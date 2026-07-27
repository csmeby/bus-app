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
import MapView, { Marker, Polyline } from 'react-native-maps';
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
// native `image` prop - the only churn-free way to change a marker's visual
// on react-native-maps (children + tracksViewChanges caused the fleet-wide
// "TelemetryController::pullTransaction index beyond bounds" crash; keying on
// heading mass-remounted every bus at once on every poll). Static requires
// are mandatory - Metro can't resolve a computed path.
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

// Dedicated offline fallback for /route-patterns - deliberately separate from
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
  // '#abc' expands per-digit to 'aabbcc' - duplicating the whole group
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
// for, not just the imminent one - a bus can be confidently tracked toward a
// stop it won't reach for another couple hours. Converting that to "118m"
// reads as a countdown when it's really just a clock time; cap the live
// countdown display to departures actually coming up soon and let anything
// farther out show as a normal clock time.
const LIVE_ESTIMATE_MAX_MINUTES = 45;

// Swaps in live-estimated departure times over their matching scheduled
// entries - matched by closest absolute time within a 20-minute window, since
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

// Bus IDs from the API are like "B2002" - strip the leading "B" for display
// ("Bus 2002" reads better than "Bus B2002").
function busDisplayName(name: string): string {
  return name.replace(/^B(?=\d)/, '');
}

