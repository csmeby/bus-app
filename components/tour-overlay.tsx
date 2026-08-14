import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ScaledText as Text } from '@/components/scaled-text';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { TOUR_STEPS, useTour } from '@/lib/tour-context';
import { translate } from '@/lib/translations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPOTLIGHT_PADDING = 6;

// Punches a "hole" around the target rect using four opaque rectangles
// (top/bottom/left/right) instead of an SVG mask - simplest thing that
// works for an axis-aligned single rect, no extra dependency.
function Spotlight({ rect, color }: { rect: { x: number; y: number; width: number; height: number }; color: string }) {
  const top = Math.max(0, rect.y - SPOTLIGHT_PADDING);
  const bottom = Math.min(SCREEN_HEIGHT, rect.y + rect.height + SPOTLIGHT_PADDING);
  const left = Math.max(0, rect.x - SPOTLIGHT_PADDING);
  const right = Math.min(SCREEN_WIDTH, rect.x + rect.width + SPOTLIGHT_PADDING);

  return (
    <>
      <View style={[styles.mask, { backgroundColor: color, top: 0, left: 0, right: 0, height: top }]} />
      <View style={[styles.mask, { backgroundColor: color, top: bottom, left: 0, right: 0, bottom: 0 }]} />
      <View style={[styles.mask, { backgroundColor: color, top, height: bottom - top, left: 0, width: left }]} />
      <View style={[styles.mask, { backgroundColor: color, top, height: bottom - top, left: right, right: 0 }]} />
      <View
        pointerEvents="none"
        style={[styles.spotlightRing, { top, left, width: right - left, height: bottom - top }]}
      />
    </>
  );
}

export function TourOverlay() {
  const { step, stepIndex, rect, nextStep, skipTour } = useTour();
  const c = useThemeColors();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);
  const tooltipOpacity = useRef(new Animated.Value(0)).current;

  // Reset to hidden the instant the step changes (before its target has
  // been measured on the new screen) and fade in only once `rect` actually
  // lands - otherwise the tooltip would render at its layout default (top-
  // left) for a frame or two while a scroll-into-view is still settling,
  // then visibly jump/pop into its real spot.
  useEffect(() => {
    tooltipOpacity.setValue(0);
  }, [stepIndex, tooltipOpacity]);

  useEffect(() => {
    if (rect) {
      Animated.timing(tooltipOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    }
  }, [rect, tooltipOpacity]);

  if (!step || stepIndex === null) return null;

  const isLast = stepIndex === TOUR_STEPS.length - 1;
  const TAB_BAR_CLEARANCE = 90;
  const spaceBelow = rect ? SCREEN_HEIGHT - (rect.y + rect.height) - TAB_BAR_CLEARANCE : 0;
  const showBelow = !rect || spaceBelow > 180;
  const tooltipTop = rect
    ? (showBelow ? rect.y + rect.height + SPOTLIGHT_PADDING + 14 : undefined)
    : undefined;
  const tooltipBottom = rect && !showBelow ? SCREEN_HEIGHT - rect.y + SPOTLIGHT_PADDING + 14 : undefined;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {rect ? (
        <Spotlight rect={rect} color="rgba(0,0,0,0.55)" />
      ) : (
        <View style={[styles.mask, StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />
      )}

      {/* Not rendered at all until `rect` is known - see the effects above. */}
      {rect && (
        <Animated.View
          style={[
            styles.tooltip,
            { backgroundColor: c.surface, borderColor: c.border, top: tooltipTop, bottom: tooltipBottom, opacity: tooltipOpacity },
          ]}
        >
          <Text style={[styles.stepCount, { color: c.textSecondary }]}>{stepIndex + 1} {t('of')} {TOUR_STEPS.length}</Text>
          <Text style={[styles.title, { color: c.text }]}>{t(step.title)}</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>{t(step.body)}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={skipTour}
              accessibilityRole="button"
              accessibilityLabel={t('Skip tour')}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
            >
              <Text style={[styles.skipText, { color: c.textSecondary }]}>{t('Skip')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: c.tint }]}
              onPress={nextStep}
              accessibilityRole="button"
              accessibilityLabel={isLast ? t('Finish tour') : t('Next')}
              hitSlop={4}
            >
              <Text style={styles.nextButtonText}>{isLast ? t('Finish') : t('Next')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mask: { position: 'absolute' },
  spotlightRing: {
    position: 'absolute',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tooltip: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
  stepCount: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 14 },
  skipText: { fontSize: 14, fontWeight: '500' },
  nextButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  nextButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
