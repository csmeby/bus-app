import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// A "locked" route auto-selects on the map the moment the app launches,
// instead of the rider having to reopen the route picker every time. Mirrors
// favorites-context.tsx's shape/namespacing (see that file's own comment on
// why "network:route" - same overlapping two-digit route numbers apply
// here), even though only the AggieSpirit map currently reads this.
export type LockedRoutesNetwork = 'aggiespirit' | 'btd';

interface LockedRoutesContextValue {
  lockedRoutes: string[];
  isLocked: (route: string, network?: LockedRoutesNetwork) => boolean;
  toggleLock: (route: string, network?: LockedRoutesNetwork) => void;
}

const LockedRoutesContext = createContext<LockedRoutesContextValue>({
  lockedRoutes: [],
  isLocked: () => false,
  toggleLock: () => {},
});

const LOCKED_ROUTES_KEY = 'locked-routes';

function key(route: string, network: LockedRoutesNetwork): string {
  return `${network}:${route}`;
}

async function readLockedRoutes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCKED_ROUTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {}
  return [];
}

async function writeLockedRoutes(lockedRoutes: string[]) {
  try {
    await AsyncStorage.setItem(LOCKED_ROUTES_KEY, JSON.stringify(lockedRoutes));
  } catch {}
}

export function LockedRoutesProvider({ children }: { children: React.ReactNode }) {
  const [lockedRoutes, setLockedRoutes] = useState<string[]>([]);

  useEffect(() => {
    readLockedRoutes().then(setLockedRoutes);
  }, []);

  const toggleLock = useCallback((route: string, network: LockedRoutesNetwork = 'aggiespirit') => {
    const k = key(route, network);
    setLockedRoutes(prev => {
      const next = prev.includes(k) ? prev.filter(r => r !== k) : [...prev, k];
      writeLockedRoutes(next);
      return next;
    });
  }, []);

  const isLocked = useCallback(
    (route: string, network: LockedRoutesNetwork = 'aggiespirit') => lockedRoutes.includes(key(route, network)),
    [lockedRoutes],
  );

  return (
    <LockedRoutesContext.Provider value={{ lockedRoutes, isLocked, toggleLock }}>
      {children}
    </LockedRoutesContext.Provider>
  );
}

export function useLockedRoutes() {
  return useContext(LockedRoutesContext);
}
