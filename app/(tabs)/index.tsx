import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { AnimatedRegion, Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Colors, DARK_MAP_STYLE } from '@/constants/theme';
import { ALL_ROUTES } from '@/constants/routes';
import { useFavorites } from '@/context/favorites-context';
import { useTrip } from '@/context/trip-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import { cachedJsonFetch } from '@/lib/local-cache';
import routePatterns from '../../routes_patterns.json';

// ── helpers ───────────────────────────────────────────────────────────────────

function dimColor(hex: string): string {
  const h = hex.replace('#', '').replace(/^(\w{3})$/, '$1$1').slice(0, 6);
  return '#' + h + '55';
}

function passengerColor(pct: number): string {
  const t = Math.min(Math.max(pct, 0), 1);
  if (t <= 0.5) {
    const s = t * 2;
    return `rgb(${Math.round(34 + 200 * s)},${Math.round(197 - 18 * s)},${Math.round(94 - 86 * s)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${Math.round(234 + 5 * s)},${Math.round(179 - 111 * s)},${Math.round(8 + 60 * s)})`;
}

function ptSegDist(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

// ~55 m in degrees at TAMU latitude. Returns true if the bus is off its planned path.
function isOffRoute(lat: number, lon: number, coords: { latitude: number; longitude: number }[]): boolean {
  if (coords.length < 2) return false;
  const THRESH = 0.0005;
  for (let i = 0; i < coords.length - 1; i++) {
    if (ptSegDist(lat, lon, coords[i].latitude, coords[i].longitude, coords[i + 1].latitude, coords[i + 1].longitude) < THRESH) {
      return false;
    }
  }
  return true;
}

// Local calendar date, not toISOString() (which is UTC and rolls over to the
// wrong day depending on time-of-day/timezone offset).
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatTime(raw: string): string {
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    const parts = raw.split(':');
    let h = parseInt(parts[0]);
    const m = parts[1] ?? '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return raw;
  }
}

// Returns minutes until departure for an estimated time. Returns null if the
// time is in the past or not a valid date.
function minutesUntil(raw: string): number | null {
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    const mins = Math.round((d.getTime() - Date.now()) / 60000);
    return mins >= 0 ? mins : null;
  } catch {
    return null;
  }
}

