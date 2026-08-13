import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { BTD_TINT } from '@/constants/btd-theme';
import { useThemeColors } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FIXED_ROUTE_FARES = [
  { label: 'General Public', price: '$1.00' },
  { label: 'Children (6-12)', price: '$0.50' },
  { label: 'Children under 6 (with paying customer)', price: 'FREE' },
  { label: 'Senior / Disabled*', price: '$0.50' },
  { label: 'Medicare*', price: '$0.50' },
  { label: 'Blinn / TAMU Students*', price: 'FREE' },
];

const TICKETS_AND_PASSES = [
  { label: 'Day Pass', sub: 'Unlimited trips in one day', price: '$3.50' },
  { label: 'Weekly Pass', sub: 'Unlimited trips in 5 consecutive weekdays', price: '$15.00' },
  { label: 'Monthly Pass', sub: 'Unlimited trips in 31 consecutive days', price: '$45.00' },
  { label: 'Ticket Book', sub: '40 one-way trips', price: '$40.00' },
  { label: 'MultiRide Pass', sub: '42 one-way trips', price: '$42.00' },
];

const REDUCED_PASSES = [
  { label: 'Day Pass', price: '$1.75' },
  { label: 'Weekly Pass', price: '$7.50' },
  { label: 'Monthly Pass', price: '$22.50' },
  { label: 'S&D PunchPass*', sub: '40 one-way trips', price: '$20.00' },
];

const PURCHASE_LOCATIONS = [
  { label: 'BTD Main Office', sub: '2117 Nuches Ln, Bryan, TX' },
  { label: 'North Terminal', sub: '301 E 26th St, Bryan, TX' },
  { label: 'Midtown Terminal', sub: '3350 Texas Ave S, Bryan, TX' },
];

const RIDING_RULES = [
  'Stand away from the curb until the bus is completely stopped.',
  'Have exact fare ready - drivers do not make change.',
  'Watch your step getting on and off the bus.',
  'Use the handrails and sit in a seat as soon as possible.',
  "Don't let children play or stand on the seats.",
  'Be courteous to other passengers.',
  'No eating, drinking, smoking, or loud music.',
  'No profanity, racial, or vulgar comments.',
  'Riding under the influence of alcohol or illegal drugs is prohibited.',
  'All buses are ADA wheelchair accessible (combined customer + mobility aid weight limit: 600 lbs).',
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useThemeColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: c.textSecondary }]} accessibilityRole="header">{title}</Text>
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>
    </View>
  );
}

function FareRow({ label, sub, price, isLast }: { label: string; sub?: string; price: string; isLast?: boolean }) {
  const scheme = useColorScheme();
  const c = useThemeColors();
  const tint = BTD_TINT[scheme];
  return (
    <View style={[styles.fareRow, !isLast && [styles.rowBorder, { borderBottomColor: c.border }]]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.fareLabel, { color: c.text }]}>{label}</Text>
        {!!sub && <Text style={[styles.fareSub, { color: c.textSecondary }]}>{sub}</Text>}
      </View>
      <Text style={[styles.farePrice, { color: tint }]}>{price}</Text>
    </View>
  );
}

