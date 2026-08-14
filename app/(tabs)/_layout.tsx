import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ICON_SCALE, useAccessibility } from '@/context/accessibility-context';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { translate } from '@/lib/translations';

export default function TabLayout() {
  const colors = useThemeColors();
  const { iconSize } = useAccessibility();
  const scale = ICON_SCALE[iconSize];
  const tabIconSize = Math.round(26 * scale);
  // React Navigation renders tabBarLabel/title itself, not through
  // ScaledText - has to be translated explicitly rather than picking it up
  // automatically like everything else.
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);
  const insets = useSafeAreaInsets();
  // React Navigation's default tab bar height is a fixed constant that
  // never grows with tabBarIcon's own size - iOS's default happens to have
  // enough slack that a larger icon squeezes in without clipping, but
  // Android's doesn't, so Accessibility > Icon Size at Large/XL clips the
  // icon/label against the bar edge there specifically. Scaling the bar's
  // own height (and label size) right along with the icon fixes it on both,
  // and is a no-op at the default icon size since scale=1 there.
  const tabBarContentHeight = Math.round(50 * Math.max(1, scale));
  // That height fix alone wasn't enough - @react-navigation/bottom-tabs'
  // own TabBarIcon wraps whatever `tabBarIcon` renders in a box whose size
  // is a FIXED constant (~31x28, from Apple HIG numbers) regardless of the
  // icon we actually render inside it. At larger scales our IconSymbol
  // overflows that box, but the label below is laid out assuming the small
  // fixed box, so it collides with the oversized icon instead of leaving
  // room for it. tabBarIconStyle overrides that wrapper's own dimensions
  // directly, so the library reserves the right amount of space.
  const tabBarIconStyle = { width: tabIconSize, height: tabIconSize };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
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
        name="index"
        options={{
          title: t('Map'),
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: t('Plan'),
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="arrow.triangle.turn.up.right.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('Calendar'),
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('More'),
          tabBarIcon: ({ color }) => <IconSymbol size={tabIconSize} name="line.3.horizontal" color={color} />,
        }}
      />
    </Tabs>
  );
}
