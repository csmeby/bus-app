import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { useAppTheme, ThemeMode } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const APPEARANCE_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Follow device settings' },
  { value: 'light', label: 'Light', description: 'Always use light theme' },
  { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
];

export default function ThemeScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const { mode, setMode } = useAppTheme();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Theme" bottomMargin={24} />

      <View
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        accessibilityRole="radiogroup"
      >
        {APPEARANCE_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.row,
              i < APPEARANCE_OPTIONS.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
            ]}
            onPress={() => setMode(opt.value)}
            activeOpacity={0.6}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityHint={opt.description}
            accessibilityState={{ checked: mode === opt.value }}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>{opt.label}</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{opt.description}</Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: mode === opt.value ? c.tint : c.border,
                  backgroundColor: mode === opt.value ? c.tint : 'transparent',
                },
              ]}
            >
              {mode === opt.value && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 13 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
});
