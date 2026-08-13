import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ScaledText as Text } from '@/components/scaled-text';
import { useThemeColors } from '@/context/theme-context';

// Back-arrow + title header shared by every pushed (non-tab) screen, so they
// all get the same spacing/typography instead of five hand-copied versions.
export function ScreenHeader({ title, bottomMargin = 20 }: { title: string; bottomMargin?: number }) {
  const c = useThemeColors();
  return (
    <View style={[styles.header, { marginBottom: bottomMargin }]}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Back"
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
