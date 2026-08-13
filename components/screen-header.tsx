import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ScaledText as Text } from '@/components/scaled-text';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { translate } from '@/lib/translations';

// Back-arrow + title header shared by every pushed (non-tab) screen, so they
// all get the same spacing/typography instead of five hand-copied versions.
// `title` is expected already-translated (each caller runs its own title
// through t()) since this component doesn't know which strings are proper
// nouns (e.g. "Brazos Transit District") vs translatable labels.
export function ScreenHeader({ title, bottomMargin = 20 }: { title: string; bottomMargin?: number }) {
  const c = useThemeColors();
  const { language } = useLanguage();
  return (
    <View style={[styles.header, { marginBottom: bottomMargin }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel={translate('Back', language)}
        hitSlop={8}
      >
        <Text style={[styles.backArrow, { color: c.tintText }]}>‹</Text>
      </TouchableOpacity>
      <Text style={[styles.pageTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  backBtn: { paddingRight: 10, paddingVertical: 4 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 28, fontWeight: '700', flex: 1 },
});
