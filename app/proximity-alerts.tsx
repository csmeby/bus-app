import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { ScheduleWindowPicker } from '@/components/schedule-window-picker';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { API_BASE } from '@/lib/api-base';
import { AlertPrefs, ProximityAlertConfig, registerPushTokenWithServer } from '@/lib/notifications';
import { translate } from '@/lib/translations';

const PREFS_KEY = 'alert-prefs-v2';
const EMPTY_PREFS: AlertPrefs = { routeConfigs: [], proximityConfigs: [] };

export default function ProximityAlertsScreen() {
  const c = useThemeColors();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  const [prefs, setPrefs] = useState<AlertPrefs>(EMPTY_PREFS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (raw) {
      try { setPrefs({ ...EMPTY_PREFS, ...JSON.parse(raw) }); } catch {}
    }
  }, []);

  // Re-read on every focus, not just mount - the "new alert" wizard writes
  // straight to AsyncStorage and pops back to this screen rather than
  // sharing any in-memory state with it.
  useFocusEffect(useCallback(() => { load(); }, [load]));

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

  const removeAlert = (id: string) =>
    updatePrefs(p => ({ ...p, proximityConfigs: p.proximityConfigs.filter(pc => pc.id !== id) }));

  const updateAlert = (id: string, patch: Partial<ProximityAlertConfig>) =>
    updatePrefs(p => ({
      ...p,
      proximityConfigs: p.proximityConfigs.map(pc => (pc.id === id ? { ...pc, ...patch } : pc)),
    }));

  const toggleExpanded = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title={t('Bus Arrival Alerts')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {prefs.proximityConfigs.length === 0 && (
          <Text style={[styles.sectionDesc, { color: c.textSecondary, fontStyle: 'italic' }]}>
            No arrival alerts yet. Add one to get notified when a bus is close to your stop.
          </Text>
        )}

        {prefs.proximityConfigs.map(pc => {
          const isOpen = expanded.has(pc.id);
          return (
            <View key={pc.id} style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggleExpanded(pc.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${pc.stopName} alert settings`}
                accessibilityState={{ expanded: isOpen }}
              >
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={1}>{pc.stopName}</Text>
                  <Text style={[styles.cardSubtitle, { color: c.textSecondary }]} numberOfLines={1}>
                    Route{pc.routes.length > 1 ? 's' : ''} {pc.routes.join(', ')}
                  </Text>
                </View>
                <View style={styles.cardHeaderRight}>
                  <TouchableOpacity
                    onPress={() => removeAlert(pc.id)}
                    hitSlop={8}
                    style={{ marginRight: 12 }}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove alert for ${pc.stopName}`}
                  >
                    <MaterialIcons name="close" size={18} color={c.textSecondary} />
                  </TouchableOpacity>
                  <MaterialIcons name={isOpen ? 'expand-less' : 'expand-more'} size={22} color={c.textSecondary} />
                </View>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.cardBody}>
                  <View style={styles.thresholdRow}>
                    <Text style={[styles.thresholdLabel, { color: c.text }]}>Notify me when a bus is</Text>
                    <TextInput
                      value={String(pc.thresholdMinutes)}
                      onChangeText={val => {
                        const digits = val.replace(/[^0-9]/g, '');
                        updateAlert(pc.id, { thresholdMinutes: digits === '' ? 0 : parseInt(digits, 10) });
                      }}
                      keyboardType="number-pad"
                      maxLength={3}
                      accessibilityLabel="Minutes-away threshold"
                      accessibilityHint="Notifies you when a bus is at least this close, in minutes"
                      style={[styles.thresholdInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
                    />
                    <Text style={[styles.thresholdLabel, { color: c.text }]}>minutes away</Text>
                  </View>

                  <ScheduleWindowPicker
                    schedule={pc.schedule}
                    onChange={schedule => updateAlert(pc.id, { schedule })}
                    c={c}
                    label="Notify me during these times:"
                  />
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: c.tint }]}
          onPress={() => router.push('/proximity-alerts-new' as any)}
          accessibilityRole="button"
          accessibilityLabel="Add a new bus arrival alert"
        >
          <MaterialIcons name="add" size={18} color={c.tint} />
          <Text style={[styles.addBtnText, { color: c.tint }]}>Add alert</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },

  sectionDesc: { fontSize: 12, lineHeight: 17, marginBottom: 12 },

  card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  cardHeaderText: { flex: 1, marginRight: 8 },
  cardHeaderRight: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14 },

  thresholdRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  thresholdLabel: { fontSize: 14, fontWeight: '500' },
  thresholdInput: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 14, fontWeight: '700', minWidth: 44, textAlign: 'center',
  },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', paddingVertical: 14, marginTop: 10,
  },
  addBtnText: { fontSize: 15, fontWeight: '700' },
});
