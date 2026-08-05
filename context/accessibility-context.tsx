import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type IconSize = 'xs' | 'small' | 'default' | 'large' | 'xl';
export type TextSize = 'xs' | 'small' | 'default' | 'large' | 'xl';

// Multipliers, not raw pixel values - every consumer scales its own base
// size by these, so a marker/icon/text that's already sized differently
// elsewhere (a stop pin vs a tab icon) scales proportionally instead of
// all converging on one absolute number.
export const ICON_SCALE: Record<IconSize, number> = { xs: 0.7, small: 0.85, default: 1, large: 1.3, xl: 1.6 };
export const TEXT_SCALE: Record<TextSize, number> = { xs: 0.8, small: 0.9, default: 1, large: 1.2, xl: 1.4 };

interface AccessibilityContextValue {
  iconSize: IconSize;
  setIconSize: (size: IconSize) => void;
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  iconSize: 'default',
  setIconSize: () => {},
  textSize: 'default',
  setTextSize: () => {},
  highContrast: false,
  setHighContrast: () => {},
  reduceMotion: false,
  setReduceMotion: () => {},
});

const PREFS_KEY = 'accessibility-prefs';

type StoredPrefs = { iconSize: IconSize; textSize: TextSize; highContrast: boolean; reduceMotion: boolean };

async function readPrefs(): Promise<Partial<StoredPrefs>> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [iconSize, setIconSizeState] = useState<IconSize>('default');
  const [textSize, setTextSizeState] = useState<TextSize>('default');
  const [highContrast, setHighContrastState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);

  useEffect(() => {
    readPrefs().then(prefs => {
      if (prefs.iconSize) setIconSizeState(prefs.iconSize);
      if (prefs.textSize) setTextSizeState(prefs.textSize);
      if (typeof prefs.highContrast === 'boolean') setHighContrastState(prefs.highContrast);
      if (typeof prefs.reduceMotion === 'boolean') setReduceMotionState(prefs.reduceMotion);
    });
  }, []);

  // One write path for all four - keeps the persisted blob's shape in one
  // place instead of four separate AsyncStorage keys drifting independently.
  const persist = useCallback((next: Partial<StoredPrefs>) => {
    readPrefs().then(prev => {
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ ...prev, ...next })).catch(() => {});
    });
  }, []);

  const setIconSize = useCallback((size: IconSize) => {
    setIconSizeState(size);
    persist({ iconSize: size });
  }, [persist]);

  const setTextSize = useCallback((size: TextSize) => {
    setTextSizeState(size);
    persist({ textSize: size });
  }, [persist]);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
    persist({ highContrast: value });
  }, [persist]);

  const setReduceMotion = useCallback((value: boolean) => {
    setReduceMotionState(value);
    persist({ reduceMotion: value });
  }, [persist]);

  return (
    <AccessibilityContext.Provider
      value={{ iconSize, setIconSize, textSize, setTextSize, highContrast, setHighContrast, reduceMotion, setReduceMotion }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
