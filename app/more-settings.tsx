import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { translate } from '@/lib/translations';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type SettingsItem = {
  href: string;
  icon: IconName;
  label: string;
  description: string;
};

const SETTINGS_ITEMS: SettingsItem[] = [
  { href: '/theme', icon: 'brightness-6', label: 'Theme', description: 'Light, dark, or follow system' },
  { href: '/language', icon: 'translate', label: 'Language', description: 'Choose your language' },
  ...(Platform.OS === 'ios'
    ? [{ href: '/map-provider', icon: 'map' as IconName, label: 'Map Provider', description: 'Apple Maps or Google Maps' }]
    : []),
  { href: '/accessibility', icon: 'accessibility-new', label: 'Accessibility', description: 'Icon/text size, contrast, and motion' },
];

export default function MoreSettingsScreen() {
  const c = useThemeColors();
  const { iconSize } = useAccessibility();
  const iconScale = ICON_SCALE[iconSize];
  const rowIconSize = Math.round(22 * iconScale);
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title={t('Settings')} bottomMargin={24} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {SETTINGS_ITEMS.map((item, index) => {
            const showBorder = index < SETTINGS_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.href}
                style={[
                  styles.row,
                  showBorder && [styles.rowBorder, { borderBottomColor: c.border }],
                ]}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={t(item.label)}
                accessibilityHint={t(item.description)}
              >
                <MaterialIcons name={item.icon} size={rowIconSize} color={c.tint} style={styles.rowIcon} />
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: c.text }]}>{t(item.label)}</Text>
                  <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{t(item.description)}</Text>
                </View>
                <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 24, flexGrow: 1 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { marginRight: 12 },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 13 },
  chevron: { fontSize: 22, fontWeight: '300' },
});
