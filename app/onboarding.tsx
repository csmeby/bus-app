import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { BRAND_MAROON } from '@/constants/theme';
import { useTour } from '@/lib/tour-context';

const LOGO_FADE_MS = 50;
const TITLE_FADE_MS = 600;
const HOLD_MS = 750;

export default function OnboardingScreen() {
  const { startTour } = useTour();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const startedRef = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: LOGO_FADE_MS, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: TITLE_FADE_MS, useNativeDriver: true }),
    ]).start();
    const holdTimer = setTimeout(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      startTour();
    }, LOGO_FADE_MS + TITLE_FADE_MS + HOLD_MS);
    return () => clearTimeout(holdTimer);
  }, [logoOpacity, titleOpacity, startTour]);

  return (
    <View style={[styles.splashRoot, { backgroundColor: "#58121d" }]}>
      <View style={{ alignItems: 'center' }}>
        <Animated.Image
          source={require('../assets/images/icon.png')}
          style={[styles.splashLogo, { opacity: logoOpacity }]}
        />
        <Animated.Text style={[styles.splashTitle, { opacity: titleOpacity }]}>Century Tree Transit</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashRoot: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashLogo: { width: 120, height: 120, borderRadius: 24, resizeMode: 'contain' },
  splashTitle: { marginTop: 20, fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
});