export default function BtdInfoScreen() {
  const scheme = useColorScheme();
  const c = useThemeColors();
  const tint = BTD_TINT[scheme];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        {/* Info moved from its own tab to a More row - no longer reached by
            just switching tabs, so it needs an explicit way back. */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
        >
          <Text style={[styles.backArrow, { color: tint }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">Brazos Transit District</Text>
        <Text style={[styles.pageSubtitle, { color: c.textSecondary }]}>
          Fixed routes serving Bryan & College Station.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Section title="FIXED ROUTE (ONE-WAY)">
          {FIXED_ROUTE_FARES.map((f, i) => (
            <FareRow key={f.label} {...f} isLast={i === FIXED_ROUTE_FARES.length - 1} />
          ))}
        </Section>
        <Text style={[styles.footnote, { color: c.textSecondary }]}>
          *Must present a valid student, faculty, or staff ID.
        </Text>

        <Section title="TICKETS & PASSES">
          {TICKETS_AND_PASSES.map((f, i) => (
            <FareRow key={f.label} {...f} isLast={i === TICKETS_AND_PASSES.length - 1} />
          ))}
        </Section>

        <Section title="REDUCED PASSES">
          {REDUCED_PASSES.map((f, i) => (
            <FareRow key={f.label} {...f} isLast={i === REDUCED_PASSES.length - 1} />
          ))}
        </Section>
        <Text style={[styles.footnote, { color: c.textSecondary }]}>
          *S&D Punch Passes are only available to clients who have been issued either a S-Pass or D-Pass card.
        </Text>

        <Section title="WHERE TO BUY TICKETS & PASSES">
          {PURCHASE_LOCATIONS.map((loc, i) => (
            <View
              key={loc.label}
              style={[styles.locationRow, i < PURCHASE_LOCATIONS.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }]]}
            >
              <Text style={[styles.fareLabel, { color: c.text }]}>{loc.label}</Text>
              <Text style={[styles.fareSub, { color: c.textSecondary }]}>{loc.sub}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={[styles.locationRow, styles.rowBorder, { borderBottomColor: c.border, borderTopWidth: 0 }]}
            onPress={() => Linking.openURL('tel:9797780607').catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Purchase over the phone, 9 7 9. 7 7 8. 0 6 0 7"
            accessibilityHint="Calls BTD"
          >
            <Text style={[styles.fareLabel, { color: c.text }]}>Purchase over the phone</Text>
            <Text style={[styles.fareSub, { color: tint }]}>979-778-0607</Text>
          </TouchableOpacity>
        </Section>

        <View style={[styles.hoursCard, { backgroundColor: tint + '14', borderColor: tint + '33' }]}>
          <MaterialIcons name="schedule" size={18} color={tint} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.fareLabel, { color: c.text }]}>Monday – Friday, 5:00 AM – 7:00 PM</Text>
            <Text style={[styles.fareSub, { color: c.textSecondary }]}>Excluding holidays. No weekend service.</Text>
          </View>
        </View>

        <Section title="MORE SERVICES">
          <View style={styles.plainRow}>
            <Text style={[styles.fareSub, { color: c.textSecondary, lineHeight: 19 }]}>
              For info about Senior/Disabled & Medicare passes, ADA Paratransit, and Demand & Response
              service, visit{' '}
              <Text
                style={{ color: tint, fontWeight: '600' }}
                onPress={() => Linking.openURL('https://www.btd.org').catch(() => {})}
                accessibilityRole="link"
              >
                btd.org
              </Text>{' '}
              or call{' '}
              <Text
                style={{ color: tint, fontWeight: '600' }}
                onPress={() => Linking.openURL('tel:9797780607').catch(() => {})}
                accessibilityRole="link"
              >
                979-778-0607
              </Text>.
            </Text>
          </View>
        </Section>

        <Section title="RIDING POLICY">
          {RIDING_RULES.map((rule, i) => (
            <View
              key={rule}
              style={[styles.ruleRow, i < RIDING_RULES.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }]]}
            >
              <Text style={[styles.ruleBullet, { color: tint }]}>•</Text>
              <Text style={[styles.ruleText, { color: c.textSecondary }]}>{rule}</Text>
            </View>
          ))}
        </Section>

        <Section title="CONTACT & QUESTIONS">
          <TouchableOpacity
            style={[styles.contactRow, styles.rowBorder, { borderBottomColor: c.border }]}
            onPress={() => Linking.openURL('tel:9797780607').catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Trip planning and general info, 9 7 9. 7 7 8. 0 6 0 7"
            accessibilityHint="Calls BTD"
          >
            <MaterialIcons name="phone" size={18} color={tint} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fareLabel, { color: c.text }]}>Trip planning & general info</Text>
              <Text style={[styles.fareSub, { color: tint }]}>979-778-0607</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactRow, styles.rowBorder, { borderBottomColor: c.border }]}
            onPress={() => Linking.openURL('https://www.btd.org').catch(() => {})}
            accessibilityRole="link"
            accessibilityLabel="Website, btd.org"
            accessibilityHint="Opens in your browser"
          >
            <MaterialIcons name="language" size={18} color={tint} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fareLabel, { color: c.text }]}>Website</Text>
              <Text style={[styles.fareSub, { color: tint }]}>btd.org</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.contactRow}>
            <MaterialIcons name="alternate-email" size={18} color={c.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.fareLabel, { color: c.text }]}>Social media</Text>
              <Text style={[styles.fareSub, { color: c.textSecondary }]}>@brazostransitdistrict</Text>
            </View>
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 16, marginBottom: 8 },
  backBtn: { paddingBottom: 6 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 28, fontWeight: '700' },
  pageSubtitle: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  scrollContent: { paddingBottom: 32 },

  section: { marginTop: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  fareRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  fareLabel: { fontSize: 14, fontWeight: '600' },
  fareSub: { fontSize: 12, marginTop: 2 },
  farePrice: { fontSize: 15, fontWeight: '700' },
  footnote: { fontSize: 11, marginTop: 8, marginLeft: 4 },

  locationRow: { padding: 14 },
  plainRow: { padding: 14 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  hoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 20,
  },

  ruleRow: { flexDirection: 'row', padding: 12, paddingHorizontal: 14, gap: 8 },
  ruleBullet: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  ruleText: { fontSize: 13, flex: 1, lineHeight: 19 },
});
