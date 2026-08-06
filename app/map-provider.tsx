import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { useMapProvider, type MapProviderPref } from '@/context/map-provider-context';
import { useThemeColors } from '@/context/theme-context';

const PROVIDER_OPTIONS: { value: MapProviderPref; label: string; description: string }[] = [
  { value: 'apple', label: 'Apple Maps', description: 'Default' },
  { value: 'google', label: 'Google Maps', description: 'Alternative' },
];

export default function MapProviderScreen() {
  const c = useThemeColors();
  const { mapProvider, setMapProvider } = useMapProvider();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Map" bottomMargin={24} />

      <View
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        accessibilityRole="radiogroup"
      >
        {PROVIDER_OPTIONS.map((opt, i) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.row,
              i < PROVIDER_OPTIONS.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
            ]}
            onPress={() => setMapProvider(opt.value)}
            activeOpacity={0.6}
            accessibilityRole="radio"
            accessibilityLabel={opt.label}
            accessibilityHint={opt.description}
            accessibilityState={{ checked: mapProvider === opt.value }}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>{opt.label}</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{opt.description}</Text>
            </View>
            <View
              style={[
                styles.radio,
                {
                  borderColor: mapProvider === opt.value ? c.tint : c.border,
                  backgroundColor: mapProvider === opt.value ? c.tint : 'transparent',
                },
              ]}
            >
              {mapProvider === opt.value && <View style={styles.radioDot} />}
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
