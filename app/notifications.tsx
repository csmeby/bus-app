import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ALL_ROUTES } from '@/constants/routes';
import { Colors } from '@/constants/theme';
import { useFavorites } from '@/context/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import {
  AlertPrefs,
  RideWindow,
  registerPushTokenWithServer,
  requestNotificationPermission,
  sendLocalTestNotification,
} from '@/lib/notifications';

const ENABLED_KEY = 'notifications-enabled';
const PREFS_KEY = 'alert-prefs';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // index = server weekday (Mon=0)

// Half-hour choices for the window pickers, 6:00 AM through 11:00 PM.
const TIME_CHOICES: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIME_CHOICES.push(`${String(h).padStart(2, '0')}:00`);
  if (h < 23) TIME_CHOICES.push(`${String(h).padStart(2, '0')}:30`);
}

function formatChoice(hm: string): string {
  const [h, m] = hm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, '0')} ${ampm}`;
}

const EMPTY_PREFS: AlertPrefs = { routes: [], schedule: [] };

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const { favorites } = useFavorites();

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pushAvailable, setPushAvailable] = useState<boolean | null>(null);
  const [prefs, setPrefs] = useState<AlertPrefs>(EMPTY_PREFS);
  const loadedRef = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [enabledRaw, prefsRaw] = await Promise.all([
        AsyncStorage.getItem(ENABLED_KEY),
        AsyncStorage.getItem(PREFS_KEY),
      ]);
      if (prefsRaw) {
        try { setPrefs({ ...EMPTY_PREFS, ...JSON.parse(prefsRaw) }); } catch {}
      }
      loadedRef.current = true;
      if (enabledRaw === 'true') {
        setEnabled(true);
        registerPushTokenWithServer(API_BASE).then(token => setPushAvailable(!!token));
      }
    })();
  }, []);

  // Persist + push prefs to the server, debounced so rapid chip-tapping
  // doesn't fire a request per tap.
  const updatePrefs = useCallback((updater: (prev: AlertPrefs) => AlertPrefs) => {
    setPrefs(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        registerPushTokenWithServer(API_BASE, next).catch(() => {});
      }, 1500);
      return next;
    });
  }, []);

  const onToggle = async (value: boolean) => {
    setBusy(true);
    try {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert('Permission needed', 'Enable notifications for this app in your device settings.');
          setBusy(false);
          return;
        }
        const token = await registerPushTokenWithServer(API_BASE, prefs);
        setPushAvailable(!!token);
        setEnabled(true);
        await AsyncStorage.setItem(ENABLED_KEY, 'true');
      } else {
        setEnabled(false);
        await AsyncStorage.setItem(ENABLED_KEY, 'false');
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleRoute = (route: string) =>
    updatePrefs(p => ({
      ...p,
      routes: p.routes.includes(route) ? p.routes.filter(r => r !== route) : [...p.routes, route],
    }));

  // "Always" is the default (empty schedule = alerts any time, per the
  // server's contract — see notifications.py's _in_window). Switching to
  // "Specific times" seeds one starter window so there's immediately
  // something to edit instead of an empty section; switching back to
  // "Always" clears it so the empty-means-always contract holds.
  const hasSchedule = prefs.schedule.length > 0;
  const setScheduleMode = (mode: 'always' | 'custom') => {
    if (mode === 'always') {
      updatePrefs(p => ({ ...p, schedule: [] }));
    } else if (!hasSchedule) {
      updatePrefs(p => ({ ...p, schedule: [{ days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }] }));
    }
  };

  const otherRoutes = ALL_ROUTES.filter(r => !favorites.includes(r));

  const addWindow = () =>
    updatePrefs(p => ({
      ...p,
      schedule: [...p.schedule, { days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }],
    }));

  const removeWindow = (idx: number) =>
    updatePrefs(p => ({ ...p, schedule: p.schedule.filter((_, i) => i !== idx) }));

  const updateWindow = (idx: number, patch: Partial<RideWindow>) =>
    updatePrefs(p => ({
      ...p,
      schedule: p.schedule.map((w, i) => (i === idx ? { ...w, ...patch } : w)),
    }));

  const toggleWindowDay = (idx: number, day: number) =>
    updatePrefs(p => ({
      ...p,
      schedule: p.schedule.map((w, i) =>
        i === idx
          ? { ...w, days: w.days.includes(day) ? w.days.filter(d => d !== day) : [...w.days, day].sort() }
          : w,
      ),
    }));

  const sendTest = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert('Permission needed', 'Enable notifications first to receive a test alert.');
      return;
    }
    await sendLocalTestNotification();
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.6}>
          <Text style={[styles.backArrow, { color: c.tint }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]}>Notifications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Enable Notifications</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>
                Required before any alerts (delays, detours, service news) can reach this device.
              </Text>
            </View>
            <Switch value={enabled} onValueChange={onToggle} disabled={busy} />
          </View>
        </View>

        {enabled && pushAvailable === false && (
          <View style={[styles.noteCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            <MaterialIcons name="info-outline" size={14} color={c.textSecondary} />
            <Text style={[styles.noteText, { color: c.textSecondary }]}>
              Remote push isn't set up yet for this app build (needs an EAS project ID — see
              lib/notifications.ts). Local notifications, like the test below, still work fine.
            </Text>
          </View>
        )}

        {enabled && (
          <>
            {/* ── Alert routes ─────────────────────────────────────────── */}
            <Text style={[styles.sectionTitle, { color: c.text }]}>Favorite Routes</Text>
            <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
              You'll get detour and service alerts for these any time they're posted,
              and delay alerts per your schedule below.
            </Text>
            {favorites.length > 0 ? (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                {favorites.map((route, i) => {
                  const on = prefs.routes.includes(route);
                  return (
                    <View
                      key={route}
                      style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}
                    >
                      <Text style={[styles.rowLabel, { color: c.text, flex: 1 }]}>Route {route}</Text>
                      <Switch value={on} onValueChange={() => toggleRoute(route)} />
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
                Star routes on the map's route picker to have them show up here.
              </Text>
            )}

            {otherRoutes.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 16, color: c.textSecondary }]}>Other routes</Text>
                <View style={styles.chipWrap}>
                  {otherRoutes.map(route => {
                    const on = prefs.routes.includes(route);
                    return (
                      <TouchableOpacity
                        key={route}
                        style={[styles.routeChip, { backgroundColor: on ? c.tint : c.surfaceAlt, borderColor: on ? c.tint : c.border }]}
                        onPress={() => toggleRoute(route)}
                      >
                        <Text style={[styles.routeChipText, { color: on ? '#fff' : c.text }]}>{route}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* ── Ride schedule ────────────────────────────────────────── */}
            <Text style={[styles.sectionTitle, { color: c.text }]}>Alert Schedule</Text>
            <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
              Detour alerts always come right away, any time. Delay alerts
              (10+ minutes behind) can be limited to the times you actually ride.
            </Text>

            <View style={[styles.segmentWrap, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
              <TouchableOpacity
                style={[styles.segmentBtn, !hasSchedule && { backgroundColor: c.tint }]}
                onPress={() => setScheduleMode('always')}
              >
                <Text style={[styles.segmentText, { color: !hasSchedule ? '#fff' : c.textSecondary }]}>Always</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, hasSchedule && { backgroundColor: c.tint }]}
                onPress={() => setScheduleMode('custom')}
              >
                <Text style={[styles.segmentText, { color: hasSchedule ? '#fff' : c.textSecondary }]}>Specific times</Text>
              </TouchableOpacity>
            </View>

            {hasSchedule && prefs.schedule.map((w, idx) => (
              <View key={idx} style={[styles.windowCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.windowHeader}>
                  <Text style={[styles.windowTitle, { color: c.text }]}>
                    {formatChoice(w.start)} – {formatChoice(w.end)}
                  </Text>
                  <TouchableOpacity onPress={() => removeWindow(idx)} hitSlop={8}>
                    <MaterialIcons name="delete-outline" size={20} color={c.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.dayRow}>
                  {DAY_LABELS.map((label, day) => {
                    const on = w.days.includes(day);
                    return (
                      <TouchableOpacity
                        key={label}
                        style={[styles.dayChip, { backgroundColor: on ? c.tint : c.surfaceAlt }]}
                        onPress={() => toggleWindowDay(idx, day)}
                      >
                        <Text style={[styles.dayChipText, { color: on ? '#fff' : c.textSecondary }]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {(['start', 'end'] as const).map(field => (
                  <View key={field} style={styles.timeRow}>
                    <Text style={[styles.timeLabel, { color: c.textSecondary }]}>{field === 'start' ? 'From' : 'To'}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {TIME_CHOICES.map(t => {
                        const on = w[field] === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.timeChip, { backgroundColor: on ? c.tint : c.surfaceAlt }]}
                            onPress={() => updateWindow(idx, { [field]: t } as Partial<RideWindow>)}
                          >
                            <Text style={[styles.timeChipText, { color: on ? '#fff' : c.textSecondary }]}>
                              {formatChoice(t)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                ))}
              </View>
            ))}

            {hasSchedule && (
              <TouchableOpacity style={[styles.inlineBtn, { borderColor: c.border }]} onPress={addWindow}>
                <MaterialIcons name="add" size={16} color={c.tint} />
                <Text style={[styles.inlineBtnText, { color: c.tint }]}>Add another window</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        <TouchableOpacity
          style={[styles.testBtn, { backgroundColor: c.tint }]}
          onPress={sendTest}
          activeOpacity={0.8}
        >
          <MaterialIcons name="notifications-active" size={16} color="#fff" />
          <Text style={styles.testBtnText}>Send Test Notification</Text>
        </TouchableOpacity>
        <Text style={[styles.testHint, { color: c.textSecondary }]}>
          Fires immediately on this device only — doesn't touch the server, so it works
          even without remote push configured.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 20 },
  backBtn: { paddingRight: 10, paddingVertical: 4 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 28, fontWeight: '700' },

  card: { borderRadius: 14, borderWidth: 1, padding: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 12 },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 16 },

  noteCard: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, marginTop: 14 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 15 },

  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 4 },
  sectionDesc: { fontSize: 12, lineHeight: 17, marginBottom: 12 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  routeChip: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  routeChipText: { fontSize: 13, fontWeight: '600' },

  segmentWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 3,
    marginBottom: 14,
  },
  segmentBtn: { flex: 1, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '700' },

  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    marginTop: 12,
  },
  inlineBtnText: { fontSize: 13, fontWeight: '600' },

  windowCard: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  windowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  windowTitle: { fontSize: 15, fontWeight: '700' },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dayChip: { flex: 1, borderRadius: 7, paddingVertical: 6, alignItems: 'center' },
  dayChipText: { fontSize: 11, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  timeLabel: { fontSize: 12, fontWeight: '600', width: 36 },
  timeChip: { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6, marginRight: 6 },
  timeChipText: { fontSize: 12, fontWeight: '500' },

  testBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 24,
  },
  testBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  testHint: { fontSize: 11, textAlign: 'center', marginTop: 8, paddingHorizontal: 10, lineHeight: 15 },
});
