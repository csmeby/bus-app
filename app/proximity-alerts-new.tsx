import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScheduleWindowPicker } from '@/components/schedule-window-picker';
import { DARK_MAP_STYLE } from '@/constants/theme';
import { ALL_ROUTES } from '@/constants/routes';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useFavorites } from '@/context/favorites-context';
import { GOOGLE_MAPS_IOS_READY, useMapProvider } from '@/context/map-provider-context';
import { useThemeColors } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import { MarkerImageFactory, useMarkerImage } from '@/lib/marker-image-factory';
import { AlertPrefs, ProximityAlertConfig, RideWindow, registerPushTokenWithServer } from '@/lib/notifications';
import { getRoutePatterns, getRoutesForStopCode, regionForStops, RoutePatterns, RouteStopRow } from '@/lib/route-stops';

const SELECTED_COLOR = '#22C55E';

type Direction = 'inbound' | 'outbound' | 'circulator';

const DIRECTION_LABELS: Record<Direction, string> = { inbound: 'Inbound', outbound: 'Outbound', circulator: 'Stop' };

// One stop as it appears on ONE direction's pattern - `number` is a
// continuous sequence across the whole route (outbound stops numbered
// first, then inbound continues from where outbound left off), NOT reset
// per direction, so the two directions of a route never show duplicate
// numbers on the same map.
type NumberedStop = RouteStopRow & {
  direction: Direction;
  directionKey?: string;
  number: number;
};

const PREFS_KEY = 'alert-prefs-v2';
const EMPTY_PREFS: AlertPrefs = { routeConfigs: [], proximityConfigs: [] };

type Step = 'route' | 'stop' | 'shared' | 'threshold' | 'schedule';

const STEP_TITLES: Record<Step, string> = {
  route: 'Which route?',
  stop: 'Which stop?',
  shared: 'Shared stop',
  threshold: 'How close?',
  schedule: 'When?',
};

// Numbered circle badge in the route's own brand color, same visual language
// as app/(btd)/map.tsx's BtdStopMarker (including its iOS+Google Maps
// composed-view-can't-snapshot workaround - see lib/marker-image-factory.tsx
// for the full writeup). Pulled out of the .map() loop below because
// useMarkerImage is a hook.
function StopBadgeMarker({
  coordinate, title, label, accessibilityLabel, color, selected, sheetBg, iconScale, isGoogleMaps, onPress,
}: {
  coordinate: { latitude: number; longitude: number };
  title: string;
  label: string;
  accessibilityLabel: string;
  color: string;
  selected: boolean;
  sheetBg: string;
  iconScale: number;
  isGoogleMaps: boolean;
  onPress: () => void;
}) {
  const badgeColor = selected ? SELECTED_COLOR : color;
  const size = 26 * iconScale;
  const imageKey = Platform.OS === 'ios' && isGoogleMaps
    ? `prox-stop-${badgeColor}-${sheetBg}-${label}-${size}`
    : null;
  const badge = (
    <View style={[styles.stopBadge, { borderColor: badgeColor, backgroundColor: sheetBg, width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.stopBadgeText, { color: badgeColor, fontSize: (label.length > 1 ? 10 : 12) * iconScale }]}>{label}</Text>
    </View>
  );
  const imageUri = useMarkerImage(imageKey, () => badge, size, size);

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={isGoogleMaps && !imageUri}
      zIndex={selected ? 3 : 2}
      title={title}
      accessibilityLabel={accessibilityLabel}
      onPress={e => {
        e.stopPropagation?.();
        onPress();
      }}
      {...(imageUri ? { image: { uri: imageUri } } : {})}
    >
      {!imageUri && badge}
    </Marker>
  );
}

