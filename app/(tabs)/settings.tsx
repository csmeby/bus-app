import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useUnitCodes } from '@/context/unit-codes-context';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type MenuItem = { href: string; icon: IconName; label: string; description: string };

// Grouped into cards: appearance on its own, then the app-preference screens.
const MENU_SECTIONS: MenuItem[][] = [
  [
    { href: '/theme', icon: 'brightness-6', label: 'Theme', description: 'Light, dark, or follow system' },
  ],
  [
    { href: '/favorites', icon: 'star-outline', label: 'Favorite Routes', description: 'Pin routes to the top of the picker' },
    { href: '/notifications', icon: 'notifications-none', label: 'Notifications', description: 'Enable alerts for delays and reroutes' },
    { href: '/disruptions', icon: 'warning-amber', label: 'Service Disruptions', description: 'Construction reroutes and closures' },
    { href: '/help', icon: 'help-outline', label: 'Help Guide', description: 'Stop types and tips for riding the bus' },
  ],
];

export default function MoreScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const { enabled: unitCodesEnabled, setEnabled: setUnitCodesEnabled } = useUnitCodes();

  const renderRow = (item: MenuItem, showBorder: boolean) => (
    <TouchableOpacity
      key={item.href}
      style={[
        styles.row,
        showBorder && [styles.rowBorder, { borderBottomColor: c.border }],
      ]}
      onPress={() => router.push(item.href as any)}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityHint={item.description}
    >
      <MaterialIcons name={item.icon} size={22} color={c.tint} style={styles.rowIcon} />
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: c.text }]}>{item.label}</Text>
        <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{item.description}</Text>
      </View>
      <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">More</Text>

      {MENU_SECTIONS.map((section, i) => (
        <View
          key={i}
          style={[styles.card, i > 0 && styles.spacedCard, { backgroundColor: c.surface, borderColor: c.border }]}
        >
          {section.map((item, j) => renderRow(item, j < section.length - 1))}
        </View>
      ))}

      {/* Unit codes — the inferred driver-shift letter (Alpha, Bravo, ...)
          shown on a bus's map callout. Meaningful only to transit staff
          checking their own assignment, never to a rider, so this defaults
          off and lives behind an explicit opt-in rather than always showing. */}
      <View style={[styles.card, styles.spacedCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.row}>
          <MaterialIcons name="badge" size={22} color={c.tint} style={styles.rowIcon} />
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Unit Codes</Text>
            <Text style={[styles.rowDesc, { color: c.textSecondary }]}>
              Shows each unit&apos;s letter code (Alpha, Bravo, ...).
            </Text>
          </View>
          <Switch
            value={unitCodesEnabled}
            onValueChange={setUnitCodesEnabled}
            accessibilityLabel="Unit codes"
            accessibilityHint="Shows each unit's letter code on bus callouts"
          />
        </View>
      </View>

      {/* Switch transit network — a separate bus service in town (Brazos
          Transit District), kept as its own app mode rather than mixed into
          this tab bar, per how different the two systems are (no live
          tracking, fixed schedules only). */}
      <TouchableOpacity
        style={[styles.card, styles.spacedCard, styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={() => router.replace('/(btd)/map' as any)}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Brazos Transit District"
        accessibilityHint="Switches to BTD's bus service"
      >
        <MaterialIcons name="swap-horiz" size={22} color={c.tint} style={styles.rowIcon} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: c.text }]}>Brazos Transit District</Text>
          <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Switch to BTD&apos;s bus service</Text>
        </View>
        <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textSecondary }]}>Century Tree Transit</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  pageTitle: { fontSize: 32, fontWeight: '700', marginTop: 16, marginBottom: 28 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  spacedCard: { marginTop: 16 },
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
  footer: { flex: 1, justifyContent: 'flex-end', paddingBottom: 24, alignItems: 'center' },
  footerText: { fontSize: 12 },
});
