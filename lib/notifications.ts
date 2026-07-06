import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Foreground display behavior — without this, a notification that arrives
// while the app is open won't show anything.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Sets up the default Android notification channel. Required on Android 8+
 * for notifications to display with the correct importance/sound/vibration.
 * No-op on iOS.
 */
async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  // Set up the Android channel up front so notifications display correctly
  // once permission is granted.
  await setupAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.status === 'granted') return true;

  const result = await Notifications.requestPermissionsAsync();
  return result.status === 'granted';
}

/**
 * Returns the Expo push token for this device. Requires:
 *   - An EAS projectId in app.json (`extra.eas.projectId`)
 *   - A physical device (simulators/emulators can't receive remote push)
 *   - Notification permission granted
 *
 * Returns null on simulators, missing projectId, or any failure.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[notifications] Push tokens require a physical device.');
    return null;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;

    if (!projectId) {
      console.warn(
        '[notifications] No EAS projectId configured (run `eas init`) — remote push is unavailable until then. Local notifications still work.',
      );
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch (e) {
    console.warn('[notifications] Failed to get push token:', e);
    return null;
  }
}

/**
 * Gets the push token and POSTs it to your backend so it can target this
 * device. Returns the token even if the server call fails so the caller can
 * still log/display it.
 */
export async function registerPushTokenWithServer(apiBase: string): Promise<string | null> {
  const token = await getExpoPushToken();
  if (!token) return null;

  try {
    const res = await fetch(`${apiBase}/notifications/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform: Platform.OS }),
    });
    if (!res.ok) {
      console.warn('[notifications] Server returned non-OK status:', res.status);
    }
  } catch (e) {
    console.warn('[notifications] Failed to register token with server:', e);
  }

  return token;
}

/**
 * Fires immediately, fully on-device — useful to confirm permissions/display
 * work without needing the server or a dev build.
 */
export async function sendLocalTestNotification(): Promise<void> {
  // Make sure the Android channel exists before scheduling.
  await setupAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'This is a local notification — no server involved.',
      sound: 'default',
    },
    trigger: null,
  });
}