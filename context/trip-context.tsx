import React, { createContext, useCallback, useContext, useState } from 'react';

interface TripContextValue {
  pendingRoutes: string[] | null;
  setPendingRoutes: (routes: string[] | null) => void;
  consumePendingRoutes: () => string[] | null;
}

const TripContext = createContext<TripContextValue>({
  pendingRoutes: null,
  setPendingRoutes: () => {},
  consumePendingRoutes: () => null,
});

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [pendingRoutes, setPendingRoutes] = useState<string[] | null>(null);

  // Read-and-clear in one step so the Map tab only ever applies a hand-off once,
  // even if it re-renders/re-focuses multiple times afterward.
  const consumePendingRoutes = useCallback(() => {
    let value: string[] | null = null;
    setPendingRoutes(prev => { value = prev; return null; });
    return value;
  }, []);

  return (
    <TripContext.Provider value={{ pendingRoutes, setPendingRoutes, consumePendingRoutes }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}