// Bus IDs from the API are like "B2002" — strip the leading "B" for display
// ("Bus 2002" reads better than "Bus B2002").
function busDisplayName(name: string): string {
  return name.replace(/^B(?=\d)/, '');
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// Upstream interruption/amenity shapes aren't pinned down yet — fall back
// through the common field names rather than assuming one.
function interruptionText(item: any): string {
  if (typeof item === 'string') return item;
  return item?.message ?? item?.description ?? item?.text ?? item?.title ?? item?.headerText ?? 'Service interruption';
}

function amenityLabel(item: any): string {
  if (typeof item === 'string') return item;
  return item?.name ?? item?.amenityType ?? item?.type ?? item?.description ?? 'Amenity';
}

// Maps AggieSpirit's amenity iconName to a MaterialIcons glyph we already ship.
function amenityIcon(iconName?: string): React.ComponentProps<typeof MaterialIcons>['name'] {
  switch (iconName) {
    case 'snowflake': return 'ac-unit';
    case 'wheelchair': return 'accessible';
    case 'home-alt': return 'home';
    default: return 'info';
  }
}

// ── types ─────────────────────────────────────────────────────────────────────

type Stop = {
  code: string;
  name: string;
  routes: string[];
  dirKeys: Record<string, string[]>; // route → [direction_key UUID, ...] (or synthetic pattern_N if the data lacks one)
  coordinate: { latitude: number; longitude: number };
  isTemporary: boolean; // stop_type === 1 (e.g. "T0410") - a temporary, not regularly-numbered stop
  // route -> is this stop a timepoint FOR THAT ROUTE — a shared physical stop can be a
  // timepoint for some routes and not others (paths.py's TIMEPOINT_ROUTE_EXCLUSIONS), so
  // this can't collapse to one boolean per stop; the effective value depends on which
  // route(s) are currently selected (see isStopTimepointForSelection).
  timepointRoutes: Record<string, boolean>;
};

type RouteInfo = {
  name: string;
  color: string;
  directions: { key: string; name: string }[];
};

type DepartureTime = {
  time: string;
  isEstimated: boolean;
  isCancelled: boolean;
  isOffRoute: boolean;
};

type TimeEntry = {
  routeShortName: string;
  routeName: string;
  direction: string;
  departureTimes: DepartureTime[];
  isTemporaryStopOnly: boolean;
  isClosedRegularStop: boolean;
  serviceInterruptions: any[];
};

type StopTimesPayload = {
  entries: TimeEntry[];
  amenities: any[];
};

// ── component ─────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { isFavorite } = useFavorites();
  const { consumePendingRoutes } = useTrip();

  const [buses, setBuses] = useState<any[]>([]);
  // One AnimatedRegion per bus (keyed by name), reused across polls so a
  // position update glides there instead of snapping — created lazily during
  // render (so it exists from the very first frame a bus appears, before the
  // animate-on-update effect below has even run) and shared read-only by the
  // bus icon, its heading arrow, and its callout, so all three move in sync.
  const busRegionsRef = useRef<Map<string, InstanceType<typeof AnimatedRegion>>>(new Map()).current;
  const getBusRegion = useCallback((bus: any) => {
    let region = busRegionsRef.get(bus.name);
    if (!region) {
      region = new AnimatedRegion({ latitude: bus.lat, longitude: bus.lon, latitudeDelta: 0, longitudeDelta: 0 });
      busRegionsRef.set(bus.name, region);
    }
    return region;
  }, [busRegionsRef]);
  const [routeLines, setRouteLines] = useState<Record<string, Record<string, { latitude: number; longitude: number }[]>>>({});
  const [stops, setStops] = useState<Stop[]>([]);
  const [routeInfo, setRouteInfo] = useState<Record<string, RouteInfo>>({});
  // Route short names with an active service disruption per /news (construction
  // reroutes, closures, etc) — shown as a warning badge in the route picker.
  const [disruptedRoutes, setDisruptedRoutes] = useState<Set<string>>(new Set());

  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  // route -> selected direction_key (UUID, or synthetic pattern_N fallback)
  const [routeDirections, setRouteDirections] = useState<Record<string, string>>({});
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [stopTimes, setStopTimes] = useState<TimeEntry[]>([]);
  const [stopTimesLoading, setStopTimesLoading] = useState(false);
  const [showAllStopRoutes, setShowAllStopRoutes] = useState(false);
  // null = today real-time; a YYYY-MM-DD string = browsing that day's schedule
  const [stopDate, setStopDate] = useState<string | null>(null);
  const [stopSchedule, setStopSchedule] = useState<TimeEntry[]>([]);
  const [stopScheduleLoading, setStopScheduleLoading] = useState(false);
  const [stopAmenities, setStopAmenities] = useState<any[]>([]);
  const [expandedEntry, setExpandedEntry] = useState<TimeEntry | null>(null);
  const [expandedInterruption, setExpandedInterruption] = useState<any | null>(null);
  const [expandedEntryDate, setExpandedEntryDate] = useState<string | null>(null);
  // Stops we've learned are closed for at least one route, discovered lazily
  // when their schedule is fetched (no proactive bulk lookup for every pin).
  const [closedStopCodes, setClosedStopCodes] = useState<Set<string>>(new Set());
  const stopPanelAnim = useRef(new Animated.Value(0)).current;

  // Ticks every second so the hold countdown below is smooth, independent of
  // the 10s /buses poll interval (which still drives whether a hold exists at all).
  const [holdTick, setHoldTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setHoldTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── bus callout ──────────────────────────────────────────────────────────
  // react-native-maps' native <Callout> dismisses itself on basically any prop
  // update to its parent Marker (coordinate, even unrelated re-renders) — tried
  // freezing the callout's content, then also its marker's coordinate, and it
  // still closed within a poll or two. A JS-side overlay positioned via
  // pointForCoordinate was tried next, but it only repositions on
  // onRegionChangeComplete, so it visibly lagged behind/detached during a
  // drag gesture. The fix: render it as a second plain Marker (no Callout)
  // sharing the bus's coordinate — a real native annotation pans/zooms in
  // perfect lockstep with the map (same as the bus icon and heading-arrow
  // markers already do), and isn't a Callout, so nothing auto-dismisses it.
  const [selectedBusName, setSelectedBusName] = useState<string | null>(null);
  // Last-known full data for the selected bus — keeps the callout showing
  // something sensible for a poll or two if the bus briefly drops out of
  // /buses (GPS gap) instead of the content disappearing out from under the user.
  const [busSnapshot, setBusSnapshot] = useState<any | null>(null);

  // ── route helpers ──────────────────────────────────────────────────────────

  const toggleRoute = (route: string) => {
    if (route === 'all') { setSelectedRoutes(['all']); return; }
    let next = selectedRoutes.filter(r => r !== 'all');
    next = next.includes(route) ? next.filter(r => r !== route) : [...next, route];
    setSelectedRoutes(next.length === 0 ? ['all'] : next);
  };

  // Resolution order: explicit user pick > live /routes first direction (if it
  // matches an actual polyline) > first polyline this route actually has.
  // Returns true when the live /routes API direction UUIDs don't match any of
  // the bundled polyline keys — i.e. routes_patterns.json is from a previous
  // semester. When stale, direction-based filtering is fully disabled so the
  // app never shows the wrong direction at full opacity.
  const isStaleRoute = (route: string): boolean => {
    const apiDirs = routeInfo[route]?.directions ?? [];
    if (apiDirs.length === 0) return false; // routeInfo not yet loaded
    const pKeys = new Set(Object.keys(routeLines[route] ?? {}));
    if (pKeys.size === 0) return false;     // polylines not yet loaded
    return !apiDirs.some(d => pKeys.has(d.key));
  };

  // Always returns a polyline key (from routes_patterns.json).
  // routeDirections stores API keys set by the direction buttons. When fresh
  // (UUIDs match), an API key == a polyline key, so the direct lookup works.
  // When stale (no match), we fall back to the first polyline key as the default.
  const getDir = (route: string): string => {
    const pick = routeDirections[route];
    if (pick && routeLines[route]?.[pick]) return pick; // fresh: API key = polyline key
    return Object.keys(routeLines[route] ?? {})[0] ?? 'default';
  };

  // Stores the raw API direction key from the direction button. Button
  // highlighting and bus comparisons both use API keys, so no mapping needed.
  const setRouteDir = (route: string, apiKey: string) =>
    setRouteDirections(prev => ({ ...prev, [route]: apiKey }));

  // A shared stop can be a timepoint for one route and not another (see
  // paths.py's TIMEPOINT_ROUTE_EXCLUSIONS), so this depends on which route(s)
  // are actually in view rather than being a fixed property of the stop.
  const isStopTimepointForSelection = (stop: Stop): boolean => {
    if (selectedRoutes.includes('all')) {
      return stop.routes.some(r => stop.timepointRoutes[r]);
    }
    return stop.routes.some(r => selectedRoutes.includes(r) && stop.timepointRoutes[r]);
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const routeColors = useMemo(() => {
    const m: Record<string, string> = {};
    Object.entries(routeInfo).forEach(([r, info]) => { m[r] = info.color; });
    return m;
  }, [routeInfo]);

  const filteredBuses = useMemo(() => {
    const list = selectedRoutes.includes('all') ? buses : buses.filter(b => selectedRoutes.includes(b.route));
    // A bus can appear in multiple routes' API responses (extra trips); deduplicate by name.
    const seen = new Set<string>();
    return list.filter(b => { if (seen.has(b.name)) return false; seen.add(b.name); return true; });
  }, [buses, selectedRoutes]);

  const filteredStops = useMemo(() => {
    if (selectedRoutes.includes('all')) return stops;
    return stops.filter(stop =>
      stop.routes.some(r => {
        if (!selectedRoutes.includes(r)) return false;
        const keys = stop.dirKeys[r] ?? [];
        if (keys.length === 0) return true; // no direction data — always show
        if (isStaleRoute(r)) return true;   // can't trust direction mapping — show all
        return keys.includes(getDir(r));
      })
    );
  }, [stops, selectedRoutes, routeDirections, routeInfo, routeLines]);

  const routeLabel = selectedRoutes.includes('all')
    ? 'All Routes'
    : selectedRoutes.length === 0
    ? 'Select Routes'
    : selectedRoutes.length === 1
    ? `Route ${selectedRoutes[0]}`
    : `${selectedRoutes.length} routes`;

  // Favorited routes (set in Settings) float to the top; stable sort keeps
  // everything else in its original order.
  const sortedRoutes = useMemo(() => {
    return [...ALL_ROUTES].sort((a, b) => {
      const aFav = isFavorite(a) ? 0 : 1;
      const bFav = isFavorite(b) ? 0 : 1;
      return aFav - bFav;
    });
  }, [isFavorite]);

  // Active times list: real-time when stopDate is null, schedule otherwise
  const visibleStopTimes = useMemo(() => {
    const raw = stopDate ? stopSchedule : stopTimes;
    const todayStr = toDateStr(new Date());

    // When auto-falling back to today's schedule (no live times), filter out
    // times that have already passed so only upcoming departures are shown.
    const filterPast = stopDate === todayStr;
    const now = Date.now();
    const processed = filterPast
      ? raw.map(entry => ({
          ...entry,
          departureTimes: entry.departureTimes.filter(t => {
            try { return new Date(t.time).getTime() >= now; }
            catch { return true; }
          }),
        }))
      : raw;

    const filtered = (showAllStopRoutes || selectedRoutes.includes('all'))
      ? processed
      : processed.filter(entry => {
          const rn = entry.routeShortName ?? '';
          return selectedRoutes.some(r => rn.startsWith(r) || r.startsWith(rn));
        });
    // Routes with no departures that day sink to the bottom instead of
    // cluttering the top with empty rows. Array.sort is stable, so routes
    // within each group (has times / no times) keep their original order.
    return [...filtered].sort((a, b) => {
      const aEmpty = a.departureTimes.length === 0 ? 1 : 0;
      const bEmpty = b.departureTimes.length === 0 ? 1 : 0;
      return aEmpty - bEmpty;
    });
  }, [stopTimes, stopSchedule, stopDate, showAllStopRoutes, selectedRoutes]);

  // De-duplicated service interruptions across whichever times list is active
  const activeInterruptions = useMemo(() => {
    const list = stopDate ? stopSchedule : stopTimes;
    const seen = new Set<string>();
    const out: any[] = [];
    for (const entry of list) {
      for (const item of entry.serviceInterruptions ?? []) {
        const key = JSON.stringify(item);
        if (!seen.has(key)) { seen.add(key); out.push(item); }
      }
    }
    return out;
  }, [stopTimes, stopSchedule, stopDate]);

  // Picks up a route hand-off from Plan a Ride's "Start" button. Tab screens stay
  // mounted when you switch away, so a normal useEffect[] would only fire once on
  // first visit — useFocusEffect re-checks every time this tab regains focus.
  useFocusEffect(
    useCallback(() => {
      const routes = consumePendingRoutes();
      if (routes && routes.length > 0) {
        setSelectedRoutes(routes);
      }
    }, [consumePendingRoutes]),
  );

  // ── data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    const lines: Record<string, Record<string, { latitude: number; longitude: number }[]>> = {};
    const stopMap = new Map<string, Stop>();

    Object.entries(routePatterns).forEach(([route, routeData]) => {
      const { patterns } = routeData as any;
      const routeDirs: Record<string, { latitude: number; longitude: number }[]> = {};

      // Key by the real direction_key UUID (matches /routes live data) rather than
      // guessing "inbound"/"outbound" from the pattern name — those labels are just
      // an artifact of the order paths.py happened to receive patterns in and don't
      // reflect the route's actual direction names (e.g. route 03 is "to White Creek"
      // / "to MSC", not inbound/outbound at all).
      Object.entries(patterns as Record<string, any>).forEach(([, pattern], idx) => {
        if (!pattern.coordinates) return;
        const dirKey: string = pattern.direction_key || `pattern_${idx}`;

        routeDirs[dirKey] = (pattern.coordinates as any[]).map(({ lat, lng }) => ({
          latitude: lat,
          longitude: lng,
        }));

        (pattern.stops as any[] | undefined)?.forEach((stop) => {
          if (!stop.lat || !stop.lng) return;
          const isTemporary = stop.stop_type === 1;
          const isTimepoint = !!stop.is_timepoint;
          const existing = stopMap.get(stop.code);
          if (existing) {
            if (!existing.routes.includes(route)) existing.routes.push(route);
            const prev = existing.dirKeys[route] ?? [];
            if (!prev.includes(dirKey)) existing.dirKeys[route] = [...prev, dirKey];
            if (isTemporary) existing.isTemporary = true;
            existing.timepointRoutes[route] = isTimepoint;
          } else {
            stopMap.set(stop.code, {
              code: stop.code,
              name: stop.name,
              routes: [route],
              dirKeys: { [route]: [dirKey] },
              coordinate: { latitude: stop.lat, longitude: stop.lng },
              isTemporary,
              timepointRoutes: { [route]: isTimepoint },
            });
          }
        });
      });

      lines[route] = routeDirs;
    });

    setRouteLines(lines);
    setStops(Array.from(stopMap.values()));
  }, []);

  useEffect(() => {
    // Route names/colors/directions barely ever change mid-semester — serve
    // the cached copy outright for up to a day, and fall back to it
    // regardless of age if the server's unreachable.
    cachedJsonFetch<any[]>(`${API_BASE}/routes`, 'routes', { maxAgeMs: 24 * 60 * 60 * 1000 })
      .then((data: any[]) => {
        const info: Record<string, RouteInfo> = {};
        data.forEach(r => {
          info[r.shortName] = {
            name: r.name,
            color: r.color ?? '#500000',
            directions: r.directions ?? [],
          };
        });
        setRouteInfo(info);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Always try a fresh fetch (disruptions are time-sensitive), but fall
    // back to the last-seen list if the server's down rather than silently
    // dropping every warning badge in the route picker.
    cachedJsonFetch<any[]>(`${API_BASE}/news`, 'news')
      .then((data: any[]) => {
        const affected = new Set<string>();
        (Array.isArray(data) ? data : []).forEach(item => {
          if (item.affectsAllRoutes) {
            ALL_ROUTES.forEach(r => affected.add(r));
          } else {
            (item.routes ?? []).forEach((r: string) => affected.add(r));
          }
        });
        setDisruptedRoutes(affected);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchBuses() {
      try {
        const res = await fetch(`${API_BASE}/buses`);
        const data: any[] = await res.json();
        setBuses(data);
      } catch (e) {
        console.warn('Bus fetch failed:', e);
      }
    }
    fetchBuses();
    const id = setInterval(fetchBuses, 10000);
    return () => clearInterval(id);
  }, []);

  // Glide each bus's marker(s) to its new position over each poll rather than
  // snapping there instantly. getBusRegion (called during render, below)
  // already created/updated each region's CURRENT value for brand-new buses,
  // so by the time this runs the region exists — this only needs to animate
  // existing ones to wherever the bus has moved since the last poll.
  useEffect(() => {
    buses.forEach(bus => {
      const region = busRegionsRef.get(bus.name);
      if (region) {
        region.timing({ latitude: bus.lat, longitude: bus.lon, duration: 900 } as any).start();
      }
    });
  }, [buses, busRegionsRef]);

  // ── bus callout ────────────────────────────────────────────────────────────

  const closeBusCallout = useCallback(() => {
    setSelectedBusName(null);
    setBusSnapshot(null);
  }, []);

  // ── stop panel ─────────────────────────────────────────────────────────────

  const fetchStopSchedule = useCallback(async (stop: Stop, date: string) => {
    setStopDate(date);
    setStopSchedule([]);
    setStopScheduleLoading(true);
    try {
      // A given calendar date's published schedule doesn't change once
      // fetched, so a stale cache fallback here is never actually wrong —
      // just keeps a previously-viewed day's schedule visible if the
      // server's unreachable on a repeat visit.
      const data = await cachedJsonFetch<StopTimesPayload>(
        `${API_BASE}/stop/${stop.code}/schedule?date=${date}`,
        `stop-schedule:${stop.code}:${date}`,
      );
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      setStopSchedule(entries);
      setStopAmenities(Array.isArray(data?.amenities) ? data.amenities : []);
      if (entries.some(e => e.isClosedRegularStop)) {
        setClosedStopCodes(prev => new Set(prev).add(stop.code));
      }
    } catch (e) {
      console.warn('Stop schedule fetch failed:', e);
      setStopSchedule([]);
    } finally {
      setStopScheduleLoading(false);
    }
  }, []);

  const openStopPanel = useCallback(async (stop: Stop) => {
    if (selectedBusName) closeBusCallout();
    setSelectedStop(stop);
    setStopTimes([]);
    setStopDate(null);
    setStopSchedule([]);
    setStopAmenities([]);
    setShowAllStopRoutes(false);
    setStopTimesLoading(true);
    Animated.spring(stopPanelAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();

    const relevantRoutes = selectedRoutes.includes('all')
      ? stop.routes
      : stop.routes.filter(r => selectedRoutes.includes(r));

    // Only the direction(s) that actually serve this stop — querying every
    // direction of the route would include ones whose path never comes here
    // (e.g. the inbound leg at a stop only the outbound leg passes).
    const dks = relevantRoutes.flatMap(r => stop.dirKeys[r] ?? []);

    try {
      const res = await fetch(`${API_BASE}/stop/${stop.code}/times?dk=${encodeURIComponent(dks.join(','))}`);
      const data: StopTimesPayload = await res.json();
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      setStopTimes(entries);
      setStopAmenities(Array.isArray(data?.amenities) ? data.amenities : []);
      if (entries.some(e => e.isClosedRegularStop)) {
        setClosedStopCodes(prev => new Set(prev).add(stop.code));
      }
      // If live times returned nothing (session stale, direction keys out of
      // date, or no buses running right now), fall back to today's full
      // schedule automatically so the panel isn't just empty.
      if (entries.length === 0) {
        fetchStopSchedule(stop, toDateStr(new Date()));
      }
    } catch (e) {
      console.warn('Stop times fetch failed:', e);
      setStopTimes([]);
      fetchStopSchedule(stop, toDateStr(new Date()));
    } finally {
      setStopTimesLoading(false);
    }
  }, [stopPanelAnim, selectedRoutes, selectedBusName, closeBusCallout, fetchStopSchedule]);

  // Tapping a route row to "see all times for the day": when browsing a
  // specific date (stopDate set), the row already came from the full-day
  // schedule fetch, so it's complete. But the default live view's rows come
  // from GetNextDepartTimes, which AggieSpirit only ever returns the next
  // ~3 upcoming departures for — not the whole day. So for that case, fetch
  // today's actual full schedule and swap in the matching route+direction's
  // complete departure list instead of just re-showing those same 3.
  const openExpandedEntry = useCallback(async (item: TimeEntry) => {
    setExpandedEntry(item);
    // Tracked separately from stopDate, which can change/clear while this
    // modal is still open — "is this time in the past" only makes sense
    // relative to whichever date this specific entry's times actually belong to.
    setExpandedEntryDate(stopDate ?? toDateStr(new Date()));
    if (stopDate || !selectedStop) return;
    try {
      const today = toDateStr(new Date());
      const data = await cachedJsonFetch<StopTimesPayload>(
        `${API_BASE}/stop/${selectedStop.code}/schedule?date=${today}`,
        `stop-schedule:${selectedStop.code}:${today}`,
      );
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      const full = entries.find(e => e.routeShortName === item.routeShortName && e.direction === item.direction);
      if (full) setExpandedEntry(full);
    } catch (e) {
      console.warn('Full-day schedule fetch failed:', e);
    }
  }, [stopDate, selectedStop]);

  const closeExpandedEntry = useCallback(() => {
    setExpandedEntry(null);
    setExpandedEntryDate(null);
  }, []);

  const closeStopPanel = useCallback(() => {
    Animated.spring(stopPanelAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start(() =>
      setSelectedStop(null)
    );
  }, [stopPanelAnim]);

  const openBusCallout = useCallback((bus: any) => {
    // Only one panel at a time — opening a bus while the stop sheet is open
    // would otherwise show both at once.
    if (selectedStop) closeStopPanel();
    setSelectedBusName(bus.name);
    setBusSnapshot(bus);
  }, [selectedStop, closeStopPanel]);

  // ── theme ──────────────────────────────────────────────────────────────────

  const panelBg = scheme === 'dark' ? 'rgba(18,18,20,0.97)' : 'rgba(255,255,255,0.97)';
  const panelBorder = scheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const sheetBg = scheme === 'dark' ? '#1C1C1E' : '#FFFFFF';

  // ── date chips ─────────────────────────────────────────────────────────────

  const dateChips = useMemo(() => {
    const today = new Date();
    return [1, 2, 3, 4, 5].map(n => {
      const d = addDays(today, n);
      return {
        dateStr: toDateStr(d),
        label: n === 1
          ? 'Tomorrow'
          : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      };
    });
  }, []);

  // Live data for the selected bus, falling back to the last-known snapshot
  // for a poll or two if it briefly drops out of /buses.
  const selectedBus = useMemo(() => {
    if (!selectedBusName) return null;
    const live = buses.find(b => b.name === selectedBusName);
    if (live) return live;
    return busSnapshot?.name === selectedBusName ? busSnapshot : null;
  }, [buses, selectedBusName, busSnapshot]);

  useEffect(() => {
    if (selectedBusName) {
      const live = buses.find(b => b.name === selectedBusName);
      if (live) setBusSnapshot(live);
    }
  }, [buses, selectedBusName]);

  const busSheetStats = useMemo(() => {
    if (!selectedBus) return null;
    const capacity = selectedBus.capacity > 0 ? selectedBus.capacity : 60;
    const pct = Math.min(Math.max(0, selectedBus.passengers) / capacity, 1);
    const routeCoords = routeLines[selectedBus.route]?.[selectedBus.directionKey]
      ?? Object.values(routeLines[selectedBus.route] ?? {})[0] ?? [];
    const offRoute = routeCoords.length > 0 && isOffRoute(selectedBus.lat, selectedBus.lon, routeCoords);
    return {
      pct,
      barColor: passengerColor(pct),
      dispPax: Math.max(0, selectedBus.passengers),
      offRoute,
    };
  }, [selectedBus, routeLines]);

  // ── timepoint hold countdown ───────────────────────────────────────────────

  // A bus is "holding" at the selected stop if /buses says so for it — see
  // hold_times.py on the server, which only flags this when a bus is within
  // ~40m of a timepoint stop AND is early relative to its scheduled departure.
  const stopHoldBus = useMemo(() => {
    if (!selectedStop) return null;
    return buses.find(b => b.hold && b.hold.stopCode === selectedStop.code) ?? null;
  }, [buses, selectedStop]);

  // Reference point for the depleting bar fill: "how much hold time was left
  // when we first saw this hold" — recomputed only when the hold's target
  // (scheduledDepartTime) changes, not on every tick.
  const holdBaselineRef = useRef<{ key: string; totalSeconds: number } | null>(null);
  if (stopHoldBus?.hold) {
    const key = `${stopHoldBus.name}-${stopHoldBus.hold.scheduledDepartTime}`;
    if (holdBaselineRef.current?.key !== key) {
      const totalSeconds = Math.max(1, (new Date(stopHoldBus.hold.scheduledDepartTime).getTime() - Date.now()) / 1000);
      holdBaselineRef.current = { key, totalSeconds };
    }
  } else {
    holdBaselineRef.current = null;
  }

  const holdSecondsRemaining = stopHoldBus?.hold
    ? Math.max(0, (new Date(stopHoldBus.hold.scheduledDepartTime).getTime() - holdTick) / 1000)
    : null;
  const holdFillPct = holdBaselineRef.current && holdSecondsRemaining != null
    ? Math.max(0, Math.min(100, (holdSecondsRemaining / holdBaselineRef.current.totalSeconds) * 100))
    : 0;
  const holdLeaveClock = stopHoldBus?.hold
    ? new Date(stopHoldBus.hold.scheduledDepartTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle={scheme}
        customMapStyle={scheme === 'dark' ? DARK_MAP_STYLE : []}
        initialRegion={{ latitude: 30.615, longitude: -96.34, latitudeDelta: 0.022, longitudeDelta: 0.022 }}
        onPress={() => {
          if (selectedBusName) closeBusCallout();
        }}
      >
        {/* Always render ALL polylines; use transparent color for inactive routes
            to prevent the native layer from retaining ghost polylines. */}
        {Object.entries(routeLines).flatMap(([route, dirs]) => {
          const isActive = selectedRoutes.includes('all') || selectedRoutes.includes(route);
          const color = routeColors[route] ?? '#888888';
          const stale = isStaleRoute(route);
          // What the user has explicitly picked (API key), or fall back to first polyline key.
          const userPick = routeDirections[route];
          const effectiveDir = (userPick && routeLines[route]?.[userPick]) ? userPick
            : Object.keys(dirs)[0];
          const polylineCount = Object.keys(dirs).length;

          return Object.entries(dirs).map(([dirKey, path]) => {
            // When stale (routes_patterns.json UUIDs don't match live API), we
            // can't reliably determine which polyline is which direction, so
            // show everything at full color. When fresh, only the selected
            // direction is full-color; the other is dimmed.
            const isSelectedDir = polylineCount === 1 || stale || dirKey === effectiveDir;
            let strokeColor: string;
            if (!isActive) {
              strokeColor = 'rgba(0,0,0,0)';
            } else if (isSelectedDir) {
              strokeColor = color;
            } else {
              strokeColor = dimColor(color);
            }
            // Stable key: prevents ghost polylines from unmount/remount cycles.
            // strokeWidth=0 for inactive reliably hides without unmounting.
            return (
              <Polyline
                key={`line-${route}-${dirKey}`}
                coordinates={path}
                strokeColor={strokeColor}
                strokeWidth={isActive && isSelectedDir ? 5 : isActive ? 3.5 : 0}
                zIndex={isActive && isSelectedDir ? 2 : isActive ? 1 : 0}
              />
            );
          });
        })}

        {/* Bus markers — rendered after stop markers below so buses always draw on
            top when a bus and a stop coincide, reinforced by the explicit zIndex. */}
        {filteredBuses.flatMap(bus => {
          const color = routeColors[bus.route] ?? '#CC2936';
          // Dim buses on the non-selected direction. routeDirections stores API
          // keys; bus.directionKey is also an API key — direct comparison works.
          // When routes_patterns.json is stale we can't trust the direction
          // mapping, so isStaleRoute disables dimming and shows all at full opacity.
          const userPick = routeDirections[bus.route];
          const isBusSelectedDir =
            selectedRoutes.includes('all') ||
            isStaleRoute(bus.route) ||
            userPick == null ||
            bus.directionKey == null ||
            bus.directionKey === userPick;
          const busFillColor = isBusSelectedDir ? color : dimColor(color);
          const hasHeading = typeof bus.heading === 'number' && !isNaN(bus.heading);
          // Shared by this bus's icon, heading arrow, and (if open) its callout
          // below, so a position update glides all of them together instead of
          // each independently snapping to the new point.
          const region = getBusRegion(bus);

          const markers = [
            <Marker.Animated
              key={bus.name}
              coordinate={region as any}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              zIndex={3}
              onPress={() => openBusCallout(bus)}
            >
              <View style={styles.busMarkerWrap}>
                <View style={[styles.busCircleFill, { backgroundColor: busFillColor }]} />
                <View style={styles.busCircleBorder} />
                <Image source={require('../../assets/images/bus.png')} style={styles.busIcon} />
              </View>
            </Marker.Animated>,
          ];

          // Separate, callout-free marker for the heading arrow. react-native-maps only
          // honors the native `rotation` prop for markers using the `image` prop, not
          // custom children — with children it silently no-ops, which is why every
          // arrow was pointing the same default direction. A CSS transform works with
          // children, but needs tracksViewChanges on (this marker has no callout to
          // disrupt, so that's free here, unlike the bus marker above).
          // tappable={false} + a lower zIndex stop this marker (sharing the bus's exact
          // coordinate) from intercepting taps meant for the bus marker underneath it.
          if (hasHeading) {
            markers.push(
              <Marker.Animated
                key={`${bus.name}-heading`}
                coordinate={region as any}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges
                tappable={false}
                zIndex={1}
              >
                <View style={[styles.headingPivot, { transform: [{ rotate: `${bus.heading}deg` }] }]}>
                  <View style={styles.headingArrow} />
                </View>
              </Marker.Animated>,
            );
          }

          return markers;
        })}

        {/* Stop markers — only shows stops for the selected direction.
            Stops we've learned are closed (after tapping into their schedule)
            get dimmed with a red badge; we can't know this ahead of a tap
            without querying every stop's schedule upfront. */}
        {filteredStops.map(stop => {
          const isClosed = closedStopCodes.has(stop.code);
          const isTimepoint = isStopTimepointForSelection(stop);
          return (
            <Marker
              key={stop.code}
              coordinate={stop.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              zIndex={0}
              onPress={() => openStopPanel(stop)}
            >
              <View>
                <Image
                  source={stop.isTemporary
                    ? require('../../assets/images/temp_stop.png')
                    : isTimepoint
                    ? require('../../assets/images/timepoint.png')
                    : require('../../assets/images/stop.png')}
                  style={[
                    stop.isTemporary
                      ? styles.tempStopIcon
                      : isTimepoint
                      ? styles.timepointIcon
                      : styles.stopIcon,
                    isClosed && styles.closedStopIcon,
                  ]}
                />
                {isClosed && <View style={styles.closedStopBadge} />}
              </View>
            </Marker>
          );
        })}

        {/* Bus callout — a second plain Marker (not <Callout>) sharing the
            selected bus's coordinate, anchored so its bottom edge (the pointer
            tip) sits right above the bus icon. Being a real marker, it pans/
            zooms with the map exactly like every other marker here; being a
            Marker and not a Callout, nothing auto-dismisses it on updates.
            tracksViewChanges is on since its content (speed/passengers/hold)
            changes live — acceptable for the one currently-selected bus. */}
        {selectedBusName && selectedBus && busSheetStats && (
          <Marker.Animated
            key={`${selectedBus.name}-callout`}
            coordinate={(busRegionsRef.get(selectedBus.name) ?? { latitude: selectedBus.lat, longitude: selectedBus.lon }) as any}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges
            tappable={false}
            zIndex={4}
          >
            <View style={styles.calloutMarkerWrap}>
              <View style={[styles.callout, { backgroundColor: sheetBg, borderColor: c.border }]}>
                <View style={styles.pillRow}>
                  <View style={[styles.pill, { backgroundColor: routeColors[selectedBus.route] ?? '#CC2936' }]}>
                    <Text style={styles.pillText}>Route {selectedBus.route}</Text>
                  </View>
                  {!!selectedBus.direction && (
                    <View style={[styles.pill, { backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }]}>
                      <Text style={[styles.pillText, { color: c.text }]}>{selectedBus.direction}</Text>
                    </View>
                  )}
                  {busSheetStats.offRoute && (
                    <View style={[styles.pill, { backgroundColor: '#F97316' }]}>
                      <Text style={styles.pillText}>Off Route</Text>
                    </View>
                  )}
                  {selectedBus.isExtraTrip && (
                    <View style={[styles.pill, { backgroundColor: '#8B5CF6' }]}>
                      <Text style={styles.pillText}>Extra Trip</Text>
                    </View>
                  )}
                </View>

                <View style={styles.busIdRow}>
                  <Text style={[styles.calloutBusId, { color: c.text }]}>Bus {busDisplayName(selectedBus.name)}</Text>
                  {/* Radio callsign inferred from the driver shift board
                      (server-side, see unit_assignment.py). When the match
                      isn't certain (a "best guess" at server-restart cold
                      start, with no per-bus signal to disambiguate) it's
                      shown with a "?" and muted — still useful, but not
                      presented as fact. */}
                  {!!selectedBus.unit && (
                    <Text style={[styles.calloutUnit, { color: selectedBus.unitConfirmed ? c.textSecondary : c.tint }]}>
                      {selectedBus.unit}{selectedBus.unitConfirmed ? '' : '?'}
                    </Text>
                  )}
                </View>

                {Array.isArray(selectedBus.amenities) && selectedBus.amenities.length > 0 && (
                  <View style={styles.amenityIconRow}>
                    {selectedBus.amenities.map((a: any, i: number) => (
                      <View key={i} style={styles.amenityIconItem}>
                        <MaterialIcons name={amenityIcon(a.iconName)} size={13} color={c.textSecondary} />
                        <Text style={[styles.amenityIconLabel, { color: c.textSecondary }]}>{amenityLabel(a)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.barRow}>
                  <View style={[styles.barBg, { backgroundColor: c.surfaceAlt }]}>
                    <View style={[styles.barFill, { width: `${Math.round(busSheetStats.pct * 100)}%`, backgroundColor: busSheetStats.barColor }]} />
                  </View>
                  <Text style={[styles.barLabel, { color: c.textSecondary }]}>~{busSheetStats.dispPax} pax</Text>
                </View>
              </View>
              <View style={[styles.calloutPointer, { borderTopColor: sheetBg }]} />
            </View>
          </Marker.Animated>
        )}
      </MapView>

      {/* ── Floating panel ────────────────────────────────────────────────── */}
      <View style={[styles.panel, { top: insets.top + 8, backgroundColor: panelBg, borderColor: panelBorder }]}>
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: c.text }]}>TAMU Buses</Text>
          <View style={[styles.badge, { backgroundColor: c.tint + '22' }]}>
            <View style={[styles.badgeDot, { backgroundColor: filteredBuses.length > 0 ? '#22C55E' : c.textSecondary }]} />
            <Text style={[styles.badgeText, { color: c.tint }]}>{filteredBuses.length} active</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.routeSelector, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.routeSelectorText, { color: c.text }]} numberOfLines={1}>{routeLabel}</Text>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Route selector modal ───────────────────────────────────────────── */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownVisible(false)} />
        <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]}>Select Routes</Text>
            <TouchableOpacity onPress={() => setDropdownVisible(false)}>
              <Text style={[styles.sheetDone, { color: c.tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.routeRow, selectedRoutes.includes('all') && { backgroundColor: c.tint + '15' }, { borderBottomColor: c.border }]}
            onPress={() => toggleRoute('all')}
          >
            <View style={[styles.routeTag, { backgroundColor: selectedRoutes.includes('all') ? c.tint : c.surfaceAlt }]}>
              <Text style={[styles.routeTagText, { color: selectedRoutes.includes('all') ? '#fff' : c.textSecondary }]}>ALL</Text>
            </View>
            <Text style={[styles.routeName, { color: c.text }]}>All Routes</Text>
            {selectedRoutes.includes('all') && <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>}
          </TouchableOpacity>

          <FlatList
            data={sortedRoutes}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const selected = selectedRoutes.includes(item);
              const info = (routePatterns as any)[item];
              // Fall back to bundled pattern keys so direction buttons appear
              // immediately even before the /routes API call returns.
              const apiDirs = routeInfo[item]?.directions ?? [];
              const patternKeys = Object.values((info?.patterns ?? {}) as Record<string, any>)
                .map((p: any, i) => ({ key: p.direction_key || `pattern_${i}`, name: '' }));
              const directions = apiDirs.length > 0 ? apiDirs : patternKeys;
              const hasMultipleDirs = directions.length > 1;
              // routeDirections stores API keys (set when user taps a button).
              // Default to the first direction's key when user hasn't picked yet.
              const defaultDir = directions[0]?.key;
              const currentApiDir = routeDirections[item] ?? defaultDir;
              const color = routeColors[item] ?? c.tint;

              return (
                <TouchableOpacity
                  style={[styles.routeRowContainer, selected && { backgroundColor: c.tint + '15' }, { borderBottomColor: c.border }]}
                  onPress={() => toggleRoute(item)}
                >
                  <View style={styles.routeRowTop}>
                    <View style={[styles.routeTag, { backgroundColor: selected ? color : c.surfaceAlt }]}>
                      <Text style={[styles.routeTagText, { color: selected ? '#fff' : c.text }]}>{item}</Text>
                    </View>
                    <Text style={[styles.routeName, { color: c.text }]} numberOfLines={1}>
                      {info?.name ?? `Route ${item}`}
                    </Text>
                    {disruptedRoutes.has(item) && <Text style={styles.disruptionWarning}>⚠</Text>}
                    {isFavorite(item) && <Text style={styles.favoriteStar}>★</Text>}
                    {selected && <Text style={[styles.checkmark, { color }]}>✓</Text>}
                  </View>
                  {selected && hasMultipleDirs && (
                    <View style={styles.dirToggleWrap}>
                      {directions.map(d => (
                        <TouchableOpacity
                          key={d.key}
                          style={[styles.dirChipFull, { backgroundColor: c.surfaceAlt }, d.key === currentApiDir && { backgroundColor: color }]}
                          onPress={e => { e.stopPropagation?.(); setRouteDir(item, d.key); }}
                        >
                          <Text numberOfLines={1} style={[styles.dirChipFullText, { color: d.key === currentApiDir ? '#fff' : c.textSecondary }]}>
                            {d.name || (directions.indexOf(d) === 0 ? 'Inbound' : 'Outbound')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  {selected && disruptedRoutes.has(item) && (
                    <TouchableOpacity
                      style={styles.disruptionButton}
                      onPress={e => {
                        e.stopPropagation?.();
                        setDropdownVisible(false);
                        router.push({ pathname: '/disruptions', params: { route: item } } as any);
                      }}
                    >
                      <Text style={styles.disruptionButtonIcon}>⚠</Text>
                      <Text style={styles.disruptionButtonText}>View Service Disruption</Text>
                      <Text style={styles.disruptionButtonArrow}>›</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── Stop times sheet ───────────────────────────────────────────────── */}
      {selectedStop && (
        <Animated.View
          style={[
            styles.stopSheet,
            { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY: stopPanelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />

          <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={1}>{selectedStop.name}</Text>
              <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>
                Stop {selectedStop.code}
                {' · '}
                {selectedStop.routes.length === 1 ? `Route ${selectedStop.routes[0]}` : `${selectedStop.routes.length} routes`}
              </Text>
              {stopAmenities.length > 0 && (
                <View style={styles.amenityRow}>
                  {stopAmenities.map((a, i) => (
                    <View key={i} style={[styles.amenityChip, { backgroundColor: c.surfaceAlt }]}>
                      <Text style={[styles.amenityChipText, { color: c.textSecondary }]}>{amenityLabel(a)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            <TouchableOpacity onPress={closeStopPanel} style={styles.closeBtn}>
              <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Timepoint hold countdown — bus is early and waiting here for its scheduled leave time */}
          {stopHoldBus && holdSecondsRemaining != null && holdSecondsRemaining > 0 && (
            <View style={styles.holdBanner}>
              <View style={[styles.holdBarFill, { width: `${holdFillPct}%` }]} />
              <View style={styles.holdContent}>
                <MaterialIcons name="pause-circle-filled" size={20} color="#92400E" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.holdTitle}>Bus {busDisplayName(stopHoldBus.name)} is holding here</Text>
                  <Text style={styles.holdSubtitle}>Leaves at {holdLeaveClock}</Text>
                </View>
                <Text style={styles.holdCountdown}>{formatCountdown(holdSecondsRemaining)}</Text>
              </View>
            </View>
          )}

          {/* Service interruption banner — tap to read the full notice */}
          {activeInterruptions.length > 0 && (
            <View style={[styles.interruptionBanner, { marginBottom: 8 }]}>
              {activeInterruptions.map((item, i) => (
                <TouchableOpacity key={i} onPress={() => setExpandedInterruption(item)} activeOpacity={0.7}>
                  <View style={styles.interruptionRow}>
                    <Text style={styles.interruptionText} numberOfLines={2}>⚠ {interruptionText(item)}</Text>
                    <Text style={styles.interruptionChevron}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Route filter toggle — shown when specific routes are selected and times exist */}
          {!selectedRoutes.includes('all') && (stopTimes.length > 0 || stopSchedule.length > 0) && (
            <TouchableOpacity
              style={[styles.filterToggle, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              onPress={() => setShowAllStopRoutes(v => !v)}
            >
              <Text style={[styles.filterToggleText, { color: c.tint }]}>
                {showAllStopRoutes ? 'Show selected routes only' : 'Show all route times'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Times content */}
          {stopTimesLoading ? (
            <View style={styles.stopTimesCenter}>
              <ActivityIndicator color={c.tint} />
              <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>Loading departures…</Text>
            </View>
          ) : stopTimes.length > 0 ? (
            // Real-time departures available
            visibleStopTimes.length > 0 ? (
              <FlatList
                data={visibleStopTimes}
                keyExtractor={(_, i) => String(i)}
                style={{ maxHeight: 280 }}
                renderItem={({ item }) => <TimeEntryRow item={item} routeColors={routeColors} c={c} onPress={() => openExpandedEntry(item)} />}
              />
            ) : (
              <View style={styles.stopTimesCenter}>
                <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>
                  No upcoming times for selected routes.{'\n'}Tap "Show all route times" above.
                </Text>
              </View>
            )
          ) : (
            // No real-time data — if we auto-loaded today's schedule, show it
            // directly without the "no more departures" header. Only show that
            // header + date picker when the user is browsing a future date or
            // today's schedule is also empty.
            (() => {
              const todayStr = toDateStr(new Date());
              const showingToday = stopDate === todayStr;
              return (
                <View>
                  {!showingToday && (
                    <View style={styles.noTimesHeader}>
                      <Text style={[styles.noTimesText, { color: c.text }]}>No more departures today</Text>
                      <Text style={[styles.noTimesSubtext, { color: c.textSecondary }]}>View scheduled times:</Text>
                    </View>
                  )}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateChipRow}
                  >
                    {/* Today chip always first — pre-selected since auto-fallback already loaded today */}
                    {(() => {
                      const isSelected = showingToday;
                      return (
                        <TouchableOpacity
                          key={todayStr}
                          style={[styles.dateChip, {
                            backgroundColor: isSelected ? c.tint : c.surfaceAlt,
                            borderColor: isSelected ? c.tint : c.border,
                          }]}
                          onPress={() => selectedStop && fetchStopSchedule(selectedStop, todayStr)}
                        >
                          <Text style={[styles.dateChipText, { color: isSelected ? '#fff' : c.text }]}>Today</Text>
                        </TouchableOpacity>
                      );
                    })()}
                    {dateChips.map(({ dateStr, label }) => {
                      const isSelected = stopDate === dateStr;
                      return (
                        <TouchableOpacity
                          key={dateStr}
                          style={[styles.dateChip, {
                            backgroundColor: isSelected ? c.tint : c.surfaceAlt,
                            borderColor: isSelected ? c.tint : c.border,
                          }]}
                          onPress={() => selectedStop && fetchStopSchedule(selectedStop, dateStr)}
                        >
                          <Text style={[styles.dateChipText, { color: isSelected ? '#fff' : c.text }]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {stopScheduleLoading ? (
                    <View style={styles.stopTimesCenter}>
                      <ActivityIndicator color={c.tint} />
                    </View>
                  ) : stopDate && visibleStopTimes.length > 0 ? (
                    <FlatList
                      data={visibleStopTimes}
                      keyExtractor={(_, i) => String(i)}
                      style={{ maxHeight: showingToday ? 280 : 220 }}
                      renderItem={({ item }) => <TimeEntryRow item={item} routeColors={routeColors} c={c} onPress={() => openExpandedEntry(item)} />}
                    />
                  ) : stopDate ? (
                    <View style={styles.stopTimesCenter}>
                      <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>No scheduled service for this date.</Text>
                    </View>
                  ) : null}
                </View>
              );
            })()
          )}
        </Animated.View>
      )}

      {/* ── Full-day schedule for a tapped route entry ───────────────────── */}
      {expandedEntry && (
        <Modal visible transparent animationType="fade" onRequestClose={closeExpandedEntry}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeExpandedEntry} />
          <View style={[styles.fullScheduleCard, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
              <View style={[styles.stopTimePill, { backgroundColor: routeColors[expandedEntry.routeShortName] ?? '#500000' }]}>
                <Text style={styles.stopTimePillText}>{expandedEntry.routeShortName || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={1}>
                  {expandedEntry.routeName || `Route ${expandedEntry.routeShortName}`}
                </Text>
                <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>{expandedEntry.direction}</Text>
              </View>
              <TouchableOpacity onPress={closeExpandedEntry} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            {/* Cancelled and already-passed times both read as "not boardable
                anymore", but for different reasons — keep them visually
                distinct rather than collapsing to one muted style: cancelled
                gets a red strikethrough (it never ran), passed just dims
                (it ran fine, it's just behind us already). Only meaningful
                for today's date — a future day has nothing "passed" yet. */}
            <FlatList
              data={expandedEntry.departureTimes}
              keyExtractor={(_, i) => String(i)}
              numColumns={3}
              contentContainerStyle={styles.fullScheduleGrid}
              renderItem={({ item: t }) => {
                const isToday = expandedEntryDate === toDateStr(new Date());
                const parsed = new Date(t.time);
                const isPast = !t.isCancelled && isToday && !isNaN(parsed.getTime()) && parsed.getTime() < Date.now();
                const mins = isToday && t.isEstimated && !t.isCancelled ? minutesUntil(t.time) : null;
                const liveLabel = mins !== null ? (mins === 0 ? 'Now' : `${mins}m`) : null;
                return (
                  <View style={[
                    styles.fullScheduleChip,
                    { backgroundColor: t.isCancelled ? 'rgba(220,38,38,0.1)' : liveLabel ? c.tint + '20' : c.surfaceAlt },
                    isPast && styles.fullScheduleChipPast,
                  ]}>
                    {liveLabel && <View style={[styles.liveDot, { backgroundColor: c.tint }]} />}
                    <Text style={[
                      styles.fullScheduleChipText,
                      t.isCancelled ? styles.fullScheduleChipTextCancelled : { color: isPast ? c.textSecondary : liveLabel ? c.tint : c.text },
                      t.isCancelled && styles.strikethrough,
                    ]}>
                      {t.isCancelled ? `✕ ${formatTime(t.time)}` : liveLabel ?? formatTime(t.time)}
                    </Text>
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.stopTimesHint, { color: c.textSecondary, padding: 20 }]}>No times for this day.</Text>
              }
            />
          </View>
        </Modal>
      )}

      {/* ── Service interruption detail modal ─────────────────────────────── */}
      {expandedInterruption && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setExpandedInterruption(null)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setExpandedInterruption(null)} />
          <View style={[styles.interruptionCard, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 24 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
              <Text style={styles.interruptionCardIcon}>⚠</Text>
              <Text style={[styles.stopSheetTitle, { color: c.text, flex: 1 }]}>Service Interruption</Text>
              <TouchableOpacity onPress={() => setExpandedInterruption(null)} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
              <Text style={[styles.interruptionCardText, { color: c.text }]}>
                {interruptionText(expandedInterruption)}
              </Text>
            </ScrollView>
          </View>
        </Modal>
      )}
    </View>
  );
}

// ── sub-component: time entry row ─────────────────────────────────────────────

function TimeEntryRow({ item, routeColors, c, onPress }: { item: TimeEntry; routeColors: Record<string, string>; c: any; onPress: () => void }) {
  const rn = item.routeShortName || '';
  const color = routeColors[rn] ?? '#500000';
  const times = item.departureTimes ?? [];

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} style={[styles.stopTimeRow, { borderBottomColor: c.border }]}>
      <View style={styles.stopTimeRouteLabel}>
        <View style={[styles.stopTimePill, { backgroundColor: color }]}>
          <Text style={styles.stopTimePillText}>{rn || '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stopTimeRouteName, { color: c.text }]} numberOfLines={1}>
            {item.routeName || `Route ${rn}`}
          </Text>
          <View style={styles.stopTimeMetaRow}>
            {!!item.direction && (
              <Text style={[styles.stopTimeDirection, { color: c.textSecondary }]}>{item.direction}</Text>
            )}
            {item.isTemporaryStopOnly && (
              <View style={[styles.miniBadge, { backgroundColor: '#F97316' }]}>
                <Text style={styles.miniBadgeText}>Temp Stop</Text>
              </View>
            )}
            {item.isClosedRegularStop && (
              <View style={[styles.miniBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.miniBadgeText}>Stop Closed</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.chevronSmall, { color: c.textSecondary }]}>›</Text>
      </View>
      <View style={styles.stopTimesChips}>
        {times.slice(0, 4).map((t, i) => {
          const mins = t.isEstimated ? minutesUntil(t.time) : null;
          const liveLabel = mins !== null ? (mins === 0 ? 'Now' : `${mins}m`) : null;
          return (
            <View key={i} style={[styles.timeChip, t.isEstimated && !t.isCancelled && { backgroundColor: c.tint + '20' }]}>
              {liveLabel !== null && (
                <View style={[styles.liveDot, { backgroundColor: c.tint }]} />
              )}
              <Text style={[
                styles.timeChipText,
                { color: t.isCancelled ? c.textSecondary : liveLabel !== null ? c.tint : c.text },
                t.isCancelled && styles.strikethrough,
              ]}>
                {t.isCancelled ? formatTime(t.time) : liveLabel ?? formatTime(t.time)}
              </Text>
            </View>
          );
        })}
        {times.length > 4 && (
          <Text style={[styles.moreTimesHint, { color: c.tint }]}>+{times.length - 4} more</Text>
        )}
        {times.length === 0 && (
          <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>No times</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // bus.png is a perfect square with the circle touching its own edge (no
  // padding), unlike stop.png (a tall 720x1080 pin that ends up ~17px wide once
  // `contain`-fit into its 26x26 box) — so the bus needs a noticeably smaller
  // box than the stop's nominal size to actually read as similarly sized.
  busIcon: { width: 24, height: 24, resizeMode: 'contain' },
  busMarkerWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  busCircleFill: { position: 'absolute', width: 20, height: 20, borderRadius: 10 },
  // Separate ring drawn over the image's own thin baked-in outline, since we
  // can't restyle stroke width/color inside the PNG itself from RN.
  busCircleBorder: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  headingPivot: { width: 24, height: 24, alignItems: 'center', justifyContent: 'flex-start' },
  headingArrow: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -3,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#1C1C1E',
  },
  stopIcon: { width: 26, height: 26, resizeMode: 'contain' },
  // temp_stop.png / timepoint.png are solid-filled signage art (no padding,
  // like bus.png) rather than stop.png's padded pin shape — sized down so
  // they read as "a bit bigger than a regular stop" rather than oversized.
  tempStopIcon: { width: 20, height: 20, resizeMode: 'contain' },
  timepointIcon: { width: 17, height: 17, resizeMode: 'contain' },
  closedStopIcon: { opacity: 0.4 },
  closedStopBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Bus callout
  callout: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 190,
    maxWidth: 270,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
    gap: 6,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  busIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calloutBusId: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  calloutUnit: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  amenityIconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityIconItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  amenityIconLabel: { fontSize: 11 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 48,
  },
  calloutMarkerWrap: {
    alignItems: 'center',
   paddingBottom: 170,
  },
  calloutPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Control panel
  panel: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  panelTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  routeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  routeSelectorText: { fontSize: 15, fontWeight: '500', flex: 1 },
  chevron: { fontSize: 20, fontWeight: '300', marginLeft: 4 },

  // Shared bottom sheet chrome
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '72%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600' },
  sheetDone: { fontSize: 16, fontWeight: '600' },

  // Route list
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  routeTag: {
    minWidth: 46,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  routeTagText: { fontSize: 13, fontWeight: '700' },
  routeName: { flex: 1, fontSize: 15 },
  checkmark: { fontSize: 16, fontWeight: '700', marginLeft: 2 },
  favoriteStar: { fontSize: 14, color: '#F59E0B' },
  disruptionWarning: { fontSize: 14, color: '#EF4444' },
  routeRowContainer: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  routeRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dirToggleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    marginLeft: 56,
  },
  dirChipFull: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dirChipFullText: { fontSize: 12, fontWeight: '600' },
  // Visually distinct from the direction toggle above it — warning-tinted so
  // it reads as "something needs attention" at a glance.
  disruptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginLeft: 56,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  disruptionButtonIcon: { fontSize: 13, color: '#EF4444' },
  disruptionButtonText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#EF4444' },
  disruptionButtonArrow: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  // Stop times sheet
  stopSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
    elevation: 12,
  },
  stopSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  stopSheetTitle: { fontSize: 17, fontWeight: '600' },
  stopSheetSubtitle: { fontSize: 13, marginTop: 2 },
  amenityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  amenityChip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  amenityChipText: { fontSize: 11, fontWeight: '500' },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 16, fontWeight: '500' },
  interruptionBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(249,115,22,0.12)',
    overflow: 'hidden',
  },
  interruptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  interruptionText: { flex: 1, fontSize: 12, fontWeight: '500', color: '#C2410C' },
  interruptionChevron: { fontSize: 18, color: '#C2410C', marginTop: -1 },
  interruptionCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  interruptionCardIcon: { fontSize: 20, marginRight: 8 },
  interruptionCardText: { fontSize: 15, lineHeight: 22 },
  holdBanner: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  holdBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#FCD34D',
  },
  holdContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  holdTitle: { fontSize: 13, fontWeight: '700', color: '#78350F' },
  holdSubtitle: { fontSize: 11, color: '#92400E', marginTop: 1 },
  holdCountdown: { fontSize: 20, fontWeight: '800', color: '#78350F' },
  filterToggle: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  stopTimesCenter: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  stopTimesHint: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // No-times / date picker
  noTimesHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 4,
  },
  noTimesText: { fontSize: 16, fontWeight: '600' },
  noTimesSubtext: { fontSize: 13 },
  dateChipRow: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  dateChip: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dateChipText: { fontSize: 13, fontWeight: '500' },

  // Stop time rows
  stopTimeRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  stopTimeRouteLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stopTimePill: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 38,
    alignItems: 'center',
  },
  stopTimePillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stopTimeRouteName: { fontSize: 14, fontWeight: '600' },
  stopTimeDirection: { fontSize: 12, marginTop: 1 },
  stopTimeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  miniBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  miniBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  chevronSmall: { fontSize: 18, fontWeight: '300' },
  stopTimesChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  timeChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeChipText: { fontSize: 13, fontWeight: '500' },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  strikethrough: { textDecorationLine: 'line-through' },
  moreTimesHint: { fontSize: 12, fontWeight: '600' },

  // Full-day schedule modal
  fullScheduleCard: {
    position: 'absolute',
    top: '15%',
    left: 16,
    right: 16,
    bottom: '15%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 12,
  },
  fullScheduleGrid: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  fullScheduleChip: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fullScheduleChipPast: { opacity: 0.5 },
  fullScheduleChipText: { fontSize: 13, fontWeight: '500' },
  fullScheduleChipTextCancelled: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
});
