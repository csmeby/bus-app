import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ErrorBoundary } from '@/components/error-boundary';
import { API_BASE } from '@/lib/api-base';
import { NOTIFICATIONS_ENABLED_KEY, registerPushTokenWithServer, requestNotificationPermission } from '@/lib/notifications';
import { setupGlobalErrorLogging } from '@/lib/error-logging';
import { FavoritesProvider } from '@/context/favorites-context';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { UnitCodesProvider } from '@/context/unit-codes-context';
import { useEffect } from 'react';

setupGlobalErrorLogging();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutInner() {
  const { theme } = useAppTheme();
  return (
    <NavThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(btd)" options={{ headerShown: false }} />
        <Stack.Screen name="theme" options={{ headerShown: false }} />
        <Stack.Screen name="favorites" options={{ headerShown: false }} />
        <Stack.Screen name="disruptions" options={{ headerShown: false }} />
        <Stack.Screen name="help" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    (async () => {
      // Re-registers the push token on every launch when the user already
      // opted in via More > Notifications. Without this, a token rotated by
      // Expo/reinstall would leave the device stuck receiving nothing until
      // the user happened to revisit the Notifications screen, which matters
      // most for reroute/delay alerts since those only ever land while the
      // app is backgrounded or closed.
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (enabled === 'true') {
        registerPushTokenWithServer(API_BASE).catch(() => {});
        return;
      }
      // `enabled` is null only on a genuinely first-ever launch (the
      // Notifications screen's own toggle always writes 'true' or 'false',
      // never leaves this unset) — ask for permission right away instead of
      // waiting for the rider to find the Notifications settings screen on
      // their own. iOS only ever shows its own system prompt once per
      // install regardless of how many times this is called, so there's no
      // risk of re-nagging on later launches once they've answered it here.
      if (enabled === null) {
        const granted = await requestNotificationPermission();
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, granted ? 'true' : 'false');
        if (granted) {
          registerPushTokenWithServer(API_BASE).catch(() => {});
        }
      }
    })();
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <UnitCodesProvider>
            <RootLayoutInner />
          </UnitCodesProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
