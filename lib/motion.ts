import { Animated } from 'react-native';

// Accessibility > Reduce Motion (see context/accessibility-context.tsx) -
// jumps straight to the end value instead of springing when enabled. Shared
// between both map screens' stop-info sheets (each owns its own
// Animated.Value, but the "should this animate at all" logic is identical) -
// a plain function, not a hook, since it just needs the current
// reduceMotion flag as a parameter, called from spots that already have it
// in scope.
export function springOrJump(
  value: Animated.Value,
  toValue: number,
  config: { tension: number; friction: number; useNativeDriver: boolean },
  reduceMotion: boolean,
  onDone?: () => void,
) {
  if (reduceMotion) {
    value.setValue(toValue);
    onDone?.();
    return;
  }
  Animated.spring(value, { toValue, ...config }).start(onDone);
}
