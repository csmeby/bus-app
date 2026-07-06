import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'cache:';

type CacheEnvelope<T> = { value: T; cachedAt: number };

async function getCached<T>(key: string): Promise<{ value: T; ageMs: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const env: CacheEnvelope<T> = JSON.parse(raw);
    return { value: env.value, ageMs: Date.now() - env.cachedAt };
  } catch {
    return null;
  }
}

async function setCached<T>(key: string, value: T): Promise<void> {
  try {
    const env: CacheEnvelope<T> = { value, cachedAt: Date.now() };
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(env));
  } catch {
    // best-effort — a write failure just means no fallback next time, not a crash
  }
}

/**
 * Fetch JSON with a local fallback. Two things this guards against:
 *  - The upstream server being unreachable (this has actually happened —
 *    aggiespirit.ts.tamu.edu has gone down for stretches) — falls back to
 *    whatever was last successfully fetched, however old, rather than
 *    showing nothing.
 *  - Re-fetching things that essentially never change within a session
 *    (route list, academic calendar, a specific past/today date's published
 *    schedule) — `maxAgeMs` serves the cached value directly and skips the
 *    network call entirely while it's still "fresh enough".
 *
 * Live, second-to-second data (bus positions, real-time next-departure
 * times) should NOT use this — a stale cached position is actively
 * misleading, not just outdated. This is for data that's either static or
 * where "last known" is still meaningfully correct.
 */
export async function cachedJsonFetch<T>(
  url: string,
  cacheKey: string,
  opts: { maxAgeMs?: number } = {},
): Promise<T> {
  if (opts.maxAgeMs != null) {
    const cached = await getCached<T>(cacheKey);
    if (cached && cached.ageMs < opts.maxAgeMs) return cached.value;
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as T;
    setCached(cacheKey, data);
    return data;
  } catch (e) {
    const cached = await getCached<T>(cacheKey);
    if (cached) return cached.value;
    throw e;
  }
}
