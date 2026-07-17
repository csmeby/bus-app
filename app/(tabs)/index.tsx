import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
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
import { findFleetInfo, fleetNotesFor, type FleetBlock } from '@/constants/fleet';
import { useFavorites } from '@/context/favorites-context';
import { useUnitCodes } from '@/context/unit-codes-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_BASE } from '@/lib/api-base';
import { cachedJsonFetch } from '@/lib/local-cache';
import routePatterns from '../../routes_patterns.json';

// Pre-rotated heading-arrow images (36 buckets, 10° apart) swapped via the
// native `image` prop — the only churn-free way to change a marker's visual
// on react-native-maps (children + tracksViewChanges caused the fleet-wide
// "TelemetryController::pullTransaction index beyond bounds" crash; keying on
// heading mass-remounted every bus at once on every poll). Static requires
// are mandatory — Metro can't resolve a computed path.
const HEADING_ARROW_IMAGES: Record<string, number> = {
  '000': require('../../assets/images/heading_arrow_000.png'),
  '010': require('../../assets/images/heading_arrow_010.png'),
  '020': require('../../assets/images/heading_arrow_020.png'),
  '030': require('../../assets/images/heading_arrow_030.png'),
  '040': require('../../assets/images/heading_arrow_040.png'),
  '050': require('../../assets/images/heading_arrow_050.png'),
  '060': require('../../assets/images/heading_arrow_060.png'),
  '070': require('../../assets/images/heading_arrow_070.png'),
  '080': require('../../assets/images/heading_arrow_080.png'),
  '090': require('../../assets/images/heading_arrow_090.png'),
  '100': require('../../assets/images/heading_arrow_100.png'),
  '110': require('../../assets/images/heading_arrow_110.png'),
  '120': require('../../assets/images/heading_arrow_120.png'),
  '130': require('../../assets/images/heading_arrow_130.png'),
  '140': require('../../assets/images/heading_arrow_140.png'),
  '150': require('../../assets/images/heading_arrow_150.png'),
  '160': require('../../assets/images/heading_arrow_160.png'),
  '170': require('../../assets/images/heading_arrow_170.png'),
  '180': require('../../assets/images/heading_arrow_180.png'),
  '190': require('../../assets/images/heading_arrow_190.png'),
  '200': require('../../assets/images/heading_arrow_200.png'),
  '210': require('../../assets/images/heading_arrow_210.png'),
  '220': require('../../assets/images/heading_arrow_220.png'),
  '230': require('../../assets/images/heading_arrow_230.png'),
  '240': require('../../assets/images/heading_arrow_240.png'),
  '250': require('../../assets/images/heading_arrow_250.png'),
  '260': require('../../assets/images/heading_arrow_260.png'),
  '270': require('../../assets/images/heading_arrow_270.png'),
  '280': require('../../assets/images/heading_arrow_280.png'),
  '290': require('../../assets/images/heading_arrow_290.png'),
  '300': require('../../assets/images/heading_arrow_300.png'),
  '310': require('../../assets/images/heading_arrow_310.png'),
  '320': require('../../assets/images/heading_arrow_320.png'),
  '330': require('../../assets/images/heading_arrow_330.png'),
  '340': require('../../assets/images/heading_arrow_340.png'),
  '350': require('../../assets/images/heading_arrow_350.png'),
};
const HEADING_BLANK_IMAGE = require('../../assets/images/heading_blank.png');

