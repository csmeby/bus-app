import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScheduleWindowPicker } from '@/components/schedule-window-picker';
import { ALL_ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/favorites-context';
import { useThemeColors } from '@/context/theme-context';
import { API_BASE } from '@/lib/api-base';
import { AlertPrefs, defaultRouteAlertConfig, registerPushTokenWithServer, RideWindow } from '@/lib/notifications';

const PREFS_KEY = 'alert-prefs-v2';
const EMPTY_PREFS: AlertPrefs = { routeConfigs: [], proximityConfigs: [] };

type Step = 'route' | 'schedule' | 'threshold' | 'final';

const STEP_TITLES: Record<Step, string> = {
  route: 'Which route?',
  schedule: 'When?',
  threshold: 'How late?',
  final: 'Alerts',
};

export default function NewRouteAlertScreen() {
  const c = useThemeColors();
  const { isFavorite } = useFavorites();
  const params = useLocalSearchParams<{ route?: string }>();
  const editingRoute = params.route ?? null; // present = editing an existing route's alert, route itself is fixed

  const [loading, setLoading] = useState(!!editingRoute);
  const [route, setRoute] = useState<string | null>(editingRoute);
  const [schedule, setSchedule] = useState<RideWindow[]>([]);
  const [thresholdMinutes, setThresholdMinutes] = useState('10');
  const [notifyReroutes, setNotifyReroutes] = useState(true);
  const [notifyNews, setNotifyNews] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editing an existing route's alert: prefill from whatever's stored for it.
  useEffect(() => {
    if (!editingRoute) return;
    (async () => {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        try {
          const prefs: AlertPrefs = { ...EMPTY_PREFS, ...JSON.parse(raw) };
          const existing = prefs.routeConfigs.find(rc => rc.route === editingRoute);
          if (existing) {
            setSchedule(existing.schedule);
            setThresholdMinutes(String(existing.delayThresholdMinutes));
            setNotifyReroutes(existing.notifyReroutes);
            // notifyNews didn't exist on configs saved before this field was
            // added - default true to preserve the old implicit behavior
            // (any added route got news) rather than silently opting out.
            setNotifyNews(existing.notifyNews ?? true);
          }
        } catch {}
      }
      setLoading(false);
    })();
  }, [editingRoute]);

  const steps: Step[] = useMemo(
    () => (editingRoute ? ['schedule', 'threshold', 'final'] : ['route', 'schedule', 'threshold', 'final']),
    [editingRoute],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const step = steps[Math.min(stepIndex, steps.length - 1)];

  const sortedRoutes = [...ALL_ROUTES].sort((a, b) => {
    const af = isFavorite(a) ? 0 : 1;
    const bf = isFavorite(b) ? 0 : 1;
    return af - bf;
  });

  const canAdvance =
    (step === 'route' && !!route) ||
    step === 'schedule' ||
    (step === 'threshold' && thresholdMinutes !== '' && parseInt(thresholdMinutes, 10) > 0) ||
    step === 'final';

  const goNext = async () => {
    if (step === 'final') {
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
    if (!route) return;
    setSaving(true);
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      let prefs: AlertPrefs = EMPTY_PREFS;
      if (raw) {
        try { prefs = { ...EMPTY_PREFS, ...JSON.parse(raw) }; } catch {}
      }
      const config = {
        ...defaultRouteAlertConfig(route),
        schedule,
        delayThresholdMinutes: parseInt(thresholdMinutes, 10) || 10,
        notifyReroutes,
        notifyNews,
      };
      const exists = prefs.routeConfigs.some(rc => rc.route === route);
      const next: AlertPrefs = {
        ...prefs,
        routeConfigs: exists
          ? prefs.routeConfigs.map(rc => (rc.route === route ? config : rc))
          : [...prefs.routeConfigs, config],
      };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
      registerPushTokenWithServer(API_BASE, next).catch(() => {});
      router.back();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, styles.centerFill, { backgroundColor: c.background }]}>
        <ActivityIndicator color={c.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.6} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
          <Text style={[styles.backArrow, { color: c.tint }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">
          {editingRoute ? `Route ${editingRoute}` : STEP_TITLES[step]}
        </Text>
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

        {step === 'schedule' && (
          <ScheduleWindowPicker
            schedule={schedule}
            onChange={setSchedule}
            c={c}
            label="Notify me during these times if the route is running late:"
          />
        )}

        {step === 'threshold' && (
          <View style={styles.thresholdRow}>
            <Text style={[styles.thresholdLabel, { color: c.text }]}>Notify me if running</Text>
            <TextInput
              value={thresholdMinutes}
              onChangeText={val => setThresholdMinutes(val.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={3}
              autoFocus
              accessibilityLabel="Delay threshold in minutes"
              accessibilityHint="Notifies you when the route is running at least this many minutes late"
              style={[styles.thresholdInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
            />
            <Text style={[styles.thresholdLabel, { color: c.text }]}>minutes late</Text>
          </View>
        )}

        {step === 'final' && (
          <>
            <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
              These always send right away, regardless of the schedule you set.
            </Text>
            <TouchableOpacity
              style={[styles.toggleRow, { borderColor: c.border }]}
              onPress={() => setNotifyReroutes(v => !v)}
              accessibilityRole="checkbox"
              accessibilityLabel="Get reroute notifications"
              accessibilityState={{ checked: notifyReroutes }}
            >
              <View style={styles.toggleRowText}>
                <Text style={[styles.toggleRowTitle, { color: notifyReroutes ? c.text : c.textSecondary }]}>Get reroute notifications?</Text>
                <Text style={[styles.toggleRowDesc, { color: c.textSecondary }]}>Detours and modified paths on this route.</Text>
              </View>
              {notifyReroutes ? (
                <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>
              ) : (
                <Text style={[styles.checkmark, { color: c.textSecondary }]}>✕</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleRow, { borderColor: c.border }]}
              onPress={() => setNotifyNews(v => !v)}
              accessibilityRole="checkbox"
              accessibilityLabel="Get official transit news notifications"
              accessibilityState={{ checked: notifyNews }}
            >
              <View style={styles.toggleRowText}>
                <Text style={[styles.toggleRowTitle, { color: notifyNews ? c.text : c.textSecondary }]}>Get official transit news notifications?</Text>
                <Text style={[styles.toggleRowDesc, { color: c.textSecondary }]}>Service disruptions and announcements for this route.</Text>
              </View>
              {notifyNews ? (
                <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>
              ) : (
                <Text style={[styles.checkmark, { color: c.textSecondary }]}>✕</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.nextBtn, { backgroundColor: c.tint }, !canAdvance && { opacity: 0.5 }]}
        onPress={goNext}
        disabled={!canAdvance || saving}
        accessibilityRole="button"
        accessibilityLabel={step === 'final' ? 'Save alert' : 'Next'}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.nextBtnText}>{step === 'final' ? 'Save alert' : 'Next'}</Text>
            {step !== 'final' && <MaterialIcons name="arrow-forward" size={18} color="#fff" />}
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  centerFill: { alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  backBtn: { paddingRight: 10, paddingVertical: 4 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 24, fontWeight: '700', flex: 1 },

  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },

  sectionDesc: { fontSize: 14, lineHeight: 20, marginBottom: 16 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  routeChipText: { fontSize: 14, fontWeight: '600' },

  thresholdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  thresholdLabel: { fontSize: 16, fontWeight: '500' },
  thresholdInput: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 16, fontWeight: '700', minWidth: 56, textAlign: 'center',
  },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10, gap: 10,
  },
  toggleRowText: { flex: 1 },
  toggleRowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  toggleRowDesc: { fontSize: 12, lineHeight: 16 },
  checkmark: { fontSize: 18, fontWeight: '700' },

  nextBtn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, paddingVertical: 14, marginBottom: 16,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
