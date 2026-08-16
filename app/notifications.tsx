import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { translate } from '@/lib/translations';
import { API_BASE } from '@/lib/api-base';
import {
  AlertPrefs,
  NOTIFICATIONS_ENABLED_KEY,
  RouteAlertConfig,
  registerPushTokenWithServer,
  requestNotificationPermission,
} from '@/lib/notifications';

const PREFS_KEY = 'alert-prefs-v2';

const EMPTY_PREFS: AlertPrefs = { routeConfigs: [], proximityConfigs: [] };

function summarizeRouteAlert(rc: RouteAlertConfig): string {
  const parts = [`${rc.delayThresholdMinutes}+ min late`];
  parts.push(rc.schedule.length === 0 ? 'Always' : `${rc.schedule.length} time window${rc.schedule.length === 1 ? '' : 's'}`);
  return parts.join(' · ');
}

export default function NotificationsScreen() {
  const c = useThemeColors();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState<AlertPrefs>(EMPTY_PREFS);

  const load = useCallback(async () => {
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
  }, [language]);

  // Re-read on every focus, not just mount - the route/proximity alert
  // wizards write straight to AsyncStorage and pop back to this screen
  // rather than sharing any in-memory state with it.
  useFocusEffect(useCallback(() => { load(); }, [load]));

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

  const removeRoute = async (route: string) => {
    const next: AlertPrefs = { ...prefs, routeConfigs: prefs.routeConfigs.filter(rc => rc.route !== route) };
    setPrefs(next);
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    registerPushTokenWithServer(API_BASE, next, language).catch(() => {});
  };

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
              Get notified when a route is running late, rerouted, or has service news.
            </Text>

            {prefs.routeConfigs.length === 0 && (
              <Text style={[styles.sectionDesc, { color: c.textSecondary, fontStyle: 'italic' }]}>
                No routes added yet. Add one below.
              </Text>
            )}

            {prefs.routeConfigs.map(rc => (
              <TouchableOpacity
                key={rc.route}
                style={[styles.routeCard, { backgroundColor: c.surface, borderColor: c.border }]}
                onPress={() => router.push({ pathname: '/route-alert-new', params: { route: rc.route } } as any)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Route ${rc.route} alert settings`}
              >
                <View style={styles.routeCardText}>
                  <Text style={[styles.routeCardTitle, { color: c.text }]}>Route {rc.route}</Text>
                  <Text style={[styles.routeCardSubtitle, { color: c.textSecondary }]}>{summarizeRouteAlert(rc)}</Text>
                  <View style={styles.badgeRow}>
                    {rc.notifyReroutes && (
                      <View style={[styles.badge, { backgroundColor: c.surfaceAlt }]}>
                        <MaterialIcons name="alt-route" size={12} color={c.tint} />
                        <Text style={[styles.badgeText, { color: c.textSecondary }]}>Reroutes</Text>
                      </View>
                    )}
                    {rc.notifyNews && (
                      <View style={[styles.badge, { backgroundColor: c.surfaceAlt }]}>
                        <MaterialIcons name="campaign" size={12} color={c.tint} />
                        <Text style={[styles.badgeText, { color: c.textSecondary }]}>News</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => removeRoute(rc.route)}
                  hitSlop={8}
                  style={{ marginRight: 4 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove route ${rc.route}`}
                >
                  <MaterialIcons name="close" size={18} color={c.textSecondary} />
                </TouchableOpacity>
                <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.addBtn, { borderColor: c.tint }]}
              onPress={() => router.push('/route-alert-new' as any)}
              accessibilityRole="button"
              accessibilityLabel="Add a new route alert"
            >
              <MaterialIcons name="add" size={18} color={c.tint} />
              <Text style={[styles.addBtnText, { color: c.tint }]}>Add route alert</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { color: c.text }]} accessibilityRole="header">Bus Arrival Alerts</Text>
            <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
              Get notified when a bus is about to reach a specific stop.
            </Text>
            <TouchableOpacity
              style={[styles.arrivalAlertsBtn, { backgroundColor: c.surface, borderColor: c.border }]}
              onPress={() => router.push('/proximity-alerts' as any)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Manage bus arrival alerts"
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowLabel, { color: c.text }]}>
                  {prefs.proximityConfigs.length === 0
                    ? 'No arrival alerts set up yet'
                    : `${prefs.proximityConfigs.length} arrival alert${prefs.proximityConfigs.length === 1 ? '' : 's'}`}
                </Text>
                <Text style={[styles.rowDesc, { color: c.textSecondary }]}>Tap to add or manage</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={c.textSecondary} />
            </TouchableOpacity>
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

  sectionTitle: { fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 4 },
  sectionDesc: { fontSize: 12, lineHeight: 17, marginBottom: 12 },

  routeCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
    marginBottom: 10, padding: 14, gap: 6,
  },
  routeCardText: { flex: 1 },
  routeCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  routeCardSubtitle: { fontSize: 12, marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', paddingVertical: 14, marginTop: 4, marginBottom: 10,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },

  arrivalAlertsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10,
  },
});