function headingArrowImage(heading: number | null | undefined): number {
  if (typeof heading !== 'number' || isNaN(heading)) return HEADING_BLANK_IMAGE;
  const bucket = (Math.round(heading / 10) * 10) % 360;
  const key = String(bucket < 0 ? bucket + 360 : bucket).padStart(3, '0');
  return HEADING_ARROW_IMAGES[key] ?? HEADING_BLANK_IMAGE;
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Dedicated offline fallback for /route-patterns — deliberately separate from
// lib/local-cache's generic cachedJsonFetch, which would treat a 200-with-{}
// response (the server's "not validated yet" answer) as a legitimate value to
// trust for its whole maxAge window. Only ever written with a verified
// non-empty payload, so a stale/empty snapshot can never come back out of it.
const ROUTE_PATTERNS_CACHE_KEY = 'cache:route-patterns-verified';

async function getCachedRoutePatterns(): Promise<Record<string, any> | null> {
  try {
    const raw = await AsyncStorage.getItem(ROUTE_PATTERNS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function setCachedRoutePatterns(data: Record<string, any>): Promise<void> {
  try {
    await AsyncStorage.setItem(ROUTE_PATTERNS_CACHE_KEY, JSON.stringify(data));
  } catch {
    // best-effort
  }
}

function dimColor(hex: string): string {
  let h = hex.replace('#', '');
  // '#abc' expands per-digit to 'aabbcc' — duplicating the whole group
  // ('abcabc') reads as a completely different color.
  if (h.length === 3) h = h.replace(/./g, ch => ch + ch);
  return '#' + h.slice(0, 6) + '55';
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
    let h = parseInt(parts[0], 10);
    if (isNaN(h)) return raw;
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

// Upstream marks isEstimated=true on every departure it has live GPS data
// for, not just the imminent one — a bus can be confidently tracked toward a
// stop it won't reach for another couple hours. Converting that to "118m"
// reads as a countdown when it's really just a clock time; cap the live
// countdown display to departures actually coming up soon and let anything
// farther out show as a normal clock time.
const LIVE_ESTIMATE_MAX_MINUTES = 45;

// Swaps in live-estimated departure times over their matching scheduled
// entries — matched by closest absolute time within a 20-minute window, since
// there's no shared trip ID between the live (GetNextDepartTimes) and
// schedule (GetStopSchedules) responses. Used so the full-day view opened
// from a live row reflects the same "bus is running a few minutes late/early"
// estimate (with its live-dot symbol) instead of just the raw scheduled time.
function mergeLiveEstimates(fullEntry: TimeEntry, liveEntry: TimeEntry): TimeEntry {
  const liveTimes = liveEntry.departureTimes.filter(t => t.isEstimated && !t.isCancelled);
  if (liveTimes.length === 0) return fullEntry;
  const merged = fullEntry.departureTimes.map(t => ({ ...t }));
  const usedIdx = new Set<number>();
  liveTimes.forEach(liveT => {
    let bestIdx = -1;
    let bestDiff = Infinity;
    merged.forEach((st, idx) => {
      if (usedIdx.has(idx) || st.isCancelled) return;
      const diff = Math.abs(new Date(st.time).getTime() - new Date(liveT.time).getTime());
      if (diff < bestDiff) { bestDiff = diff; bestIdx = idx; }
    });
    if (bestIdx >= 0 && bestDiff <= 20 * 60 * 1000) {
      merged[bestIdx] = liveT;
      usedIdx.add(bestIdx);
    }
  });
  return { ...fullEntry, departureTimes: merged };
}

function liveMinutesLabel(t: DepartureTime): string | null {
  if (!t.isEstimated || t.isCancelled) return null;
  const mins = minutesUntil(t.time);
  if (mins === null || mins > LIVE_ESTIMATE_MAX_MINUTES) return null;
  return mins === 0 ? 'Now' : `${mins} min`;
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

// Upstream amenity shapes aren't pinned down yet — fall back through the
// common field names rather than assuming one.
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

type RerouteDir = {
  directionName: string;
  since: string;
  currentCoordinates: { latitude: number; longitude: number }[];
  baselineCoordinates: { latitude: number; longitude: number }[];
  unservedStops: string[];
  // Coordinates/names for unserved stops that appear on NO currently-live
  // pattern (own route's or any sibling's) — without this the server can say
  // a stop is skipped but the app has nothing to draw its marker at. Only
  // present on manually-set baselines (see reroute_watch.set_baseline).
  unservedStopDetails?: Record<string, { name?: string; lat: number; lng: number }>;
};

// ── component ─────────────────────────────────────────────────────────────────

export default function MapScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const insets = useSafeAreaInsets();
  const { isFavorite } = useFavorites();
  const { enabled: unitCodesEnabled } = useUnitCodes();

  // Whether we've been granted location permission — gates showsUserLocation
  // so the map doesn't sit there silently failing to show a blue dot for
  // someone who never granted it (or hasn't been asked yet).
  const [locationGranted, setLocationGranted] = useState(false);
  useEffect(() => {
    (async () => {
      const { status: existing } = await Location.getForegroundPermissionsAsync();
      if (existing === 'granted') {
        setLocationGranted(true);
        return;
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
    })();
  }, []);

  const [buses, setBuses] = useState<any[]>([]);
  // Heading-arrow markers use the `image` prop (not children) to stay churn-free
  // (see HEADING_ARROW_IMAGES above), but react-native-maps on iOS doesn't
  // reliably repaint a Marker's native icon when `image` changes on an already-
  // mounted marker — it needs tracksViewChanges nudged to force a re-snapshot.
  // A per-bus key/tracksViewChanges toggle would be the same mass-remount crash
  // already hit for these routes; instead this pulses tracksViewChanges true for
  // every heading marker together, once per poll, then back to false — shared
  // state for a refresh that's shared across many markers, per the lesson above.
  const [headingRefreshPulse, setHeadingRefreshPulse] = useState(false);
  // One AnimatedRegion per bus (keyed by name), reused across polls so a
  // position update glides there instead of snapping — created lazily during
  // render (so it exists from the very first frame a bus appears, before the
  // animate-on-update effect below has even run) and shared read-only by the
  // bus icon, its heading arrow, and its callout, so all three move in sync.
  const busRegionsRef = useRef<Map<string, InstanceType<typeof AnimatedRegion>>>(new Map()).current;
  // Buses whose route is deselected are "parked" here (far off-map) instead
  // of being hidden via the Marker `opacity` prop or unmounted:
  //  - opacity on Marker.Animated didn't apply on-device (buses never
  //    reappeared — see the dedupedBuses comment below), and
  //  - mount/unmount churn on route toggle is this app's documented native
  //    crash trigger, confirmed twice now (crash came back the same day the
  //    filtered-array mounting was reinstated).
  // Moving the marker via its AnimatedRegion is the ONE mechanism these
  // markers demonstrably support (it's how the position glide works), so
  // visibility rides on it too.
  const PARKED_REGION = { latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 };
  // Bus names currently un-parked (their route is selected) — lets the
  // position effect below distinguish "just became visible → snap into
  // place" from "already visible → glide".
  const shownBusesRef = useRef<Set<string>>(new Set()).current;
  const getBusRegion = useCallback((bus: any, visible: boolean) => {
    let region = busRegionsRef.get(bus.name);
    if (!region) {
      region = new AnimatedRegion(visible
        ? { latitude: bus.lat, longitude: bus.lon, latitudeDelta: 0, longitudeDelta: 0 }
        : PARKED_REGION);
      busRegionsRef.set(bus.name, region);
    }
    return region;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busRegionsRef]);
  const [routeLines, setRouteLines] = useState<Record<string, Record<string, { latitude: number; longitude: number }[]>>>({});
  const [stops, setStops] = useState<Stop[]>([]);
  // Backing store for `stops`, persisted across every applyPatterns() call
  // this session — see the comment inside applyPatterns for why this can't
  // just be a fresh Map per call.
  const stopMapRef = useRef<Map<string, Stop>>(new Map()).current;
  const [routeInfo, setRouteInfo] = useState<Record<string, RouteInfo>>({});
  // Live reroute detections from /reroutes: route -> dirKey -> geometry info.
  // Rerouted directions draw the CURRENT path solid and the regular path as a
  // red dashed line, with unserved stops badged (see reroute_watch.py server-side).
  const [reroutes, setReroutes] = useState<Record<string, Record<string, RerouteDir>>>({});
  // Union of every reroute entry ever seen this session, geometry retained even
  // after the reroute clears. The overlay below renders from this (not
  // `reroutes` directly) with a STABLE key and hides inactive entries via
  // transparent/zero-width props, same trick used for the base route
  // polylines — mounting/unmounting a Polyline (which plain `reroutes`
  // would do the instant a detour ends) is what was crashing the app on
  // Android when a reroute cleared.
  const [reroutesGeometry, setReroutesGeometry] = useState<Record<string, Record<string, RerouteDir>>>({});
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
  const [expandedEntryDate, setExpandedEntryDate] = useState<string | null>(null);
  // Stops we've learned are closed for at least one route, discovered lazily
  // when their schedule is fetched (no proactive bulk lookup for every pin).
  const [closedStopCodes, setClosedStopCodes] = useState<Set<string>>(new Set());
  const stopPanelAnim = useRef(new Animated.Value(0)).current;
  // Monotonic tokens guarding the stop panel's async fetches: any newer fetch
  // (tapping another stop, another date chip, or closing the panel) bumps the
  // counter, so a slow in-flight response for the OLD stop/date can't land
  // late and overwrite the newer panel's contents. Same idea for the
  // expanded full-day modal, which could otherwise be re-opened by a late
  // response after the user dismissed it.
  const stopReqIdRef = useRef(0);
  const expandedReqIdRef = useRef(0);
  const mapRef = useRef<MapView>(null);

  const [holdTick, setHoldTick] = useState(() => Date.now());

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
  const [fleetInfoBus, setFleetInfoBus] = useState<{ name: string; info: FleetBlock | null } | null>(null);

  // ── route helpers ──────────────────────────────────────────────────────────

  const toggleRoute = (route: string) => {
    if (animateTimeoutRef.current) {
      clearTimeout(animateTimeoutRef.current);
      animateTimeoutRef.current = null;
    }
    
    if (route === 'all') {
      setSelectedRoutes(prev => (prev.includes('all') ? [] : ['all']));
      return;
    }
    setSelectedRoutes(prev => {
      const next = prev.filter(r => r !== 'all');
      return next.includes(route) ? next.filter(r => r !== route) : [...next, route];
    });
  };

  // route -> true when the live /routes API direction UUIDs don't match any of
  // the bundled polyline keys — i.e. routes_patterns.json is from a previous
  // semester. When stale, direction-based filtering is fully disabled so the
  // app never shows the wrong direction at full opacity. Memoized: this used
  // to be a function re-doing the Object.keys().map() scan on every call, and
  // it's called per stop×route and per bus on every render.
  const staleRouteMap = useMemo(() => {
    const m: Record<string, boolean> = {};
    Object.keys(routeLines).forEach(route => {
      const apiDirs = routeInfo[route]?.directions ?? [];
      const pKeys = Object.keys(routeLines[route] ?? {}).map(k => k.toLowerCase().trim());
      m[route] = apiDirs.length > 0 && pKeys.length > 0 &&
        !apiDirs.some(d => {
          const ak = (d.key || '').toLowerCase().trim();
          return !!ak && pKeys.includes(ak);
        });
    });
    return m;
  }, [routeInfo, routeLines]);

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

  // Which polyline key counts as "the selected direction" for each route:
  // the user's explicit pick if it matches an actual polyline, else the
  // first polyline key. Shared by the regular route polylines AND the
  // reroute overlay below — a route with an active reroute on BOTH
  // directions (e.g. a two-way construction detour) used to render both
  // overlay pairs unconditionally at full strength, ignoring the direction
  // toggle entirely (it only ever affected the regular polylines, which
  // are hidden either way once a direction is rerouted) — so toggling
  // direction visibly did nothing. Using the same effectiveDir for both
  // means whichever direction is selected is the only one bold, rerouted
  // or not.
  const effectiveDirByRoute = useMemo(() => {
    const m: Record<string, string> = {};
    Object.entries(routeLines).forEach(([route, dirs]) => {
      const userPick = routeDirections[route];
      m[route] = (userPick && dirs[userPick]) ? userPick : Object.keys(dirs)[0];
    });
    return m;
  }, [routeLines, routeDirections]);

  // Direction NAME the user currently has selected for a route (explicit
  // pick, else the route's first direction) — sourced from routeInfo
  // (/routes), independently of routeLines/reroutes' own direction-key
  // namespaces. AggieSpirit doesn't just reissue directionKeys once a
  // semester (the assumption effectiveDirByRoute above was built under) —
  // confirmed 2026-07-15 that an actively-rerouted route's key can rotate
  // to a brand new UUID on every single 5-minute reroute-watch poll while
  // the detour is still active. A reroute overlay's live `dk` therefore
  // routinely does NOT equal effectiveDirByRoute[route] (a snapshot from a
  // separately-polled, less-frequently-refreshed source) even when it's
  // genuinely the same physical direction — which silently hid the dashed
  // baseline line and the unserved-stop badges on exactly the routes this
  // whole feature exists for. Direction NAMES ("to MSC", "Northbound") stay
  // stable across that churn, so matching on name is the robust check;
  // see isSelectedDirection below.
  const selectedDirNameByRoute = useMemo(() => {
    const m: Record<string, string | undefined> = {};
    Object.entries(routeInfo).forEach(([route, info]) => {
      const key = routeDirections[route] ?? info.directions[0]?.key;
      m[route] = info.directions.find(d => d.key === key)?.name;
    });
    return m;
  }, [routeInfo, routeDirections]);

  // True when `dk` (a reroute/polyline direction key) is the direction the
  // user currently has selected for `route`. Prefers matching by direction
  // NAME (stable across a directionKey rotation — see
  // selectedDirNameByRoute above); falls back to raw key equality only when
  // a name isn't available on either side, so missing data never silently
  // starts hiding something that used to show.
  const isSelectedDirection = useCallback((route: string, dk: string, dkName: string | undefined, fallbackKey: string | undefined) => {
    const selName = selectedDirNameByRoute[route];
    if (selName && dkName) return selName.trim().toLowerCase() === dkName.trim().toLowerCase();
    return dk === fallbackKey;
  }, [selectedDirNameByRoute]);

  // Stops skipped by an active reroute on ANY route — deliberately NOT
  // filtered by selectedRoutes. This set feeds the stop markers' React keys
  // (badge state is baked into the key, see the marker comment below), so
  // making it selection-dependent meant toggling a route flipped isUnserved
  // and force-remounted a batch of markers at the exact moment the user
  // opened/closed a route — the same native add/remove churn this file's
  // polyline comments identify as the Android ghost/crash trigger. A stop of
  // an unselected route is hidden via opacity anyway, so the extra codes here
  // are invisible until their route is selected.
  const unservedStopCodes = useMemo(() => {
    const s = new Set<string>();
    Object.values(reroutes).forEach(dirs => {
      Object.values(dirs).forEach(d => (d.unservedStops ?? []).forEach(code => s.add(code)));
    });
    return s;
  }, [reroutes]);

  // EVERY bus in the feed stays mounted, deduped by name (a bus can appear
  // in multiple routes' API responses via extra trips). Route selection must
  // NOT filter this render array: both filtered variants crashed on route
  // toggle (2026-07-13 and again 2026-07-14 — mass Marker.Animated
  // mount/unmount is this app's documented native crash trigger, and adding
  // a synchronous glide-stop before the selection change didn't save it).
  // The always-mounted version was crash-free, but its `opacity`-prop hiding
  // never displayed buses on individually-selected routes on-device — so
  // visibility is now handled by PARKING hidden buses' AnimatedRegions
  // off-map instead (see getBusRegion / the position effect below), which
  // needs no mount churn and no opacity prop at all.
  const dedupedBuses = useMemo(() => {
    const seen = new Set<string>();
    return buses.filter(b => { if (seen.has(b.name)) return false; seen.add(b.name); return true; });
  }, [buses]);

  // Count for the "N active" badge — only buses on currently-selected routes.
  const visibleBusCount = useMemo(() => {
    if (selectedRoutes.includes('all')) return dedupedBuses.length;
    return dedupedBuses.filter(b => selectedRoutes.includes(b.route)).length;
  }, [dedupedBuses, selectedRoutes]);

  // Stops belonging to a currently-selected route (or flagged unserved by
  // any active reroute — selection-independent so the set doesn't churn on
  // route toggle; see unservedStopCodes) — the bounded set of markers that
  // stay mounted.
  // This only changes when the user (de)selects a ROUTE, not when they flip
  // direction, which is what actually matters: switching direction used to
  // swing a batch of markers in/out of the render array (native add/remove
  // churn — the same thing this file's polyline comments flag as the cause
  // of ghosted overlays on Android), so direction-only visibility is instead
  // applied as opacity within this already-mounted set (see visibleStopCodes
  // below). Mounting literally every stop in the system regardless of route
  // selection was tried first and made things worse (crashes, stops not all
  // rendering) — too many simultaneous native marker views — so this stays
  // scoped to selected routes like the original filteredStops did.
  const routeStops = useMemo(() => {
    if (selectedRoutes.includes('all')) return stops;
    return stops.filter(stop =>
      unservedStopCodes.has(stop.code) || stop.routes.some(r => selectedRoutes.includes(r)));
  }, [stops, selectedRoutes, unservedStopCodes]);

  // Of routeStops, which should render at full opacity for the current
  // direction pick — the part that's allowed to change on every direction
  // toggle without unmounting anything, since routeStops itself doesn't.
  const visibleStopCodes = useMemo(() => {
    // Invert reroutes once into route -> stopCode -> [dirKeys skipping it],
    // instead of re-scanning every reroute entry for every stop×route pair.
    const unservedDirsByRoute: Record<string, Record<string, string[]>> = {};
    Object.entries(reroutes).forEach(([route, dirs]) => {
      const byStop: Record<string, string[]> = {};
      Object.entries(dirs).forEach(([dk, info]) => {
        (info.unservedStops ?? []).forEach(code => {
          (byStop[code] ??= []).push(dk);
        });
      });
      unservedDirsByRoute[route] = byStop;
    });

    const s = new Set<string>();
    routeStops.forEach(stop => {
      // Unserved-by-a-selected-route check runs BEFORE and INDEPENDENTLY of
      // stop.routes membership below — not nested inside the `.some(r =>
      // stop.routes...)` loop like it used to be. stop.routes only reflects
      // which routes' LIVE, currently-undetoured pattern has actually been
      // observed carrying this stop; a stop a detour skips entirely means
      // ITS OWN route's live pattern never includes it while detoured, so
      // that route never gets linked into stop.routes at all — the stop is
      // only known (has a coordinate) via whichever OTHER route's pattern
      // happened to still carry it (e.g. route 04's "The Gardens" (0410) is
      // currently known only via "01-04"'s still-normal pattern while 04
      // itself is detoured around it — "04" was never in this stop's
      // .routes, so the old nested check could never reach it and the
      // unserved badge silently never showed for a selected-but-unlinked
      // route). The server's reroute payload is authoritative on "which
      // route currently skips this stop" regardless of that client-side
      // linkage, so it's checked first, unconditionally.
      const unservedBySelectedRoute = !stop.isTemporary && selectedRoutes.some(r => {
        // Resolve direction from the reroute payload's own dirKey, not
        // stop.dirKeys — stop.dirKeys is only ever refreshed by a LIVE poll
        // actually containing this stop, which a currently-unserved stop by
        // definition never is, so it's frozen at a possibly since-rotated
        // value. Matched by direction NAME (see isSelectedDirection) — an
        // actively-rerouted direction's key can rotate on every single
        // reroute-watch poll (confirmed 2026-07-15), which made a raw
        // effectiveDirByRoute[r] key-equality check miss almost every time.
        const unservedDirs = unservedDirsByRoute[r]?.[stop.code] ?? [];
        return unservedDirs.some(dk => isSelectedDirection(r, dk, reroutes[r]?.[dk]?.directionName, effectiveDirByRoute[r]));
      });
      if (unservedBySelectedRoute) {
        s.add(stop.code);
        return;
      }

      const show = stop.routes.some(r => {
        if (!selectedRoutes.includes(r)) return false;
        const keys = stop.dirKeys[r] ?? [];
        if (keys.length === 0) return true;    // no direction data — always show
        if (staleRouteMap[r]) return true;     // can't trust direction mapping — show all
        return keys.includes(effectiveDirByRoute[r]);
      });
      if (show) s.add(stop.code);
    });
    return s;
  }, [routeStops, selectedRoutes, effectiveDirByRoute, staleRouteMap, reroutes, isSelectedDirection]);

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

  const selectedRouteBounds = useMemo(() => {
    if (selectedRoutes.length === 0) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let hasCoords = false;

    selectedRoutes.forEach(route => {
      const dirs = routeLines[route];
      if (!dirs) return;
      
      const effectiveDir = effectiveDirByRoute[route];
      const coords = dirs[effectiveDir];
      if (!coords || coords.length === 0) return;
      
      coords.forEach(({ latitude, longitude }) => {
        minLat = Math.min(minLat, latitude);
        maxLat = Math.max(maxLat, latitude);
        minLng = Math.min(minLng, longitude);
        maxLng = Math.max(maxLng, longitude);
        hasCoords = true;
      });
    });

    if (!hasCoords) return null;

    const latPadding = (maxLat - minLat) * 0.15;
    const lngPadding = (maxLng - minLng) * 0.15;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + latPadding * 2,
      longitudeDelta: (maxLng - minLng) + lngPadding * 2,
    };
  }, [selectedRoutes, routeLines, effectiveDirByRoute]);

  // All Routes case
  const allRoutesBounds = useMemo(() => {
    if (!selectedRoutes.includes('all')) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let hasCoords = false;

    Object.entries(routeLines).forEach(([route, dirs]) => {
      const coords = Object.values(dirs).flat();
      coords.forEach(({ latitude, longitude }) => {
        minLat = Math.min(minLat, latitude);
        maxLat = Math.max(maxLat, latitude);
        minLng = Math.min(minLng, longitude);
        maxLng = Math.max(maxLng, longitude);
        hasCoords = true;
      });
    });

    if (!hasCoords) return null;
    
    const latPadding = (maxLat - minLat) * 0.15;
    const lngPadding = (maxLng - minLng) * 0.15;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: (maxLat - minLat) + latPadding * 2,
      longitudeDelta: (maxLng - minLng) + lngPadding * 2,
    };
  }, [selectedRoutes, routeLines]);


  // ── data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Paint immediately from the bundled snapshot, then swap in the server's
    // freshly-built patterns (current-semester direction UUIDs) when they
    // arrive. The bundle is only a cold-start/offline fallback — the server
    // copy is what keeps direction keys matching /routes and /buses.
    // No maxAgeMs here on purpose: the server returns {} until its own
    // rebuild has finished and validated, and cachedJsonFetch would persist
    // and trust that empty response as "fresh" for the whole window,
    // blocking correction the moment the server did have good data. Always
    // hit the network on each of these infrequent (15-min) polls; the local
    // cache is only consulted as an offline fallback on fetch failure, and
    // only non-empty responses ever get stored into it below.
    applyPatterns(routePatterns);
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/route-patterns`);
        const data = res.ok ? await res.json() : null;
        if (!cancelled && data && Object.keys(data).length > 0) {
          applyPatterns(data);
          setCachedRoutePatterns(data);
        }
      } catch {
        // Offline — fall back to the last-known-good server copy, if any
        // (still better than nothing, and never an empty/invalid snapshot
        // since only non-empty responses are ever written to this cache key).
        const cached = await getCachedRoutePatterns();
        if (!cancelled && cached) applyPatterns(cached);
      }
    };
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  function applyPatterns(source: Record<string, any>) {
    const lines: Record<string, Record<string, { latitude: number; longitude: number }[]>> = {};
    // Seeded from every stop ever merged in this session (bundled fallback,
    // then each live /route-patterns poll), NOT reset per call. A stop that's
    // currently CLOSED by a reroute is, by definition, missing from the live
    // pattern's patternPoints — that's exactly how reroute_watch.py computes
    // unservedStops server-side. Resetting this map on every fetch meant the
    // very first live poll after app launch would silently drop any
    // currently-closed stop's only coordinate/name data (the bundled
    // fallback has it; the live pattern never will while the closure is
    // active), leaving unservedStopCodes naming a stop that had no marker
    // left to badge. routeLines stays a full per-call replace (below) since
    // the live geometry — including an active reroute's actual driven path —
    // must always win; only the stop catalog needs to be additive.
    const stopMap = stopMapRef;
    // Temp stops (stop_type===1, "T0410" etc.) are the one category that
    // does NOT belong in the additive/never-shrinks model above — unlike a
    // regular stop (which can be legitimately absent from a single fetch
    // while a reroute has it closed, and must keep its old entry so the
    // unserved badge has something to attach to), a temp stop exists ONLY
    // because of an active reroute in the first place. Once a fetch stops
    // reporting it at all, the reroute that created it has ended and it
    // should disappear permanently — otherwise it lingers in "All Routes"
    // view (which renders the full unfiltered `stops` accumulation) forever
    // for the rest of the session, a phantom marker for a detour that's
    // long over. Tracked across this call's full route set (every route is
    // always present in a real payload) and swept at the end.
    const seenTempCodes = new Set<string>();

    Object.entries(source).forEach(([route, routeData]) => {
      const { patterns } = routeData as any;
      const routeDirs: Record<string, { latitude: number; longitude: number }[]> = {};

      // Key by the real direction_key UUID (matches /routes live data) rather than
      // guessing "inbound"/"outbound" from the pattern name — those labels are just
      // an artifact of the order paths.py happened to receive patterns in and don't
      // reflect the route's actual direction names (e.g. route 03 is "to White Creek"
      // / "to MSC", not inbound/outbound at all).
      Object.entries(patterns as Record<string, any>).forEach(([, pattern], idx) => {
        if (!pattern.coordinates) return;
        const dirKey: string = (pattern.direction_key || `pattern_${idx}`).toLowerCase();

        routeDirs[dirKey] = (pattern.coordinates as any[]).map(({ lat, lng }) => ({
          latitude: lat,
          longitude: lng,
        }));

        (pattern.stops as any[] | undefined)?.forEach((stop) => {
          if (!stop.lat || !stop.lng) return;
          const isTemporary = stop.stop_type === 1;
          const isTimepoint = !!stop.is_timepoint;
          if (isTemporary) seenTempCodes.add(stop.code);
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

    // Sweep temp stops this call no longer confirms — see seenTempCodes
    // above. Runs after every applyPatterns call (bundled seed included),
    // so a stale temp stop baked into the bundled fallback snapshot gets
    // cleaned up the moment the first live fetch fails to reconfirm it.
    for (const [code, stop] of stopMap) {
      if (stop.isTemporary && !seenTempCodes.has(code)) stopMap.delete(code);
    }

    setRouteLines(lines);
    setStops(Array.from(stopMap.values()));
  }

  useEffect(() => {
    // Route names/colors/directions barely ever change mid-semester — serve
    // the cached copy outright for up to a day, and fall back to it
    // regardless of age if the server's unreachable.
    // Fetch routes with a much shorter cache to prevent mismatch with fresh patterns
    cachedJsonFetch<any[]>(`${API_BASE}/routes`, 'routes', { maxAgeMs: 5 * 60 * 1000 })
      .then((data: any[]) => {
        const info: Record<string, RouteInfo> = {};
        data.forEach(r => {
          info[r.shortName] = {
            name: r.name,
            color: r.color ?? '#500000',
            directions: (r.directions ?? []).map((d: any) => ({ ...d, key: d.key?.toLowerCase() })),
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
        setBuses(data.map(b => ({ ...b, directionKey: b.directionKey?.toLowerCase() })));
        // Nudge every heading marker to re-snapshot its (possibly changed)
        // image together, once per poll — see headingRefreshPulse above.
        setHeadingRefreshPulse(true);
        setTimeout(() => setHeadingRefreshPulse(false), 100);
      } catch (e) {
        console.warn('Bus fetch failed:', e);
      }
    }
    fetchBuses();
    const id = setInterval(fetchBuses, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Server re-checks pattern geometry every 5 minutes; polling faster than
    // half that gains nothing.
    async function fetchReroutes() {
      try {
        const res = await fetch(`${API_BASE}/reroutes`);
        const data = await res.json();
        if (data && typeof data === 'object') {
          const normalized: Record<string, any> = {};
          Object.entries(data).forEach(([route, dirs]: [string, any]) => {
            normalized[route] = {};
            Object.entries(dirs).forEach(([dk, info]) => {
              normalized[route][dk.toLowerCase()] = info;
            });
          });
          setReroutes(normalized);
          // Seed the stop catalog with any unserved stop the app has no
          // coordinate for from any live pattern (see unservedStopDetails on
          // RerouteDir). Added once and kept for the session — a stable,
          // one-time mount, not per-poll churn — so the unserved badge has a
          // marker to attach to. Never overwrites a live-pattern stop.
          {
            let added = false;
            Object.entries(normalized as Record<string, Record<string, RerouteDir>>).forEach(([route, dirs]) => {
              Object.values(dirs).forEach(info => {
                Object.entries(info.unservedStopDetails ?? {}).forEach(([code, d]) => {
                  if (!stopMapRef.has(code) && typeof d?.lat === 'number' && typeof d?.lng === 'number') {
                    stopMapRef.set(code, {
                      code,
                      name: d.name ?? `Stop ${code}`,
                      routes: [route],
                      dirKeys: {},
                      coordinate: { latitude: d.lat, longitude: d.lng },
                      isTemporary: false,
                      timepointRoutes: {},
                    });
                    added = true;
                  }
                });
              });
            });
            if (added) setStops(Array.from(stopMapRef.values()));
          }
          setReroutesGeometry(prev => {
            const next: Record<string, Record<string, RerouteDir>> = {};
            Object.keys(prev).forEach(route => { next[route] = { ...prev[route] }; });
            Object.entries(normalized).forEach(([route, dirs]) => {
              next[route] = { ...next[route], ...dirs };
            });
            return next;
          });
        } else {
          setReroutes({});
        }
      } catch {
        // keep the last-known reroute state on failure
      }
    }
    fetchReroutes();
    const id = setInterval(fetchReroutes, 150000);
    return () => clearInterval(id);
  }, []);

  // Glide each bus's marker(s) to its new position over each poll rather than
  // snapping there instantly. getBusRegion (called during render, below)
  // already created/updated each region's CURRENT value for brand-new buses,
  // so by the time this runs the region exists — this only needs to animate
  // existing ones to wherever the bus has moved since the last poll.
  useEffect(() => {
    // Evict regions for buses gone from the feed — the map otherwise grows
    // one AnimatedRegion per bus ever seen this session. Safe here: a bus
    // missing from `buses` also just left dedupedBuses, so its markers were
    // unmounted in the commit this effect runs after.
    const liveNames = new Set(buses.map(b => b.name));
    busRegionsRef.forEach((_, name) => {
      if (!liveNames.has(name)) {
        busRegionsRef.delete(name);
        shownBusesRef.delete(name);
      }
    });
    // Position/visibility driver: hidden buses park off-map, a bus whose
    // route just got selected snaps straight into place (gliding there from
    // the parking spot would streak it across the map), and an
    // already-visible bus glides to its fresh poll position.
    dedupedBuses.forEach(bus => {
      const region = busRegionsRef.get(bus.name);
      if (!region) return;
      const visible = selectedRoutes.includes('all') || selectedRoutes.includes(bus.route);
      if (!visible) {
        if (shownBusesRef.has(bus.name)) {
          shownBusesRef.delete(bus.name);
          region.stopAnimation(() => {});
          region.setValue(PARKED_REGION as any);
        }
      } else if (!shownBusesRef.has(bus.name)) {
        shownBusesRef.add(bus.name);
        region.stopAnimation(() => {});
        region.setValue({ latitude: bus.lat, longitude: bus.lon, latitudeDelta: 0, longitudeDelta: 0 } as any);
      } else {
        region.timing({ latitude: bus.lat, longitude: bus.lon, duration: 900 } as any).start();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buses, dedupedBuses, selectedRoutes, busRegionsRef, shownBusesRef]);

  // ── bus callout ────────────────────────────────────────────────────────────

  const closeBusCallout = useCallback(() => {
    setSelectedBusName(null);
    setBusSnapshot(null);
  }, []);

  const openFleetInfo = useCallback((busName: string) => {
    setFleetInfoBus({ name: busName, info: findFleetInfo(busName) });
  }, []);

  const closeFleetInfo = useCallback(() => setFleetInfoBus(null), []);

  // ── stop panel ─────────────────────────────────────────────────────────────

  const fetchStopSchedule = useCallback(async (stop: Stop, date: string) => {
    const reqId = ++stopReqIdRef.current;
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
      if (stopReqIdRef.current !== reqId) return;
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      setStopSchedule(entries);
      setStopAmenities(Array.isArray(data?.amenities) ? data.amenities : []);
      if (entries.some(e => e.isClosedRegularStop)) {
        setClosedStopCodes(prev => new Set(prev).add(stop.code));
      }
    } catch (e) {
      if (stopReqIdRef.current !== reqId) return;
      console.warn('Stop schedule fetch failed:', e);
      setStopSchedule([]);
    } finally {
      // The loading flag belongs to whichever fetch is newest.
      if (stopReqIdRef.current === reqId) setStopScheduleLoading(false);
    }
  }, []);

  const openStopPanel = useCallback(async (stop: Stop) => {
    if (selectedBusName) closeBusCallout();
    const reqId = ++stopReqIdRef.current;
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

    // Loading-flag handling is explicit in both branches (not a finally):
    // the fallback fetchStopSchedule call bumps stopReqIdRef itself, so a
    // finally-with-guard would see a "newer" request and leave the live
    // spinner stuck on forever.
    try {
      const res = await fetch(`${API_BASE}/stop/${stop.code}/times?dk=${encodeURIComponent(dks.join(','))}`);
      const data: StopTimesPayload = await res.json();
      if (stopReqIdRef.current !== reqId) return; // user moved on to another stop
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      setStopTimes(entries);
      setStopAmenities(Array.isArray(data?.amenities) ? data.amenities : []);
      if (entries.some(e => e.isClosedRegularStop)) {
        setClosedStopCodes(prev => new Set(prev).add(stop.code));
      }
      setStopTimesLoading(false);
      // If live times returned nothing (session stale, direction keys out of
      // date, or no buses running right now), fall back to today's full
      // schedule automatically so the panel isn't just empty.
      if (entries.length === 0) {
        fetchStopSchedule(stop, toDateStr(new Date()));
      }
    } catch (e) {
      if (stopReqIdRef.current !== reqId) return;
      console.warn('Stop times fetch failed:', e);
      setStopTimes([]);
      setStopTimesLoading(false);
      fetchStopSchedule(stop, toDateStr(new Date()));
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
    const reqId = ++expandedReqIdRef.current;
    setExpandedEntry(item);
    // Tracked separately from stopDate, which can change/clear while this
    // modal is still open — "is this time in the past" only makes sense
    // relative to whichever date this specific entry's times actually belong to.
    const date = stopDate ?? toDateStr(new Date());
    setExpandedEntryDate(date);
    if (!selectedStop) return;
    // Always swap in the complete day's schedule for this route+direction:
    // the live view's rows only carry the next ~3 departures, and the today-
    // schedule fallback's rows are filtered to upcoming times only — either
    // way the tapped row is incomplete for a "full day" view. Past times
    // render dimmed (see the isPast style in the modal) rather than hidden.
    try {
      const data = await cachedJsonFetch<StopTimesPayload>(
        `${API_BASE}/stop/${selectedStop.code}/schedule?date=${date}`,
        `stop-schedule:${selectedStop.code}:${date}`,
      );
      // Modal closed (or reopened for another row) while this was in flight —
      // setting state here would pop the dismissed modal back open.
      if (expandedReqIdRef.current !== reqId) return;
      const entries = Array.isArray(data?.entries) ? data.entries : [];
      const full = entries.find(e => e.routeShortName === item.routeShortName && e.direction === item.direction);
      if (full) setExpandedEntry(mergeLiveEstimates(full, item));
    } catch (e) {
      console.warn('Full-day schedule fetch failed:', e);
    }
  }, [stopDate, selectedStop]);

  const closeExpandedEntry = useCallback(() => {
    expandedReqIdRef.current++; // invalidate any in-flight full-day fetch
    setExpandedEntry(null);
    setExpandedEntryDate(null);
  }, []);

  const closeStopPanel = useCallback(() => {
    stopReqIdRef.current++; // drop in-flight times/schedule responses for the closed panel
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
    return [0, 1, 2, 3, 4, 5].map(n => {
      const d = addDays(today, n);
      return {
        dateStr: toDateStr(d),
        label: n === 0
          ? 'Today'
          : n === 1
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

  // Deselecting a route parks its bus markers off-map, but the snapshot
  // fallback above keeps `selectedBus` truthy even without live data — so
  // without this, an open callout would keep floating (over empty map, or
  // over the parking spot) after its bus's route was toggled off.
  useEffect(() => {
    if (!selectedBusName || !busSnapshot) return;
    if (!(selectedRoutes.includes('all') || selectedRoutes.includes(busSnapshot.route))) {
      closeBusCallout();
    }
  }, [selectedRoutes, selectedBusName, busSnapshot, closeBusCallout]);

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

  // Drive the countdown only while a hold is actually showing (see the
  // holdTick comment above). The immediate set on start keeps the first
  // rendered value from being up to a whole interval stale.
  useEffect(() => {
    if (!stopHoldBus) return;
    setHoldTick(Date.now());
    const id = setInterval(() => setHoldTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, [stopHoldBus]);

  const previousSelectedRoutesRef = useRef<string[]>([]);
  const animateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = previousSelectedRoutesRef.current;
    
    // Check if selection actually changed
    const changed = selectedRoutes.length !== prev.length || 
      selectedRoutes.some(r => !prev.includes(r));
    
    if (changed) {
      // Clear any pending animation
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
      
      // Don't animate if nothing is selected
      if (selectedRoutes.length === 0) return;
      
      // Small delay to let polylines render
      animateTimeoutRef.current = setTimeout(() => {
        const bounds = selectedRoutes.includes('all') 
          ? allRoutesBounds 
          : selectedRouteBounds;
        
        if (bounds && mapRef.current) {
          mapRef.current.animateToRegion(bounds, 800);
        }
        
        animateTimeoutRef.current = null;
      }, 100);
    }
    
    previousSelectedRoutesRef.current = selectedRoutes;
  }, [selectedRoutes, selectedRouteBounds, allRoutesBounds]);

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

  useEffect(() => {
    return () => {
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
    };
  }, []);


  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        userInterfaceStyle={scheme}
        customMapStyle={scheme === 'dark' ? DARK_MAP_STYLE : []}
        initialRegion={{ latitude: 30.615, longitude: -96.34, latitudeDelta: 0.022, longitudeDelta: 0.022 }}
        showsUserLocation={locationGranted}
        showsMyLocationButton={locationGranted}
        onPress={() => {
          if (selectedBusName) closeBusCallout();
        }}
      >
        {/* Always render ALL polylines; use transparent color for inactive routes
            to prevent the native layer from retaining ghost polylines. */}
        {Object.entries(routeLines).flatMap(([route, dirs]) => {
          const isActive = selectedRoutes.includes('all') || selectedRoutes.includes(route);
          const color = routeColors[route] ?? '#888888';
          const stale = !!staleRouteMap[route];
          const effectiveDir = effectiveDirByRoute[route];
          const polylineCount = Object.keys(dirs).length;

          return Object.entries(dirs).map(([dirKey, path]) => {
            // When stale (routes_patterns.json UUIDs don't match live API), we
            // can't reliably determine which polyline is which direction, so
            // show everything at full color. When fresh, only the selected
            // direction is full-color; the other is dimmed.
            const isSelectedDir = polylineCount === 1 || stale || dirKey === effectiveDir;
            // A rerouted direction's bundled geometry is outdated — hide it;
            // the reroute overlay below draws both the live path and the
            // dashed regular path instead.
            const isRerouted = !!reroutes[route]?.[dirKey];
            let strokeColor: string;
            if (!isActive || isRerouted) {
              strokeColor = 'rgba(0,0,0,0)';
            } else if (isSelectedDir) {
              strokeColor = color;
            } else {
              strokeColor = dimColor(color);
            }
            // Every polyline stays mounted at all times with a STABLE key
            // (route+direction only — never the color). Baking strokeColor
            // into the key was the actual bug: it forced React to unmount
            // the old-colored Polyline and mount a new one on every single
            // route/direction switch, and it's exactly that native
            // add/remove churn that leaves a ghost path behind on Android
            // (a removed overlay isn't always cleaned up promptly). With a
            // stable key, switching routes only updates strokeColor/
            // strokeWidth props on the same already-mounted native view —
            // nothing is ever added or removed, so nothing can ghost.
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

        {/* Reroute overlays — for each rerouted direction of a visible route:
            the path buses are ACTUALLY driving right now, solid in the route
            color, plus the regular path as a red dashed line so the detour is
            unmistakable (same treatment the official transit site uses).
            Rendered from `reroutesGeometry` (every entry ever seen, geometry
            kept around after the detour clears) rather than the live
            `reroutes` state, and never conditionally omitted — same
            always-mounted, STABLE-key treatment as the regular route
            polylines above. Driving this straight off `reroutes` used to
            unmount the Polyline the instant a reroute ended, which is
            exactly the native ghost/crash bug the base-polyline comment
            above describes. */}
        {Object.entries(reroutesGeometry).flatMap(([route, dirs]) => {
          const isSelected = selectedRoutes.includes('all') || selectedRoutes.includes(route);
          const color = routeColors[route] ?? '#888888';
          const stale = !!staleRouteMap[route];
          const polylineCount = Object.keys(routeLines[route] ?? {}).length;
          return Object.entries(dirs).flatMap(([dk, info]) => {
            if (!Array.isArray(info?.currentCoordinates) || info.currentCoordinates.length < 2) return [];
            if (!Array.isArray(info?.baselineCoordinates) || info.baselineCoordinates.length < 2) return [];
            // Matched by direction NAME, not raw key — see
            // isSelectedDirection. A reroute's directionKey can rotate on
            // every single poll while the detour is active, which made this
            // raw-key comparison against effectiveDirByRoute (a separately
            // and less-frequently polled snapshot) miss almost every time,
            // hiding the dashed baseline line entirely (confirmed 2026-07-15
            // on route 04).
            const isSelectedDir = polylineCount <= 1 || stale
              || isSelectedDirection(route, dk, info.directionName, effectiveDirByRoute[route]);
            // The dashed baseline is binary — fully hidden on the
            // non-selected direction — same as the proven-safe hide-based
            // version. Only the SOLID current-path line goes through a dim
            // state (thinner + faded, never hidden) on the non-selected
            // direction: a dim state on BOTH lines together is what
            // crashed on toggle before, so this narrows the risky
            // prop-mutation to a single polyline instead of two.
            const dashedVisible = isSelected && !!reroutes[route]?.[dk] && isSelectedDir;
            const solidVisible = isSelected && !!reroutes[route]?.[dk];
            const baseColor = dashedVisible ? '#DC2626' : 'rgba(0,0,0,0)';
            const curColor = !solidVisible ? 'rgba(0,0,0,0)' : isSelectedDir ? color : dimColor(color);
            // STABLE key (route+dk only), matching every other polyline in
            // this file — coordinates update in place via props instead of
            // remounting. A previous version baked the trimmed segment's
            // point count into the key to dodge a hypothesized (never
            // actually confirmed) Android crash on in-place coordinate
            // updates. But the trimmed segment's length changes almost
            // every 5-minute poll while a reroute is active, so that was
            // silently remounting these two polylines over and over for as
            // long as the reroute stayed active — which is exactly the kind
            // of native view churn this file's own base-polyline comment
            // already identified as the real Android hazard ("unmount →
            // native ghost"), not prop updates. That repeated remounting is
            // the far more likely explanation for buses glitching out and
            // the app crashing specifically on the actively-rerouted route.
            return [
              <Polyline
                key={`reroute-base-${route}-${dk}`}
                coordinates={info.baselineCoordinates}
                strokeColor={baseColor}
                strokeWidth={dashedVisible ? 3 : 0}
                lineDashPattern={[14, 10]}
                // Constant, not dashedVisible-dependent — visibility is
                // already fully handled by strokeWidth/color going to 0/
                // transparent, so zIndex never needs to move too. Route 04
                // (the only route with any geometry here — every other
                // route's reroutesGeometry entry is empty and short-circuits
                // above) was the sole route where the bus marker vanished,
                // permanently, on a direction toggle; this pair of Polylines
                // is the only thing that changes props on toggle that's
                // unique to that route, so freezing every prop we don't
                // strictly need to move removes that as a variable.
                zIndex={2}
              />,
              <Polyline
                key={`reroute-cur-${route}-${dk}`}
                coordinates={info.currentCoordinates}
                strokeColor={curColor}
                strokeWidth={solidVisible ? (isSelectedDir ? 5 : 3.5) : 0}
                zIndex={3}
              />,
            ];
          });
        })}

        {/* Bus markers — rendered after stop markers below so buses always draw on
            top when a bus and a stop coincide, reinforced by the explicit zIndex.
            Every bus stays mounted; deselected routes' buses are parked
            off-map via their AnimatedRegion (see the dedupedBuses comment
            for the history: filtered mounting crashed, opacity didn't show). */}
        {dedupedBuses.flatMap(bus => {
          const isRouteVisible = selectedRoutes.includes('all') || selectedRoutes.includes(bus.route);
          const color = routeColors[bus.route] ?? '#CC2936';
          // Dim buses on the non-selected direction. Matched by direction
          // NAME (bus.direction, e.g. "to MSC" — AggieSpirit's vehicle feed
          // already carries this directly) against selectedDirNameByRoute,
          // not bus.directionKey against effectiveDirByRoute's routeLines
          // snapshot — those are two independently-polled live sources, and
          // an actively-rerouted route's directionKey can rotate on every
          // single poll (confirmed 2026-07-15 on route 04), which made the
          // raw-key comparison miss constantly and dim buses that were
          // actually on the selected direction. Falls back to the old
          // key comparison when a name isn't available on either side (via
          // isSelectedDirection). When routes_patterns.json is stale we
          // can't trust ANY direction mapping, so staleRouteMap disables
          // dimming and shows all buses at full opacity instead of guessing.
          const isBusSelectedDir =
            selectedRoutes.includes('all') ||
            !!staleRouteMap[bus.route] ||
            bus.directionKey == null ||
            isSelectedDirection(bus.route, bus.directionKey, bus.direction, effectiveDirByRoute[bus.route]);
          const busFillColor = isBusSelectedDir ? color : dimColor(color);
          // Shared by this bus's icon, heading arrow, and (if open) its callout
          // below, so a position update glides all of them together instead of
          // each independently snapping to the new point.
          const region = getBusRegion(bus, isRouteVisible);

          const markers = [
            <Marker.Animated
              key={bus.name}
              coordinate={region as any}
              anchor={{ x: 0.5, y: 0.5 }}
              // REVERTED to false (tried always-true same day — made things
              // worse: the bus went from "sometimes disappears, recovers" to
              // "disappears and stays gone permanently" on the 04). Confirmed
              // via debug logs that the bus's own JS state/region are fine
              // when it vanishes, and confirmed the bug is 04-only (the only
              // route whose reroute-overlay Polylines actually render any
              // geometry — see below) — so the trigger is the reroute
              // overlay's prop churn on direction toggle, not this marker's
              // own tracking mode. Leave this frozen; fix the actual trigger.
              tracksViewChanges={false}
              // Must beat every polyline's zIndex, including the rerouted
              // solid overlay (max 3, see the reroute-overlay block above) —
              // a tie there let the platform's stacking order win, which on
              // iOS could put an opaque route line on top of the bus icon
              // right where the bus always sits (on its own route). Only
              // ever visible on a route with an active reroute, and only
              // sometimes (a tie's resolution isn't guaranteed), which
              // matches the route-04-only, intermittent "bus disappears"
              // report exactly.
              zIndex={10}
              onPress={() => isRouteVisible && openBusCallout(bus)}
            >
              <View
                style={styles.busMarkerWrap}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Bus ${busDisplayName(bus.name)}, route ${bus.route}${bus.direction ? `, ${bus.direction}` : ''}`}
                accessibilityHint="Shows this bus's details"
              >
                <View style={[styles.busCircleFill, { backgroundColor: busFillColor }]} />
                <View style={styles.busCircleBorder} />
                <Image source={require('../../assets/images/bus.png')} style={styles.busIcon} />
              </View>
            </Marker.Animated>,
          ];

          markers.push(
            <Marker.Animated
              key={`${bus.name}-heading`}
              coordinate={region as any}
              anchor={{ x: 0.5, y: 0.5 }}
              image={headingArrowImage(bus.heading)}
              tracksViewChanges={headingRefreshPulse}
              tappable={false}
              zIndex={9}
            />,
          );

          return markers;
        })}

        {/* Stop markers — every stop belonging to a selected route stays
            mounted for as long as that route stays selected (see routeStops
            above); within that set, stops outside the current DIRECTION
            selection are hidden via the native `opacity`/`tappable` props
            instead of being left out of this array, so flipping direction
            never adds/removes markers.
            Stops we've learned are closed (after tapping into their schedule)
            get dimmed with a red badge; we can't know this ahead of a tap
            without querying every stop's schedule upfront. */}
        {routeStops.map(stop => {
          const isVisible = selectedRoutes.includes('all') || visibleStopCodes.has(stop.code);
          const isClosed = closedStopCodes.has(stop.code);
          // A stop an active reroute skips — dimmed like a closed stop but
          // badged with an ✕ so it reads as "not served right now". Temp
          // stops are excluded: they exist ONLY because of a reroute (that's
          // what makes them temporary in the first place), so one going
          // unserved again later is expected churn, not something worth
          // flagging as "cancelled" the way a real numbered stop closing is.
          const isUnserved = unservedStopCodes.has(stop.code) && !stop.isTemporary;
          const isTimepoint = isStopTimepointForSelection(stop);
          return (
            <Marker
              // isClosed/isUnserved arrive asynchronously (schedule lookup /
              // reroute poll), after this marker's first paint. With
              // tracksViewChanges={false} the native layer snapshots the
              // marker's content exactly once and never re-measures it —
              // so a badge that appears later gets tacked onto a bitmap
              // whose anchor was already centered on the badge-less icon,
              // which is what made the icon look shifted a few pixels from
              // the badge instead of the badge sitting on its corner.
              // Keying on the badge state forces a clean remount (fresh
              // snapshot, correctly centered around icon+badge together)
              // the moment either becomes true. Visibility is NOT part of
              // this key — it's applied via opacity/tappable below so
              // toggling it never remounts the marker.
              key={`${stop.code}-${isClosed}-${isUnserved}`}
              coordinate={stop.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={false}
              opacity={isVisible ? 1 : 0}
              tappable={isVisible}
              zIndex={0}
              onPress={() => isVisible && openStopPanel(stop)}
            >
              <View
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${stop.name}, ${stop.isTemporary ? 'temporary bus stop' : isTimepoint ? 'timepoint bus stop' : 'bus stop'}${isUnserved ? ', not served right now due to a detour' : isClosed ? ', closed' : ''}`}
                accessibilityHint="Shows departure times for this stop"
              >
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
                    (isClosed || isUnserved) && styles.closedStopIcon,
                  ]}
                />
                {isUnserved ? (
                  <View style={styles.unservedStopBadge}>
                    <Text style={styles.unservedStopBadgeText}>✕</Text>
                  </View>
                ) : isClosed ? (
                  <View style={styles.closedStopBadge} />
                ) : null}
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
                  <TouchableOpacity
                    onPress={() => openFleetInfo(selectedBus.name)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`Bus ${busDisplayName(selectedBus.name)}, view fleet info`}
                  >
                    <Text style={[styles.calloutBusId, { color: c.text }]}>
                      Bus {busDisplayName(selectedBus.name)}
                    </Text>
                  </TouchableOpacity>
                  {/* Radio callsign inferred from the driver shift board
                      (server-side, see unit_assignment.py). When the match
                      isn't certain (a "best guess" at server-restart cold
                      start, with no per-bus signal to disambiguate) it's
                      shown with a "?" and muted — still useful, but not
                      presented as fact. */}
                  {unitCodesEnabled && !!selectedBus.unit && (
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

                <View
                  style={styles.barRow}
                  accessible
                  accessibilityLabel={`Approximately ${busSheetStats.dispPax} passengers on board`}
                >
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
          <Text style={[styles.panelTitle, { color: c.text }]} accessibilityRole="header">Bus Routes</Text>
          <View style={styles.badge} accessible accessibilityLabel={`${visibleBusCount} buses active`}>
            <View style={[styles.badgeDot, { backgroundColor: visibleBusCount > 0 ? '#22C55E' : c.textSecondary }]} />
            <Text style={[styles.badgeText, { color: c.textSecondary }]}>{visibleBusCount} active</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.routeSelector, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
          onPress={() => setDropdownVisible(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Select routes, currently ${routeLabel}`}
          accessibilityHint="Opens the route picker"
        >
          <Text style={[styles.routeSelectorText, { color: c.text }]} numberOfLines={1}>{routeLabel}</Text>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ── Route selector modal ───────────────────────────────────────────── */}
      <Modal visible={dropdownVisible} transparent animationType="slide" onRequestClose={() => setDropdownVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss route picker"
        />
        <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]} accessibilityRole="header">Select Routes</Text>
            <TouchableOpacity onPress={() => setDropdownVisible(false)} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.sheetDone, { color: c.tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.routeRow, selectedRoutes.includes('all') && { backgroundColor: c.tint + '15' }, { borderBottomColor: c.border }]}
            onPress={() => toggleRoute('all')}
            accessibilityRole="checkbox"
            accessibilityLabel="All routes"
            accessibilityState={{ checked: selectedRoutes.includes('all') }}
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
                .map((p: any, i) => ({ key: (p.direction_key || `pattern_${i}`).toLowerCase(), name: '' }));
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
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Route ${item}, ${info?.name ?? ''}${disruptedRoutes.has(item) ? ', has a service disruption' : ''}${isFavorite(item) ? ', favorite' : ''}`}
                  accessibilityState={{ checked: selected }}
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
                          accessibilityRole="radio"
                          accessibilityLabel={`${d.name || (directions.indexOf(d) === 0 ? 'Inbound' : 'Outbound')} direction`}
                          accessibilityState={{ checked: d.key === currentApiDir }}
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
                      accessibilityRole="button"
                      accessibilityLabel={`View service disruption for route ${item}`}
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
              <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">{selectedStop.name}</Text>
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
            <TouchableOpacity
              onPress={closeStopPanel}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close stop details"
              hitSlop={8}
            >
              <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Timepoint hold countdown — bus is early and waiting here for its scheduled leave time */}
          {stopHoldBus && holdSecondsRemaining != null && holdSecondsRemaining > 0 && (
            <View
              style={styles.holdBanner}
              // Label deliberately excludes the per-second countdown so screen
              // readers aren't re-announced every tick.
              accessible
              accessibilityRole="alert"
              accessibilityLabel={`Bus ${busDisplayName(stopHoldBus.name)} is holding here, leaves at ${holdLeaveClock}`}
            >
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

          {/* Route filter toggle — shown when specific routes are selected and times exist */}
          {!selectedRoutes.includes('all') && (stopTimes.length > 0 || stopSchedule.length > 0) && (
            <TouchableOpacity
              style={[styles.filterToggle, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              onPress={() => setShowAllStopRoutes(v => !v)}
              accessibilityRole="button"
              accessibilityLabel={showAllStopRoutes ? 'Show selected routes only' : 'Show all route times'}
            >
              <Text style={[styles.filterToggleText, { color: c.tint }]}>
                {showAllStopRoutes ? 'Show selected routes only' : 'Show all route times'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Times content. The day-browser row (Today/Tomorrow/...) is always
              visible so a rider can check any day's full schedule regardless
              of whether live estimates are currently showing — it used to be
              hidden any time live times were available, which was most of
              the time. Live view is shown when nobody's tapped a date chip
              yet (stopDate === null); tapping any chip (including "Today")
              switches to that day's full published schedule instead. */}
          {stopTimesLoading ? (
            <View style={styles.stopTimesCenter}>
              <ActivityIndicator color={c.tint} />
              <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>Loading departures…</Text>
            </View>
          ) : (
            (() => {
              const showingLive = !stopDate && stopTimes.length > 0;
              return (
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.dateChipRow}
                  >
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
                          accessibilityRole="button"
                          accessibilityLabel={`${label} schedule`}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Text style={[styles.dateChipText, { color: isSelected ? '#fff' : c.text }]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {showingLive ? (
                    visibleStopTimes.length > 0 ? (
                      <FlatList
                        data={visibleStopTimes}
                        keyExtractor={(_, i) => String(i)}
                        style={{ maxHeight: 220 }}
                        renderItem={({ item }) => <TimeEntryRow item={item} routeColors={routeColors} c={c} onPress={() => openExpandedEntry(item)} />}
                      />
                    ) : (
                      <View style={styles.stopTimesCenter}>
                        <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>
                          No upcoming times for selected routes.{'\n'}Tap “Show all route times” above.
                        </Text>
                      </View>
                    )
                  ) : !stopDate ? (
                    <View style={styles.noTimesHeader}>
                      <Text style={[styles.noTimesText, { color: c.text }]}>No more departures today</Text>
                      <Text style={[styles.noTimesSubtext, { color: c.textSecondary }]}>View scheduled times:</Text>
                    </View>
                  ) : null}

                  {stopDate && (
                    stopScheduleLoading ? (
                      <View style={styles.stopTimesCenter}>
                        <ActivityIndicator color={c.tint} />
                      </View>
                    ) : visibleStopTimes.length > 0 ? (
                      <FlatList
                        data={visibleStopTimes}
                        keyExtractor={(_, i) => String(i)}
                        style={{ maxHeight: 220 }}
                        renderItem={({ item }) => <TimeEntryRow item={item} routeColors={routeColors} c={c} onPress={() => openExpandedEntry(item)} />}
                      />
                    ) : (
                      <View style={styles.stopTimesCenter}>
                        <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>No scheduled service for this date.</Text>
                      </View>
                    )
                  )}
                </View>
              );
            })()
          )}
        </Animated.View>
      )}

      {/* ── Full-day schedule for a tapped route entry ───────────────────── */}
      {expandedEntry && (
        <Modal visible transparent animationType="fade" onRequestClose={closeExpandedEntry}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeExpandedEntry}
            accessibilityRole="button"
            accessibilityLabel="Dismiss full schedule"
          />
          <View style={[styles.fullScheduleCard, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
              <View style={[styles.stopTimePill, { backgroundColor: routeColors[expandedEntry.routeShortName] ?? '#500000' }]}>
                <Text style={styles.stopTimePillText}>{expandedEntry.routeShortName || '?'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopSheetTitle, { color: c.text }]} numberOfLines={1} accessibilityRole="header">
                  {expandedEntry.routeName || `Route ${expandedEntry.routeShortName}`}
                </Text>
                <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>{expandedEntry.direction}</Text>
              </View>
              <TouchableOpacity
                onPress={closeExpandedEntry}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close full schedule"
                hitSlop={8}
              >
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
                // This view shows the actual clock time, not a countdown — if
                // the bus is running 2 min late, that's "6:02" here (already
                // the live-adjusted time, via mergeLiveEstimates), just with
                // the dot marking it as an estimate rather than the raw
                // scheduled time. The "X min" countdown is only for the
                // compact row chips (TimeEntryRow) elsewhere.
                const isLiveEstimate = isToday && t.isEstimated && !t.isCancelled;
                return (
                  <View
                    style={[
                      styles.fullScheduleChip,
                      { backgroundColor: t.isCancelled ? 'rgba(220,38,38,0.1)' : c.surfaceAlt },
                      isPast && styles.fullScheduleChipPast,
                    ]}
                    accessible
                    accessibilityLabel={`${formatTime(t.time)}${t.isCancelled ? ', cancelled' : isPast ? ', already departed' : isLiveEstimate ? ', live estimate' : ''}`}
                  >
                    {isLiveEstimate && <View style={[styles.liveDot, { backgroundColor: c.tint }]} />}
                    <Text style={[
                      styles.fullScheduleChipText,
                      t.isCancelled ? styles.fullScheduleChipTextCancelled : { color: isPast ? c.textSecondary : c.text },
                      t.isCancelled && styles.strikethrough,
                    ]}>
                      {t.isCancelled ? `✕ ${formatTime(t.time)}` : formatTime(t.time)}
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

      {/* ── Fleet info card, opened by tapping a bus's number in its callout ── */}
      {fleetInfoBus && (
        <Modal visible transparent animationType="fade" onRequestClose={closeFleetInfo}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={closeFleetInfo}
            accessibilityRole="button"
            accessibilityLabel="Dismiss fleet info"
          />
          <View style={[styles.fleetCard, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 20 }]}>
            <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
            <View style={[styles.stopSheetHeader, { borderBottomColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stopSheetTitle, { color: c.text }]} accessibilityRole="header">
                  Bus {busDisplayName(fleetInfoBus.name)}
                </Text>
                {fleetInfoBus.info && (
                  <Text style={[styles.stopSheetSubtitle, { color: c.textSecondary }]}>
                    {fleetInfoBus.info.manufacturer} {fleetInfoBus.info.model}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={closeFleetInfo}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Close fleet info"
                hitSlop={8}
              >
                <Text style={[styles.closeBtnText, { color: c.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {fleetInfoBus.info ? (
              <ScrollView contentContainerStyle={styles.fleetBody}>
                <View style={styles.pillRow}>
                  {fleetInfoBus.info.electric && (
                    <View style={[styles.pill, { backgroundColor: '#16A34A' }]}>
                      <Text style={styles.pillText}>⚡ Electric</Text>
                    </View>
                  )}
                </View>

                <View style={styles.fleetSpecGrid}>
                  <View style={styles.fleetSpecItem}>
                    <Text style={[styles.fleetSpecLabel, { color: c.textSecondary }]}>Built</Text>
                    <Text style={[styles.fleetSpecValue, { color: c.text }]}>{fleetInfoBus.info.buildYear}</Text>
                  </View>
                  <View style={styles.fleetSpecItem}>
                    <Text style={[styles.fleetSpecLabel, { color: c.textSecondary }]}>Engine</Text>
                    <Text style={[styles.fleetSpecValue, { color: c.text }]}>{fleetInfoBus.info.engine}</Text>
                  </View>
                  {!!fleetInfoBus.info.transmission && (
                    <View style={styles.fleetSpecItem}>
                      <Text style={[styles.fleetSpecLabel, { color: c.textSecondary }]}>Transmission</Text>
                      <Text style={[styles.fleetSpecValue, { color: c.text }]}>{fleetInfoBus.info.transmission}</Text>
                    </View>
                  )}
                  {!!fleetInfoBus.info.seating && (
                    <View style={styles.fleetSpecItem}>
                      <Text style={[styles.fleetSpecLabel, { color: c.textSecondary }]}>Seating</Text>
                      <Text style={[styles.fleetSpecValue, { color: c.text }]}>{fleetInfoBus.info.seating}</Text>
                    </View>
                  )}
                </View>

                {(() => {
                  const notes = fleetNotesFor(fleetInfoBus.name, fleetInfoBus.info!);
                  return !!notes.length && (
                    <View style={styles.fleetNotes}>
                      {notes.map((note, i) => (
                        <Text key={i} style={[styles.fleetNoteText, { color: c.textSecondary }]}>
                          {'•'} {note}
                        </Text>
                      ))}
                    </View>
                  );
                })()}

                <Text style={[styles.fleetSourceText, { color: c.textSecondary }]}>
                  Fleet data via the CPTDB wiki.
                </Text>
              </ScrollView>
            ) : (
              <View style={styles.fleetBody}>
                <Text style={[styles.stopTimesHint, { color: c.textSecondary }]}>
                  No fleet data available for this bus number yet.
                </Text>
              </View>
            )}
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

  // Screen-reader summary of the visible chips — the raw children would read
  // as a jumble of symbols (live dots, "›", strikethroughs) without context.
  const timesLabel = times.length === 0
    ? 'no upcoming times'
    : times.slice(0, 4).map(t => {
        if (t.isCancelled) return `${formatTime(t.time)} cancelled`;
        const live = liveMinutesLabel(t);
        return live !== null ? `in ${live === 'Now' ? '0 minutes' : live.replace(' min', ' minutes')}` : formatTime(t.time);
      }).join(', ');

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onPress}
      style={[styles.stopTimeRow, { borderBottomColor: c.border }]}
      accessibilityRole="button"
      accessibilityLabel={`${item.routeName || `Route ${rn}`}${item.direction ? `, ${item.direction}` : ''}${item.isClosedRegularStop ? ', stop closed' : ''}${item.isTemporaryStopOnly ? ', temporary stop' : ''}. Departures: ${timesLabel}`}
      accessibilityHint="Shows the full day's schedule"
    >
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
          const liveLabel = liveMinutesLabel(t);
          return (
            <View key={i} style={[styles.timeChip, { backgroundColor: c.surfaceAlt }]}>
              {liveLabel !== null && (
                <View style={[styles.liveDot, { backgroundColor: c.tint }]} />
              )}
              <Text style={[
                styles.timeChipText,
                { color: t.isCancelled ? c.textSecondary : c.text },
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
  unservedStopBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unservedStopBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900', lineHeight: 9 },

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
    gap: 6,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 3.5 },
  badgeText: { fontSize: 13, fontWeight: '500' },
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
  holdBanner: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 14,
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

  fleetCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '50%',
    transform: [{ translateY: -150 }], // Start with ~half of min height
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 12,
    maxHeight: '60%',
  },
  fleetBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  fleetSpecGrid: { gap: 10 },
  fleetSpecItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  fleetSpecLabel: { fontSize: 13, fontWeight: '500' },
  fleetSpecValue: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  fleetNotes: { gap: 6 },
  fleetNoteText: { fontSize: 13, lineHeight: 18 },
  fleetSourceText: { fontSize: 11, marginTop: 2 },
});
