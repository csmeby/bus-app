import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import routePatterns from '../../routes_patterns.json';

const CAMPUS_REGION = { latitude: 30.615, longitude: -96.34, latitudeDelta: 0.03, longitudeDelta: 0.03 };

// Walking legs are always drawn the same way regardless of itinerary, so the
// eye can tell "you're on foot here" at a glance. Bus legs use the route's
// real brand color only when an itinerary actually involves 2+ different
// routes (so a transfer is visually distinguishable); a single-route trip
// always renders in one consistent transit color, since the rider doesn't
// need a legend for a trip that only ever uses one route.
const WALK_COLOR = '#9CA3AF';
const TRANSIT_COLOR = '#2563EB';

type LatLon = { lat: number; lon: number };

type Leg = {
  type: 'walk' | 'wait' | 'bus';
  description: string;
  minutes: number;
  distanceMiles?: number;
  route?: string;
  direction?: string;
  color?: string;
  path?: LatLon[];
  departTime?: string; // ISO — only present on 'wait' legs: when that bus actually leaves the stop
};

type Itinerary = {
  totalMinutes: number;
  departTime: string;
  arriveTime: string;
  legs: Leg[];
};

type PlanResult = {
  feasible: boolean;
  itineraries: Itinerary[];
  message: string | null;
};

// ── Known-stop search ─────────────────────────────────────────────────────
// routes_patterns.json is already bundled with the app (it's how the map
// screen draws route lines/stops), so building a local, offline-searchable
// stop list costs nothing and answers instantly — no API key, no network
// round trip, no rate limit. A stop can sit on more than one route, so we
// dedupe by stop code and just accumulate which routes serve it.

type KnownStop = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  routes: string[];
};

const KNOWN_STOPS: KnownStop[] = (() => {
  const byCode = new Map<string, KnownStop>();
  Object.entries(routePatterns as Record<string, any>).forEach(([routeNum, routeData]) => {
    Object.values(routeData.patterns ?? {}).forEach((pattern: any) => {
      (pattern.stops ?? []).forEach((stop: any) => {
        const existing = byCode.get(stop.code);
        if (existing) {
          if (!existing.routes.includes(routeNum)) existing.routes.push(routeNum);
        } else {
          byCode.set(stop.code, { code: stop.code, name: stop.name, lat: stop.lat, lng: stop.lng, routes: [routeNum] });
        }
      });
    });
  });
  return Array.from(byCode.values());
})();

function searchKnownStops(query: string, limit = 6): KnownStop[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: KnownStop[] = [];
  const contains: KnownStop[] = [];
  for (const stop of KNOWN_STOPS) {
    const name = stop.name.toLowerCase();
    if (name.startsWith(q)) starts.push(stop);
    else if (name.includes(q)) contains.push(stop);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

// ── General place search (Photon) ───────────────────────────────────────
// Photon (https://photon.komoot.io) is komoot's free public OpenStreetMap

const PHOTON_BBOX = '-96.614456,30.432690,-96.078186,30.896333';
const PHOTON_MIN_CHARS = 3;
const PHOTON_DEBOUNCE_MS = 400;

type PhotonResult = {
  id: string;
  label: string;
  sublabel: string | null;
  lat: number;
  lon: number;
};

function buildPhotonLabel(props: Record<string, any>): { label: string; sublabel: string | null } {
  const label = props.name || [props.street, props.housenumber].filter(Boolean).join(' ') || 'Unnamed place';
  const sublabel = [props.street && props.housenumber ? `${props.housenumber} ${props.street}` : props.street, props.city, props.state]
    .filter(Boolean)
    .filter(part => part !== label)
    .join(', ') || null;
  return { label, sublabel };
}

async function fetchPhotonResults(query: string, signal: AbortSignal): Promise<PhotonResult[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=${PHOTON_BBOX}&limit=5`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Photon request failed: ${res.status}`);
  const data = await res.json();
  const features: any[] = data?.features ?? [];
  return features.map((f, i) => {
    const [lon, lat] = f.geometry?.coordinates ?? [0, 0]; // GeoJSON is [lon, lat], not [lat, lon]
    const { label, sublabel } = buildPhotonLabel(f.properties ?? {});
    return { id: `${f.properties?.osm_type ?? 'p'}${f.properties?.osm_id ?? i}`, label, sublabel, lat, lon };
  });
}

// Debounces a free-text query against Photon: waits for typing to pause,
// requires a minimum length, and cancels any in-flight request that's been
// superseded by newer input so slow responses can't clobber fresh ones.
function usePhotonSearch(query: string) {
  const [results, setResults] = useState<PhotonResult[]>([]);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    abortRef.current?.abort();

    if (trimmed.length < PHOTON_MIN_CHARS) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const found = await fetchPhotonResults(trimmed, controller.signal);
        setResults(found);
      } catch (e: any) {
        if (e?.name !== 'AbortError') console.warn('Photon search failed:', e);
      } finally {
        setSearching(false);
      }
    }, PHOTON_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return { results, searching };
}

