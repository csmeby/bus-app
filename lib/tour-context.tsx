import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';

import { ONBOARDING_COMPLETE_KEY } from '@/lib/onboarding';

export type TourStepId = 'map-routes' | 'favorites' | 'notifications' | 'btd' | 'help';

type Rect = { x: number; y: number; width: number; height: number };
type ScrollEntry = { ref: React.RefObject<ScrollView | null>; getOffsetY: () => number };

const SCREEN_HEIGHT = Dimensions.get('window').height;
// A bit above true center - leaves more room below for the tooltip (which
// prefers showing below the target) than above it.
const TARGET_CENTER_Y = SCREEN_HEIGHT * 0.42;
const SCROLL_REPOSITION_THRESHOLD = 32;
const SCROLL_SETTLE_MS = 350;
const NAV_SETTLE_MS = 550;

export const TOUR_STEPS: { id: TourStepId; route: string; title: string; body: string }[] = [
  {
    id: 'map-routes',
    route: '/(tabs)',
    title: 'Pick Your Routes',
    body: 'Tap here to choose which routes show live buses on the map.',
  },
  {
    id: 'favorites',
    route: '/(tabs)/settings',
    title: 'Favorite Routes',
    body: 'Pin the routes you ride most so they sort to the top of the picker.',
  },
  {
    id: 'notifications',
    route: '/(tabs)/settings',
    title: 'Notifications',
    body: 'Turn on alerts for delays and reroutes on your routes.',
  },
  {
    id: 'btd',
    route: '/(tabs)/settings',
    title: 'Riding BTD?',
    body: "Switch over to Brazos Transit District from here anytime - or set it as your default in the toggle right below.",
  },
  {
    id: 'help',
    route: '/(tabs)/settings',
    title: 'New Here?',
    body: 'The Help Guide covers stop types and tips for riding the bus - worth a look if you\'re a first time rider.',
  },
];

interface TourContextValue {
  stepIndex: number | null;
  step: (typeof TOUR_STEPS)[number] | null;
  rect: Rect | null;
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
  registerTarget: (id: TourStepId, ref: React.RefObject<View | null>) => void;
  reportLayout: (id: TourStepId) => void;
  registerScrollView: (entry: ScrollEntry | null) => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  // Plain ref, not state - target components register themselves on mount;
  // re-rendering the provider every registration would be wasted work since
  // nothing here needs to react to WHICH targets exist, only to measuring
  // whichever one is currently active.
  const targetsRef = useRef<Partial<Record<TourStepId, React.RefObject<View | null>>>>({});
  // The currently-mounted screen's ScrollView, if it has one (only More/
  // Settings does today) - registered/unregistered by that screen itself,
  // so this is null while the Map tab (no ScrollView) is active.
  const scrollEntryRef = useRef<ScrollEntry | null>(null);

  const measure = useCallback((id: TourStepId) => {
    const ref = targetsRef.current[id];
    ref?.current?.measureInWindow((x, y, width, height) => {
      const scrollEntry = scrollEntryRef.current;
      const centerY = y + height / 2;
      if (scrollEntry?.ref.current && Math.abs(centerY - TARGET_CENTER_Y) > SCROLL_REPOSITION_THRESHOLD) {
        // Scroll the target toward the middle of the screen instead of
        // trusting wherever it happened to land in the content - otherwise
        // a target near the bottom of a long screen (e.g. the BTD card)
        // can end up sitting behind the tab bar with nowhere for the
        // tooltip to go.
        const delta = centerY - TARGET_CENTER_Y;
        const nextY = Math.max(0, scrollEntry.getOffsetY() + delta);
        scrollEntry.ref.current.scrollTo({ y: nextY, animated: true });
        setTimeout(() => {
          ref.current?.measureInWindow((x2, y2, width2, height2) => {
            setRect({ x: x2, y: y2, width: width2, height: height2 });
          });
        }, SCROLL_SETTLE_MS);
        return;
      }
      setRect({ x, y, width, height });
    });
  }, []);

  const registerTarget = useCallback((id: TourStepId, ref: React.RefObject<View | null>) => {
    targetsRef.current[id] = ref;
  }, []);

  const registerScrollView = useCallback((entry: ScrollEntry | null) => {
    scrollEntryRef.current = entry;
  }, []);

  const reportLayout = useCallback((id: TourStepId) => {
    setStepIndex(current => {
      if (current !== null && TOUR_STEPS[current].id === id) measure(id);
      return current;
    });
  }, [measure]);

  const startTour = useCallback(() => {
    setRect(null);
    setStepIndex(0);
    router.replace(TOUR_STEPS[0].route as any);
  }, []);

  const finish = useCallback(() => {
    AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true').catch(() => {});
    setStepIndex(null);
    setRect(null);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex(current => {
      const ni = (current ?? -1) + 1;
      if (ni >= TOUR_STEPS.length) {
        finish();
        return null;
      }
      setRect(null);
      router.replace(TOUR_STEPS[ni].route as any);
      return ni;
    });
  }, [finish]);

  const skipTour = useCallback(() => {
    finish();
  }, [finish]);

  // A step's target may already be mounted (same tab as the previous step)
  // when the step becomes active, so onLayout won't fire again on its own -
  // re-measure directly whenever the active step changes. A second measure
  // after NAV_SETTLE_MS corrects for the tab-switch transition still being
  // in flight when the first one fires (the exact cause of "first target
  // after navigating lands offset").
  useEffect(() => {
    if (stepIndex === null) return;
    const id = TOUR_STEPS[stepIndex].id;
    measure(id);
    const settleTimer = setTimeout(() => measure(id), NAV_SETTLE_MS);
    return () => clearTimeout(settleTimer);
  }, [stepIndex, measure]);

  const value = useMemo<TourContextValue>(() => ({
    stepIndex,
    step: stepIndex !== null ? TOUR_STEPS[stepIndex] : null,
    rect,
    startTour,
    nextStep,
    skipTour,
    registerTarget,
    reportLayout,
    registerScrollView,
  }), [stepIndex, rect, startTour, nextStep, skipTour, registerTarget, reportLayout, registerScrollView]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within a TourProvider');
  return ctx;
}

// Wrap any element that a tour step should point at. Transparent pass-
// through otherwise - only measures/reports while its own step is active.
export function TourTarget({ id, children, style }: { id: TourStepId; children: React.ReactNode; style?: any }) {
  const { registerTarget, reportLayout } = useTour();
  const ref = useRef<View>(null);

  useEffect(() => {
    registerTarget(id, ref);
  }, [id, registerTarget]);

  return (
    <View ref={ref} style={style} onLayout={() => reportLayout(id)}>
      {children}
    </View>
  );
}
