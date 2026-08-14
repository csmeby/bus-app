import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import {
  IconSize,
  TextSize,
  useAccessibility,
} from '@/context/accessibility-context';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { translate } from '@/lib/translations';

const ICON_SIZES: IconSize[] = ['xs', 'small', 'default', 'large', 'xl'];
const TEXT_SIZES: TextSize[] = ['xs', 'small', 'default', 'large', 'xl'];

const ICON_LABELS: Record<IconSize, string> = {
  xs: 'Extra Small',
  small: 'Small',
  default: 'Default',
  large: 'Large',
  xl: 'Extra Large',
};

const TEXT_LABELS: Record<TextSize, string> = {
  xs: 'Extra Small',
  small: 'Small',
  default: 'Default',
  large: 'Large',
  xl: 'Extra Large',
};

function SliderRow<T extends string>({
  label,
  options,
  value,
  onChange,
  labels,
  c,
  t,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  labels: Record<T, string>;
  c: ReturnType<typeof useThemeColors>;
  t: (s: string) => string;
}) {
  const currentIndex = options.indexOf(value);

  return (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderValueText, { color: c.textSecondary }]}>
          {t(labels[value])}
        </Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={options.length - 1}
        step={1}
        value={currentIndex >= 0 ? currentIndex : 2}
        onValueChange={index => onChange(options[index])}
        minimumTrackTintColor={c.tint}
        maximumTrackTintColor={c.border}
        thumbTintColor={c.tint}
        accessibilityLabel={t(label)}
        accessibilityValue={{ min: 0, max: options.length - 1, now: currentIndex >= 0 ? currentIndex : 2, text: t(labels[value]) }}
      />
      <View style={styles.sliderLabelsRow}>
        <Text style={[styles.rangeLabel, { color: c.textSecondary }]}>{t('Min')}</Text>
        <Text style={[styles.rangeLabel, { color: c.textSecondary }]}>{t('Max')}</Text>
      </View>
    </View>
  );
}

export default function AccessibilityScreen() {
  const c = useThemeColors();
  const {
    iconSize,
    setIconSize,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
  } = useAccessibility();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title={t('Accessibility')} bottomMargin={24} />

      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <View style={[styles.section, styles.rowBorder, { borderBottomColor: c.border }]}>
          <Text style={[styles.sectionLabel, { color: c.text }]}>{t('Icon Size')}</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
            {t('Scales map markers and tab bar icons. Changing this will close any routes you have open on the map.')}
          </Text>
          <SliderRow
            label="Icon Size"
            options={ICON_SIZES}
            value={iconSize}
            onChange={setIconSize}
            labels={ICON_LABELS}
            c={c}
            t={t}
          />
        </View>

        <View style={[styles.section, styles.rowBorder, { borderBottomColor: c.border }]}>
          <Text style={[styles.sectionLabel, { color: c.text }]}>{t('Text Size')}</Text>
          <Text style={[styles.sectionDesc, { color: c.textSecondary }]}>
            {t('Scales text in the More menu and key screens.')}
          </Text>
          <SliderRow
            label="Text Size"
            options={TEXT_SIZES}
            value={textSize}
            onChange={setTextSize}
            labels={TEXT_LABELS}
            c={c}
            t={t}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowLabel, { color: c.text }]}>{t('High Contrast')}</Text>
            <Text style={[styles.rowDesc, { color: c.textSecondary }]}>
              {t('Stronger contrast between text, backgrounds, and borders.')}
            </Text>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            accessibilityLabel={t('High Contrast')}
            accessibilityHint={t('Uses a stronger-contrast color palette throughout the app')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  section: { paddingHorizontal: 16, paddingVertical: 14 },
  sectionLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  sectionDesc: { fontSize: 13, marginBottom: 8 },
  sliderContainer: {
    marginTop: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -4,
  },
  sliderValueText: {
    fontSize: 13,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  rangeLabel: {
    fontSize: 11,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 13 },
});