// Sort key for "numerical order" route lists - reads the leading digits of
// a route short name ("01-04" -> 1, "12" -> 12) so routes sort by number
// rather than lexicographically ("12" before "3"). Routes with no leading
// digits sort last.
function routeNumberSortKey(routeShortName: string | undefined): number {
  const m = (routeShortName ?? '').match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// bus.delay comes from the server's bus_delay.py - an approximate schedule
// offset (see that module's docstring for how, and its caveats), or null
// when it couldn't be confidently computed. Deliberately not shown for a
// null delay rather than falling back to "On time" - we don't actually know
// that, we just don't know the delay either.
function busDelayLabel(delay: { minutes: number } | null | undefined): string | null {
  if (!delay || typeof delay.minutes !== 'number') return null;
  if (delay.minutes === 0) return 'On time';
  const mins = Math.abs(delay.minutes);
  return `${mins}m ${delay.minutes > 0 ? 'late' : 'early'}`;
}

// Upstream amenity shapes aren't pinned down yet - fall back through the
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
  // route -> is this stop a timepoint FOR THAT ROUTE - a shared physical stop can be a
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

// Which "half" of a route a direction_key belongs to - sourced from the
// bundled/live pattern's own object key ("inbound"/"outbound"/"pattern_N"),
// NOT from the live /routes API's display name, which isn't consistently
// "Inbound"/"Outbound" text (e.g. route 03's directions are named "to White
// Creek" / "to MSC"). 'circulator' covers the routes with only one pattern
// (loops with no inbound/outbound distinction at all).
type DirKind = 'inbound' | 'outbound' | 'circulator';

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
  // pattern (own route's or any sibling's) - without this the server can say
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

  // Whether we've been granted location permission - gates showsUserLocation
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
  // Driven off the bus poll (every 10s - the most frequent heartbeat this
  // screen has) rather than any single fetch, so a one-off blip doesn't
  // flash the banner; only sustained failure does. Shown as a small banner
  // near the panel below so a rider browsing offline knows what they're
  // looking at is a saved snapshot, not live data.
  const [isOffline, setIsOffline] = useState(false);
  const busFetchFailuresRef = useRef(0);

  // Buses are plain Markers with a direct coordinate prop (see the
  // BusMarker/BusHeadingMarker components below), NOT Marker.Animated +
  // AnimatedRegion - that combination was tried two different ways (parking
  // hidden buses at (0,0), then hiding via the `opacity` prop instead) and
  // BOTH failed to reliably show a bus again after a route switch, even
  // though debug logging proved the underlying coordinate value was always
  // correct. The glide between poll positions (see
  // useGlideCoordinate/GlidingBus below) is faked entirely in JS on top of
  // this same plain Marker - re-rendering with a slightly-updated
  // coordinate every animation frame - specifically so gliding doesn't
  // require touching Marker.Animated/AnimatedRegion at all.
  //
  // Visibility itself (mountedBuses below) mounts/unmounts a bus's Marker
  // by route selection, same as stops (routeStops) - an EARLIER version of
  // this file instead kept every bus always-mounted and toggled `opacity`
  // to hide/show, on the theory that plain Marker "reliably honors opacity"
  // the way stops seemed to. In practice that had its own silent failure:
  // after a bus had been opacity-hidden for a while - especially following
  // a big excursion through "All Routes" - flipping opacity back up
  // sometimes just never redisplayed it (no crash, no log, the "N active"
  // badge count still correct the whole time). Mount/unmount sidesteps that
  // by always giving a freshly-selected bus a brand-new native view rather
  // than depending on an existing hidden one to wake back up correctly.
  const [routeLines, setRouteLines] = useState<Record<string, Record<string, { latitude: number; longitude: number }[]>>>({});
  // route -> dirKey -> inbound/outbound/circulator, see DirKind above.
  const [routeDirKinds, setRouteDirKinds] = useState<Record<string, Record<string, DirKind>>>({});
  const [stops, setStops] = useState<Stop[]>([]);
  // Backing store for `stops`, persisted across every applyPatterns() call
  // this session - see the comment inside applyPatterns for why this can't
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
  // polylines - mounting/unmounting a Polyline (which plain `reroutes`
  // would do the instant a detour ends) is what was crashing the app on
  // Android when a reroute cleared.
  const [reroutesGeometry, setReroutesGeometry] = useState<Record<string, Record<string, RerouteDir>>>({});
  // Route short names with an active service disruption per /news (construction
  // reroutes, closures, etc) - shown as a warning badge in the route picker.
  const [disruptedRoutes, setDisruptedRoutes] = useState<Set<string>>(new Set());

  // Routes the user has chosen to see on the map. Starts empty on every
  // launch - nothing is drawn until the rider actively picks a route.
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(new Set());
  const [routePickerOpen, setRoutePickerOpen] = useState(false);

  // Normally 'slide' (the sheet's own open/close animation). Forced to
  // 'none' for the one instant right before navigating to the disruptions
  // screen - closing the modal via its usual slide-down WHILE the stack
  // push transition also plays made that tap feel like two animations
  // stacked back to back instead of one. Reset to 'slide' every time the
  // picker is (re)opened so its normal dismiss (✕/backdrop tap) is unaffected.
  const [routePickerAnimation, setRoutePickerAnimation] = useState<'slide' | 'none'>('slide');
  // route -> the dirKey the rider has explicitly picked as "full strength"
  // for that route. Unset falls back to whichever pattern is labeled
  // 'inbound' (see routeDirKinds / getPrimaryDir) - the rider can flip it
  // per route since that label isn't always the real-world correct side
  // (see the DirKind comment above).
  const [routePrimaryDir, setRoutePrimaryDir] = useState<Record<string, string>>({});

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
  // Markers/polylines are gated on this instead of mounting the instant this
  // component does. Without it, the very first `/buses` response (often
  // 20-40 buses, 2 markers each - icon + heading arrow - mounting in one
  // React commit) can land before the native map view's own shadow tree has
  // finished initializing, racing react-native-maps' Fabric mounting
  // instructions against the map's own setup. Matches the observed
  // "insertObject:atIndex: index N beyond bounds" native crash (a mounting
  // instruction batch sized for a tree that doesn't exist yet) and its
  // "random" flakiness (a timing race, not a deterministic bug) exactly.
  const [mapReady, setMapReady] = useState(false);

  const [holdTick, setHoldTick] = useState(() => Date.now());

  // ── bus callout ──────────────────────────────────────────────────────────
  // react-native-maps' native <Callout> dismisses itself on basically any prop
  // update to its parent Marker (coordinate, even unrelated re-renders) - tried
  // freezing the callout's content, then also its marker's coordinate, and it
  // still closed within a poll or two. A JS-side overlay positioned via
  // pointForCoordinate was tried next, but it only repositions on
  // onRegionChangeComplete, so it visibly lagged behind/detached during a
  // drag gesture. The fix: render it as a second plain Marker (no Callout)
  // sharing the bus's coordinate - a real native annotation pans/zooms in
  // perfect lockstep with the map (same as the bus icon and heading-arrow
  // markers already do), and isn't a Callout, so nothing auto-dismisses it.
  const [selectedBusName, setSelectedBusName] = useState<string | null>(null);
  // Last-known full data for the selected bus - keeps the callout showing
  // something sensible for a poll or two if the bus briefly drops out of
  // /buses (GPS gap) instead of the content disappearing out from under the user.
  const [busSnapshot, setBusSnapshot] = useState<any | null>(null);
  const [fleetInfoBus, setFleetInfoBus] = useState<{ name: string; info: FleetBlock | null } | null>(null);

  // ── route helpers ──────────────────────────────────────────────────────────

  // route -> true when the live /routes API direction UUIDs don't match any of
  // the bundled polyline keys - i.e. routes_patterns.json is from a previous
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

  // Which of a route's (at most two) dirKeys currently renders at full
  // strength: the rider's explicit pick (routePrimaryDir) if it's still a
  // real key for this route, else whichever pattern paths.py labeled
  // 'inbound', else just the first key. undefined for a route with no
  // patterns loaded yet.
  const getPrimaryDir = useCallback((route: string): string | undefined => {
    const keys = Object.keys(routeLines[route] ?? {});
    if (keys.length === 0) return undefined;
    const picked = routePrimaryDir[route];
    if (picked && keys.includes(picked)) return picked;
    return keys.find(k => routeDirKinds[route]?.[k] === 'inbound') ?? keys[0];
  }, [routeLines, routeDirKinds, routePrimaryDir]);

  const setRouteDirection = useCallback((route: string, dirKey: string) => {
    setRoutePrimaryDir(prev => ({ ...prev, [route]: dirKey }));
  }, []);

  // A shared stop can be a timepoint for one route and not another (see
  // paths.py's TIMEPOINT_ROUTE_EXCLUSIONS), so this depends on which route(s)
  // are actually in view rather than being a fixed property of the stop.
  const isStopTimepointForSelection = (stop: Stop): boolean => {
    return stop.routes.some(r => selectedRoutes.has(r) && stop.timepointRoutes[r]);
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const routeColors = useMemo(() => {
    const m: Record<string, string> = {};
    Object.entries(routeInfo).forEach(([r, info]) => { m[r] = info.color; });
    return m;
  }, [routeInfo]);

  // /buses can carry duplicate entries for the same physical bus (seen
  // across overlapping direction groups) - collapse to one marker per name.
  const dedupedBuses = useMemo(() => {
    const m = new Map<string, any>();
    buses.forEach(b => { if (b?.name) m.set(b.name, b); });
    return Array.from(m.values());
  }, [buses]);

  // Buses on a selected route MOUNT/unmount (array-filtered), the same
  // pattern already used for stops (see routeStops), instead of staying
  // permanently mounted and toggling `opacity` to hide/show. The
  // always-mounted-plus-opacity approach was deliberately chosen earlier
  // this project specifically to avoid a native crash - but that crash was
  // documented against Marker.Animated + AnimatedRegion, not against plain
  // Marker (which is what BusMarker/BusHeadingMarker already are, same as
  // StopMarker's mount/unmount-safe composed path). In practice, the
  // opacity approach turned out to have its own bug: after a bus's route
  // had been hidden for a while - especially following a big excursion
  // through "All Routes" - flipping its `opacity` back up sometimes just
  // silently failed to redisplay it (no crash, no log, badge count still
  // correct), and only re-selecting through a slow, small-batch route
  // sequence would reliably bring it back. A fresh mount always renders
  // correctly the first time, sidestepping that failure mode entirely
  // rather than trying to patch around it.
  const mountedBuses = useMemo(
    () => dedupedBuses.filter(bus => selectedRoutes.has(bus.route)),
    [dedupedBuses, selectedRoutes]
  );

  // Per-bus opacity within the mounted set: full strength on the route's
  // primary direction (or a circulator/stale route with no reliable
  // direction split), a bit translucent on the other direction - same
  // treatment as the route polylines below, and the same rider-picked
  // "primary" (see getPrimaryDir/routePrimaryDir). Direction changes only
  // ever affect this opacity map, never mountedBuses above - so toggling
  // direction can't trigger a mount/unmount, only a route (de)selection can.
  const busOpacity = useMemo(() => {
    const m = new Map<string, number>();
    mountedBuses.forEach(bus => {
      const stale = !!staleRouteMap[bus.route];
      const kind = routeDirKinds[bus.route]?.[bus.directionKey] ?? 'circulator';
      const primary = getPrimaryDir(bus.route);
      const isSecondary = !stale && kind !== 'circulator' && bus.directionKey !== primary;
      m.set(bus.name, isSecondary ? 0.55 : 1);
    });
    return m;
  }, [mountedBuses, staleRouteMap, routeDirKinds, getPrimaryDir]);

  // Count for the "N active" badge - every currently-mounted (i.e.
  // selected-route) bus, regardless of direction dimming.
  const visibleBusCount = mountedBuses.length;

  // Stop codes an active reroute on a currently-selected route is skipping
  // right now - by definition these are MISSING from that route's live
  // pattern (reroute_watch.py computes unservedStops server-side the same
  // way), so they'd otherwise vanish from the map the moment the detour
  // starts. Scoped to selectedRoutes (not direction - see visibleStopCodes
  // below for the direction-accurate version) so an unrelated route's
  // closure doesn't pull in a stop nobody's currently looking at.
  const unservedStopCodesForSelection = useMemo(() => {
    const s = new Set<string>();
    Object.entries(reroutes).forEach(([route, dirs]) => {
      if (!selectedRoutes.has(route)) return;
      Object.values(dirs).forEach(d => (d.unservedStops ?? []).forEach(code => s.add(code)));
    });
    return s;
  }, [reroutes, selectedRoutes]);

  // Which stops render as markers AT ALL - tied to the CURRENT route
  // selection, same as buses (mountedBuses). A previous version of this
  // mounted a stop once its route had EVER been selected and never
  // unmounted it again, on the theory that removing an already-mounted
  // marker was the specifically unreliable native operation for stops. That
  // held up for the "select individual routes" case, but broke down exactly
  // the way this comment now knows to check for: once "All Routes" gets
  // selected even once, EVERY route joins the ever-selected set, so EVERY
  // stop in the system stays permanently mounted from then on - meaning
  // every subsequent route (de)selection becomes pure opacity toggling on
  // an already-mounted marker, which is the EXACT pattern that failed for
  // buses (opacity flipping back to visible silently not redisplaying).
  // Mounting/unmounting by current selection is what actually fixed that
  // for buses, so stops use the same approach now.
  const routeStops = useMemo(
    () => stops.filter(stop =>
      unservedStopCodesForSelection.has(stop.code) || stop.routes.some(r => selectedRoutes.has(r))),
    [stops, selectedRoutes, unservedStopCodesForSelection]
  );

  // Of the mounted routeStops, which should render at full opacity for the
  // CURRENT direction pick - the part that's allowed to change on every
  // direction toggle without unmounting anything (routeStops above doesn't
  // change). An unserved stop only counts if the reroute skipping it is on
  // the route's current primary direction (or the route's mapping is stale,
  // in which case direction can't be trusted either way - see
  // staleRouteMap) - otherwise a detour on the direction you're NOT looking
  // at would badge a stop that has nothing to do with what's on screen.
  const { visibleStopCodes, unservedVisibleStopCodes } = useMemo(() => {
    const visible = new Set<string>();
    const unserved = new Set<string>();
    routeStops.forEach(stop => {
      const unservedHere = Object.entries(reroutes).some(([route, dirs]) => {
        if (!selectedRoutes.has(route)) return false;
        const stale = !!staleRouteMap[route];
        const primary = getPrimaryDir(route);
        return Object.entries(dirs).some(([dk, info]) =>
          (info.unservedStops ?? []).includes(stop.code) && (stale || dk === primary));
      });
      if (unservedHere) {
        visible.add(stop.code);
        unserved.add(stop.code);
        return;
      }
      // No `keys.length === 0` "show regardless" fallback here on purpose:
      // that case is a stop with NO live-pattern evidence of belonging to
      // any specific direction of this route - either it's a
      // reroute-seeded phantom (dirKeys deliberately left `{}`, see the
      // /reroutes effect) or a stop long since dropped from every live
      // pattern (a route permanently rerouted around it - see the
      // "permanent route recovery" notes elsewhere in this codebase).
      // Showing it unconditionally on EVERY direction was exactly the bug:
      // a stop permanently closed on inbound kept showing as a plain,
      // unbadged stop on outbound too, because it no longer has an active
      // /reroutes entry (handled above) but still lingered in `stops` from
      // whenever it was last actually observed. staleRouteMap is a
      // different, legitimate case - a whole route's live/bundled direction
      // UUIDs don't line up, not a specific stop's phantom status - so that
      // still shows regardless.
      const show = stop.routes.some(r => {
        if (!selectedRoutes.has(r)) return false;
        if (staleRouteMap[r]) return true;
        const keys = stop.dirKeys[r] ?? [];
        if (keys.length === 0) return false;
        // Match by direction KIND (inbound/outbound/circulator), not raw
        // dirKey equality. stop.dirKeys accumulates additively across every
        // applyPatterns call this session and never prunes (see that
        // function's comments) - so it can still hold an OLDER
        // direction_key UUID for a route whose live keys have since
        // rotated. AggieSpirit does rotate these, confirmed on actively-
        // rerouted routes (see the reroute-matching notes elsewhere in this
        // file) - and getPrimaryDir always reads the CURRENT routeLines
        // keys, so a raw UUID equality check here would silently stop
        // matching the moment a route's keys rotated, hiding stops that are
        // still completely legitimate for the route's current primary
        // direction. routeDirKinds is keyed the same (possibly-stale) way
        // stop.dirKeys is, so this bridges the gap either way.
        const primaryKind = routeDirKinds[r]?.[getPrimaryDir(r) ?? ''] ?? 'circulator';
        return keys.some(k => (routeDirKinds[r]?.[k] ?? 'circulator') === primaryKind);
      });
      if (show) visible.add(stop.code);
    });
    return { visibleStopCodes: visible, unservedVisibleStopCodes: unserved };
  }, [routeStops, selectedRoutes, staleRouteMap, getPrimaryDir, reroutes, routeDirKinds]);


  // Favorited routes (set in Settings) float to the top; stable sort keeps
  // everything else in its original order.
  const sortedRoutes = useMemo(() => {
    return [...ALL_ROUTES].sort((a, b) => {
      const aFav = isFavorite(a) ? 0 : 1;
      const bFav = isFavorite(b) ? 0 : 1;
      return aFav - bFav;
    });
  }, [isFavorite]);

  const routeSelectorLabel = useMemo(() => {
    if (selectedRoutes.size === 0) return 'Select routes';
    if (selectedRoutes.size === ALL_ROUTES.length) return 'All Routes';
    if (selectedRoutes.size === 1) return `Route ${[...selectedRoutes][0]}`;
    return `${selectedRoutes.size} routes selected`;
  }, [selectedRoutes]);

  const toggleRoute = useCallback((route: string) => {
    setSelectedRoutes(prev => {
      const next = new Set(prev);
      if (next.has(route)) next.delete(route); else next.add(route);
      return next;
    });
  }, []);

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

    // Default view is scoped to the route(s) currently selected on the map
    // - tapping a stop while "Route 12" is open shouldn't dump every route
    // that happens to share this physical stop into the panel. "All Stop
    // Times" (showAllStopRoutes) lifts that filter. Fuzzy startsWith match
    // (not strict equality) so a combined route like "01-04" still matches
    // whichever of "01"/"04" the rider has selected, and vice versa.
    const filtered = showAllStopRoutes
      ? processed
      : processed.filter(entry => {
          const rn = entry.routeShortName ?? '';
          return [...selectedRoutes].some(r => rn.startsWith(r) || r.startsWith(rn));
        });

    if (showAllStopRoutes) {
      // Numerical order across every route serving this stop, regardless
      // of which have upcoming departures.
      return [...filtered].sort((a, b) => routeNumberSortKey(a.routeShortName) - routeNumberSortKey(b.routeShortName));
    }
    // Routes with no departures that day sink to the bottom instead of
    // cluttering the top with empty rows. Array.sort is stable, so routes
    // within each group (has times / no times) keep their original order.
    return [...filtered].sort((a, b) => {
      const aEmpty = a.departureTimes.length === 0 ? 1 : 0;
      const bEmpty = b.departureTimes.length === 0 ? 1 : 0;
      return aEmpty - bEmpty;
    });
  }, [stopTimes, stopSchedule, stopDate, showAllStopRoutes, selectedRoutes]);

  // ── data loading ───────────────────────────────────────────────────────────

  useEffect(() => {
    // Paint immediately from the bundled snapshot, then swap in the server's
    // freshly-built patterns (current-semester direction UUIDs) when they
    // arrive. The bundle is only a cold-start/offline fallback - the server
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
        // Offline - fall back to the last-known-good server copy, if any
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
    const kinds: Record<string, Record<string, DirKind>> = {};
    // Seeded from every stop ever merged in this session (bundled fallback,
    // then each live /route-patterns poll), NOT reset per call. A stop that's
    // currently CLOSED by a reroute is, by definition, missing from the live
    // pattern's patternPoints - that's exactly how reroute_watch.py computes
    // unservedStops server-side. Resetting this map on every fetch meant the
    // very first live poll after app launch would silently drop any
    // currently-closed stop's only coordinate/name data (the bundled
    // fallback has it; the live pattern never will while the closure is
    // active), leaving unservedStopCodes naming a stop that had no marker
    // left to badge. routeLines stays a full per-call replace (below) since
    // the live geometry - including an active reroute's actual driven path -
    // must always win; only the stop catalog needs to be additive.
    const stopMap = stopMapRef;
    // Temp stops (stop_type===1, "T0410" etc.) are the one category that
    // does NOT belong in the additive/never-shrinks model above - unlike a
    // regular stop (which can be legitimately absent from a single fetch
    // while a reroute has it closed, and must keep its old entry so the
    // unserved badge has something to attach to), a temp stop exists ONLY
    // because of an active reroute in the first place. Once a fetch stops
    // reporting it at all, the reroute that created it has ended and it
    // should disappear permanently - otherwise it lingers in "All Routes"
    // view (which renders the full unfiltered `stops` accumulation) forever
    // for the rest of the session, a phantom marker for a detour that's
    // long over. Tracked across this call's full route set (every route is
    // always present in a real payload) and swept at the end.
    const seenTempCodes = new Set<string>();

    Object.entries(source).forEach(([route, routeData]) => {
      const { patterns } = routeData as any;
      const routeDirs: Record<string, { latitude: number; longitude: number }[]> = {};
      const routeKinds: Record<string, DirKind> = {};

      // Key by the real direction_key UUID (matches /routes live data) rather than
      // guessing "inbound"/"outbound" from the pattern name - those labels are just
      // an artifact of the order paths.py happened to receive patterns in and don't
      // reflect the route's actual direction names (e.g. route 03 is "to White Creek"
      // / "to MSC", not inbound/outbound at all).
      //
      // That said, the object key itself (paths.py's `labels = ["inbound",
      // "outbound"]`, or "pattern_N" for a single-pattern circulator) is a
      // stable, always-present binary split per route, even though it's
      // arbitrary about which literal side of the road it lands on. It's the
      // only per-route "which of the (at most) two patterns is this" signal
      // available, so it's what drives the full-strength-vs-thinner styling
      // - not a claim that it points the right way in the real world.
      Object.entries(patterns as Record<string, any>).forEach(([patternKey, pattern], idx) => {
        if (!pattern.coordinates) return;
        const dirKey: string = (pattern.direction_key || `pattern_${idx}`).toLowerCase();

        routeDirs[dirKey] = (pattern.coordinates as any[]).map(({ lat, lng }) => ({
          latitude: lat,
          longitude: lng,
        }));
        const pk = patternKey.toLowerCase();
        routeKinds[dirKey] = pk === 'inbound' ? 'inbound' : pk === 'outbound' ? 'outbound' : 'circulator';

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
      kinds[route] = routeKinds;
    });

    // Sweep temp stops this call no longer confirms - see seenTempCodes
    // above. Runs after every applyPatterns call (bundled seed included),
    // so a stale temp stop baked into the bundled fallback snapshot gets
    // cleaned up the moment the first live fetch fails to reconfirm it.
    for (const [code, stop] of stopMap) {
      if (stop.isTemporary && !seenTempCodes.has(code)) stopMap.delete(code);
    }

    setRouteLines(lines);
    setRouteDirKinds(kinds);
    setStops(Array.from(stopMap.values()));
  }

  useEffect(() => {
    // Route names/colors/directions barely ever change mid-semester - serve
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

  // Bus loading - completely rebuilt
  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadBuses = async () => {
      try {
        const res = await fetch(`${API_BASE}/buses`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: any[] = await res.json();

        // Normalize direction keys
        const normalizedData = data.map(b => ({
          ...b,
          directionKey: b.directionKey?.toLowerCase()
        }));

        if (isMounted) {
          setBuses(normalizedData);
          busFetchFailuresRef.current = 0;
          setIsOffline(false);
        }
      } catch (e) {
        console.warn('Bus fetch failed:', e);
        if (isMounted) {
          busFetchFailuresRef.current += 1;
          if (busFetchFailuresRef.current >= 2) setIsOffline(true);
        }
      }
    };

    // Initial load
    loadBuses();

    // Set up polling
    intervalId = setInterval(loadBuses, 10000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
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
          // RerouteDir). Added once and kept for the session - a stable,
          // one-time mount, not per-poll churn - so the unserved badge has a
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

  // ── route bounds for zoom-to-fit ─────────────────────────────────────────
  const selectedRouteBounds = useMemo(() => {
    const activeRoutes = Array.from(selectedRoutes);
    if (activeRoutes.length === 0) return null;
    
    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;
    let hasCoords = false;

    activeRoutes.forEach(route => {
      const dirs = routeLines[route];
      if (!dirs) return;
      
      Object.values(dirs).forEach(coords => {
        coords.forEach(({ latitude, longitude }) => {
          minLat = Math.min(minLat, latitude);
          maxLat = Math.max(maxLat, latitude);
          minLng = Math.min(minLng, longitude);
          maxLng = Math.max(maxLng, longitude);
          hasCoords = true;
        });
      });
    });

    if (!hasCoords) return null;

    const latPadding = (maxLat - minLat) * 0.2;
    const lngPadding = (maxLng - minLng) * 0.2;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) + latPadding * 2, 0.005),
      longitudeDelta: Math.max((maxLng - minLng) + lngPadding * 2, 0.005),
    };
  }, [selectedRoutes, routeLines]);

  // ── zoom to fit selected routes ──────────────────────────────────────────
  const previousSelectedRoutesRef = useRef<Set<string>>(new Set());
  const animateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const prev = previousSelectedRoutesRef.current;
    
    // Check if selection actually changed
    const changed = selectedRoutes.size !== prev.size || 
      Array.from(selectedRoutes).some(r => !prev.has(r));
    
    if (changed) {
      // Clear any pending animation
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
      
      // Don't animate if nothing is selected
      if (selectedRoutes.size === 0) return;
      
      // Small delay to let polylines render
      animateTimeoutRef.current = setTimeout(() => {
        if (selectedRouteBounds && mapRef.current) {
          mapRef.current.animateToRegion(selectedRouteBounds, 800);
        }
        animateTimeoutRef.current = null;
      }, 100);
    }
    
    previousSelectedRoutesRef.current = new Set(selectedRoutes);
  }, [selectedRoutes, selectedRouteBounds]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
        animateTimeoutRef.current = null;
      }
    };
  }, []);

  // ── bus callout ────────────────────────────────────────────────────────────

  const closeBusCallout = useCallback(() => {
    setSelectedBusName(null);
    setBusSnapshot(null);
  }, []);

  // Deselecting a bus's route unmounts its marker (see mountedBuses) - its
  // callout shouldn't keep floating over a bus that's no longer shown.
  useEffect(() => {
    if (!selectedBusName) return;
    const bus = buses.find(b => b.name === selectedBusName) ?? busSnapshot;
    if (bus && !selectedRoutes.has(bus.route)) closeBusCallout();
  }, [selectedRoutes, selectedBusName, buses, busSnapshot, closeBusCallout]);

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
      // fetched, so a stale cache fallback here is never actually wrong -
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

    const relevantRoutes = stop.routes;

    // Only the direction(s) that actually serve this stop - querying every
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
  }, [stopPanelAnim, selectedBusName, closeBusCallout, fetchStopSchedule]);

  // Tapping a route row to "see all times for the day": when browsing a
  // specific date (stopDate set), the row already came from the full-day
  // schedule fetch, so it's complete. But the default live view's rows come
  // from GetNextDepartTimes, which AggieSpirit only ever returns the next
  // ~3 upcoming departures for - not the whole day. So for that case, fetch
  // today's actual full schedule and swap in the matching route+direction's
  // complete departure list instead of just re-showing those same 3.
  const openExpandedEntry = useCallback(async (item: TimeEntry) => {
    const reqId = ++expandedReqIdRef.current;
    setExpandedEntry(item);
    // Tracked separately from stopDate, which can change/clear while this
    // modal is still open - "is this time in the past" only makes sense
    // relative to whichever date this specific entry's times actually belong to.
    const date = stopDate ?? toDateStr(new Date());
    setExpandedEntryDate(date);
    if (!selectedStop) return;
    // Always swap in the complete day's schedule for this route+direction:
    // the live view's rows only carry the next ~3 departures, and the today-
    // schedule fallback's rows are filtered to upcoming times only - either
    // way the tapped row is incomplete for a "full day" view. Past times
    // render dimmed (see the isPast style in the modal) rather than hidden.
    try {
      const data = await cachedJsonFetch<StopTimesPayload>(
        `${API_BASE}/stop/${selectedStop.code}/schedule?date=${date}`,
        `stop-schedule:${selectedStop.code}:${date}`,
      );
      // Modal closed (or reopened for another row) while this was in flight -
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
    // Only one panel at a time - opening a bus while the stop sheet is open
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
      delayLabel: busDelayLabel(selectedBus.delay),
    };
  }, [selectedBus, routeLines]);

  // The callout marker's tracksViewChanges was left hard-`true` (its content -
  // passengers/off-route/unit - updates live), but that means every re-render
  // while it's open forces react-native-maps to re-snapshot a marker with rich
  // children, which under this app's Fabric/New Architecture setup is the same
  // native-mounting crash family already hit and fixed elsewhere in this file
  // - just triggered by opening a callout instead of a bus poll. Same fix:
  // pulse tracksViewChanges only when the callout's actual visible content
  // changes (or first opens), not continuously.
  const [calloutRefreshPulse, setCalloutRefreshPulse] = useState(false);
  useEffect(() => {
    if (!selectedBusName) return;
    setCalloutRefreshPulse(true);
    const id = setTimeout(() => setCalloutRefreshPulse(false), 100);
    return () => clearTimeout(id);
  }, [selectedBusName, busSheetStats]);

  // ── timepoint hold countdown ───────────────────────────────────────────────

  // A bus is "holding" at the selected stop if /buses says so for it - see
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

  // Reference point for the depleting bar fill: "how much hold time was left
  // when we first saw this hold" - recomputed only when the hold's target
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
        onMapReady={() => setMapReady(true)}
      >
        {/* Nothing below mounts until the native map view itself is ready -
            see mapReady above for why. */}
        {mapReady && <>
        {/* Always render ALL polylines, for every route whether selected or
            not; use a transparent/zero-width line for anything hidden to
            prevent the native layer from retaining ghost polylines (see the
            file-level notes on why nothing here ever conditionally
            unmounts). Selected + the route's primary direction (or a
            circulator/stale route, which have no reliable direction split)
            draws at full strength; the other direction draws thinner and
            dimmed so it still reads as part of the route without competing
            with the primary line. Which direction counts as primary is the
            rider's own per-route pick - see getPrimaryDir/routePrimaryDir. */}
        {Object.entries(routeLines).flatMap(([route, dirs]) => {
          const color = routeColors[route] ?? '#888888';
          const stale = !!staleRouteMap[route];
          const selected = selectedRoutes.has(route);
          const primary = getPrimaryDir(route);

          return Object.entries(dirs).map(([dirKey, path]) => {
            const kind = routeDirKinds[route]?.[dirKey] ?? 'circulator';
            const isSecondary = !stale && kind !== 'circulator' && dirKey !== primary;
            const strokeColor = !selected ? 'rgba(0,0,0,0)' : isSecondary ? dimColor(color) : color;
            const strokeWidth = !selected ? 0 : isSecondary ? 3 : 5;
            // Every polyline stays mounted at all times with a STABLE key
            return (
              <Polyline
                key={`line-${route}-${dirKey}`}
                coordinates={[...path]}
                strokeColor={strokeColor}
                strokeWidth={strokeWidth}
                zIndex={isSecondary ? 1 : 2}
              />
            );
          });
        })}

        {/* Reroute overlays - for each rerouted direction of a visible route:
            the path buses are ACTUALLY driving right now, solid in the route
            color, plus the regular path as a red dashed line so the detour is
            unmistakable (same treatment the official transit site uses).
            Rendered from `reroutesGeometry` (every entry ever seen, geometry
            kept around after the detour clears) rather than the live
            `reroutes` state, and never conditionally omitted - same
            always-mounted, STABLE-key treatment as the regular route
            polylines above. Driving this straight off `reroutes` used to
            unmount the Polyline the instant a reroute ended, which is
            exactly the native ghost/crash bug the base-polyline comment
            above describes. */}
        {Object.entries(reroutesGeometry).flatMap(([route, dirs]) => {
          const color = routeColors[route] ?? '#888888';
          const stale = !!staleRouteMap[route];
          const routeSelected = selectedRoutes.has(route);
          const primary = getPrimaryDir(route);
          return Object.entries(dirs).flatMap(([dk, info]) => {
            if (!Array.isArray(info?.currentCoordinates) || info.currentCoordinates.length < 2) return [];
            if (!Array.isArray(info?.baselineCoordinates) || info.baselineCoordinates.length < 2) return [];
            const active = routeSelected && !!reroutes[route]?.[dk];
            const kind = routeDirKinds[route]?.[dk] ?? 'circulator';
            const isSecondary = !stale && kind !== 'circulator' && dk !== primary;
            // The red "this is what you're missing" dashed baseline only
            // makes sense for the direction currently at full strength - on
            // the secondary direction it's dropped entirely (not just
            // thinned) rather than cluttering the dimmed line with a second,
            // differently-colored one.
            const baseActive = active && !isSecondary;
            const baseColor = baseActive ? '#DC2626' : 'rgba(0,0,0,0)';
            const curColor = !active ? 'rgba(0,0,0,0)' : isSecondary ? dimColor(color) : color;
            // STABLE key (route+dk only), matching every other polyline in
            // this file - coordinates update in place via props instead of
            // remounting.
            return [
              <Polyline
                key={`reroute-base-${route}-${dk}`}
                coordinates={info.baselineCoordinates}
                strokeColor={baseColor}
                strokeWidth={baseActive ? 3 : 0}
                lineDashPattern={[14, 10]}
                zIndex={2}
              />,
              <Polyline
                key={`reroute-cur-${route}-${dk}`}
                coordinates={info.currentCoordinates}
                strokeColor={curColor}
                strokeWidth={active ? (isSecondary ? 3 : 5) : 0}
                zIndex={3}
              />,
            ];
          });
        })}

        {/* Bus markers - rendered after stop markers below so buses always draw on
            top when a bus and a stop coincide, reinforced by the explicit zIndex.
            Only buses on a currently-selected route mount at all (see
            mountedBuses above); direction-level dimming within that set is
            opacity only, via busOpacity. Rendered via GlidingBus (icon +
            heading arrow sharing one glide position - see
            useGlideCoordinate), each of which owns its own
            tracksViewChanges lifecycle scoped to ITS OWN content changes. */}
        {mountedBuses.map(bus => {
          const color = routeColors[bus.route] ?? '#CC2936';
          const opacity = busOpacity.get(bus.name) ?? 1;
          return (
            <GlidingBus
              key={bus.name}
              bus={bus}
              fillColor={color}
              opacity={opacity}
              tappable
              onPress={() => openBusCallout(bus)}
            />
          );
        })}

        {/* Stop markers - every stop in routeStops (route-selection scoped,
            see above) stays mounted regardless of direction; direction-level
            visibility is opacity only, via visibleStopCodes. Rendered via
            the StopMarker subcomponent below, which owns its own `ready`
            state (and self-heal pulse) so tracksViewChanges only ever locks
            to false AFTER its icon has actually laid out - see StopMarker
            for why. */}
        {routeStops.map(stop => (
          <StopMarker
            key={stop.code}
            stop={stop}
            isVisible={visibleStopCodes.has(stop.code)}
            isClosed={closedStopCodes.has(stop.code)}
            isUnserved={unservedVisibleStopCodes.has(stop.code)}
            isTimepoint={isStopTimepointForSelection(stop)}
            onPress={() => openStopPanel(stop)}
          />
        ))}

        {/* Bus callout - a second plain Marker (not <Callout>) sharing the
            selected bus's coordinate, anchored so its bottom edge (the pointer
            tip) sits right above the bus icon. Being a real marker, it pans/
            zooms with the map exactly like every other marker here; being a
            Marker and not a Callout, nothing auto-dismisses it on updates.
            tracksViewChanges is on since its content (speed/passengers/hold)
            changes live - acceptable for the one currently-selected bus. */}
        {selectedBusName && selectedBus && busSheetStats && (
          <Marker
            key={`${selectedBus.name}-callout`}
            coordinate={{ latitude: selectedBus.lat, longitude: selectedBus.lon }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={calloutRefreshPulse}
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
                      shown with a "?" and muted - still useful, but not
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
                {busSheetStats.delayLabel && (
                  <Text style={[styles.delayLabel, { color: c.textSecondary }]}>{busSheetStats.delayLabel}</Text>
                )}
              </View>
              <View style={[styles.calloutPointer, { borderTopColor: sheetBg }]} />
            </View>
          </Marker>
        )}
        </>}
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
          onPress={() => { setRoutePickerAnimation('slide'); setRoutePickerOpen(true); }}
          accessibilityRole="button"
          accessibilityLabel={`${routeSelectorLabel}. Tap to change which routes are shown`}
        >
          <Text style={[styles.routeSelectorText, { color: c.text }]} numberOfLines={1}>{routeSelectorLabel}</Text>
          <Text style={[styles.chevron, { color: c.textSecondary }]}>›</Text>
        </TouchableOpacity>
        {isOffline && (
          <View
            style={styles.offlineBanner}
            accessible
            accessibilityRole="alert"
            accessibilityLabel="No connection. Showing saved routes. Bus positions and live times aren't available right now."
          >
            <MaterialIcons name="cloud-off" size={13} color="#92400E" />
            <Text style={styles.offlineBannerText}>No connection. Showing saved routes</Text>
          </View>
        )}
      </View>

      {/* ── Route selector modal ───────────────────────────────────────────── */}
      <Modal visible={routePickerOpen} transparent animationType={routePickerAnimation} onRequestClose={() => setRoutePickerOpen(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoutePickerOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Dismiss route picker"
        />
        <View style={[styles.sheet, { backgroundColor: sheetBg, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
          <View style={[styles.sheetHeader, { borderBottomColor: c.border }]}>
            <Text style={[styles.sheetTitle, { color: c.text }]} accessibilityRole="header">Select Routes</Text>
            <TouchableOpacity onPress={() => setRoutePickerOpen(false)} accessibilityRole="button" hitSlop={8}>
              <Text style={[styles.sheetDone, { color: c.tint }]}>Done</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.routeRow, selectedRoutes.size === ALL_ROUTES.length && { backgroundColor: c.tint + '15' }, { borderBottomColor: c.border }]}
            onPress={() => setSelectedRoutes(selectedRoutes.size === ALL_ROUTES.length ? new Set() : new Set(ALL_ROUTES))}
            accessibilityRole="checkbox"
            accessibilityLabel="All routes"
            accessibilityState={{ checked: selectedRoutes.size === ALL_ROUTES.length }}
          >
            <View style={[styles.routeTag, { backgroundColor: selectedRoutes.size === ALL_ROUTES.length ? c.tint : c.surfaceAlt }]}>
              <Text style={[styles.routeTagText, { color: selectedRoutes.size === ALL_ROUTES.length ? '#fff' : c.textSecondary }]}>ALL</Text>
            </View>
            <Text style={[styles.routeName, { color: c.text }]}>All Routes</Text>
            {selectedRoutes.size === ALL_ROUTES.length && <Text style={[styles.checkmark, { color: c.tint }]}>✓</Text>}
          </TouchableOpacity>

          <FlatList
            data={sortedRoutes}
            keyExtractor={item => item}
            renderItem={({ item: route }) => {
              const selected = selectedRoutes.has(route);
              const info = routeInfo[route];
              const color = routeColors[route] ?? c.tint;
              const stale = !!staleRouteMap[route];
              const dirKeys = Object.keys(routeLines[route] ?? {});
              const hasMultipleDirs = dirKeys.length > 1;
              const primary = getPrimaryDir(route);
              return (
                <TouchableOpacity
                  style={[styles.routeRowContainer, selected && { backgroundColor: c.tint + '15' }, { borderBottomColor: c.border }]}
                  onPress={() => toggleRoute(route)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Route ${route}, ${info?.name ?? ''}${disruptedRoutes.has(route) ? ', has a service disruption' : ''}${isFavorite(route) ? ', favorite' : ''}`}
                  accessibilityState={{ checked: selected }}
                >
                  <View style={styles.routeRowTop}>
                    <View style={[styles.routeTag, { backgroundColor: selected ? color : c.surfaceAlt }]}>
                      <Text style={[styles.routeTagText, { color: selected ? '#fff' : c.text }]}>{route}</Text>
                    </View>
                    <Text style={[styles.routeName, { color: c.text }]} numberOfLines={1}>
                      {info?.name ?? `Route ${route}`}
                    </Text>
                    {disruptedRoutes.has(route) && <Text style={styles.disruptionWarning}>⚠</Text>}
                    {isFavorite(route) && <Text style={styles.favoriteStar}>★</Text>}
                    {selected && <Text style={[styles.checkmark, { color }]}>✓</Text>}
                  </View>
                  {selected && hasMultipleDirs && !stale && (
                    <View style={styles.dirToggleWrap}>
                      {dirKeys.map(dirKey => {
                        const kind = routeDirKinds[route]?.[dirKey];
                        const label = info?.directions.find(d => d.key === dirKey)?.name
                          || (kind === 'outbound' ? 'Outbound' : 'Inbound');
                        const isPrimary = dirKey === primary;
                        return (
                          <TouchableOpacity
                            key={dirKey}
                            style={[styles.dirChipFull, { backgroundColor: c.surfaceAlt }, isPrimary && { backgroundColor: color }]}
                            onPress={e => { e.stopPropagation?.(); setRouteDirection(route, dirKey); }}
                            accessibilityRole="radio"
                            accessibilityLabel={`${label} direction`}
                            accessibilityState={{ checked: isPrimary }}
                          >
                            <Text numberOfLines={1} style={[styles.dirChipFullText, { color: isPrimary ? '#fff' : c.textSecondary }]}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {selected && disruptedRoutes.has(route) && (
                    <TouchableOpacity
                      style={styles.disruptionButton}
                      onPress={e => {
                        e.stopPropagation?.();
                        setRoutePickerAnimation('none');
                        setRoutePickerOpen(false);
                        router.push({ pathname: '/disruptions', params: { route } } as any);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`View service disruption for route ${route}`}
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

          {/* Timepoint hold countdown - bus is early and waiting here for its scheduled leave time */}
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

          {/* Route filter toggle - only worth showing when this physical
              stop actually serves more than one route; otherwise "All Stop
              Times" would just show the exact same single row. */}
          {selectedStop.routes.length > 1 && (
            <TouchableOpacity
              style={[styles.filterToggle, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}
              onPress={() => setShowAllStopRoutes(v => !v)}
              accessibilityRole="button"
              accessibilityLabel={showAllStopRoutes ? 'Show selected route only' : 'Show all stop times'}
            >
              <Text style={[styles.filterToggleText, { color: c.tint }]}>
                {showAllStopRoutes ? 'Show Selected Route Only' : 'All Stop Times'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Times content. The day-browser row (Today/Tomorrow/...) is always
              visible so a rider can check any day's full schedule regardless
              of whether live estimates are currently showing - it used to be
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
                          No upcoming times for your selected route.{'\n'}Tap “All Stop Times” above.
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
                anymore", but for different reasons - keep them visually
                distinct rather than collapsing to one muted style: cancelled
                gets a red strikethrough (it never ran), passed just dims
                (it ran fine, it's just behind us already). Only meaningful
                for today's date - a future day has nothing "passed" yet. */}
            <FlatList
              data={expandedEntry.departureTimes}
              keyExtractor={(_, i) => String(i)}
              numColumns={3}
              contentContainerStyle={styles.fullScheduleGrid}
              renderItem={({ item: t }) => {
                const isToday = expandedEntryDate === toDateStr(new Date());
                const parsed = new Date(t.time);
                const isPast = !t.isCancelled && isToday && !isNaN(parsed.getTime()) && parsed.getTime() < Date.now();
                // This view shows the actual clock time, not a countdown - if
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

// ── sub-component: bus marker ───────────────────────────────────────────────
//
// Self-contained refresh lifecycle, same pattern as StopMarker below -
// deliberately NOT driven by any shared/global pulse state. The previous
// version gated every bus marker's tracksViewChanges on one shared boolean
// that got flipped both on every 10s bus poll AND on every selectedRoutes
// change. Toggling a second route on meant a batch of buses flipping
// opacity 0→1 at the SAME instant every bus in the fleet (visible or not)
// was told to re-snapshot - a large simultaneous batch of native mounting
// instructions, the same crash pattern documented elsewhere in this file
// for heading arrows and stop markers. Scoping the pulse to each marker's
// own content (this bus's fill color only) means opening a route only ever
// changes cheap props (opacity/tappable) on however many markers are
// affected, and never touches tracksViewChanges for the fleet at once.
// Interpolates a bus's displayed lat/lon toward its latest polled position
// over `durationMs` instead of snapping there instantly, WITHOUT
// react-native-maps' Marker.Animated/AnimatedRegion - that combination is
// documented elsewhere in this file as having twice, independently, failed
// to reliably show a bus again after its route was deselected then
// reselected, even though the underlying coordinate was provably correct.
// This drives the exact same plain, non-Animated <Marker coordinate={...}>
// this file already relies on for reliable opacity/visibility - the glide
// is faked entirely in JS by re-rendering with a slightly-updated coordinate
// on every animation frame, so there's no Animated-specific native code path
// for opacity to ever break inside. currentRef (not React state) holds the
// authoritative in-flight position so a new poll landing mid-glide starts
// its tween from wherever the bus visually is right now, not from a stale
// value captured in a closure.
function useGlideCoordinate(targetLat: number, targetLon: number, durationMs = 900) {
  const currentRef = useRef({ lat: targetLat, lon: targetLon });
  const [, forceTick] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = { ...currentRef.current };
    const startTime = Date.now();
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const tick = () => {
      const t = Math.min(1, (Date.now() - startTime) / durationMs);
      currentRef.current = {
        lat: start.lat + (targetLat - start.lat) * t,
        lon: start.lon + (targetLon - start.lon) * t,
      };
      forceTick(n => n + 1);
      rafRef.current = t < 1 ? requestAnimationFrame(tick) : null;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [targetLat, targetLon, durationMs]);

  return currentRef.current;
}

function BusMarker({
  bus,
  fillColor,
  opacity,
  tappable,
  onPress,
}: {
  bus: any;
  fillColor: string;
  opacity: number;
  tappable: boolean;
  onPress: () => void;
}) {
  const [ready, setReady] = useState(false);

  return (
    <Marker
      coordinate={{ latitude: bus.lat, longitude: bus.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      opacity={opacity}
      tappable={tappable}
      tracksViewChanges={!ready}
      zIndex={10}
      onPress={onPress}
    >
      <View
        style={styles.busMarkerWrap}
        onLayout={() => requestAnimationFrame(() => setReady(true))}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Bus ${busDisplayName(bus.name)}, route ${bus.route}${bus.direction ? `, ${bus.direction}` : ''}`}
        accessibilityHint="Shows this bus's details"
      >
        <View style={[styles.busCircleFill, { backgroundColor: fillColor }]} />
        <View style={styles.busCircleBorder} />
        <Image source={require('../../assets/images/bus.png')} style={styles.busIcon} />
      </View>
    </Marker>
  );
}

// Heading-arrow marker. Same self-contained approach as BusMarker above,
// pulsing tracksViewChanges only when THIS bus's own heading value changes
// (a new arrow image needs rasterizing) - never in lockstep with any other
// bus. Image-only marker (no child View), so there's no onLayout to hook;
// "ready" locks after two animation frames post-mount instead, which is
// enough headroom for the image prop to have actually been applied natively
// before the first snapshot locks in.
function BusHeadingMarker({ bus, opacity }: { bus: any; opacity: number }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return (
    <Marker
      coordinate={{ latitude: bus.lat, longitude: bus.lon }}
      anchor={{ x: 0.5, y: 0.5 }}
      image={headingArrowImage(bus.heading)}
      opacity={opacity}
      tracksViewChanges={!ready}
      tappable={false}
      zIndex={9}
    />
  );
}

// Pairs a bus's icon and heading-arrow markers with ONE shared glide
// position (see useGlideCoordinate) so they move in perfect lockstep rather
// than each independently tweening off slightly different timing.
function GlidingBus({
  bus,
  fillColor,
  opacity,
  tappable,
  onPress,
}: {
  bus: any;
  fillColor: string;
  opacity: number;
  tappable: boolean;
  onPress: () => void;
}) {
  const pos = useGlideCoordinate(bus.lat, bus.lon);
  const glidingBus = pos.lat === bus.lat && pos.lon === bus.lon ? bus : { ...bus, lat: pos.lat, lon: pos.lon };
  return (
    <>
      <BusMarker
        bus={glidingBus}
        fillColor={fillColor}
        opacity={opacity}
        tappable={tappable}
        onPress={onPress}
      />
      <BusHeadingMarker bus={glidingBus} opacity={opacity} />
    </>
  );
}

// ── sub-component: stop marker ──────────────────────────────────────────────
//
// tracksViewChanges used to be hard-frozen `false` inline on this Marker.
// That tells MapKit/react-native-maps to snapshot the custom child View
// exactly once, at mount, and never re-snapshot it. If that one snapshot
// races the child View's own layout/paint (the same mount-time race already
// documented and fixed for the bus icon and heading-arrow markers above -
// see BusMarker/BusHeadingMarker), MapKit has nothing to rasterize and
// silently substitutes its own default red drop-pin instead. Because
// tracksViewChanges never flipped back to true, that marker was stuck
// showing the stock pin for the rest of its mounted life - and worse, the
// stock pin ignores the `opacity` prop this file relies on for hiding
// deselected-route stops, so a stop that lost the race could show a full-
// opacity red pin on a route that isn't even selected. This is the
// "occasional default iPhone pin sitting on a closed route" symptom.
//
// The onLayout+double-rAF timing fix below (still used for the badged path)
// cut the frequency down but never eliminated it - under a bursty mount
// (hundreds of stops landing in one commit) or heavy native load during a
// zoom/pan, the race is still there to lose, and a lost marker's cached
// default-pin bitmap is exactly the kind of thing iOS can also duplicate
// visually under memory/tile-cache pressure. The real fix, for the vast
// majority of stops that carry no badge: skip the composed-child-view
// snapshot entirely by rendering the icon via the native `image` prop
// instead - same churn-free technique BusHeadingMarker already uses for
// this identical race, and one that doesn't need a snapshot to go right in
// the first place because there's no child view to rasterize. Only a
// closed/unserved stop, which still needs its little badge overlaid, pays
// for the composed-view path (and its residual race) below.
function StopMarker({
  stop,
  isVisible,
  isClosed,
  isUnserved,
  isTimepoint,
  onPress,
}: {
  stop: Stop;
  isVisible: boolean;
  isClosed: boolean;
  isUnserved: boolean;
  isTimepoint: boolean;
  onPress: () => void;
}) {
  const badged = isClosed || isUnserved;
  const [ready, setReady] = useState(false);

  // Re-arms readiness whenever this marker flips between the plain
  // image-only rendering and the composed badge rendering below - each is a
  // different native representation needing its own settle-and-snapshot
  // pass, so a stale `ready` from the other mode can't be inherited across
  // a badge toggle. Drives readiness outright for the plain path (no child
  // view to wait on layout for); the composed path instead waits for its
  // own onLayout below.
  useEffect(() => {
    setReady(false);
    if (badged) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [badged]);

  if (!badged) {
    return (
      <Marker
        coordinate={stop.coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        // Marker's `image` prop renders at the asset's own intrinsic size -
        // unlike an <Image style={{width,height}}>, it does NOT scale down
        // to fit a style box. temp_stop.png/timepoint.png/stop.png are
        // full-resolution source art (used at much bigger sizes elsewhere -
        // help.tsx's legend, and the composed badge marker path below,
        // both of which size them via a normal <Image style>), so using
        // them directly here rendered every plain stop at native pixel
        // size - comically huge. These *_marker variants are pre-scaled
        // (with @2x/@3x siblings) to the point size this icon used to
        // render at via style, specifically for this prop.
        image={stop.isTemporary
          ? require('../../assets/images/temp_stop_marker.png')
          : isTimepoint
          ? require('../../assets/images/timepoint_marker.png')
          : require('../../assets/images/stop_marker.png')}
        opacity={isVisible ? 1 : 0}
        tappable={isVisible}
        tracksViewChanges={!ready}
        zIndex={0}
        onPress={() => isVisible && onPress()}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${stop.name}, ${stop.isTemporary ? 'temporary bus stop' : isTimepoint ? 'timepoint bus stop' : 'bus stop'}`}
        accessibilityHint="Shows departure times for this stop"
      />
    );
  }

  return (
    <Marker
      coordinate={stop.coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      // !ready covers the initial mount snapshot - see onLayout below.
      tracksViewChanges={!ready}
      opacity={isVisible ? 1 : 0}
      tappable={isVisible}
      zIndex={0}
      onPress={() => isVisible && onPress()}
    >
      <View
        onLayout={() => {
          // One more frame after layout so the Image has actually had a
          // chance to paint before the snapshot locks in.
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${stop.name}, ${stop.isTemporary ? 'temporary bus stop' : isTimepoint ? 'timepoint bus stop' : 'bus stop'}${isUnserved ? ', not served right now due to a detour' : ', closed'}`}
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
            styles.closedStopIcon,
          ]}
        />
        {isUnserved ? (
          <View style={styles.unservedStopBadge}>
            <Text style={styles.unservedStopBadgeText}>✕</Text>
          </View>
        ) : (
          <View style={styles.closedStopBadge} />
        )}
      </View>
    </Marker>
  );
}

// ── sub-component: time entry row ─────────────────────────────────────────────

function TimeEntryRow({ item, routeColors, c, onPress }: { item: TimeEntry; routeColors: Record<string, string>; c: any; onPress: () => void }) {
  const rn = item.routeShortName || '';
  const color = routeColors[rn] ?? '#500000';
  const times = item.departureTimes ?? [];

  // Screen-reader summary of the visible chips - the raw children would read
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
  // like bus.png) rather than stop.png's padded pin shape - sized down so
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
  delayLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  offlineBannerText: { fontSize: 12, fontWeight: '600', color: '#92400E' },

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
  // Visually distinct from the direction toggle above it - warning-tinted so
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