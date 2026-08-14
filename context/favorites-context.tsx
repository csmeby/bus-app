import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Both networks use plain two-digit route numbers ("01", "04", ...) that
// overlap heavily (AggieSpirit's route 04 and BTD's route 04 are unrelated
// routes) - so every stored/looked-up key is namespaced "network:route"
// internally to keep the two from cross-contaminating each other's
// favorites. AggieSpirit is the default network on every call so none of
// its existing call sites (app/(tabs)/index.tsx, app/favorites.tsx,
// app/notifications.tsx) had to change - only the BTD favorites screen
// passes 'btd' explicitly.
export type FavoritesNetwork = 'aggiespirit' | 'btd';

interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (route: string, network?: FavoritesNetwork) => boolean;
  toggleFavorite: (route: string, network?: FavoritesNetwork) => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const FAVORITES_KEY = 'favorite-routes';

function key(route: string, network: FavoritesNetwork): string {
  return `${network}:${route}`;
}

async function readFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const stored: string[] = JSON.parse(raw);
    // One-time migration: favorites saved before the network namespace
    // existed have no "network:" prefix at all - they were always
    // AggieSpirit routes (BTD had no favorites feature yet), so backfill
    // that prefix rather than silently losing them.
    if (stored.some(f => !f.includes(':'))) {
      const migrated = stored.map(f => (f.includes(':') ? f : key(f, 'aggiespirit')));
      await writeFavorites(migrated);
      return migrated;
    }
    return stored;
  } catch {}
  return [];
}

async function writeFavorites(favorites: string[]) {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {}
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    readFavorites().then(setFavorites);
  }, []);

  const toggleFavorite = useCallback((route: string, network: FavoritesNetwork = 'aggiespirit') => {
    const k = key(route, network);
    setFavorites(prev => {
      const next = prev.includes(k) ? prev.filter(r => r !== k) : [...prev, k];
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (route: string, network: FavoritesNetwork = 'aggiespirit') => favorites.includes(key(route, network)),
    [favorites],
  );

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