function addressLabel(addr: Location.LocationGeocodedAddress | undefined): string | null {
  if (!addr) return null;
  return addr.name || addr.formattedAddress || [addr.street, addr.city].filter(Boolean).join(', ') || null;
}

async function reverseGeocodeLabel(lat: number, lon: number): Promise<string | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
    return addressLabel(results[0]);
  } catch {
    return null;
  }
}

// ── Date / time formatting ──────────────────────────────────────────────────

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtHM(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDateLabel(d: Date): string {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (toDateStr(d) === toDateStr(today)) return 'Today';
  if (toDateStr(d) === toDateStr(tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTimeLabel(d: Date): string {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatClock(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function legIcon(leg: Leg): React.ComponentProps<typeof MaterialIcons>['name'] {
  if (leg.type === 'walk') return 'directions-walk';
  if (leg.type === 'wait') return 'schedule';
  return 'directions-bus';
}

// Fits a region around every point across every leg's path, with a little
// padding so endpoints aren't flush against the map edge.
function regionForItinerary(itin: Itinerary) {
  const points = itin.legs.flatMap(l => l.path ?? []);
  if (points.length === 0) return CAMPUS_REGION;
  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latPad = Math.max((maxLat - minLat) * 0.35, 0.004);
  const lonPad = Math.max((maxLon - minLon) * 0.35, 0.004);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: (maxLat - minLat) + latPad * 2,
    longitudeDelta: (maxLon - minLon) + lonPad * 2,
  };
}

// Single-route trips always render in one consistent transit color; only
// once an itinerary actually involves 2+ different routes does each bus leg
// get its own route-brand color, so a transfer is visually distinguishable.
function colorForBusLeg(leg: Leg, multiRoute: boolean): string {
  if (multiRoute) return leg.color ?? TRANSIT_COLOR;
  return TRANSIT_COLOR;
}

// ── Location search field ────────────────────────────────────────────────────
// One search box + results list, shared by the origin and destination cards
// (they were identical apart from which state they wrote into). Owns its own
// query/focus state; the parent only hears about the final pick.

function LocationField({
  valueLabel,
  emptyLabel,
  searchLabel,
  onPick,
  c,
}: {
  valueLabel: string | null;
  emptyLabel: string;
  searchLabel: string;
  onPick: (point: LatLon, label: string) => void;
  c: (typeof Colors)['light'];
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const stopMatches = useMemo(() => searchKnownStops(query), [query]);
  const { results: placeMatches, searching } = usePhotonSearch(query);

  const pick = (point: LatLon, label: string) => {
    onPick(point, label);
    setQuery('');
    setFocused(false);
  };

  return (
    <>
      <Text style={[styles.locationLabel, { color: c.text }]} numberOfLines={1}>
        {valueLabel ?? emptyLabel}
      </Text>

      <View style={[styles.searchBox, { borderColor: c.border, backgroundColor: c.surfaceAlt }]}>
        <MaterialIcons name="search" size={18} color={c.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search a stop or address"
          placeholderTextColor={c.textSecondary}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          returnKeyType="search"
          accessibilityLabel={searchLabel}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <MaterialIcons name="close" size={16} color={c.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {focused && query.trim().length > 0 && (
        <View style={[styles.resultsList, { borderColor: c.border, backgroundColor: c.surfaceAlt }]}>
          {stopMatches.map(stop => (
            <TouchableOpacity
              key={stop.code}
              style={styles.resultRow}
              onPress={() => pick({ lat: stop.lat, lon: stop.lng }, stop.name)}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={`${stop.name}, bus stop, route${stop.routes.length > 1 ? 's' : ''} ${stop.routes.join(', ')}`}
            >
              <MaterialIcons name="directions-bus" size={16} color={c.tint} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultName, { color: c.text }]} numberOfLines={1}>{stop.name}</Text>
                <Text style={[styles.resultSub, { color: c.textSecondary }]} numberOfLines={1}>
                  Bus stop · Route{stop.routes.length > 1 ? 's' : ''} {stop.routes.join(', ')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {stopMatches.length > 0 && (placeMatches.length > 0 || searching) && (
            <View style={[styles.resultsDivider, { backgroundColor: c.border }]} />
          )}

          {searching && placeMatches.length === 0 && (
            <View style={styles.resultRow}>
              <ActivityIndicator size="small" color={c.tint} />
              <Text style={[styles.resultSub, { color: c.textSecondary }]}>Searching nearby places…</Text>
            </View>
          )}

          {placeMatches.map(place => (
            <TouchableOpacity
              key={place.id}
              style={styles.resultRow}
              onPress={() =>
                pick({ lat: place.lat, lon: place.lon }, place.sublabel ? `${place.label}, ${place.sublabel}` : place.label)
              }
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={place.sublabel ? `${place.label}, ${place.sublabel}` : place.label}
            >
              <MaterialIcons name="place" size={16} color={c.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultName, { color: c.text }]} numberOfLines={1}>{place.label}</Text>
                {place.sublabel && (
                  <Text style={[styles.resultSub, { color: c.textSecondary }]} numberOfLines={1}>{place.sublabel}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {query.trim().length < PHOTON_MIN_CHARS && stopMatches.length === 0 && (
            <View style={styles.resultRow}>
              <Text style={[styles.resultSub, { color: c.textSecondary }]}>Keep typing to search places…</Text>
            </View>
          )}
        </View>
      )}
    </>
  );
}

export default function PlanRideScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];

  const [origin, setOrigin] = useState<LatLon | null>(null);
  const [originLabel, setOriginLabel] = useState<string | null>(null);

  const [destination, setDestination] = useState<LatLon | null>(null);
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);

  const [pickerFor, setPickerFor] = useState<'origin' | 'destination' | null>(null);
  const [pickerPoint, setPickerPoint] = useState<LatLon>({ lat: CAMPUS_REGION.latitude, lon: CAMPUS_REGION.longitude });

  const [locating, setLocating] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [departTime, setDepartTime] = useState<Date | null>(null);
  const [arriveTime, setArriveTime] = useState<Date | null>(null);
  const [activeTimeField, setActiveTimeField] = useState<'depart' | 'arrive' | null>(null);
  // iOS shows the spinner inline in a sheet we control; Android opens its own
  // dialog imperatively and never needs this state.
  const [showIOSTimeSheet, setShowIOSTimeSheet] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [routePreviewItin, setRoutePreviewItin] = useState<Itinerary | null>(null);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location access to use your current position.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setOrigin({ lat, lon });
      setOriginLabel((await reverseGeocodeLabel(lat, lon)) ?? 'Current Location');
    } catch (e) {
      console.warn('Failed to get current location:', e);
      Alert.alert('Could not get location', 'Try again, or pick a location another way.');
    } finally {
      setLocating(false);
    }
  };

  const openMapPicker = (which: 'origin' | 'destination') => {
    const existing = which === 'origin' ? origin : destination;
    setPickerPoint(existing ?? { lat: CAMPUS_REGION.latitude, lon: CAMPUS_REGION.longitude });
    setPickerFor(which);
  };

  const confirmMapPicker = async () => {
    const which = pickerFor;
    const point = pickerPoint;
    setPickerFor(null);
    const label = (await reverseGeocodeLabel(point.lat, point.lon)) ?? `${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}`;
    if (which === 'origin') {
      setOrigin(point);
      setOriginLabel(label);
    } else if (which === 'destination') {
      setDestination(point);
      setDestinationLabel(label);
    }
  };

  // ── Date picker ────────────────────────────────────────────────────────
  // Android's date dialog is imperative (DateTimePickerAndroid.open) and has
  // no inline component; iOS renders <DateTimePicker> itself, so we show it
  // inside a sheet we control. No upper bound — a person planning a week or
  // a semester out should be able to scroll the calendar forward freely.

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: selectedDate,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === 'set' && date) setSelectedDate(date);
        },
      });
    } else {
      setShowDatePicker(true);
    }
  };

  // ── Time pickers ───────────────────────────────────────────────────────

  const openTimePicker = (field: 'depart' | 'arrive') => {
    const current = (field === 'depart' ? departTime : arriveTime) ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'time',
        is24Hour: false,
        onChange: (event, date) => {
          if (event.type === 'set' && date) {
            if (field === 'depart') setDepartTime(date);
            else setArriveTime(date);
          }
        },
      });
    } else {
      setActiveTimeField(field);
      setShowIOSTimeSheet(true);
    }
  };

  const findRoutes = async () => {
    if (!origin || !destination || !hasTimeConstraint) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/trip-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: origin.lat, lon: origin.lon },
          destination: { lat: destination.lat, lon: destination.lon },
          departAfter: departTime ? fmtHM(departTime) : undefined,
          arriveBy: arriveTime ? fmtHM(arriveTime) : undefined,
          date: toDateStr(selectedDate),
        }),
      });
      const data: PlanResult = await res.json();
      setResult(data);
    } catch (e) {
      console.warn('Trip plan request failed:', e);
      setResult({ feasible: false, itineraries: [], message: 'Could not reach the planner. Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const hasTimeConstraint = !!departTime || !!arriveTime;
  const canFindRoutes = !!origin && !!destination && hasTimeConstraint;

  const swapEnds = () => {
    setOrigin(destination);
    setOriginLabel(destinationLabel);
    setDestination(origin);
    setDestinationLabel(originLabel);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">Plan a Ride</Text>

        <View style={[styles.disclaimer, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
          <MaterialIcons name="info-outline" size={14} color={c.textSecondary} />
          <Text style={[styles.disclaimerText, { color: c.textSecondary }]}>
            This is an estimate. Always check the live map and allow extra buffer time.
          </Text>
        </View>

        {/* Origin */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>FROM</Text>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <LocationField
            valueLabel={originLabel}
            emptyLabel="No starting point set"
            searchLabel="Search for a starting point"
            onPick={(point, label) => { setOrigin(point); setOriginLabel(label); }}
            c={c}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              onPress={useCurrentLocation}
              disabled={locating}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Use current location"
              accessibilityState={{ disabled: locating, busy: locating }}
            >
              {locating ? <ActivityIndicator size="small" color={c.tint} /> : <MaterialIcons name="my-location" size={16} color={c.tint} />}
              <Text style={[styles.choiceBtnText, { color: c.text }]}>Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              onPress={() => openMapPicker('origin')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Choose starting point on map"
            >
              <MaterialIcons name="map" size={16} color={c.tint} />
              <Text style={[styles.choiceBtnText, { color: c.text }]}>Choose on Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Destination */}
        <View style={styles.sectionLabelRow}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary, marginBottom: 0 }]}>TO</Text>
          <TouchableOpacity
            onPress={swapEnds}
            hitSlop={8}
            disabled={!origin && !destination}
            activeOpacity={0.6}
            style={styles.swapBtn}
            accessibilityRole="button"
            accessibilityLabel="Swap starting point and destination"
            accessibilityState={{ disabled: !origin && !destination }}
          >
            <MaterialIcons name="swap-vert" size={16} color={(origin || destination) ? c.tint : c.border} />
            <Text style={[styles.swapBtnText, { color: (origin || destination) ? c.tint : c.border }]}>Swap</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <LocationField
            valueLabel={destinationLabel}
            emptyLabel="No destination set"
            searchLabel="Search for a destination"
            onPick={(point, label) => { setDestination(point); setDestinationLabel(label); }}
            c={c}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.choiceBtn, { backgroundColor: c.surfaceAlt, borderColor: c.border, flex: 1 }]}
              onPress={() => openMapPicker('destination')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Choose destination on map"
            >
              <MaterialIcons name="map" size={16} color={c.tint} />
              <Text style={[styles.choiceBtnText, { color: c.text }]}>Choose on Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 18 }]}>DATE</Text>
        <TouchableOpacity
          style={[styles.dateRow, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={openDatePicker}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Travel date, currently ${selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}`}
          accessibilityHint="Opens the date picker"
        >
          <MaterialIcons name="calendar-today" size={18} color={c.tint} />
          <Text style={[styles.dateRowText, { color: c.text }]}>{formatDateLabel(selectedDate)}</Text>
          <Text style={[styles.dateRowSub, { color: c.textSecondary }]}>
            {selectedDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <MaterialIcons name="chevron-right" size={20} color={c.textSecondary} />
        </TouchableOpacity>

        {/* Time constraints */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary, marginTop: 18 }]}>TIMING</Text>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.timingHint, { color: c.textSecondary }]}>
            Set a leave-after or arrive-by time (at least one is required).
          </Text>
          <View style={styles.timeRow}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Leave after</Text>
            <View style={styles.timeRowRight}>
              <TouchableOpacity
                style={[styles.timeChip, { borderColor: c.border, backgroundColor: c.surfaceAlt }]}
                onPress={() => openTimePicker('depart')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Leave after, currently ${departTime ? formatTimeLabel(departTime) : 'anytime'}`}
                accessibilityHint="Opens the time picker"
              >
                <MaterialIcons name="schedule" size={15} color={departTime ? c.tint : c.textSecondary} />
                <Text style={[styles.timeChipText, { color: departTime ? c.text : c.textSecondary }]}>
                  {departTime ? formatTimeLabel(departTime) : 'Anytime'}
                </Text>
              </TouchableOpacity>
              {departTime && (
                <TouchableOpacity
                  onPress={() => setDepartTime(null)}
                  hitSlop={8}
                  style={styles.clearTimeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear leave-after time"
                >
                  <MaterialIcons name="close" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={[styles.timeRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, marginTop: 12, paddingTop: 12 }]}>
            <Text style={[styles.rowLabel, { color: c.text }]}>Arrive by</Text>
            <View style={styles.timeRowRight}>
              <TouchableOpacity
                style={[styles.timeChip, { borderColor: c.border, backgroundColor: c.surfaceAlt }]}
                onPress={() => openTimePicker('arrive')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Arrive by, currently ${arriveTime ? formatTimeLabel(arriveTime) : 'no deadline'}`}
                accessibilityHint="Opens the time picker"
              >
                <MaterialIcons name="schedule" size={15} color={arriveTime ? c.tint : c.textSecondary} />
                <Text style={[styles.timeChipText, { color: arriveTime ? c.text : c.textSecondary }]}>
                  {arriveTime ? formatTimeLabel(arriveTime) : 'No deadline'}
                </Text>
              </TouchableOpacity>
              {arriveTime && (
                <TouchableOpacity
                  onPress={() => setArriveTime(null)}
                  hitSlop={8}
                  style={styles.clearTimeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Clear arrive-by time"
                >
                  <MaterialIcons name="close" size={16} color={c.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.findBtn, { backgroundColor: !canFindRoutes ? c.border : c.tint }]}
          onPress={findRoutes}
          disabled={!canFindRoutes || loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Find routes"
          accessibilityState={{ disabled: !canFindRoutes || loading, busy: loading }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.findBtnText}>Find Routes</Text>}
        </TouchableOpacity>
        {origin && destination && !hasTimeConstraint && (
          <Text style={[styles.findBtnHint, { color: c.textSecondary }]}>
            Set a leave-after or arrive-by time above to search.
          </Text>
        )}

        {/* Results */}
        {result && (
          <View style={styles.results}>
            {!result.feasible ? (
              <View style={[styles.noResultCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <MaterialIcons name="error-outline" size={20} color="#EF4444" />
                <Text style={[styles.noResultText, { color: c.text }]}>{result.message}</Text>
              </View>
            ) : (
              result.itineraries.map((itin, i) => (
                <View key={i} style={[styles.itinCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={styles.itinHeader}>
                    <Text style={[styles.itinTotal, { color: c.text }]}>{itin.totalMinutes} min</Text>
                    <Text style={[styles.itinTimes, { color: c.textSecondary }]}>
                      {formatClock(itin.departTime)} → {formatClock(itin.arriveTime)}
                    </Text>
                  </View>
                  {itin.legs.map((leg, j) => (
                    <View key={j} style={styles.legRow}>
                      <MaterialIcons name={legIcon(leg)} size={16} color={leg.color ?? c.textSecondary} />
                      <Text style={[styles.legText, { color: c.text }]}>
                        {leg.description}
                        {leg.type === 'wait' && leg.departTime ? ` (leaves at ${formatClock(leg.departTime)})` : ''}
                      </Text>
                      <Text style={[styles.legMinutes, { color: c.textSecondary }]}>{leg.minutes} min</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.startBtn, { backgroundColor: c.tint }]}
                    onPress={() => setRoutePreviewItin(itin)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`View route on map, ${itin.totalMinutes} minute trip, ${formatClock(itin.departTime)} to ${formatClock(itin.arriveTime)}`}
                  >
                    <MaterialIcons name="open-in-full" size={15} color="#fff" />
                    <Text style={styles.startBtnText}>View Route</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Route preview modal — shows just this itinerary's walking + bus
          segments (board to alight only, never the full route), not the
          live map. Bus legs share one consistent color unless the trip
          involves 2+ different routes, in which case each gets its real
          route color so the transfer point is easy to read. */}
      <Modal
        visible={routePreviewItin !== null}
        animationType="slide"
        onRequestClose={() => setRoutePreviewItin(null)}
      >
        <SafeAreaView style={[styles.pickerRoot, { backgroundColor: c.background }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: c.text }]} accessibilityRole="header">Route preview</Text>
            {routePreviewItin && (
              <Text style={[styles.previewSubtitle, { color: c.textSecondary }]}>
                {formatClock(routePreviewItin.departTime)} → {formatClock(routePreviewItin.arriveTime)} · {routePreviewItin.totalMinutes} min
              </Text>
            )}
          </View>
          {routePreviewItin && (() => {
            const busRoutes = new Set(
              routePreviewItin.legs.filter(l => l.type === 'bus' && l.route).map(l => l.route)
            );
            const multiRoute = busRoutes.size > 1;
            const region = regionForItinerary(routePreviewItin);
            return (
              <MapView style={{ flex: 1 }} initialRegion={region}>
                {routePreviewItin.legs.map((leg, i) => {
                  if (!leg.path || leg.path.length < 2) return null;
                  const coords = leg.path.map(p => ({ latitude: p.lat, longitude: p.lon }));
                  if (leg.type === 'walk') {
                    return (
                      <Polyline
                        key={i}
                        coordinates={coords}
                        strokeColor={WALK_COLOR}
                        strokeWidth={3}
                        lineDashPattern={[6, 6]}
                      />
                    );
                  }
                  if (leg.type === 'bus') {
                    return (
                      <Polyline
                        key={i}
                        coordinates={coords}
                        strokeColor={colorForBusLeg(leg, multiRoute)}
                        strokeWidth={5}
                      />
                    );
                  }
                  return null;
                })}
                {!!routePreviewItin.legs[0]?.path?.[0] && (
                  <Marker
                    coordinate={{
                      latitude: routePreviewItin.legs[0].path[0].lat,
                      longitude: routePreviewItin.legs[0].path[0].lon,
                    }}
                    title="Start"
                    pinColor="#22C55E"
                  />
                )}
                {(() => {
                  const lastLeg = routePreviewItin.legs[routePreviewItin.legs.length - 1];
                  const lastPoint = lastLeg?.path?.[lastLeg.path.length - 1];
                  return lastPoint ? (
                    <Marker
                      coordinate={{ latitude: lastPoint.lat, longitude: lastPoint.lon }}
                      title="End"
                      pinColor="#EF4444"
                    />
                  ) : null;
                })()}
              </MapView>
            );
          })()}
          <View style={[styles.pickerFooter, { backgroundColor: c.surface }]}>
            <TouchableOpacity
              style={[styles.pickerConfirmBtn, { backgroundColor: c.tint, flex: 1 }]}
              onPress={() => setRoutePreviewItin(null)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Done, close route preview"
            >
              <Text style={styles.pickerConfirmText}>Done</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Map picker modal */}
      <Modal visible={pickerFor !== null} animationType="slide" onRequestClose={() => setPickerFor(null)}>
        <SafeAreaView style={[styles.pickerRoot, { backgroundColor: c.background }]}>
          <View style={styles.pickerHeader}>
            <Text style={[styles.pickerTitle, { color: c.text }]}>
              Tap to set your {pickerFor === 'origin' ? 'starting point' : 'destination'}
            </Text>
          </View>
          <MapView
            style={{ flex: 1 }}
            initialRegion={CAMPUS_REGION}
            onPress={e => setPickerPoint({ lat: e.nativeEvent.coordinate.latitude, lon: e.nativeEvent.coordinate.longitude })}
          >
            <Marker coordinate={{ latitude: pickerPoint.lat, longitude: pickerPoint.lon }} />
          </MapView>
          <View style={[styles.pickerFooter, { backgroundColor: c.surface }]}>
            <TouchableOpacity
              style={styles.pickerCancelBtn}
              onPress={() => setPickerFor(null)}
              activeOpacity={0.7}
              accessibilityRole="button"
            >
              <Text style={{ color: c.textSecondary, fontSize: 15, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerConfirmBtn, { backgroundColor: c.tint }]}
              onPress={confirmMapPicker}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={styles.pickerConfirmText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* iOS date sheet — Android uses the imperative dialog above instead */}
      {Platform.OS === 'ios' && (
        <Modal visible={showDatePicker} animationType="slide" transparent onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={[styles.sheet, { backgroundColor: c.surface }]}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} accessibilityRole="button" hitSlop={8}>
                  <Text style={[styles.sheetCancel, { color: c.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { color: c.text }]} accessibilityRole="header">Choose a date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} accessibilityRole="button" hitSlop={8}>
                  <Text style={[styles.sheetDone, { color: c.tint }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="inline"
                minimumDate={new Date()}
                themeVariant={scheme}
                accentColor={c.tint}
                onChange={(_, date) => date && setSelectedDate(date)}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* iOS time sheet — Android uses the imperative dialog above instead */}
      {Platform.OS === 'ios' && (
        <Modal visible={showIOSTimeSheet} animationType="slide" transparent onRequestClose={() => setShowIOSTimeSheet(false)}>
          <View style={styles.sheetBackdrop}>
            <View style={[styles.sheet, { backgroundColor: c.surface }]}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShowIOSTimeSheet(false)} accessibilityRole="button" hitSlop={8}>
                  <Text style={[styles.sheetCancel, { color: c.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.sheetTitle, { color: c.text }]} accessibilityRole="header">
                  {activeTimeField === 'depart' ? 'Leave after' : 'Arrive by'}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => {
                    const value = (activeTimeField === 'depart' ? departTime : arriveTime) ?? new Date();
                    if (activeTimeField === 'depart') setDepartTime(value);
                    else setArriveTime(value);
                    setShowIOSTimeSheet(false);
                  }}
                >
                  <Text style={[styles.sheetDone, { color: c.tint }]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={(activeTimeField === 'depart' ? departTime : arriveTime) ?? new Date()}
                mode="time"
                display="spinner"
                themeVariant={scheme}
                onChange={(_, date) => {
                  if (!date) return;
                  if (activeTimeField === 'depart') setDepartTime(date);
                  else setArriveTime(date);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 40 },
  pageTitle: { fontSize: 32, fontWeight: '700', marginTop: 16, marginBottom: 14 },

  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 18,
  },
  disclaimerText: { flex: 1, fontSize: 11, lineHeight: 15 },

  sectionLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, marginBottom: 8, marginLeft: 4 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 8,
    marginRight: 4,
  },
  swapBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  swapBtnText: { fontSize: 12, fontWeight: '600' },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  locationLabel: { fontSize: 15, fontWeight: '600', marginBottom: 10 },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  resultsList: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
    overflow: 'hidden',
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  resultsDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 4 },
  resultName: { fontSize: 14, fontWeight: '600' },
  resultSub: { fontSize: 11, marginTop: 1 },

  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  choiceBtnText: { fontSize: 13, fontWeight: '600' },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateRowText: { fontSize: 15, fontWeight: '700' },
  dateRowSub: { fontSize: 13, flex: 1 },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timingHint: { fontSize: 12, lineHeight: 16, marginBottom: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  timeRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeChipText: { fontSize: 14, fontWeight: '600' },
  clearTimeBtn: { padding: 2 },

  findBtn: { marginTop: 20, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  findBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  findBtnHint: { fontSize: 12, textAlign: 'center', marginTop: 8 },

  results: { marginTop: 24 },
  noResultCard: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, alignItems: 'flex-start' },
  noResultText: { flex: 1, fontSize: 13, lineHeight: 18 },

  itinCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12 },
  itinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  itinTotal: { fontSize: 18, fontWeight: '700' },
  itinTimes: { fontSize: 13 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  legText: { flex: 1, fontSize: 13 },
  legMinutes: { fontSize: 12 },
  startBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 8,
  },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  pickerRoot: { flex: 1 },
  pickerHeader: { paddingHorizontal: 20, paddingVertical: 14 },
  pickerTitle: { fontSize: 16, fontWeight: '600' },
  previewSubtitle: { fontSize: 13, marginTop: 4 },
  pickerFooter: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 24 },
  pickerCancelBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pickerConfirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  pickerConfirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24 },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sheetCancel: { fontSize: 15 },
  sheetTitle: { fontSize: 15, fontWeight: '700' },
  sheetDone: { fontSize: 15, fontWeight: '700' },
});