import { Tabs } from 'expo-router';
import React from 'react';

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
  const tabIconSize = Math.round(26 * ICON_SCALE[iconSize]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BTD_TINT[scheme],
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="bus.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="clock.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="info"
        options={{
          title: 'Info',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="info.circle.fill" color={color} />,
        }}
      />
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
