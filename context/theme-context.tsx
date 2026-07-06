import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextValue {
  theme: ResolvedTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  mode: 'system',
  setMode: () => {},
});

const PREFS_KEY = 'theme-prefs';

async function readMode(): Promise<ThemeMode> {
  try {
    const value = await AsyncStorage.getItem(PREFS_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {}
  return 'system';
}

async function writeMode(mode: ThemeMode) {
  try {
    await AsyncStorage.setItem(PREFS_KEY, mode);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemScheme() ?? 'dark';
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    readMode().then(setModeState);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    writeMode(newMode);
  }, []);

  const theme: ResolvedTheme = mode === 'system' ? systemScheme : mode;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
