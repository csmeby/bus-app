import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import {
  registerPushTokenWithServer,
  requestNotificationPermission,
  sendLocalTestNotification,
} from '@/lib/notifications';

const ENABLED_KEY = 'notifications-enabled';

export default function NotificationsScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];

  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pushAvailable, setPushAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ENABLED_KEY).then(v => {
      if (v === 'true') {
        setEnabled(true);
        registerPushTokenWithServer(API_BASE).then(token => setPushAvailable(!!token));
      }
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
        const token = await registerPushTokenWithServer(API_BASE);
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

      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Enable Notifications</Text>
            <Text style={[styles.rowDesc, { color: c.textSecondary }]}>
              Required before any alerts (service disruptions, etc.) can be sent to this device.
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

  testBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },
  testBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  testHint: { fontSize: 11, textAlign: 'center', marginTop: 8, paddingHorizontal: 10, lineHeight: 15 },
});
