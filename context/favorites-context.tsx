import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface FavoritesContextValue {
  favorites: string[];
  isFavorite: (route: string) => boolean;
  toggleFavorite: (route: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favorites: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
});

const FAVORITES_KEY = 'favorite-routes';

async function readFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (raw) return JSON.parse(raw);
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

  const toggleFavorite = useCallback((route: string) => {
    setFavorites(prev => {
      const next = prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route];
      writeFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((route: string) => favorites.includes(route), [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
