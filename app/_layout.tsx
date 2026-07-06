import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ErrorBoundary } from '@/components/error-boundary';
import { requestNotificationPermission, getExpoPushToken } from '@/lib/notifications';
import { setupGlobalErrorLogging } from '@/lib/error-logging';
import { FavoritesProvider } from '@/context/favorites-context';
import { ThemeProvider, useAppTheme } from '@/context/theme-context';
import { TripProvider } from '@/context/trip-context';
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
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
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
      const granted = await requestNotificationPermission();
      console.log('Permission granted?', granted);
      
      const token = await getExpoPushToken();
      console.log('🔑 TOKEN:', token);
    })();
  }, []);
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <FavoritesProvider>
          <TripProvider>
            <RootLayoutInner />
          </TripProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
