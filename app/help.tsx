import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { useThemeColors } from '@/context/theme-context';

const STOP_TYPES = [
  {
    key: 'regular',
    image: require('../assets/images/stop/stop.png'),
    imageSize: 56,
    title: 'Normal Stop',
    text: "Just a regular stop on the route. The driver will stop if a passenger requests the stop or if someone's waiting to board.",
  },
  {
    key: 'timepoint',
    image: require('../assets/images/timepoint/timepoint.png'),
    imageSize: 44,
    title: 'Timepoint',
    text: "Similar to a regular stop, but if the driver is running early, they'll hold here until the scheduled leave time.",
  },
  {
    key: 'temp',
    image: require('../assets/images/temp_stop/temp_stop.png'),
    imageSize: 44,
    title: 'Temporary Stop',
    text: 'Like a normal stop, but not permanent. Usually for construction or temporary route changes. Sometimes marked with an A-frame sign, but not always.',
  },
];

const RIDING_TIPS = [
  {
    key: 'stop-request',
    title: 'Stop Request',
    body: "Pull the cord or push the strip when you hear your stop being announced. Otherwise, the driver will keep driving and can only drop you off at the next stop.",
    tip: 'Some routes share stops on the other side of the road. It might be faster or easier to wait for the bus to come back around to the adjacent stop.',
  },
  {
    key: 'not-automatic',
    title: 'Not Every Stop Is Automatic',
    body:
      "If no one's waiting at the stop, the bus isn't stopping.\n\n" +
      'Drivers aren\'t required to stop at any stop unless they\'re running ahead of schedule (at a timepoint), have passengers to pick up, or you requested it.',
  },
  {
    key: 'plan-ahead',
    title: 'Plan Ahead',
    body:
      "Leave earlier than you think you need to, especially during the beginning of the semester or peak riding times.\n\n" +
      "Nobody knows exactly how timing will be affected by traffic, ridership, accidents, etc.",
  },
  {
    key: 'full-bus',
    title: 'Full Bus / "Another Bus Follows"',
    body:
      "Backpacks off, move back, make two rows. The busses can fit about 70 people. If a bus has to leave you behind, there's always another one behind it.\n\n" +
      '"Another Bus Follows" on the marquee means the bus is full and will only stop to let people off. You will have to catch the next one.',
  },
  {
    key: 'rush-hours',
    title: 'Rush Hours',
    body: 'Expect busses to be running late or full during rush hours: 7-8 AM, class changes, 3 PM, and 5 PM.',
  },
  {
    key: 'mobility-bikes',
    title: 'Mobility Devices & Bikes',
    body:
      'Scooters, one-wheels, and similar devices need to be folded and stowed under a seat. Bikes are not allowed on buses.\n\n' +
      "If you can't take it on the bus, park it or ride it. These items are trip hazards and become projectiles in accidents. Please be courteous to everyone else.",
  },
];

function Paragraphs({ text, color }: { text: string; color: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <Text key={i} style={[styles.tipText, { color, marginTop: i > 0 ? 8 : 0 }]}>
          {para}
        </Text>
      ))}
    </>
  );
}

export default function HelpScreen() {
  const c = useThemeColors();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Help Guide" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 28 }]} accessibilityRole="header">STOP TYPES</Text>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {STOP_TYPES.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.stopRow,
                i < STOP_TYPES.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
              ]}
            >
              <View style={styles.stopIconBox}>
                <Image
                  source={item.image}
                  style={[styles.stopImage, { width: item.imageSize, height: item.imageSize }]}
                  accessible={false}
                  importantForAccessibility="no"
                />
              </View>
              <View style={styles.stopTextWrap}>
                <Text style={[styles.stopTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.stopText, { color: c.textSecondary }]}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 10 }]} accessibilityRole="header">HOW TO RIDE</Text>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {RIDING_TIPS.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.tipRow,
                i < RIDING_TIPS.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
              ]}
            >
              <Text style={[styles.tipTitle, { color: c.text }]}>{item.title}</Text>
              <Paragraphs text={item.body} color={c.textSecondary} />
              {!!item.tip && (
                <View style={[styles.tipCallout, { backgroundColor: c.surfaceAlt, borderLeftColor: c.tint }]}>
                  <Text style={[styles.tipCalloutLabel, { color: c.tintText }]}>TIP</Text>
                  <Text style={[styles.tipCalloutText, { color: c.textSecondary }]}>{item.tip}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 24 },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  stopRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  stopIconBox: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  stopImage: { resizeMode: 'contain' },
  stopTextWrap: { flex: 1 },
  stopTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  stopText: { fontSize: 13, lineHeight: 18 },

  tipRow: { padding: 14 },
  tipTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  tipText: { fontSize: 13, lineHeight: 18 },
  tipCallout: {
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tipCalloutLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, marginBottom: 2 },
  tipCalloutText: { fontSize: 12, lineHeight: 17 },
});
