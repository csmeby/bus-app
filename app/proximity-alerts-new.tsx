import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScheduleWindowPicker } from '@/components/schedule-window-picker';
import { ALL_ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/favorites-context';
import { useThemeColors } from '@/context/theme-context';
import { API_BASE } from '@/lib/api-base';
import { AlertPrefs, ProximityAlertConfig, RideWindow, registerPushTokenWithServer } from '@/lib/notifications';
import { DirectionStops, getDirectionStops, getRoutesForStopCode, RouteStopRow } from '@/lib/route-stops';

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

export default function NewProximityAlertScreen() {
  const c = useThemeColors();
  const { isFavorite } = useFavorites();

  const [route, setRoute] = useState<string | null>(null);
  const [directionStops, setDirectionStops] = useState<DirectionStops | null>(null);
  const [loadingStops, setLoadingStops] = useState(false);
  const [stop, setStop] = useState<RouteStopRow | null>(null);

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

  // Route chosen: fetch that route's own stops (inbound/outbound), reset
  // anything downstream since it no longer applies to the new route.
  useEffect(() => {
    if (!route) return;
    setLoadingStops(true);
    setDirectionStops(null);
    setStop(null);
    setSharedRoutes([]);
    getDirectionStops(route, API_BASE)
      .then(setDirectionStops)
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

        {step === 'stop' && (
          loadingStops ? (
            <ActivityIndicator color={c.tint} style={{ marginTop: 24 }} />
          ) : (
            <>
              {(['inbound', 'outbound', 'circulator'] as const).map(dir => {
                const rows = directionStops?.[dir];
                if (!rows || rows.length === 0) return null;
                const heading = dir === 'inbound' ? 'Inbound' : dir === 'outbound' ? 'Outbound' : 'Stops';
                return (
                  <View key={dir} style={{ marginBottom: 16 }}>
                    <Text style={[styles.sectionTitle, { color: c.textSecondary }]}>{heading}</Text>
                    {rows.map(s => {
                      const selected = stop?.code === s.code;
                      return (
                        <TouchableOpacity
                          key={s.code}
                          style={[styles.stopRow, { borderColor: c.border }, selected && { backgroundColor: c.tint + '15' }]}
                          onPress={() => setStop(s)}
                          accessibilityRole="radio"
                          accessibilityLabel={s.name}
                          accessibilityState={{ checked: selected }}
                        >
                          <Text style={[styles.stopRowText, { color: c.text }]} numberOfLines={1}>{s.name}</Text>
                          {selected && <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </>
          )
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

  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

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
