import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

// Google Maps' `image`/`icon` Marker prop renders a real bitmap with no
// native snapshot pass involved - the one marker style that's proven
// reliable on every Google Maps renderer we've tested (Android AND iOS).
// Composed-View markers (a JS <View> the native map has to snapshot into a
// bitmap itself) work on Android once tracksViewChanges is forced
// permanently true, but on iOS's Google Maps SDK they don't paint AT ALL -
// not stuck-on-a-stale-frame like Android, just never captured once. Route
// colors (and this app's stop-badge route numbers) come from a live API, so
// they can't be pre-baked into static assets ahead of time the way the bus
// ring/heading-arrow/stop-pin images are. This renders that small bit of
// per-color/per-label content off-screen ONCE per distinct value, captures
// it into a real bitmap via react-native-view-shot, and caches the result -
// every marker sharing that same color/label after the first reuses the
// cached image instead of re-rendering or re-capturing anything.
const cache = new Map<string, string>();
const inFlight = new Set<string>();

type Job = { key: string; render: () => React.ReactNode; width: number; height: number };

let queue: Job[] = [];
let notify: (() => void) | null = null;

export function getCachedMarkerImage(key: string): string | undefined {
  return cache.get(key);
}

function requestMarkerImage(job: Job) {
  if (cache.has(job.key) || inFlight.has(job.key)) return;
  inFlight.add(job.key);
  queue.push(job);
  notify?.();
}

// Returns the cached bitmap URI for `key` (undefined until it's ready - the
// composed-view fallback the caller renders in the meantime is only ever
// visible for a frame or two, and only the first time a given color/label
// combo is ever seen). `render`/`width`/`height` describe what to capture -
// only actually used the first time this key shows up.
export function useMarkerImage(
  key: string | null,
  render: () => React.ReactNode,
  width: number,
  height: number
): string | undefined {
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!key || cache.has(key)) return;
    requestMarkerImage({ key, render, width, height });
    const id = setInterval(() => {
      if (cache.has(key)) {
        clearInterval(id);
        forceTick(t => t + 1);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return key ? cache.get(key) : undefined;
}

// Mount ONCE per map screen. Renders every not-yet-cached job off-screen,
// captures each shortly after its own layout settles, then drops it from
// the pending list - so the off-screen host only ever holds truly pending
// jobs, never accumulates forever.
export function MarkerImageFactory() {
  const [pending, setPending] = useState<Job[]>([]);
  const refs = useRef<Record<string, View | null>>({});

  useEffect(() => {
    notify = () => setPending([...queue]);
    return () => { notify = null; };
  }, []);

  const capture = useCallback((job: Job) => {
    // Double rAF settle - same "wait for a real post-layout frame" dance
    // used throughout this app's other marker-image code, cheap insurance
    // against capturing a half-laid-out first frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        const ref = refs.current[job.key];
        queue = queue.filter(j => j.key !== job.key);
        delete refs.current[job.key];
        if (!ref) { inFlight.delete(job.key); return; }
        try {
          const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'data-uri' });
          cache.set(job.key, uri);
        } catch {
          // Leave it uncached - the composed-view fallback keeps showing
          // rather than retrying forever on a job that can't capture.
        } finally {
          inFlight.delete(job.key);
          setPending([...queue]);
        }
      });
    });
  }, []);

  if (pending.length === 0) return null;

  return (
    <View style={styles.host} pointerEvents="none">
      {pending.map(job => (
        <View
          key={job.key}
          ref={r => { refs.current[job.key] = r; }}
          collapsable={false}
          style={{ width: job.width, height: job.height }}
          onLayout={() => capture(job)}
        >
          {job.render()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Off-screen, not just invisible - opacity/visibility tricks can make some
  // native view-shot implementations capture a blank frame.
  host: { position: 'absolute', top: -9999, left: -9999 },
});
