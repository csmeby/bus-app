import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { LANGUAGE_NAMES, LanguageCode, useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';

const LANGUAGE_OPTIONS: LanguageCode[] = ['en', 'es', 'zh', 'hi', 'vi', 'ko', 'ar', 'fr', 'tl', 'pt'];

export default function LanguageScreen() {
  const c = useThemeColors();
  const { language, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Language" bottomMargin={16} />

      <View style={[styles.noteCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <MaterialIcons name="info-outline" size={16} color={c.textSecondary} />
        <Text style={[styles.noteText, { color: c.textSecondary }]}>
          Machine-translated. Wording may be imperfect or occasionally inaccurate - route names, live bus data, and service alerts always show in English.
        </Text>
      </View>

      <View
        style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
        accessibilityRole="radiogroup"
      >
        {LANGUAGE_OPTIONS.map((code, i) => (
          <TouchableOpacity
            key={code}
            style={[
              styles.row,
              i < LANGUAGE_OPTIONS.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
            ]}
            onPress={() => setLanguage(code)}
            activeOpacity={0.6}
            accessibilityRole="radio"
            accessibilityLabel={LANGUAGE_NAMES[code]}
            accessibilityState={{ checked: language === code }}
          >
            <Text style={[styles.rowLabel, { color: c.text }]}>{LANGUAGE_NAMES[code]}</Text>
            <View
              style={[
                styles.radio,
                {
                  borderColor: language === code ? c.tint : c.border,
                  backgroundColor: language === code ? c.tint : 'transparent',
                },
              ]}
            >
              {language === code && <View style={styles.radioDot} />}
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
  noteCard: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 16 },
  noteText: { flex: 1, fontSize: 12, lineHeight: 17 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
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
