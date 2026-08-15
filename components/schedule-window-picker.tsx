import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ScaledText as Text } from '@/components/scaled-text';
import type { RideWindow } from '@/lib/notifications';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // index = server weekday (Mon=0)
const DAY_FULL_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Free-text HH:MM entry - the picker-chip version of this only offered
// fixed 30-minute increments, which is what this replaces. Keeps its own
// draft text so a mid-typing value like "8:" doesn't get validated away
// before the user's finished, only reformatting/committing on blur.
export function TimeField({
  value, onChange, c, accessibilityLabel,
}: { value: string; onChange: (v: string) => void; c: any; accessibilityLabel: string }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  const commit = () => {
    const m = text.match(/^(\d{1,2}):?(\d{2})$/);
    if (m) {
      const h = Math.min(23, parseInt(m[1], 10));
      const min = Math.min(59, parseInt(m[2], 10));
      const formatted = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      setText(formatted);
      if (formatted !== value) onChange(formatted);
    } else {
      setText(value); // invalid - revert to the last good value
    }
  };

  return (
    <TextInput
      value={text}
      onChangeText={setText}
      onBlur={commit}
      placeholder="08:00"
      placeholderTextColor={c.textSecondary}
      keyboardType="numbers-and-punctuation"
      maxLength={5}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Enter a time as hours and minutes, like 08:00"
      style={[styles.timeInput, { color: c.text, backgroundColor: c.surfaceAlt, borderColor: c.border }]}
    />
  );
}

// "Always" / "Specific times" segmented control + one or more day/time
// windows. Shared by the per-route delay-alert schedule (app/notifications.tsx)
// and the proximity-alert schedule (app/proximity-alerts-new.tsx) so both use
// exactly the same picker instead of two copies of this ~90-line block.
export function ScheduleWindowPicker({
  schedule, onChange, c, label,
}: { schedule: RideWindow[]; onChange: (schedule: RideWindow[]) => void; c: any; label: string }) {
  const hasSchedule = schedule.length > 0;

  const setMode = (mode: 'always' | 'custom') => {
    if (mode === 'always') {
      onChange([]);
    } else {
      onChange([{ days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }]);
    }
  };

  const addWindow = () => onChange([...schedule, { days: [0, 1, 2, 3, 4], start: '08:00', end: '10:00' }]);
  const removeWindow = (idx: number) => onChange(schedule.filter((_, i) => i !== idx));
  const updateWindow = (idx: number, patch: Partial<RideWindow>) =>
    onChange(schedule.map((w, i) => (i === idx ? { ...w, ...patch } : w)));
  const toggleWindowDay = (idx: number, day: number) =>
    onChange(schedule.map((w, i) =>
      i === idx
        ? { ...w, days: w.days.includes(day) ? w.days.filter(d => d !== day) : [...w.days, day].sort() }
        : w,
    ));

  return (
    <View>
      <Text style={[styles.subLabel, { color: c.textSecondary }]}>{label}</Text>
      <View style={[styles.segmentWrap, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, !hasSchedule && { backgroundColor: c.tint }]}
          onPress={() => setMode('always')}
          accessibilityRole="button"
          accessibilityLabel="Always"
          accessibilityState={{ selected: !hasSchedule }}
          hitSlop={6}
        >
          <Text style={[styles.segmentText, { color: !hasSchedule ? '#fff' : c.textSecondary }]}>Always</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, hasSchedule && { backgroundColor: c.tint }]}
          onPress={() => setMode('custom')}
          accessibilityRole="button"
          accessibilityLabel="Specific times"
          accessibilityState={{ selected: hasSchedule }}
          hitSlop={6}
        >
          <Text style={[styles.segmentText, { color: hasSchedule ? '#fff' : c.textSecondary }]}>Specific times</Text>
        </TouchableOpacity>
      </View>

      {hasSchedule && schedule.map((w, idx) => (
        <View key={idx} style={[styles.windowCard, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
          <View style={styles.windowHeader}>
            <Text style={[styles.windowTitle, { color: c.text }]}>Window {idx + 1}</Text>
            <TouchableOpacity
              onPress={() => removeWindow(idx)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Delete window ${idx + 1}`}
            >
              <MaterialIcons name="delete-outline" size={18} color={c.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((dayLabel, day) => {
              const on = w.days.includes(day);
              return (
                <TouchableOpacity
                  key={dayLabel}
                  style={[styles.dayChip, { backgroundColor: on ? c.tint : c.surface }]}
                  onPress={() => toggleWindowDay(idx, day)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={DAY_FULL_NAMES[day]}
                  accessibilityState={{ checked: on }}
                  hitSlop={{ top: 10, bottom: 10, left: 2, right: 2 }}
                >
                  <Text style={[styles.dayChipText, { color: on ? '#fff' : c.textSecondary }]}>{dayLabel}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.timeRow}>
            <Text style={[styles.timeLabel, { color: c.textSecondary }]}>From</Text>
            <TimeField
              value={w.start}
              onChange={t => updateWindow(idx, { start: t })}
              c={c}
              accessibilityLabel={`Window ${idx + 1} start time`}
            />
            <Text style={[styles.timeLabel, { color: c.textSecondary }]}>To</Text>
            <TimeField
              value={w.end}
              onChange={t => updateWindow(idx, { end: t })}
              c={c}
              accessibilityLabel={`Window ${idx + 1} end time`}
            />
          </View>
        </View>
      ))}

      {hasSchedule && (
        <TouchableOpacity
          style={[styles.inlineBtn, { borderColor: c.border }]}
          onPress={addWindow}
          accessibilityRole="button"
          accessibilityLabel="Add another window"
        >
          <MaterialIcons name="add" size={16} color={c.tint} />
          <Text style={[styles.inlineBtnText, { color: c.tint }]}>Add another window</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  subLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },

  segmentWrap: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, padding: 3, marginBottom: 10 },
  segmentBtn: { flex: 1, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  segmentText: { fontSize: 13, fontWeight: '700' },

  inlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    marginTop: 4,
  },
  inlineBtnText: { fontSize: 13, fontWeight: '600' },

  windowCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  windowHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  windowTitle: { fontSize: 13, fontWeight: '700' },
  dayRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dayChip: { flex: 1, borderRadius: 7, paddingVertical: 6, alignItems: 'center' },
  dayChipText: { fontSize: 11, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeLabel: { fontSize: 12, fontWeight: '600' },
  timeInput: {
    borderRadius: 7, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 13, fontWeight: '600', minWidth: 64, textAlign: 'center',
  },
});
