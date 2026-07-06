import { Platform } from 'react-native';

import { API_BASE } from './api-base';

/**
 * Best-effort POST of a crash to the server (bus/client_crashes.log) — the
 * Metro console is easy to lose (closed window, scrolled past, running on a
 * device with nobody watching), so this is the durable copy. Fire-and-forget:
 * a crash is exactly the wrong moment to let a failed network call cascade
 * into another error, so any failure here is swallowed.
 */
export function reportCrash(payload: Record<string, unknown>): void {
  try {
    fetch(`${API_BASE}/client-crash-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: Platform.OS, timestamp: new Date().toISOString(), ...payload }),
    }).catch(() => {});
  } catch {
    // best-effort only
  }
}

/**
 * Logs uncaught JS exceptions to the console (so they show up in the Metro/
 * Expo terminal) and reports them to the server, so they show up even when
 * running on a physical device with nobody watching the terminal.
 */
export function setupGlobalErrorLogging(): void {
  const g = global as any;
  if (typeof g.ErrorUtils?.setGlobalHandler !== 'function') return;

  const originalHandler = g.ErrorUtils.getGlobalHandler?.();
  g.ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    console.error(`[GlobalError]${isFatal ? ' (fatal)' : ''}`, error);
    const err = error instanceof Error ? error : new Error(String(error));
    reportCrash({
      source: 'global-handler',
      isFatal: !!isFatal,
      message: err.message,
      stack: err.stack,
    });
    originalHandler?.(error, isFatal);
  });
}
