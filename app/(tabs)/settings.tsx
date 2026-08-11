import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useThemeColors } from '@/context/theme-context';
import { useUnitCodes } from '@/context/unit-codes-context';
import { DEFAULT_LAUNCH_BTD_KEY, ONBOARDING_COMPLETE_KEY } from '@/lib/onboarding';
import { TourTarget, useTour, type TourStepId } from '@/lib/tour-context';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

type MenuItem = { href: string; icon: IconName; label: string; description: string; tourId?: TourStepId };

// Grouped into cards: appearance on its own, then the app-preference screens.
const MENU_SECTIONS: MenuItem[][] = [
  [
    { href: '/theme', icon: 'brightness-6', label: 'Theme', description: 'Light, dark, or follow system' },
    { href: '/accessibility', icon: 'accessibility-new', label: 'Accessibility', description: 'Icon/text size, contrast, and motion' },
  ],
  [
    { href: '/favorites', icon: 'star-outline', label: 'Favorite Routes', description: 'Pin routes to the top of the selector', tourId: 'favorites' },
    { href: '/notifications', icon: 'notifications-none', label: 'Notifications', description: 'Enable alerts for delays and reroutes', tourId: 'notifications' },
    { href: '/disruptions', icon: 'warning-amber', label: 'Service Disruptions', description: 'Construction reroutes and closures' },
    { href: '/help', icon: 'help-outline', label: 'Help Guide', description: 'Stop types and tips for riding the bus', tourId: 'help' },
  ],
];

export default function MoreScreen() {
  const c = useThemeColors();
  const { iconSize } = useAccessibility();
  const iconScale = ICON_SCALE[iconSize];
  const rowIconSize = Math.round(22 * iconScale);
  const { enabled: unitCodesEnabled, setEnabled: setUnitCodesEnabled } = useUnitCodes();
  const [launchIntoBtd, setLaunchIntoBtd] = useState(false);
  const { registerScrollView } = useTour();
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(DEFAULT_LAUNCH_BTD_KEY).then(v => {
      if (v === 'true') setLaunchIntoBtd(true);
    });
  }, []);

  // Lets the tour scroll a target (e.g. the BTD card, which otherwise sits
  // low enough to land behind the tab bar) toward the middle of the screen
  // before measuring it - see registerScrollView in lib/tour-context.tsx.
  useEffect(() => {
    registerScrollView({ ref: scrollRef, getOffsetY: () => scrollY.current });
    return () => registerScrollView(null);
  }, [registerScrollView]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  };

  const toggleLaunchIntoBtd = (value: boolean) => {
    setLaunchIntoBtd(value);
    AsyncStorage.setItem(DEFAULT_LAUNCH_BTD_KEY, value ? 'true' : 'false').catch(() => {});
  };

  const replayTutorial = async () => {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    router.push('/onboarding' as any);
  };

  const renderRow = (item: MenuItem, showBorder: boolean) => {
    const row = (
      <TouchableOpacity
        key={item.tourId ? undefined : item.href}
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
        <MaterialIcons name={item.icon} size={rowIconSize} color={c.tint} style={styles.rowIcon} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: c.text }]}>{item.label}</Text>
          <Text style={[styles.rowDesc, { color: c.textSecondary }]}>{item.description}</Text>
        </View>
        <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
      </TouchableOpacity>
    );
    if (!item.tourId) return row;
    return <TourTarget key={item.href} id={item.tourId}>{row}</TourTarget>;
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
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
          <MaterialIcons name="badge" size={rowIconSize} color={c.tint} style={styles.rowIcon} />
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Unit Codes <Text style={{ color: c.tint }}>(Experimental)</Text></Text>
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
      <TourTarget id="btd" style={[styles.card, styles.spacedCard, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TouchableOpacity
          style={[styles.row, styles.rowBorder, { borderBottomColor: c.border }]}
          onPress={() => router.replace('/(btd)/map' as any)}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Brazos Transit District"
          accessibilityHint="Switches to BTD's bus service"
        >
          <MaterialIcons name="swap-horiz" size={rowIconSize} color={c.tint} style={styles.rowIcon} />
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Brazos Transit District</Text>
            <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Switch to BTD&apos;s bus service</Text>
          </View>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <MaterialIcons name="rocket-launch" size={rowIconSize} color={c.tint} style={styles.rowIcon} />
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
      </TourTarget>

      <TouchableOpacity
        style={[styles.card, styles.spacedCard, styles.row, { backgroundColor: c.surface, borderColor: c.border }]}
        onPress={replayTutorial}
        activeOpacity={0.6}
        accessibilityRole="button"
        accessibilityLabel="Replay tutorial"
        accessibilityHint="Watch the first-launch walkthrough again"
      >
        <MaterialIcons name="replay" size={rowIconSize} color={c.tint} style={styles.rowIcon} />
        <View style={styles.rowText}>
          <Text style={[styles.rowLabel, { color: c.text }]}>Replay Tutorial</Text>
          <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Watch the first-launch walkthrough again</Text>
        </View>
        <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textSecondary }]}>Century Tree Transit</Text>
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
