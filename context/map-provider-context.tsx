import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// iOS-only choice - Android has no Apple Maps to choose between, it's
// always Google Maps regardless of this setting (see how MapScreen/
// BtdMapScreen read this: gated on Platform.OS === 'ios').
export type MapProviderPref = 'apple' | 'google';

// app.json's react-native-maps plugin now has an iosGoogleMapsApiKey set
// (as of build 9) - flip this back to false if a future build ever drops
// that key again, since selecting Google Maps without it crashes with
// "Element type is invalid" (react-native-maps trying to render a native
// component that isn't linked into the binary) rather than falling back
// gracefully.
export const GOOGLE_MAPS_IOS_READY = true;

interface MapProviderContextValue {
  mapProvider: MapProviderPref;
  setMapProvider: (provider: MapProviderPref) => void;
}

const MapProviderContext = createContext<MapProviderContextValue>({
  mapProvider: 'apple',
  setMapProvider: () => {},
});

const PREFS_KEY = 'map-provider-pref';

export function MapProviderProvider({ children }: { children: React.ReactNode }) {
  const [mapProvider, setMapProviderState] = useState<MapProviderPref>('apple');

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY).then(v => {
      if (v === 'apple' || v === 'google') setMapProviderState(v);
    });
  }, []);

  const setMapProvider = useCallback((provider: MapProviderPref) => {
    setMapProviderState(provider);
    AsyncStorage.setItem(PREFS_KEY, provider).catch(() => {});
  }, []);

  return (
    <MapProviderContext.Provider value={{ mapProvider, setMapProvider }}>
      {children}
    </MapProviderContext.Provider>
  );
}

export function useMapProvider() {
  return useContext(MapProviderContext);
}
