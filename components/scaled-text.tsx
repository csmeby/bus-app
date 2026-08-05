import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';

import { TEXT_SCALE, useAccessibility } from '@/context/accessibility-context';

// Drop-in replacement for react-native's own Text - files pull this in as
// `import { ScaledText as Text } from '@/components/scaled-text'` so every
// existing `<Text style={styles.whatever}>` call site picks up Accessibility
// > Text Size (see context/accessibility-context.tsx) automatically, with
// zero changes needed at any individual call site.
//
// Only scales when the flattened style actually declares a fontSize -
// nested <Text> elements that omit one specifically to inherit their
// parent's (React Native supports this, unlike a plain View) would otherwise
// get clobbered with some arbitrary default instead of truly inheriting.
export function ScaledText({ style, ...rest }: TextProps) {
  const { textSize } = useAccessibility();
  const scale = TEXT_SCALE[textSize];

  if (scale === 1) {
    return <RNText style={style} {...rest} />;
  }

  const flat = StyleSheet.flatten(style);
  if (!flat || flat.fontSize == null) {
    return <RNText style={style} {...rest} />;
  }

  return <RNText {...rest} style={[style, { fontSize: flat.fontSize * scale }]} />;
}
