import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useThemeColors } from '@/context/theme-context';

export default function TabLayout() {
  const colors = useThemeColors();
  const { iconSize } = useAccessibility();
  const tabIconSize = Math.round(26 * ICON_SCALE[iconSize]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
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
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="line.3.horizontal" color={color} />,
        }}
      />
    </Tabs>
  );
}
