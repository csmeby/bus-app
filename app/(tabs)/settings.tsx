import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const MENU_ITEMS = [
  { href: '/theme', label: 'Theme', description: 'Light, dark, or follow system' },
  { href: '/favorites', label: 'Favorite Routes', description: 'Pin routes to the top of the picker' },
  { href: '/disruptions', label: 'Service Disruptions', description: 'Construction reroutes and closures' },
  { href: '/help', label: 'Help Guide', description: 'Stop types and tips for riding the bus' },
  { href: '/notifications', label: 'Notifications', description: 'Enable alerts and send test notifications' },
] as const;

export default function MoreScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];

  // Helper component to avoid repetitive code for rendering rows
  const renderRow = (item: typeof MENU_ITEMS[number], showBorder: boolean) => (
    <TouchableOpacity
      key={item.href}
      style={[
        styles.row,
        showBorder && [styles.rowBorder, { borderBottomColor: c.border }],
      ]}
      onPress={() => router.push(item.href as any)}
      activeOpacity={0.6}
    >
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: c.text }]}>{item.label}</Text>
        <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{item.description}</Text>
      </View>
      <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );

  // Split your items
  const themeItem = MENU_ITEMS[0];
  const appSettingsItems = MENU_ITEMS.slice(1);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <Text style={[styles.pageTitle, { color: c.text }]}>More</Text>

      {/* Card 1: Theme Settings */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        {renderRow(themeItem, false)}
      </View>

      {/* Card 2: App Preferences (Favorites & Disruptions) */}
      <View style={[styles.card, styles.spacedCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        {appSettingsItems.map((item, i) =>
          renderRow(item, i < appSettingsItems.length - 1)
        )}
      </View>

      {/* Switch transit network — a separate bus service in town (Brazos
          Transit District), kept as its own app mode rather than mixed into
          this tab bar, per how different the two systems are (no live
          tracking, fixed schedules only). */}
      <TouchableOpacity
        style={[styles.card, styles.spacedCard, styles.switchModeCard, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={() => router.replace('/(btd)/map' as any)}
        activeOpacity={0.6}
      >
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: c.text }]}>Brazos Transit District</Text>
          <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Switch to BTD fixed routes (separate bus service)</Text>
        </View>
        <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textSecondary }]}>TAMU Bus Tracker</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  pageTitle: { fontSize: 32, fontWeight: '700', marginTop: 16, marginBottom: 28 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  spacedCard: { marginTop: 16 },
  switchModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 13 },
  chevron: { fontSize: 22, fontWeight: '300' },
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24, alignItems: 'center' },
  footerText: { fontSize: 12 },
});