import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BTD_TINT } from '@/constants/btd-theme';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DEFAULT_LAUNCH_BTD_KEY } from '@/lib/onboarding';

export default function BtdMoreScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const tint = BTD_TINT[scheme];
  const [launchIntoBtd, setLaunchIntoBtd] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(DEFAULT_LAUNCH_BTD_KEY).then(v => {
      if (v === 'true') setLaunchIntoBtd(true);
    });
  }, []);

  const toggleLaunchIntoBtd = (value: boolean) => {
    setLaunchIntoBtd(value);
    AsyncStorage.setItem(DEFAULT_LAUNCH_BTD_KEY, value ? 'true' : 'false').catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">More</Text>

        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push('/theme' as any)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="Theme"
            accessibilityHint="Light, dark, or follow system"
          >
            <MaterialIcons name="brightness-6" size={22} color={tint} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Theme</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Light, dark, or follow system</Text>
            </View>
            <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Switch transit network - the mirror of the AggieSpirit-side card
            in app/(tabs)/settings.tsx. Load into BTD lives on both sides (see
            that file's comment) so whichever mode a rider defaults into,
            they can find and change it there. */}
        <View style={[styles.card, styles.spacedCard, { backgroundColor: c.surface, borderColor: c.border }]}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder, { borderBottomColor: c.border }]}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel="AggieSpirit Buses"
            accessibilityHint="Switches back to TAMU's bus service"
          >
            <MaterialIcons name="swap-horiz" size={22} color={tint} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>AggieSpirit Buses</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Switch back to TAMU&apos;s bus service</Text>
            </View>
            <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <MaterialIcons name="rocket-launch" size={22} color={tint} style={styles.rowIcon} />
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Load into BTD</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Open straight to BTD instead of the map when you start the app</Text>
            </View>
            <Switch
              value={launchIntoBtd}
              onValueChange={toggleLaunchIntoBtd}
              accessibilityLabel="Load into BTD"
              accessibilityHint="Opens the app directly to BTD's map on launch"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: c.textSecondary }]}>Brazos Transit District</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 },
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
  footer: { marginTop: 'auto', paddingTop: 24, alignItems: 'center' },
  footerText: { fontSize: 12 },
});
