import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BTD_TINT } from '@/constants/btd-theme';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useThemeColors } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function BtdTabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme ?? 'dark';
  const colors = useThemeColors();
  const { iconSize } = useAccessibility();
  const scale = ICON_SCALE[iconSize];
  const tabIconSize = Math.round(26 * scale);
  const insets = useSafeAreaInsets();
  // See app/(tabs)/_layout.tsx's own comment on this same pattern - React
  // Navigation's default tab bar height doesn't grow with tabBarIcon's own
  // size, which clips a scaled-up icon/label against the bar edge on
  // Android specifically (iOS's default has enough slack to absorb it).
  const tabBarContentHeight = Math.round(50 * Math.max(1, scale));
  // See app/(tabs)/_layout.tsx's own comment on this same line - the height
  // fix alone isn't enough, @react-navigation/bottom-tabs' icon wrapper is a
  // fixed-size box regardless of what's rendered inside it, so the label
  // collides with an oversized icon unless this is overridden directly.
  const tabBarIconStyle = { width: tabIconSize, height: tabIconSize };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BTD_TINT[scheme],
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarContentHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 6),
        },
        tabBarLabelStyle: { fontSize: Math.round(11 * Math.max(1, scale)) },
        tabBarIconStyle,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="arrow.triangle.turn.up.right.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="clock.fill" color={color} />,
        }}
      />
      {/* Still a real route (More > Info pushes to it), just no longer its
          own tab - href: null keeps it registered without a tab bar icon,
          matching how AggieSpirit's own Help Guide lives as a More row
          instead of a tab. */}
      <Tabs.Screen name="info" options={{ href: null }} />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="line.3.horizontal" color={color} />,
        }}
      />
    </Tabs>
  );
}
