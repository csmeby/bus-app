import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BTD_TINT } from '@/constants/btd-theme';
import { Colors, DARK_MAP_STYLE } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import btdRoutesRaw from '../../btd_routes.json';

// ── types ─────────────────────────────────────────────────────────────────────

type BtdStopEntry = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  number: number;
  times: string[];
};

type BtdRoute = {
  name: string;
  color: string;
  terminal: string;
  description: string | null;
  stops: BtdStopEntry[];
  path: { lat: number; lng: number }[];
};

const btdRoutes = btdRoutesRaw as Record<string, BtdRoute>;
const ALL_BTD_ROUTES = Object.keys(btdRoutes).sort();

type MergedStop = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  routes: { route: string; routeName: string; color: string; number: number; times: string[] }[];
};

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// BTD has no live tracking, but its schedule is fixed — so "when's the next
// bus here" is pure clock math against the published times. `now` is passed
// in (minutes since local midnight) so all of a stop's routes agree on the
// same instant and re-derive together on each tick.
// Returns null when service isn't running (weekend, or no departures left today).
function nextDeparture(times: string[], nowMinutes: number, isWeekday: boolean):
  { time: string; index: number; minutesAway: number } | null {
  if (!isWeekday) return null;
  for (let i = 0; i < times.length; i++) {
    const t = toMinutes(times[i]);
    if (t >= nowMinutes) {
      return { time: times[i], index: i, minutesAway: t - nowMinutes };
    }
  }
  return null;
}

