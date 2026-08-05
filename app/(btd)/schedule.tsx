import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { LayoutAnimation, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { BTD_TINT } from '@/constants/btd-theme';
import { useThemeColors } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import btdRoutesRaw from '../../btd_routes.json';

type BtdStopEntry = { key: string; label: string; number: number; times: string[] };
type BtdRoute = { name: string; color: string; terminal: string; description: string | null; stops: BtdStopEntry[] };

const btdRoutes = btdRoutesRaw as Record<string, BtdRoute>;
const ALL_BTD_ROUTES = Object.keys(btdRoutes).sort();

// A stop's "times" are already expanded to every clock time all day — collapse
// back down to the PDF's own "minutes after the hour" shorthand (e.g. a stop
// at :00, :49 every hour shows as ":00, :49" instead of 28 separate times).
function minutesAfterHour(times: string[]): string {
  const minutes = Array.from(new Set(times.map(t => t.split(':')[1]))).sort((a, b) => Number(a) - Number(b));
  return minutes.map(m => `:${m}`).join(', ');
}

function prettyTerminal(terminal: string): string {
  return terminal
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Route 04 (Yellow) isn't a loop like the others — it's a single corridor
// (Texas Ave) run by two buses in opposite directions, so its "stops" in
// btd_routes.json are merged/deduped for the map view. For the schedule,
// the PDF's own minute-by-minute table is far more readable as the flat,
// in-order list it actually is (duplicate stops/offsets included, since
// that's genuinely the out-and-back trip), rather than the merged version.
const YELLOW_SCHEDULE: { offset: string; label: string }[] = [
  { offset: ':00', label: 'MLK @ Texas Ave.' },
  { offset: ':01', label: 'Texas Ave. @ William J Bryan' },
  { offset: ':03', label: 'Texas Ave. @ 26th Street' },
  { offset: ':04', label: 'Texas Ave. @ 29th Street' },
  { offset: ':06', label: 'Texas Ave. @ Coulter' },
  { offset: ':07', label: 'Texas Ave. @ Carson' },
  { offset: ':08', label: 'Texas Ave. @ Twin' },
  { offset: ':09', label: 'Texas Ave. @ Villa Maria' },
  { offset: ':10', label: 'Texas Ave. @ BTD Transfer Point' },
  { offset: ':13', label: 'Texas Ave. @ University' },
  { offset: ':15', label: 'Texas Ave. @ New Main' },
  { offset: ':16', label: 'Texas Ave. @ George Bush' },
  { offset: ':17', label: 'Texas Ave. @ Harvey' },
  { offset: ':18', label: 'Texas Ave. @ Holleman' },
  { offset: ':19', label: 'Texas Ave. @ Brentwood' },
  { offset: ':20', label: 'Texas Ave. @ Southwest Pkwy' },
  { offset: ':21', label: 'Texas Ave. @ Krenek Tap' },
  { offset: ':22', label: 'Texas Ave. @ Harvey Mitchell Pkwy' },
  { offset: ':23', label: 'Texas Ave. @ Deacon' },
  { offset: ':24', label: 'Texas Ave. @ Rock Prairie' },
  { offset: ':25', label: 'Texas Ave. @ Birmingham' },
  { offset: ':26', label: 'Birmingham @ Longmire' },
  { offset: ':30', label: 'Longmire @ Harvey Mitchell Pkwy' },
  { offset: ':31', label: 'Harvey Mitchell Pkwy @ Texas Ave.' },
  { offset: ':32', label: 'Texas Ave. @ Krenek Tap' },
  { offset: ':32', label: 'Texas Ave. @ Southwest Pkwy' },
  { offset: ':33', label: 'Texas Ave. @ Brentwood' },
  { offset: ':34', label: 'Texas Ave. @ Holleman' },
  { offset: ':35', label: 'Texas Ave. @ Harvey' },
  { offset: ':36', label: 'Texas Ave. @ George Bush' },
  { offset: ':37', label: 'Texas Ave. @ New Main' },
  { offset: ':39', label: 'Texas Ave. @ University' },
  { offset: ':42', label: 'Texas Ave. @ Villa Maria' },
  { offset: ':43', label: 'Texas Ave. @ Twin' },
  { offset: ':44', label: 'Texas Ave. @ Carson' },
  { offset: ':46', label: 'Texas Ave. @ Coulter' },
  { offset: ':47', label: 'Texas Ave. @ 29th Street' },
  { offset: ':48', label: 'Texas Ave. @ William J Bryan' },
  { offset: ':49', label: 'Texas Ave. @ MLK' },
  { offset: ':49', label: 'Texas Ave. @ 18th Street' },
  { offset: ':50', label: '18th Street @ Houston' },
  { offset: ':50', label: 'Houston @ MLK' },
];

export default function BtdScheduleScreen() {
  const scheme = useColorScheme();
  const c = useThemeColors();
  const tint = BTD_TINT[scheme];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (routeNum: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [routeNum]: !prev[routeNum] }));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">Schedule</Text>
        <Text style={[styles.pageSubtitle, { color: c.textSecondary }]}>
          Time points repeat every hour, on the same minutes, all day.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.hoursCard, { backgroundColor: tint + '14', borderColor: tint + '33' }]}>
          <MaterialIcons name="schedule" size={18} color={tint} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hoursLabel, { color: c.text }]}>Monday - Friday, 5:00 AM - 7:00 PM</Text>
            <Text style={[styles.hoursSub, { color: c.textSecondary }]}>Excluding holidays. No weekend service.</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>ROUTES</Text>
        {ALL_BTD_ROUTES.map(routeNum => {
          const route = btdRoutes[routeNum];
          const isOpen = !!expanded[routeNum];
          return (
            <View
              key={routeNum}
              style={[styles.routeCard, { backgroundColor: c.surface, borderColor: c.border }]}
            >
              {/* Colored accent strip keyed to the route's brand color — BTD
                  routes are named by color, so this is their primary identity. */}
              <View style={[styles.routeAccent, { backgroundColor: route.color }]} />
              <TouchableOpacity
                style={styles.routeHeaderRow}
                onPress={() => toggle(routeNum)}
                activeOpacity={0.6}
                accessibilityRole="button"
                accessibilityLabel={`${route.name} route, via ${prettyTerminal(route.terminal)}, ${route.stops.length} time points`}
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={[styles.routeTag, { backgroundColor: route.color }]}>
                  <Text style={styles.routeTagText}>{routeNum}</Text>
                </View>
                <View style={styles.routeNameWrap}>
                  <Text style={[styles.routeName, { color: c.text }]}>{route.name} Route</Text>
                  <Text style={[styles.routeTerminal, { color: c.textSecondary }]}>
                    via {prettyTerminal(route.terminal)} · {route.stops.length} time points
                  </Text>
                </View>
                <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={22} color={c.textSecondary} />
              </TouchableOpacity>

              {isOpen && (
                <View style={[styles.routeCardBody, { borderTopColor: c.border }]}>
                  {!!route.description && (
                    <Text style={[styles.routeDescription, { color: c.textSecondary }]}>{route.description}</Text>
                  )}
                  {routeNum === '04'
                    ? YELLOW_SCHEDULE.map((row, i) => (
                        <View
                          key={`${row.offset}-${row.label}-${i}`}
                          style={[styles.flatRow, i < YELLOW_SCHEDULE.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }]]}
                        >
                          <Text style={[styles.flatOffset, { color: tint }]}>{row.offset}</Text>
                          <Text style={[styles.flatLabel, { color: c.text }]}>{row.label}</Text>
                        </View>
                      ))
                    : route.stops.map((stop, i) => (
                        <View
                          key={stop.key}
                          style={[styles.stopRow, i < route.stops.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }]]}
                        >
                          <View style={[styles.stopBadge, { borderColor: route.color }]}>
                            <Text style={[styles.stopBadgeText, { color: route.color }]}>{stop.number}</Text>
                          </View>
                          <Text style={[styles.stopLabel, { color: c.text }]} numberOfLines={2}>{stop.label}</Text>
                          <Text style={[styles.stopOffsets, { color: tint }]}>{minutesAfterHour(stop.times)}</Text>
                        </View>
                      ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 16, marginBottom: 8 },
  pageTitle: { fontSize: 28, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  scrollContent: { paddingBottom: 32 },

  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, marginLeft: 4 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
  },
  hoursLabel: { fontSize: 14, fontWeight: '600' },
  hoursSub: { fontSize: 12, marginTop: 2 },

  routeCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 10 },
  routeAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  routeHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingLeft: 16, paddingRight: 12 },
  routeTag: { minWidth: 34, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  routeTagText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  routeNameWrap: { flex: 1 },
  routeName: { fontSize: 16, fontWeight: '700' },
  routeTerminal: { fontSize: 12, marginTop: 1 },
  routeCardBody: { borderTopWidth: StyleSheet.hairlineWidth },
  routeDescription: { fontSize: 12, lineHeight: 17, paddingHorizontal: 14, paddingTop: 10, paddingLeft: 16 },

  stopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 16, paddingRight: 14, gap: 10 },
  stopBadge: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stopBadgeText: { fontSize: 11, fontWeight: '800' },
  stopLabel: { fontSize: 13, flex: 1 },
  stopOffsets: { fontSize: 12, fontWeight: '700' },

  flatRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 16, paddingRight: 14, gap: 12 },
  flatOffset: { fontSize: 13, fontWeight: '800', width: 36 },
  flatLabel: { fontSize: 13, flex: 1 },
});
