import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface UnitCodesContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const UnitCodesContext = createContext<UnitCodesContextValue>({
  enabled: false,
  setEnabled: () => {},
});

const UNIT_CODES_KEY = 'unit-codes-enabled';

export function UnitCodesProvider({ children }: { children: React.ReactNode }) {
  // Defaults to off — the letter (Alpha/Bravo/...) is inferred driver-shift
  // trivia that means nothing to a rider, only to transit staff checking
  // their own assignment. Riders who never open Settings should never see it.
  const [enabled, setEnabledState] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(UNIT_CODES_KEY).then(v => {
      if (v === 'true') setEnabledState(true);
    });
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    AsyncStorage.setItem(UNIT_CODES_KEY, value ? 'true' : 'false').catch(() => {});
  }, []);

  return (
    <UnitCodesContext.Provider value={{ enabled, setEnabled }}>
      {children}
    </UnitCodesContext.Provider>
  );
}

export function useUnitCodes() {
  return useContext(UnitCodesContext);
}