function prettyTerminal(terminal: string): string {
  return terminal
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ── direction arrows ─────────────────────────────────────────────────────────
// BTD routes are loops (except Yellow, an out-and-back corridor) with no live
// vehicles to imply direction visually — a few arrowheads along each active
// route's line, pointing the way the bus actually travels it, stand in for
// that. Positioned by CUMULATIVE DISTANCE along the path rather than by raw
// point index: OSRM's road-snapped points aren't evenly spaced (dense through
// turns, sparse on straightaways), so an index-based pick would cluster
// arrows in curvy sections and leave long straight stretches bare.

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Compass bearing (degrees, 0 = north) from a to b, for rotating the arrow glyph.
function bearing(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

const ARROW_FRACTIONS = [0.15, 0.4, 0.65, 0.9];

function routeArrowPoints(path: { lat: number; lng: number }[]): { coordinate: { lat: number; lng: number }; heading: number }[] {
  if (path.length < 2) return [];
  const cum = [0];
  for (let i = 1; i < path.length; i++) {
    cum.push(cum[i - 1] + haversineMeters(path[i - 1], path[i]));
  }
  const total = cum[cum.length - 1];
  if (total === 0) return [];

  return ARROW_FRACTIONS.map(frac => {
    const target = total * frac;
    let idx = cum.findIndex(d => d >= target);
    if (idx <= 0) idx = 1;
    if (idx >= path.length) idx = path.length - 1;
    return { coordinate: path[idx], heading: bearing(path[idx - 1], path[idx]) };
  });
}

// ── component ─────────────────────────────────────────────────────────────────

export default function BtdMapScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const tint = BTD_TINT[scheme];
  const insets = useSafeAreaInsets();

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(['all']);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedStop, setSelectedStop] = useState<MergedStop | null>(null);
  const stopSheetAnim = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);

  // Re-derives "next departure" highlights every 30s while a stop sheet is
  // open — the schedule itself is static, only "now" moves.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    if (!selectedStop) return;
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [selectedStop]);

  const now = new Date(nowTick);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;

  const toggleRoute = (route: string) => {
    if (route === 'all') { setSelectedRoutes(['all']); return; }
    let next = selectedRoutes.filter(r => r !== 'all');
    next = next.includes(route) ? next.filter(r => r !== route) : [...next, route];
    setSelectedRoutes(next.length === 0 ? ['all'] : next);
  };

  const activeRouteNums = selectedRoutes.includes('all') ? ALL_BTD_ROUTES : selectedRoutes;

  const sheetBg = scheme === 'dark' ? '#1C1C1E' : '#FFFFFF';
  const panelBg = scheme === 'dark' ? 'rgba(18,18,20,0.97)' : 'rgba(255,255,255,0.97)';
  const panelBorder = scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const routeLabel = selectedRoutes.includes('all')
    ? 'All Routes'
    : selectedRoutes.length === 1
      ? `${btdRoutes[selectedRoutes[0]]?.name ?? selectedRoutes[0]} Route`
      : `${selectedRoutes.length} Routes`;

  // Every physical stop, merged across the currently-active route(s) - a
  // stop shared by more than one route (corridor overlaps, shared terminals)
  // shows once on the map but carries every route's own number/schedule.
  const mergedStops = useMemo(() => {
    const byKey: Record<string, MergedStop> = {};
    for (const routeNum of activeRouteNums) {
      const route = btdRoutes[routeNum];
      if (!route) continue;
      for (const s of route.stops) {
        if (!byKey[s.key]) {
          byKey[s.key] = { key: s.key, label: s.label, lat: s.lat, lng: s.lng, routes: [] };
        }
        byKey[s.key].routes.push({
          route: routeNum, routeName: route.name, color: route.color, number: s.number, times: s.times,
        });
      }
    }
    return Object.values(byKey);
  }, [activeRouteNums]);

  // Arrowheads only for currently-active routes — with all 9 selected at
  // once, every route's arrows would still show, so this doesn't reduce
  // clutter in that case, but it does mean picking a route or two doesn't
  // pay the cost of computing arrows for routes not even being drawn.
  const routeArrows = useMemo(() => {
    return activeRouteNums.map(routeNum => ({
      routeNum,
      color: btdRoutes[routeNum].color,
      points: routeArrowPoints(btdRoutes[routeNum].path),
    }));
  }, [activeRouteNums]);

  // ── route bounds for zoom-to-fit ─────────────────────────────────────────
  const selectedRouteBounds = useMemo(() => {
    const activeRoutes = selectedRoutes.includes('all') ? ALL_BTD_ROUTES : selectedRoutes;
    if (activeRoutes.length === 0) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let hasCoords = false;

    activeRoutes.forEach(routeNum => {
      const route = btdRoutes[routeNum];
      if (!route?.path) return;
      
      route.path.forEach(({ lat, lng }) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
        hasCoords = true;
      });
    });

    if (!hasCoords) return null;

    const latPadding = (maxLat - minLat) * 0.2;
    const lngPadding = (maxLng - minLng) * 0.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + latPadding * 2,
      longitudeDelta: (maxLng - minLng) + lngPadding * 2,
    };
  }, [selectedRoutes]);

  // ── zoom to fit selected routes ──────────────────────────────────────────
  const previousSelectedRoutesRef = useRef<string[]>([]);
  const animateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = previousSelectedRoutesRef.current;
    
    // Check if selection actually changed
    const changed = selectedRoutes.length !== prev.length || 
      selectedRoutes.some(r => !prev.includes(r));
    
    if (changed) {
      // Clear any pending animation
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
      
      // Don't animate if nothing is selected
      if (selectedRoutes.length === 0) return;
      
      // Small delay to let polylines render
      animateTimeoutRef.current = setTimeout(() => {
        if (selectedRouteBounds && mapRef.current) {
          mapRef.current.animateToRegion(selectedRouteBounds, 800);
        }
        animateTimeoutRef.current = null;
      }, 100);
    }
    
    previousSelectedRoutesRef.current = selectedRoutes;
  }, [selectedRoutes, selectedRouteBounds]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
    };
  }, []);

  const openStop = useCallback((stop: MergedStop) => {
    setNowTick(Date.now()); // fresh "now" the moment it opens, not up to 30s stale
    setSelectedStop(stop);
    Animated.spring(stopSheetAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
  }, [stopSheetAnim]);
  const closeStop = useCallback(() => {
    Animated.spring(stopSheetAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start(() =>
      setSelectedStop(null)
    );
  }, [stopSheetAnim]);

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle={scheme}
        customMapStyle={scheme === 'dark' ? DARK_MAP_STYLE : []}
        initialRegion={{ latitude: 30.625, longitude: -96.32, latitudeDelta: 0.16, longitudeDelta: 0.16 }}
        onPress={closeStop}
      >
        {ALL_BTD_ROUTES.map(routeNum => {
          const route = btdRoutes[routeNum];
          const isActive = activeRouteNums.includes(routeNum);
          return (
            <Polyline
              key={`btd-line-${routeNum}`}
              coordinates={route.path.map(p => ({ latitude: p.lat, longitude: p.lng }))}
              strokeColor={isActive ? route.color : 'rgba(0,0,0,0)'}
              strokeWidth={isActive ? 4 : 2}
              zIndex={isActive ? 2 : 1}
            />
          );
        })}

        {mergedStops.map(stop => {
          const primary = [...stop.routes].sort((a, b) => a.route.localeCompare(b.route))[0];
          return (
            <Marker
              key={stop.key}
              coordinate={{ latitude: stop.lat, longitude: stop.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              zIndex={3}
              onPress={e => {
                // Without this, the tap bubbles up to the MapView's own
                // onPress (closeStop) right after this handler runs — the
                // sheet would open and get immediately snapped shut in the
                // same gesture.
                e.stopPropagation();
                openStop(stop);
              }}
            >
              <View
                style={[styles.stopBadge, { borderColor: primary.color, backgroundColor: sheetBg }]}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${stop.label}, bus stop`}
                accessibilityHint="Shows this stop's schedule"
              >
                <Text style={[styles.stopBadgeText, { color: primary.color }]}>{primary.number}</Text>
              </View>
            </Marker>
          );
        })}

        {/* Direction arrows — BTD's routes are fixed loops with no live
            vehicle to imply which way they run, so a few rotated arrowheads
            along each active route's line stand in for that. */}
        {routeArrows.flatMap(({ routeNum, color, points }) =>
          points.map((pt, i) => (
            <Marker
              key={`btd-arrow-${routeNum}-${i}`}
              coordinate={{ latitude: pt.coordinate.lat, longitude: pt.coordinate.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              tappable={false}
              zIndex={2}
            >
              <View style={[styles.arrowPivot, { transform: [{ rotate: `${pt.heading}deg` }] }]}>
                <View style={[styles.arrowGlyph, { borderBottomColor: color }]} />
              </View>
            </Marker>
          ))
        )}
      </MapView>

      {/* ── Floating panel ────────────────────────────────────────────────── */}
      <View style={[styles.panel, { top: insets.top + 8, backgroundColor: panelBg, borderColor: panelBorder }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: c.text }]} accessibilityRole="header">Brazos Transit District</Text>
          <View style={[styles.serviceBadge, { backgroundColor: isWeekday ? tint + '1A' : c.surfaceAlt }]}>
            <Text style={[styles.serviceBadgeText, { color: isWeekday ? tint : c.textSecondary }]}>
              {isWeekday ? 'Running Today' : 'No Weekend Service'}
            </Text>
          </View>
        </View>
        <View style={styles.panelMetaRow}>
          <MaterialIcons name="schedule" size={13} color={c.textSecondary} />
          <Text style={[styles.panelSubtitle, { color: c.textSecondary }]}>
            Mon-Fri 5 AM-7 PM · no live tracking
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.routeSelector, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Select routes, currently ${routeLabel}`}
          accessibilityHint="Opens the route picker"
        >
          <Text style={[styles.routeSelectorText, { color: c.text }]} numberOfLines={1}>{routeLabel}</Text>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Route selector modal ───────────────────────────────────────────── */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss route picker"
        />
        <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]} accessibilityRole="header">Select Routes</Text>
            <TouchableOpacity onPress={() => setDropdownVisible(false)} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.sheetDone, { color: tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.routeRow, selectedRoutes.includes('all') && { backgroundColor: tint + '15' }, { borderBottomColor: c.border }]}
            onPress={() => toggleRoute('all')}
            accessibilityRole="checkbox"
            accessibilityLabel="All routes"
            accessibilityState={{ checked: selectedRoutes.includes('all') }}
          >
            <View style={[styles.routeTag, { backgroundColor: selectedRoutes.includes('all') ? tint : c.surfaceAlt }]}>
              <Text style={[styles.routeTagText, { color: selectedRoutes.includes('all') ? '#fff' : c.textSecondary }]}>ALL</Text>
            </View>
            <Text style={[styles.routeName, { color: c.text }]}>All Routes</Text>
            {selectedRoutes.includes('all') && <Text style={[styles.checkmark, { color: tint }]}>✓</Text>}
          </TouchableOpacity>

          <FlatList
            data={ALL_BTD_ROUTES}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const selected = selectedRoutes.includes(item);
              const route = btdRoutes[item];
              return (
                <TouchableOpacity
                  style={[styles.routeRow, selected && { backgroundColor: tint + '15' }, { borderBottomColor: c.border }]}
                  onPress={() => toggleRoute(item)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${route.name} route, via ${prettyTerminal(route.terminal)}`}
                  accessibilityState={{ checked: selected }}
                >
                  {/* Tag keeps the route's brand color even unselected — BTD
                      routes are literally NAMED by their color, so a gray tag
                      throws away the fastest way to recognize one. */}
                  <View style={[styles.routeTag, { backgroundColor: route.color, opacity: selected ? 1 : 0.85 }]}>
                    <Text style={styles.routeTagText}>{item}</Text>
                  </View>
                  <View style={styles.routeNameWrap}>
                    <Text style={[styles.routeName, { color: c.text }]} numberOfLines={1}>{route.name} Route</Text>
                    <Text style={[styles.routeTerminal, { color: c.textSecondary }]} numberOfLines={1}>
                      via {prettyTerminal(route.terminal)}
                    </Text>
                  </View>
                  {selected && <Text style={[styles.checkmark, { color: route.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── Stop schedule panel ─────────────────────────────────────────────── */}
      {selectedStop && (
        <Animated.View
          style={[
            styles.stopSheet,
            { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY: stopSheetAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={2} accessibilityRole="header">{selectedStop.label}</Text>
              <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>
                {selectedStop.routes.length === 1
                  ? '1 route serves this stop'
                  : `${selectedStop.routes.length} routes serve this stop`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeStop}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close stop schedule"
              hitSlop={8}
            >
              <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {selectedStop.routes.map(r => {
              const next = nextDeparture(r.times, nowMinutes, isWeekday);
              return (
                <View key={r.route} style={styles.routeScheduleBlock}>
                  <View style={styles.routeScheduleHeader}>
                    <View style={[styles.stopBadge, styles.stopBadgeSmall, { borderColor: r.color, backgroundColor: sheetBg }]}>
                      <Text style={[styles.stopBadgeText, styles.stopBadgeTextSmall, { color: r.color }]}>{r.number}</Text>
                    </View>
                    <Text style={[styles.routeScheduleName, { color: c.text }]}>{r.routeName} Route</Text>
                    {next ? (
                      <View style={[styles.nextBadge, { backgroundColor: r.color + '1A' }]}>
                        <Text style={[styles.nextBadgeText, { color: r.color }]}>
                          {next.minutesAway === 0 ? 'Due now' : `Next in ${next.minutesAway} min`}
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.noServiceText, { color: c.textSecondary }]}>
                        {isWeekday ? 'Done for today' : 'No weekend service'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.timeGrid}>
                    {r.times.map((t, i) => {
                      const isNext = next?.index === i;
                      // Past times only dim on a weekday — on a weekend nothing
                      // ran, so "already passed" isn't true of any of them.
                      const isPast = isWeekday && (next ? i < next.index : true);
                      return (
                        <View
                          key={t}
                          style={[
                            styles.timeChip,
                            { backgroundColor: isNext ? r.color : c.surfaceAlt },
                            isPast && styles.timeChipPast,
                          ]}
                          accessible
                          accessibilityLabel={`${formatTime(t)}${isNext ? ', next departure' : isPast ? ', already departed' : ''}`}
                        >
                          <Text style={[
                            styles.timeChipText,
                            { color: isNext ? '#fff' : isPast ? c.textSecondary : c.text },
                            isNext && styles.timeChipTextNext,
                          ]}>
                            {formatTime(t)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  panel: {
    position: 'absolute', left: 12, right: 12, borderRadius: 16, borderWidth: 1,
    padding: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  panelTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, flexShrink: 1 },
  serviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  serviceBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  serviceBadgeText: { fontSize: 11, fontWeight: '700' },
  panelMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6, marginBottom: 10 },
  panelSubtitle: { fontSize: 12, flexShrink: 1 },
  routeSelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  routeSelectorText: { fontSize: 15, fontWeight: '500', flex: 1 },
  chevron: { fontSize: 20, fontWeight: '300' },

  stopBadge: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  stopBadgeSmall: { width: 22, height: 22, borderRadius: 11 },
  stopBadgeText: { fontSize: 12, fontWeight: '800' },
  stopBadgeTextSmall: { fontSize: 11 },

  // A north-pointing triangle rotated to `heading` — bearing() is measured
  // from north, so the untransformed glyph has to point north too, or every
  // rotation would be off by a constant offset.
  arrowPivot: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  arrowGlyph: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '75%' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { fontSize: 17, fontWeight: '600' },
  sheetDone: { fontSize: 16, fontWeight: '600' },
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  routeTag: { minWidth: 36, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  routeTagText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  routeNameWrap: { flex: 1 },
  routeName: { fontSize: 15, fontWeight: '500' },
  routeTerminal: { fontSize: 12, marginTop: 1 },
  checkmark: { fontSize: 18, fontWeight: '700' },

  stopSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: -4 },
  },
  stopSheetHeader: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  stopSheetTitle: { fontSize: 17, fontWeight: '600' },
  stopSheetSubtitle: { fontSize: 13, marginTop: 2 },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, fontWeight: '500' },

  routeScheduleBlock: { paddingHorizontal: 20, paddingTop: 14 },
  routeScheduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  routeScheduleName: { fontSize: 15, fontWeight: '600', flex: 1 },
  nextBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  nextBadgeText: { fontSize: 12, fontWeight: '700' },
  noServiceText: { fontSize: 12, fontWeight: '500' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 6 },
  timeChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  timeChipPast: { opacity: 0.45 },
  timeChipText: { fontSize: 12, fontWeight: '500' },
  timeChipTextNext: { fontWeight: '700' },
});