export default function NewProximityAlertScreen() {
  const c = useThemeColors();
  const scheme = useColorScheme();
  const { isFavorite } = useFavorites();
  const { iconSize } = useAccessibility();
  const iconScale = ICON_SCALE[iconSize];
  const { mapProvider } = useMapProvider();
  const provider = Platform.OS === 'ios' && mapProvider === 'google' && GOOGLE_MAPS_IOS_READY ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
  const isGoogleMaps = Platform.OS === 'android' || provider === PROVIDER_GOOGLE;
  const sheetBg = scheme === 'dark' ? '#1C1C1E' : '#FFFFFF';

  const [route, setRoute] = useState<string | null>(null);
  const [routePatterns, setRoutePatterns] = useState<RoutePatterns | null>(null);
  const [loadingStops, setLoadingStops] = useState(false);
  const [stop, setStop] = useState<NumberedStop | null>(null);
  // Set only when a tapped stop is served by more than one direction of this
  // route (same physical stop code in both the inbound and outbound
  // pattern) - holds every direction's entry for that code until the rider
  // picks which one this alert should watch.
  const [pendingChoice, setPendingChoice] = useState<NumberedStop[] | null>(null);

  const [sharedRoutes, setSharedRoutes] = useState<string[]>([]);
  const [loadingShared, setLoadingShared] = useState(false);
  const [includedSharedRoutes, setIncludedSharedRoutes] = useState<Set<string>>(new Set());

  const [thresholdMinutes, setThresholdMinutes] = useState('5');
  const [schedule, setSchedule] = useState<RideWindow[]>([]);
  const [saving, setSaving] = useState(false);

  const steps: Step[] = useMemo(() => {
    const base: Step[] = ['route', 'stop'];
    if (stop && sharedRoutes.length > 0) base.push('shared');
    base.push('threshold', 'schedule');
    return base;
  }, [stop, sharedRoutes]);

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  // Route chosen: fetch that route's own color/polylines/stops, reset
  // anything downstream since it no longer applies to the new route.
  useEffect(() => {
    if (!route) return;
    setLoadingStops(true);
    setRoutePatterns(null);
    setStop(null);
    setPendingChoice(null);
    setSharedRoutes([]);
    getRoutePatterns(route, API_BASE)
      .then(setRoutePatterns)
      .finally(() => setLoadingStops(false));
  }, [route]);

  // Stop chosen: check whether any other route shares this exact physical
  // stop - drives whether the "shared" step appears at all.
  useEffect(() => {
    if (!stop || !route) return;
    setLoadingShared(true);
    getRoutesForStopCode(stop.code, API_BASE)
      .then(routes => {
        const others = routes.filter(r => r !== route);
        setSharedRoutes(others);
        setIncludedSharedRoutes(new Set(others)); // default: include all
      })
      .finally(() => setLoadingShared(false));
  }, [stop, route]);

  // Outbound numbered first, inbound continues from there (never restarts
  // at 1) - e.g. a 9-stop outbound pattern's inbound counterpart starts at
  // 10 - so the same route's two directions never show duplicate numbers.
  const numberedStops = useMemo<NumberedStop[]>(() => {
    const out: NumberedStop[] = [];
    let n = 0;
    (routePatterns?.outbound?.stops ?? []).forEach(s => {
      n += 1;
      out.push({ ...s, direction: 'outbound', directionKey: routePatterns?.outbound?.directionKey, number: n });
    });
    (routePatterns?.inbound?.stops ?? []).forEach(s => {
      n += 1;
      out.push({ ...s, direction: 'inbound', directionKey: routePatterns?.inbound?.directionKey, number: n });
    });
    (routePatterns?.circulator ?? []).forEach(p => {
      p.stops.forEach(s => {
        n += 1;
        out.push({ ...s, direction: 'circulator', directionKey: p.directionKey, number: n });
      });
    });
    return out;
  }, [routePatterns]);

  // One marker per unique physical stop code - a code served by more than
  // one direction (a stop both directions of this route pass through)
  // collapses to a single marker here so the two don't render on top of
  // each other; tapping it opens the direction chooser instead of picking
  // straight away (see chooseStop below).
  const markerGroups = useMemo(() => {
    const byCode = new Map<string, NumberedStop[]>();
    numberedStops.forEach(s => {
      byCode.set(s.code, [...(byCode.get(s.code) ?? []), s]);
    });
    return [...byCode.values()];
  }, [numberedStops]);

  const stopMapRegion = useMemo(() => regionForStops(numberedStops), [numberedStops]);

  const chooseStop = (entries: NumberedStop[]) => {
    if (entries.length === 1) {
      setStop(entries[0]);
      setPendingChoice(null);
    } else {
      setPendingChoice(entries);
    }
  };

  const finalizeChoice = (s: NumberedStop) => {
    setStop(s);
    setPendingChoice(null);
  };

  const sortedRoutes = [...ALL_ROUTES].sort((a, b) => {
    const af = isFavorite(a) ? 0 : 1;
    const bf = isFavorite(b) ? 0 : 1;
    return af - bf;
  });

  const toggleSharedRoute = (r: string) =>
    setIncludedSharedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });

  const canAdvance =
    (step === 'route' && !!route) ||
    (step === 'stop' && !!stop) ||
    step === 'shared' ||
    (step === 'threshold' && thresholdMinutes !== '' && parseInt(thresholdMinutes, 10) > 0) ||
    step === 'schedule';

  const goNext = async () => {
    if (step === 'schedule') {
      await save();
      return;
    }
    setStepIndex(i => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.back();
      return;
    }
    setStepIndex(i => Math.max(i - 1, 0));
  };

  const save = async () => {
    if (!route || !stop) return;
    setSaving(true);
    try {
      const config: ProximityAlertConfig = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        stopCode: stop.code,
        stopName: stop.name,
        routes: [route, ...[...includedSharedRoutes]],
        directionKey: stop.directionKey,
        thresholdMinutes: parseInt(thresholdMinutes, 10) || 5,
        schedule,
      };
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      let prefs: AlertPrefs = EMPTY_PREFS;
      if (raw) {
        try { prefs = { ...EMPTY_PREFS, ...JSON.parse(raw) }; } catch {}
      }
      const next: AlertPrefs = { ...prefs, proximityConfigs: [...prefs.proximityConfigs, config] };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      registerPushTokenWithServer(API_BASE, next).catch(() => {});
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const routeColor = routePatterns?.color ?? '#888888';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
          <Text style={[styles.backArrow, { color: c.tint }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">{STEP_TITLES[step]}</Text>
      </View>

      <View style={styles.progressRow}>
        {steps.map((s, i) => (
          <View key={s} style={[styles.progressDot, { backgroundColor: i <= stepIndex ? c.tint : c.border }]} />
        ))}
      </View>

      {step === 'stop' ? (
        loadingStops ? (
          <ActivityIndicator color={c.tint} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.mapWrap}>
            <View style={styles.legendRow}>
              {!!routePatterns?.inbound && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, { backgroundColor: routeColor }]} />
                  <Text style={[styles.legendText, { color: c.textSecondary }]}>Inbound</Text>
                </View>
              )}
              {!!routePatterns?.outbound && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendLine, styles.legendLineDashed, { borderColor: routeColor }]} />
                  <Text style={[styles.legendText, { color: c.textSecondary }]}>Outbound</Text>
                </View>
              )}
              <Text style={[styles.legendText, { color: c.textSecondary, marginLeft: 'auto' }]}>Tap a stop</Text>
            </View>
            <View style={[styles.mapContainer, { borderColor: c.border }]}>
              <MarkerImageFactory />
              <MapView
                key={provider === PROVIDER_GOOGLE ? 'google' : 'default'}
                style={{ flex: 1 }}
                provider={provider}
                initialRegion={stopMapRegion}
                userInterfaceStyle={scheme}
                customMapStyle={scheme === 'dark' ? DARK_MAP_STYLE : []}
              >
                {routePatterns?.inbound && (
                  <Polyline coordinates={routePatterns.inbound.coordinates} strokeColor={routeColor} strokeWidth={4} zIndex={1} />
                )}
                {routePatterns?.outbound && (
                  <Polyline
                    coordinates={routePatterns.outbound.coordinates}
                    strokeColor={routeColor}
                    strokeWidth={4}
                    lineDashPattern={[8, 6]}
                    zIndex={1}
                  />
                )}
                {routePatterns?.circulator?.map((p, i) => (
                  <Polyline key={`circ-line-${i}`} coordinates={p.coordinates} strokeColor={routeColor} strokeWidth={4} zIndex={1} />
                ))}

                {markerGroups.map(entries => {
                  const first = entries[0];
                  const shared = entries.length > 1;
                  return (
                    <StopBadgeMarker
                      key={first.code}
                      coordinate={first.coordinate}
                      title={first.name}
                      label={shared ? '⇄' : String(first.number)}
                      accessibilityLabel={
                        shared
                          ? `${first.name}, served by both directions - tap to choose one`
                          : `${first.name}, stop ${first.number}`
                      }
                      color={routeColor}
                      selected={stop?.code === first.code}
                      sheetBg={sheetBg}
                      iconScale={iconScale}
                      isGoogleMaps={isGoogleMaps}
                      onPress={() => chooseStop(entries)}
                    />
                  );
                })}
              </MapView>
            </View>
            {pendingChoice ? (
              <View style={[styles.selectedStopBanner, styles.chooserBanner, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Text style={[styles.chooserTitle, { color: c.text }]} numberOfLines={1}>
                  Which direction? ({pendingChoice[0].name})
                </Text>
                <View style={styles.chooserRow}>
                  {pendingChoice.map(entry => (
                    <TouchableOpacity
                      key={entry.direction}
                      style={[styles.chooserOption, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                      onPress={() => finalizeChoice(entry)}
                      accessibilityRole="button"
                      accessibilityLabel={`${DIRECTION_LABELS[entry.direction]}, stop ${entry.number}`}
                    >
                      <Text style={[styles.chooserOptionText, { color: c.text }]}>{DIRECTION_LABELS[entry.direction]}</Text>
                      <Text style={[styles.chooserOptionSub, { color: c.textSecondary }]}>Stop {entry.number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : stop && (
              <View style={[styles.selectedStopBanner, { backgroundColor: c.surface, borderColor: c.border }]}>
                <MaterialIcons name="check-circle" size={18} color={SELECTED_COLOR} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.selectedStopText, { color: c.text }]} numberOfLines={1}>{stop.name}</Text>
                  <Text style={[styles.selectedStopSub, { color: c.textSecondary }]}>{DIRECTION_LABELS[stop.direction]} · Stop {stop.number}</Text>
                </View>
              </View>
            )}
          </View>
        )
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {step === 'route' && (
          <View style={styles.chipWrap}>
            {sortedRoutes.map(r => {
              const selected = r === route;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.routeChip, { backgroundColor: selected ? c.tint : c.surfaceAlt, borderColor: c.border }]}
                  onPress={() => setRoute(r)}
                  accessibilityRole="radio"
                  accessibilityLabel={`Route ${r}${isFavorite(r) ? ', favorite' : ''}`}
                  accessibilityState={{ checked: selected }}
                  hitSlop={7}
                >
                  {isFavorite(r) && <Text style={{ fontSize: 11, color: selected ? '#fff' : c.text }}>★ </Text>}
                  <Text style={[styles.routeChipText, { color: selected ? '#fff' : c.text }]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {step === 'shared' && (
          loadingShared ? (
            <ActivityIndicator color={c.tint} style={{ marginTop: 24 }} />
          ) : (
            <>
              <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
                {stop?.name} is also serviced by route{sharedRoutes.length > 1 ? 's' : ''} {sharedRoutes.join(', ')}. Include those?
              </Text>
              {sharedRoutes.map(r => {
                const included = includedSharedRoutes.has(r);
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.stopRow, { borderColor: c.border }]}
                    onPress={() => toggleSharedRoute(r)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Include route ${r}`}
                    accessibilityState={{ checked: included }}
                  >
                    <Text style={[styles.stopRowText, { color: included ? c.text : c.textSecondary }]}>Route {r}</Text>
                    {included ? (
                      <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>
                    ) : (
                      <Text style={[styles.checkmark, { color: c.textSecondary }]}>✕</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </>
          )
        )}

        {step === 'threshold' && (
          <View style={styles.thresholdRow}>
            <Text style={[styles.thresholdLabel, { color: c.text }]}>Notify me when a bus is</Text>
            <TextInput
              value={thresholdMinutes}
              onChangeText={val => setThresholdMinutes(val.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              autoFocus
              accessibilityLabel="Minutes-away threshold"
              accessibilityHint="Notifies you when a bus is at least this close, in minutes"
              style={[styles.thresholdInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
            />
            <Text style={[styles.thresholdLabel, { color: c.text }]}>minutes away</Text>
          </View>
        )}

        {step === 'schedule' && (
          <ScheduleWindowPicker
            schedule={schedule}
            onChange={setSchedule}
            c={c}
            label="Notify me during these times:"
          />
        )}
      </ScrollView>
      )}

      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: c.tint }, !canAdvance && { opacity: 0.5 }]}
        onPress={goNext}
        disabled={!canAdvance || saving}
        accessibilityRole="button"
        accessibilityLabel={step === 'schedule' ? 'Save alert' : 'Next'}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.nextBtnText}>{step === 'schedule' ? 'Save alert' : 'Next'}</Text>
            {step !== 'schedule' && <MaterialIcons name="arrow-forward" size={18} color="#fff" />}
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  backBtn: { paddingRight: 10, paddingVertical: 4 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 24, fontWeight: '700', flex: 1 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },

  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

  mapWrap: { flex: 1, marginBottom: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendLine: { width: 18, height: 3, borderRadius: 1.5 },
  legendLineDashed: { backgroundColor: 'transparent', borderTopWidth: 3, borderStyle: 'dashed', height: 0 },
  legendText: { fontSize: 12, fontWeight: '600' },
  mapContainer: { flex: 1, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  selectedStopBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginTop: 10,
  },
  selectedStopText: { fontSize: 14, fontWeight: '600' },
  selectedStopSub: { fontSize: 12, marginTop: 1 },

  chooserBanner: { flexDirection: 'column', alignItems: 'stretch' },
  chooserTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  chooserRow: { flexDirection: 'row', gap: 8 },
  chooserOption: { flex: 1, borderRadius: 10, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
  chooserOptionText: { fontSize: 13, fontWeight: '700' },
  chooserOptionSub: { fontSize: 11, marginTop: 2 },

  stopBadge: {
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  stopBadgeText: { fontWeight: '800' },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  routeChipText: { fontSize: 14, fontWeight: '600' },

  stopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 8,
  },
  stopRowText: { fontSize: 14, fontWeight: '500', flex: 1, marginRight: 8 },
  checkmark: { fontSize: 16, fontWeight: '700' },

  thresholdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  thresholdLabel: { fontSize: 16, fontWeight: '500' },
  thresholdInput: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 16, fontWeight: '700', minWidth: 56, textAlign: 'center',
  },

  nextBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, marginBottom: 16,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
