import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';

import { TEXT_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useLanguage } from '@/context/language-context';
import { translate } from '@/lib/translations';

// Drop-in replacement for react-native's own Text - files pull this in as
// `import { ScaledText as Text } from '@/components/scaled-text'` so every
// existing `<Text style={styles.whatever}>` call site picks up Accessibility
// > Text Size (see context/accessibility-context.tsx) AND the selected
// Language (see context/language-context.tsx, lib/translations.ts)
// automatically, with zero changes needed at any individual call site.
//
// Translation only fires when `children` is a single plain string - dynamic
// content (`{`Route ${route}`}`, numbers, nested elements) still renders as
// a string by the time it gets here, but won't match any dictionary entry
// (which is keyed by exact static English text) and silently falls through
// unchanged. That's intentional, not a bug: this only translates the app's
// fixed chrome, never server-driven data - see the Language screen's own
// disclaimer.
//
// Only scales when the flattened style actually declares a fontSize -
// nested <Text> elements that omit one specifically to inherit their
// parent's (React Native supports this, unlike a plain View) would otherwise
// get clobbered with some arbitrary default instead of truly inheriting.
export function ScaledText({ style, children, ...rest }: TextProps) {
  const { textSize } = useAccessibility();
  const scale = TEXT_SCALE[textSize];
  const { language } = useLanguage();

  const translatedChildren = typeof children === 'string' ? translate(children, language) : children;

  if (scale === 1) {
    return <RNText style={style} {...rest}>{translatedChildren}</RNText>;
  }

  const flat = StyleSheet.flatten(style);
  if (!flat || flat.fontSize == null) {
    return <RNText style={style} {...rest}>{translatedChildren}</RNText>;
  }

  return <RNText {...rest} style={[style, { fontSize: flat.fontSize * scale }]}>{translatedChildren}</RNText>;
}
