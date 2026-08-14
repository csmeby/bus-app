import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { ALL_ROUTES } from '@/constants/routes';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { useFavorites } from '@/context/favorites-context';
import { translate } from '@/lib/translations';
import { API_BASE } from '@/lib/api-base';
import {
  AlertPrefs,
  NOTIFICATIONS_ENABLED_KEY,
  RouteAlertConfig,
  defaultRouteAlertConfig,
  registerPushTokenWithServer,
  requestNotificationPermission,
} from '@/lib/notifications';

const PREFS_KEY = 'alert-prefs-v2';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // index = server weekday (Mon=0)
const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const EMPTY_PREFS: AlertPrefs = { routeConfigs: [] };

// Free-text HH:MM entry - the picker-chip version of this only offered
// fixed 30-minute increments, which is what this replaces. Keeps its own
// draft text so a mid-typing value like "8:" doesn't get validated away
// before the user's finished, only reformatting/committing on blur.
function TimeField({
  value, onChange, c, accessibilityLabel,
}: { value: string; onChange: (v: string) => void; c: any; accessibilityLabel: string }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  const commit = () => {
    const m = text.match(/^(\d{1,2}):?(\d{2})$/);
    if (m) {
      const h = Math.min(23, parseInt(m[1], 10));
      const min = Math.min(59, parseInt(m[2], 10));
      const formatted = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      setText(formatted);
      if (formatted !== value) onChange(formatted);
    } else {
      setText(value); // invalid - revert to the last good value
    }
  };

  return (
    <TextInput
      value={text}
      onChangeText={setText}
      onBlur={commit}
      placeholder="08:00"
      placeholderTextColor={c.textSecondary}
      keyboardType="numbers-and-punctuation"
      maxLength={5}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Enter a time as hours and minutes, like 08:00"
      style={[styles.timeInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
    />
  );
}

export default function NotificationsScreen() {
  const c = useThemeColors();
  const { isFavorite } = useFavorites();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState<AlertPrefs>(EMPTY_PREFS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [enabledRaw, prefsRaw] = await Promise.all([
        AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY),
        AsyncStorage.getItem(PREFS_KEY),
      ]);
      if (prefsRaw) {
        try { setPrefs({ ...EMPTY_PREFS, ...JSON.parse(prefsRaw) }); } catch {}
      }
      if (enabledRaw === 'true') {
        setEnabled(true);
        registerPushTokenWithServer(API_BASE, undefined, language);
      }
    })();
    // Mount-only load of persisted prefs/enabled state - language is read
    // from context (already resolved by the time this screen is reachable),
    // not something this effect should re-run for if it changes later while
    // the screen happens to stay mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist + push prefs to the server, debounced so rapid typing/tapping
  // doesn't fire a request per keystroke.
  const updatePrefs = useCallback((updater: (prev: AlertPrefs) => AlertPrefs) => {
    setPrefs(prev => {
      const next = updater(prev);
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next)).catch(() => {});
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        registerPushTokenWithServer(API_BASE, next, language).catch(() => {});
      }, 1500);
      return next;
    });
  }, [language]);

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
        await registerPushTokenWithServer(API_BASE, prefs, language);
        setEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
      } else {
        setEnabled(false);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      }
    } finally {
      setBusy(false);
    }
  };

  const configFor = (route: string) => prefs.routeConfigs.find(rc => rc.route === route);

  const addRoute = (route: string) => {
    updatePrefs(p => ({ ...p, routeConfigs: [...p.routeConfigs, defaultRouteAlertConfig(route)] }));
    setExpanded(prev => new Set(prev).add(route));
  };

  const removeRoute = (route: string) =>
    updatePrefs(p => ({ ...p, routeConfigs: p.routeConfigs.filter(rc => rc.route !== route) }));

  const updateRoute = (route: string, patch: Partial<RouteAlertConfig>) =>
    updatePrefs(p => ({
      ...p,
      routeConfigs: p.routeConfigs.map(rc => (rc.route === route ? { ...rc, ...patch } : rc)),
    }));

  const toggleExpanded = (route: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(route)) next.delete(route); else next.add(route);
      return next;
    });

  const setScheduleMode = (route: string, mode: 'always' | 'custom') => {
    if (mode === 'always') {
      updateRoute(route, { schedule: [] });
    } else {
      updateRoute(route, { schedule: [{ days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }] });
    }
  };

  const addWindow = (route: string) => {
    const rc = configFor(route);
    if (!rc) return;
    updateRoute(route, { schedule: [...rc.schedule, { days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }] });
  };

  const removeWindow = (route: string, idx: number) => {
    const rc = configFor(route);
    if (!rc) return;
    updateRoute(route, { schedule: rc.schedule.filter((_, i) => i !== idx) });
  };

  const updateWindow = (route: string, idx: number, patch: Partial<RouteAlertConfig['schedule'][number]>) => {
    const rc = configFor(route);
    if (!rc) return;
    updateRoute(route, { schedule: rc.schedule.map((w, i) => (i === idx ? { ...w, ...patch } : w)) });
  };

  const toggleWindowDay = (route: string, idx: number, day: number) => {
    const rc = configFor(route);
    if (!rc) return;
    updateRoute(route, {
      schedule: rc.schedule.map((w, i) =>
        i === idx
          ? { ...w, days: w.days.includes(day) ? w.days.filter(d => d !== day) : [...w.days, day].sort() }
          : w,
      ),
    });
  };

  const addedRoutes = prefs.routeConfigs.map(rc => rc.route);
  const addableRoutes = ALL_ROUTES.filter(r => !addedRoutes.includes(r));
  // Favorites first, in the add-a-route picker, so the routes someone's
  // actually likely to want are one tap away instead of buried in the list.
  const sortedAddable = [...addableRoutes].sort((a, b) => {
    const af = isFavorite(a) ? 0 : 1;
    const bf = isFavorite(b) ? 0 : 1;
    return af - bf;
  });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title={t('Notifications')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: c.text }]}>Enable Notifications</Text>
              <Text style={[styles.rowDesc, { color: c.textSecondary }]}>
                Required before any alerts (delays, detours, service news) can reach this device.
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={onToggle}
              disabled={busy}
              accessibilityLabel={t('Enable Notifications')}
              accessibilityHint={t('Required before any alerts (delays, detours, service news) can reach this device.')}
            />
          </View>
        </View>

        {enabled && (
          <>
            <Text style={[styles.sectionTitle, { color: c.text }]} accessibilityRole="header">My Routes</Text>
            <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
              Add a route to set up its alerts.
            </Text>

            {prefs.routeConfigs.length === 0 && (
              <Text style={[styles.sectionDesc, { color: c.textSecondary, fontStyle: 'italic' }]}>
                No routes added yet. Pick one below.
              </Text>
            )}

            {prefs.routeConfigs.map(rc => {
              const isOpen = expanded.has(rc.route);
              const hasSchedule = rc.schedule.length > 0;
              return (
                <View key={rc.route} style={[styles.routeCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <TouchableOpacity
                    style={styles.routeCardHeader}
                    onPress={() => toggleExpanded(rc.route)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Route ${rc.route} alert settings`}
                    accessibilityState={{ expanded: isOpen }}
                  >
                    <Text style={[styles.routeCardTitle, { color: c.text }]}>Route {rc.route}</Text>
                    <View style={styles.routeCardHeaderRight}>
                      <TouchableOpacity
                        onPress={() => removeRoute(rc.route)}
                        hitSlop={8}
                        style={{ marginRight: 12 }}
                        accessibilityRole="button"
                        accessibilityLabel={`Remove route ${rc.route}`}
                      >
                        <MaterialIcons name="close" size={18} color={c.textSecondary} />
                      </TouchableOpacity>
                      <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={22} color={c.textSecondary} />
                    </View>
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.routeCardBody}>
                      {/* Delay threshold */}
                      <View style={styles.delayRow}>
                        <Text style={[styles.delayLabel, { color: c.text }]}>Notify me if running</Text>
                        <TextInput
                          value={String(rc.delayThresholdMinutes)}
                          onChangeText={t => {
                            const digits = t.replace(/[^0-9]/g, '');
                            updateRoute(rc.route, { delayThresholdMinutes: digits === '' ? 0 : parseInt(digits, 10) });
                          }}
                          keyboardType="number-pad"
                          maxLength={3}
                          accessibilityLabel="Delay threshold in minutes"
                          accessibilityHint="Notifies you when the route is running at least this many minutes late"
                          style={[styles.delayInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                        />
                        <Text style={[styles.delayLabel, { color: c.text }]}>minutes late</Text>
                      </View>

                      {/* Delay schedule */}
                      <Text style={[styles.subLabel, { color: c.textSecondary }]}>
                        Notify me during these times if the route is running late:
                      </Text>
                      <View style={[styles.segmentWrap, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                        <TouchableOpacity
                          style={[styles.segmentBtn, !hasSchedule && { backgroundColor: c.tint }]}
                          onPress={() => setScheduleMode(rc.route, 'always')}
                          accessibilityRole="button"
                          accessibilityLabel="Always"
                          accessibilityState={{ selected: !hasSchedule }}
                          hitSlop={6}
                        >
                          <Text style={[styles.segmentText, { color: !hasSchedule ? '#fff' : c.textSecondary }]}>Always</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.segmentBtn, hasSchedule && { backgroundColor: c.tint }]}
                          onPress={() => setScheduleMode(rc.route, 'custom')}
                          accessibilityRole="button"
                          accessibilityLabel="Specific times"
                          accessibilityState={{ selected: hasSchedule }}
                          hitSlop={6}
                        >
                          <Text style={[styles.segmentText, { color: hasSchedule ? '#fff' : c.textSecondary }]}>Specific times</Text>
                        </TouchableOpacity>
                      </View>

                      {hasSchedule && rc.schedule.map((w, idx) => (
                        <View key={idx} style={[styles.windowCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
                          <View style={styles.windowHeader}>
                            <Text style={[styles.windowTitle, { color: c.text }]}>Window {idx + 1}</Text>
                            <TouchableOpacity
                              onPress={() => removeWindow(rc.route, idx)}
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel={`Delete window ${idx + 1}`}
                            >
                              <MaterialIcons name="delete-outline" size={18} color={c.textSecondary} />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.dayRow}>
                            {DAY_LABELS.map((label, day) => {
                              const on = w.days.includes(day);
                              return (
                                <TouchableOpacity
                                  key={label}
                                  style={[styles.dayChip, { backgroundColor: on ? c.tint : c.surface }]}
                                  onPress={() => toggleWindowDay(rc.route, idx, day)}
                                  accessibilityRole="checkbox"
                                  accessibilityLabel={DAY_FULL_NAMES[day]}
                                  accessibilityState={{ checked: on }}
                                  hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
                                >
                                  <Text style={[styles.dayChipText, { color: on ? '#fff' : c.textSecondary }]}>{label}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                          <View style={styles.timeRow}>
                            <Text style={[styles.timeLabel, { color: c.textSecondary }]}>From</Text>
                            <TimeField
                              value={w.start}
                              onChange={t => updateWindow(rc.route, idx, { start: t })}
                              c={c}
                              accessibilityLabel={`Window ${idx + 1} start time`}
                            />
                            <Text style={[styles.timeLabel, { color: c.textSecondary }]}>To</Text>
                            <TimeField
                              value={w.end}
                              onChange={t => updateWindow(rc.route, idx, { end: t })}
                              c={c}
                              accessibilityLabel={`Window ${idx + 1} end time`}
                            />
                          </View>
                        </View>
                      ))}

                      {hasSchedule && (
                        <TouchableOpacity
                          style={[styles.inlineBtn, { borderColor: c.border }]}
                          onPress={() => addWindow(rc.route)}
                          accessibilityRole="button"
                          accessibilityLabel="Add another window"
                        >
                          <MaterialIcons name="add" size={16} color={c.tint} />
                          <Text style={[styles.inlineBtnText, { color: c.tint }]}>Add another window</Text>
                        </TouchableOpacity>
                      )}

                      {/* Reroutes - independent of the schedule above, always fires */}
                      <View style={[styles.row, { paddingHorizontal: 0, marginTop: 14 }]}>
                        <View style={styles.rowText}>
                          <Text style={[styles.rowLabel, { color: c.text }]}>Notify me about reroutes</Text>
                          <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Always sent right away, regardless of the schedule above.</Text>
                        </View>
                        <Switch
                          value={rc.notifyReroutes}
                          onValueChange={v => updateRoute(rc.route, { notifyReroutes: v })}
                          accessibilityLabel={`Notify me about reroutes on route ${rc.route}`}
                        />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {sortedAddable.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 20, color: c.textSecondary }]}>Add a route</Text>
                <View style={styles.chipWrap}>
                  {sortedAddable.map(route => (
                    <TouchableOpacity
                      key={route}
                      style={[styles.routeChip, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                      onPress={() => addRoute(route)}
                      accessibilityRole="button"
                      accessibilityLabel={`Add route ${route}${isFavorite(route) ? ', favorite' : ''}`}
                      hitSlop={7}
                    >
                      {isFavorite(route) && <Text style={{ fontSize: 11 }}>★ </Text>}
                      <Text style={[styles.routeChipText, { color: c.text }]}>{route}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },

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
  routeChip: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  routeChipText: { fontSize: 13, fontWeight: '600' },

  routeCard: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  routeCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  routeCardHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  routeCardTitle: { fontSize: 15, fontWeight: '700' },
  routeCardBody: { paddingHorizontal: 14, paddingBottom: 14 },

  delayRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  delayLabel: { fontSize: 14, fontWeight: '500' },
  delayInput: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 14, fontWeight: '700', minWidth: 44, textAlign: 'center',
  },

  subLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },

  segmentWrap: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 3, marginBottom: 10 },
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
    marginTop: 4,
  },
  inlineBtnText: { fontSize: 13, fontWeight: '600' },

  windowCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  windowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  windowTitle: { fontSize: 13, fontWeight: '700' },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dayChip: { flex: 1, borderRadius: 7, paddingVertical: 6, alignItems: 'center' },
  dayChipText: { fontSize: 11, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeLabel: { fontSize: 12, fontWeight: '600' },
  timeInput: {
    borderRadius: 7, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 13, fontWeight: '600', minWidth: 64, textAlign: 'center',
  },

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
