import React, { useCallback, useMemo, useState } from 'react';
import {
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

// ── component ─────────────────────────────────────────────────────────────────

export default function BtdMapScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const tint = BTD_TINT[scheme];
  const insets = useSafeAreaInsets();

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(['all']);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedStop, setSelectedStop] = useState<MergedStop | null>(null);

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

  const openStop = useCallback((stop: MergedStop) => setSelectedStop(stop), []);
  const closeStop = useCallback(() => setSelectedStop(null), []);

  return (
    <View style={styles.root}>
      <MapView
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
              onPress={() => openStop(stop)}
            >
              <View style={[styles.stopBadge, { borderColor: primary.color, backgroundColor: sheetBg }]}>
                <Text style={[styles.stopBadgeText, { color: primary.color }]}>{primary.number}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ── Floating panel ────────────────────────────────────────────────── */}
      <View style={[styles.panel, { top: insets.top + 8, backgroundColor: panelBg, borderColor: panelBorder }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: c.text }]}>Brazos Transit District</Text>
        </View>
        <Text style={[styles.panelSubtitle, { color: c.textSecondary }]}>
          Fixed routes, no live tracking available.
        </Text>
        <TouchableOpacity
          style={[styles.routeSelector, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.routeSelectorText, { color: c.text }]} numberOfLines={1}>{routeLabel}</Text>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Route selector modal ───────────────────────────────────────────── */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)} />
        <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]}>Select Routes</Text>
            <TouchableOpacity onPress={() => setDropdownVisible(false)}>
              <Text style={[styles.sheetDone, { color: tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.routeRow, selectedRoutes.includes('all') && { backgroundColor: tint + '15' }, { borderBottomColor: c.border }]}
            onPress={() => toggleRoute('all')}
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
                >
                  <View style={[styles.routeTag, { backgroundColor: selected ? route.color : c.surfaceAlt }]}>
                    <Text style={[styles.routeTagText, { color: selected ? '#fff' : c.text }]}>{item}</Text>
                  </View>
                  <Text style={[styles.routeName, { color: c.text }]} numberOfLines={1}>{route.name} Route</Text>
                  {selected && <Text style={[styles.checkmark, { color: route.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── Stop schedule panel ─────────────────────────────────────────────── */}
      {selectedStop && (
        <View style={[styles.stopSheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={2}>{selectedStop.label}</Text>
              <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>
                {selectedStop.routes.length === 1 ? '1 route' : `${selectedStop.routes.length} routes`} serve this stop
              </Text>
            </View>
            <TouchableOpacity onPress={closeStop} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {selectedStop.routes.map(r => (
              <View key={r.route} style={styles.routeScheduleBlock}>
                <View style={styles.routeScheduleHeader}>
                  <View style={[styles.stopBadge, styles.stopBadgeSmall, { borderColor: r.color, backgroundColor: sheetBg }]}>
                    <Text style={[styles.stopBadgeText, styles.stopBadgeTextSmall, { color: r.color }]}>{r.number}</Text>
                  </View>
                  <Text style={[styles.routeScheduleName, { color: c.text }]}>{r.routeName} Route</Text>
                </View>
                <View style={styles.timeGrid}>
                  {r.times.map(t => (
                    <View key={t} style={[styles.timeChip, { backgroundColor: c.surfaceAlt }]}>
                      <Text style={[styles.timeChipText, { color: c.text }]}>{formatTime(t)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
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
  panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 17, fontWeight: '700' },
  panelSubtitle: { fontSize: 12, marginTop: 4, marginBottom: 10 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '75%' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 6 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetTitle: { fontSize: 17, fontWeight: '600' },
  sheetDone: { fontSize: 16, fontWeight: '600' },
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  routeTag: { minWidth: 36, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  routeTagText: { fontSize: 13, fontWeight: '700' },
  routeName: { fontSize: 15, flex: 1 },
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
  routeScheduleName: { fontSize: 15, fontWeight: '600' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 6 },
  timeChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  timeChipText: { fontSize: 12, fontWeight: '500' },
});
