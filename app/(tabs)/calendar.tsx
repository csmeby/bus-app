import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { API_BASE } from '@/lib/api-base';
import { cachedJsonFetch } from '@/lib/local-cache';
import { translate } from '@/lib/translations';

const LEGEND_ITEMS = [
  { category: 'no_service', color: '#EF4444', label: 'No Service' },
  { category: 'gameday', color: '#7C2D12', label: 'Gameday' },
  { category: 'summer', color: '#8B5CF6', label: 'Summer' },
  { category: 'break', color: '#F59E0B', label: 'Break' },
  { category: 'regular', color: '#22C55E', label: 'Regular' },
  { category: 'charter', color: '#06B6D4', label: 'Charter' },
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Local calendar date, not toISOString() (UTC) - avoids the day-shift bug
// that broke multi-day schedule lookups on the main map screen.
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

type CalendarEvent = {
  title: string;
  category: string;
  color: string;
  label: string;
  description: string;
  url: string | null;
};

type DayInfo = {
  primaryCategory: string;
  primaryColor: string;
  primaryLabel: string;
  secondaryColor: string | null;
  events: CalendarEvent[];
};

type GridCell = {
  date: Date;
  dateStr: string;
  inMonth: boolean;
};

export default function CalendarScreen() {
  const c = useThemeColors();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [days, setDays] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const todayStr = toDateStr(new Date());

  const gridCells: GridCell[] = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDow = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    const cells: GridCell[] = [];

    for (let i = firstDow; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      cells.push({ date: d, dateStr: toDateStr(d), inMonth: false });
    }
    for (let day = 1; day <= numDays; day++) {
      const d = new Date(year, month, day);
      cells.push({ date: d, dateStr: toDateStr(d), inMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
      cells.push({ date: d, dateStr: toDateStr(d), inMonth: false });
    }
    return cells;
  }, [viewDate]);

  useEffect(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const start = toDateStr(new Date(year, month, 1));
    const end = toDateStr(new Date(year, month + 1, 0));
    setLoading(true);
    cachedJsonFetch<any>(`${API_BASE}/calendar/days?start=${start}&end=${end}`, `calendar:${start}:${end}`, {
      maxAgeMs: 24 * 60 * 60 * 1000,
    })
      .then(data => setDays(data && typeof data === 'object' ? data : {}))
      .catch(e => console.warn('Calendar fetch failed:', e))
      .finally(() => setLoading(false));
  }, [viewDate]);

  const goToPrevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goToNextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const selectedInfo = selectedDay ? days[selectedDay] : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">{t('Calendar')}</Text>

        <View style={styles.monthHeader}>
          <TouchableOpacity
            onPress={goToPrevMonth}
            style={styles.navBtn}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={t('Previous month')}
            hitSlop={8}
          >
            <Text style={[styles.navArrow, { color: c.tintText }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: c.text }]} accessibilityRole="header">
            {viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity
            onPress={goToNextMonth}
            style={styles.navBtn}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={t('Next month')}
            hitSlop={8}
          >
            <Text style={[styles.navArrow, { color: c.tintText }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysRow}>
          {WEEKDAY_LABELS.map((wd, i) => (
            <Text
              key={i}
              style={[styles.weekDayLabel, { color: c.textSecondary }]}
              accessibilityLabel={t(WEEKDAY_FULL_NAMES[i])}
            >
              {wd}
            </Text>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={c.tintText} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.grid}>
            {gridCells.map(cell => {
              const info = days[cell.dateStr];
              const isToday = cell.dateStr === todayStr;
              const isPast = cell.dateStr < todayStr;
              const dateLabel = cell.date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
              return (
                <TouchableOpacity
                  key={cell.dateStr}
                  disabled={!info}
                  style={styles.dayCellOuter}
                  onPress={() => setSelectedDay(cell.dateStr)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${dateLabel}${isToday ? ', today' : ''}${info ? `, ${info.primaryLabel}` : ''}`}
                  accessibilityHint={info ? t('Shows this day\'s transit schedule changes') : undefined}
                  accessibilityState={{ disabled: !info }}
                >
                  {info?.secondaryColor && !isPast ? (
                    <LinearGradient
                      colors={[info.primaryColor, info.primaryColor, info.secondaryColor, info.secondaryColor]}
                      locations={[0, 0.49, 0.51, 1]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        styles.dayCellInner,
                        { opacity: cell.inMonth ? 1 : 0.4 },
                        isToday && { borderWidth: 2, borderColor: c.tintText },
                      ]}
                    >
                      <Text style={[styles.dayNumber, { color: '#fff' }]}>{cell.date.getDate()}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      style={[
                        styles.dayCellInner,
                        {
                          backgroundColor:
                            info && !isPast ? info.primaryColor + (cell.inMonth ? '' : '66') : 'transparent',
                        },
                        isToday && { borderWidth: 2, borderColor: c.tintText },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayNumber,
                          { color: info && !isPast ? '#fff' : cell.inMonth ? c.text : c.textSecondary },
                        ]}
                      >
                        {cell.date.getDate()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.legend}>
          {LEGEND_ITEMS.map(item => (
            <View key={item.category} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={[styles.legendLabel, { color: c.textSecondary }]}>{t(item.label)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selectedDay} transparent animationType="fade" onRequestClose={() => setSelectedDay(null)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
          accessibilityRole="button"
          accessibilityLabel={t('Dismiss')}
        />
        <View style={[styles.dayModalCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.dayModalDate, { color: c.text }]} accessibilityRole="header">
            {selectedDay &&
              parseLocalDate(selectedDay).toLocaleDateString([], {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
          </Text>
          <ScrollView style={{ maxHeight: 320 }}>
            {selectedInfo ? (
              selectedInfo.events.map((ev, i) => (
                <View key={i} style={[styles.eventCard, { borderColor: c.border }]}>
                  <View style={styles.eventCardHeader}>
                    <View style={[styles.eventColorDot, { backgroundColor: ev.color }]} />
                    <Text style={[styles.eventTitle, { color: c.text }]} numberOfLines={2}>{ev.title}</Text>
                  </View>
                  {!!ev.description && (
                    <Text style={[styles.eventDescription, { color: c.textSecondary }]}>{ev.description}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={[styles.noEventsText, { color: c.textSecondary }]}>
                {t('No scheduled transit changes today - normal posted hours apply.')}
              </Text>
            )}
          </ScrollView>
          <TouchableOpacity
            onPress={() => setSelectedDay(null)}
            style={[styles.closeModalBtn, { backgroundColor: c.tint }]}
            accessibilityRole="button"
          >
            <Text style={styles.closeModalBtnText}>{t('Close')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const CELL_PCT = '14.2857%';

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 24 },
  pageTitle: { fontSize: 32, fontWeight: '700', marginTop: 16, marginBottom: 20 },

  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: { paddingHorizontal: 16, paddingVertical: 4 },
  navArrow: { fontSize: 26, fontWeight: '400' },
  monthTitle: { fontSize: 18, fontWeight: '600' },

  weekDaysRow: { flexDirection: 'row', marginBottom: 4 },
  weekDayLabel: { width: CELL_PCT, textAlign: 'center', fontSize: 12, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellOuter: { width: CELL_PCT, aspectRatio: 1, padding: 3 },
  dayCellInner: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: { fontSize: 14, fontWeight: '600' },

  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 20,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },
  legendLabel: { fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  dayModalCard: {
    position: 'absolute',
    top: '20%',
    left: 20,
    right: 20,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 12,
  },
  dayModalDate: { fontSize: 17, fontWeight: '700', marginBottom: 14 },
  eventCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  eventCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  eventColorDot: { width: 10, height: 10, borderRadius: 5 },
  eventTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  eventDescription: { fontSize: 13, lineHeight: 18 },
  noEventsText: { fontSize: 14, lineHeight: 20, paddingVertical: 12 },
  closeModalBtn: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeModalBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
