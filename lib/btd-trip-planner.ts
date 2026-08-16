// Client-side trip planner for BTD routes - unlike AggieSpirit's server-side
// planner (server/trip_planner.py), BTD has no live bus tracking or live
// schedule API at all (confirmed - it's schedule based), so there's nothing
// a network round trip would buy here. Runs entirely offline against
// btd_routes.json, the same bundled file the map/schedule screens use.
//
// Route 04/Yellow is an out-and-back corridor, not a loop - its normal
// "stops" list is merged/deduped across both directions of travel (see
// (btd)/map.tsx's own comment), so a stop's position there doesn't
// correspond to a single chronological pass the way it does for every
// other route. Its real per-direction stop order and times instead live in
// "directionalSequences" (two ordered stop lists, one per direction) - a
// one-time extraction from BTD's GTFS feed (see git history for the
// extraction script; the GTFS data itself isn't bundled or depended on at
// runtime, only this baked-in result is).
//
// Searches itineraries using as many transfers as the network genuinely
// requires - a round-based (RAPTOR-style) earliest-arrival search, one round
// per additional bus boarding, rather than a fixed 0/1-transfer cap. BTD's
// hub-and-spoke layout means plenty of real trips need 2-3+ transfers; this
// finds and surfaces those instead of quietly falling back to a walk-only
// result. See planBtdTrip's own comments for the round-by-round mechanics.
import btdRoutesRaw from '../btd_routes.json';

const EARTH_RADIUS_MI = 3958.8;
const WALK_SPEED_MPH = 3.0;
const WALK_CIRCUITY_FACTOR = 1.3;
const MAX_WALK_MILES = 0.6;
const MAX_TRANSFER_WALK_MILES = 0.3;
const MAX_STOPS_PER_SIDE = 6;
const MAX_ITINERARIES = 5;
// One round = one additional bus boarding. Generous headroom - on this
// network's 9 route sequences the search converges (no further
// improvement) in practice well before this, so it's a safety bound on
// iteration count, not a real cap on how many transfers a trip can use.
const MAX_ROUNDS = 8;
// Small margin before the actual scheduled departure - covers the walk
// itself plus not wanting to arrive at an empty stop the instant the bus
// pulls away. See server/trip_planner.py's identical LEAVE_BUFFER_MINUTES.
const LEAVE_BUFFER_MINUTES = 5;

export type LatLon = { lat: number; lon: number };

export type Leg = {
  type: 'walk' | 'wait' | 'bus';
  description: string;
  minutes: number;
  distanceMiles?: number;
  route?: string;
  routeName?: string;
  color?: string;
  path?: LatLon[];
  departTime?: string;
};

export type Itinerary = {
  totalMinutes: number;
  departTime: string;
  arriveTime: string;
  legs: Leg[];
  // True when the rider gave an "arrive by" deadline and this itinerary's
  // real arrival is after it - still surfaced (see pickBest's own comment
  // on why walk/bus options are never hard-dropped for missing the
  // window), just flagged so the UI can warn instead of silently showing a
  // time that doesn't actually meet the ask.
  missesDeadline?: boolean;
};

export type PlanResult = {
  feasible: boolean;
  itineraries: Itinerary[];
  message: string | null;
};

type BtdStopEntry = { key: string; label: string; lat: number; lng: number; times: string[]; number: number };
type BtdRoute = {
  name: string;
  color: string;
  terminal: string;
  description: string | null;
  stops: BtdStopEntry[];
  path: { lat: number; lng: number }[];
  // Route 04/Yellow only - see this file's top comment.
  directionalSequences?: BtdStopEntry[][];
};

const btdRoutes = btdRoutesRaw as Record<string, BtdRoute>;

export function knownBtdStops(): { key: string; label: string; lat: number; lng: number; routes: string[] }[] {
  const byKey = new Map<string, { key: string; label: string; lat: number; lng: number; routes: string[] }>();
  for (const [routeNum, route] of Object.entries(btdRoutes)) {
    for (const s of route.stops) {
      const existing = byKey.get(s.key);
      if (existing) {
        if (!existing.routes.includes(routeNum)) existing.routes.push(routeNum);
      } else {
        byKey.set(s.key, { key: s.key, label: s.label, lat: s.lat, lng: s.lng, routes: [routeNum] });
      }
    }
  }
  return Array.from(byKey.values());
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dphi / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dlambda / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

function walkMinutes(miles: number): number {
  return ((miles * WALK_CIRCUITY_FACTOR) / WALK_SPEED_MPH) * 60;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseHHMM(hhmm: string, dateStr: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(`${dateStr}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}

// value: 'HH:MM', applied to fallback's date. Falls back untouched if unset.
function applyTimeOfDay(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback;
  const [h, m] = value.split(':').map(Number);
  const d = new Date(fallback);
  d.setHours(h, m, 0, 0);
  return d;
}

// ── Route sequences ────────────────────────────────────────────────────
// A "sequence" is one ordered, chronologically-walkable stop list. Every
// route has exactly one, EXCEPT Yellow, which has two (one per direction -
// see this file's top comment) - modeled uniformly here so the rest of the
// planner never needs to special-case Yellow again.
type RouteSequence = { seqId: string; routeNum: string; routeName: string; color: string; stops: BtdStopEntry[] };

const ROUTE_SEQUENCES: RouteSequence[] = (() => {
  const out: RouteSequence[] = [];
  for (const [routeNum, route] of Object.entries(btdRoutes)) {
    if (route.directionalSequences?.length) {
      route.directionalSequences.forEach((stops, i) => {
        out.push({ seqId: `${routeNum}-${i}`, routeNum, routeName: route.name, color: route.color, stops });
      });
    } else {
      out.push({ seqId: routeNum, routeNum, routeName: route.name, color: route.color, stops: route.stops });
    }
  }
  return out;
})();

type Occurrence = { seq: RouteSequence; stop: BtdStopEntry; stopIndex: number };

// One hop in a reconstructed itinerary's chain, as recorded by the
// round-based search below - `fromStopKey` (absent only on the very first,
// origin-anchored hop) is what lets reconstruct() walk the chain backward
// from a destination stop to the origin.
type HopParent =
  | { kind: 'origin-walk'; toStop: BtdStopEntry; distanceMiles: number }
  | { kind: 'walk'; fromStopKey: string; fromStop: BtdStopEntry; toStop: BtdStopEntry; distanceMiles: number }
  | { kind: 'bus'; fromStopKey: string; seq: RouteSequence; boardStop: BtdStopEntry; boardTime: Date; alightStop: BtdStopEntry; alightTime: Date };

const ALL_OCCURRENCES: Occurrence[] = ROUTE_SEQUENCES.flatMap(seq =>
  seq.stops.map((stop, stopIndex) => ({ seq, stop, stopIndex }))
);

// Every occurrence at a given physical stop (by key), across every route/
// direction that serves it - used by transfer search to ask "what can I
// catch from here?" without rescanning everything each time.
const OCCURRENCES_BY_STOP_KEY: Map<string, Occurrence[]> = (() => {
  const map = new Map<string, Occurrence[]>();
  for (const occ of ALL_OCCURRENCES) {
    if (!map.has(occ.stop.key)) map.set(occ.stop.key, []);
    map.get(occ.stop.key)!.push(occ);
  }
  return map;
})();

// Every distinct physical stop within MAX_TRANSFER_WALK_MILES of each
// other, self included at distance 0 (a same-stop "transfer" - just a
// different route calling at the same physical stop, no walking at all).
const STOP_NEIGHBORS: Map<string, { key: string; dist: number }[]> = (() => {
  const uniqueStops = new Map<string, { lat: number; lng: number }>();
  for (const occ of ALL_OCCURRENCES) {
    if (!uniqueStops.has(occ.stop.key)) uniqueStops.set(occ.stop.key, { lat: occ.stop.lat, lng: occ.stop.lng });
  }
  const keys = Array.from(uniqueStops.keys());
  const map = new Map<string, { key: string; dist: number }[]>();
  for (const a of keys) {
    const pa = uniqueStops.get(a)!;
    const neighbors: { key: string; dist: number }[] = [];
    for (const b of keys) {
      const pb = uniqueStops.get(b)!;
      const dist = haversineMiles(pa.lat, pa.lng, pb.lat, pb.lng);
      if (dist <= MAX_TRANSFER_WALK_MILES) neighbors.push({ key: b, dist });
    }
    map.set(a, neighbors);
  }
  return map;
})();

// Every occurrence within max_miles, capped to `limit` distinct PHYSICAL
// stops (not `limit` occurrences) so one stop served by several
// routes/directions can't crowd out a farther stop that's a rider's only
// option on a different route - same reasoning as trip_planner.py's
// _nearest.
function nearest(lat: number, lon: number, maxMiles: number, limit: number): { dist: number; occ: Occurrence }[] {
  const byKey = new Map<string, { dist: number; occs: Occurrence[] }>();
  for (const occ of ALL_OCCURRENCES) {
    const dist = haversineMiles(lat, lon, occ.stop.lat, occ.stop.lng);
    if (dist > maxMiles) continue;
    const existing = byKey.get(occ.stop.key);
    if (existing) existing.occs.push(occ);
    else byKey.set(occ.stop.key, { dist, occs: [occ] });
  }
  const closest = Array.from(byKey.values()).sort((a, b) => a.dist - b.dist).slice(0, limit);
  const scored: { dist: number; occ: Occurrence }[] = [];
  for (const { dist, occs } of closest) for (const occ of occs) scored.push({ dist, occ });
  scored.sort((a, b) => a.dist - b.dist);
  return scored;
}

// Earliest entry in a stop's (already-ascending) times list at or after
// `floor`, with its index - the index is what lets a caller look up the
// SAME physical run's time at a different stop on the same sequence.
function earliestRunAtOrAfter(times: string[], floor: Date, dateStr: string): { index: number; time: Date } | null {
  for (let i = 0; i < times.length; i++) {
    const t = parseHHMM(times[i], dateStr);
    if (t >= floor) return { index: i, time: t };
  }
  return null;
}

function nearestPathIndex(path: { lat: number; lng: number }[], lat: number, lng: number): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  path.forEach((p, i) => {
    const d = haversineMiles(lat, lng, p.lat, p.lng);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  });
  return bestIdx;
}

// The boarded segment of a route's polyline, board-stop to alight-stop -
// stops aren't exact points on `path` (it's OSRM-generated, see
// server/btd_paths.py), so this snaps each to its nearest path point first.
function routeSegmentPath(routeNum: string, stopA: BtdStopEntry, stopB: BtdStopEntry): LatLon[] {
  const path = btdRoutes[routeNum]?.path ?? [];
  if (path.length === 0) {
    return [{ lat: stopA.lat, lon: stopA.lng }, { lat: stopB.lat, lon: stopB.lng }];
  }
  const idxA = nearestPathIndex(path, stopA.lat, stopA.lng);
  const idxB = nearestPathIndex(path, stopB.lat, stopB.lng);
  const segment = idxB >= idxA ? path.slice(idxA, idxB + 1) : [...path.slice(idxA), ...path.slice(0, idxB + 1)];
  return segment.map(p => ({ lat: p.lat, lon: p.lng }));
}

function walkLeg(from: LatLon, to: LatLon, description: string, miles: number): Leg {
  return { type: 'walk', description, minutes: Math.round(walkMinutes(miles)), distanceMiles: round2(miles), path: [from, to] };
}

export function planBtdTrip(
  origin: LatLon,
  destination: LatLon,
  opts: { departAfter?: string; arriveBy?: string; date?: string }
): PlanResult {
  const now = new Date();
  const targetDate = opts.date || toDateStr(now);
  const isToday = targetDate === toDateStr(now);
  const dayBase = new Date(`${targetDate}T00:00:00`);

  // Mon-Fri only, 5 AM - 7 PM - see (btd)/schedule.tsx's own hours card.
  const weekday = dayBase.getDay();
  if (weekday === 0 || weekday === 6) {
    return {
      feasible: false,
      itineraries: [],
      message: 'BTD routes don\'t run on weekends. Pick a weekday to plan a trip.',
    };
  }

  const defaultEarliest = isToday ? now : dayBase;
  const earliestDepart = opts.departAfter ? applyTimeOfDay(opts.departAfter, defaultEarliest) : defaultEarliest;
  const latestArrive = opts.arriveBy ? applyTimeOfDay(opts.arriveBy, dayBase) : null;
  const arriveByMode = !!opts.arriveBy && !opts.departAfter;

  const candidates: Itinerary[] = [];

  // Walk-only fallback - always offered, and never hard-dropped for
  // missing the deadline (flagged via missesDeadline instead). Some riders
  // can't walk at all, but for the ones who can, "here's the walk, it just
  // runs late" beats no walking option at all.
  const directMiles = haversineMiles(origin.lat, origin.lon, destination.lat, destination.lon);
  const wmin = walkMinutes(directMiles);
  const walkLeave = arriveByMode && latestArrive
    ? new Date(Math.max(latestArrive.getTime() - wmin * 60000, earliestDepart.getTime()))
    : earliestDepart;
  const walkArrive = new Date(walkLeave.getTime() + wmin * 60000);
  candidates.push({
    totalMinutes: Math.round(wmin),
    departTime: walkLeave.toISOString(),
    arriveTime: walkArrive.toISOString(),
    missesDeadline: !!latestArrive && walkArrive > latestArrive,
    legs: [walkLeg(origin, destination, 'Walk the entire way', directMiles)],
  });

  const originCandidates = nearest(origin.lat, origin.lon, MAX_WALK_MILES, MAX_STOPS_PER_SIDE);
  const destCandidates = nearest(destination.lat, destination.lon, MAX_WALK_MILES, MAX_STOPS_PER_SIDE);

  // Every stop on a sequence reachable from a given board index, in real
  // travel order - stops after the boarding index come on the SAME run
  // (boardIndex); stops at or before it are only reached after the bus
  // loops back around, i.e. the NEXT run (boardIndex + 1). Loop routes'
  // hub/terminal stops are very often index 0 (the start of the loop) -
  // without this wraparound, boarding anywhere past index 0 could never
  // reach back around to that hub at all, which silently broke transfer
  // search for exactly the hub-and-spoke pattern this system uses (see git
  // history for the real trip this was caught on: Blue stop 5 -> Maroon
  // stop 8, transferring at Midtown Terminal, itself index 0 on both).
  function reachableStops(seq: RouteSequence, fromIndex: number, boardIndex: number): { stop: BtdStopEntry; runIndex: number }[] {
    const out: { stop: BtdStopEntry; runIndex: number }[] = [];
    seq.stops.forEach((stop, i) => {
      if (i === fromIndex) return;
      const runIndex = i > fromIndex ? boardIndex : boardIndex + 1;
      if (runIndex < stop.times.length) out.push({ stop, runIndex });
    });
    return out;
  }

  // ── Round-based (RAPTOR-style) multi-transfer search ────────────────────
  // Round 0 seeds every stop within walking distance of the origin. Each
  // round after that is ONE more bus boarding: round k's arrival/parent
  // maps start as a copy of round k-1's (everything already found stays
  // valid), then get improved by (a) boarding a bus from any stop newly
  // reached in round k-1, and (b) walking from any stop a bus just reached
  // THIS round to a nearby stop on another route. This supports as many
  // transfers as the network genuinely needs - no fixed cap, just
  // MAX_ROUNDS as a safety bound (the loop converges and stops early once a
  // round finds nothing new to improve).
  const arrivalByRound: Map<string, Date>[] = [];
  const parentByRound: Map<string, HopParent>[] = [];

  const round0Arrival = new Map<string, Date>();
  const round0Parent = new Map<string, HopParent>();
  for (const { dist, occ } of originCandidates) {
    const arrive = new Date(earliestDepart.getTime() + walkMinutes(dist) * 60000);
    const existingSeed = round0Arrival.get(occ.stop.key);
    if (!existingSeed || arrive < existingSeed) {
      round0Arrival.set(occ.stop.key, arrive);
      round0Parent.set(occ.stop.key, { kind: 'origin-walk', toStop: occ.stop, distanceMiles: dist });
    }
  }
  arrivalByRound.push(round0Arrival);
  parentByRound.push(round0Parent);

  let frontier = new Set(round0Arrival.keys());
  for (let k = 1; k <= MAX_ROUNDS && frontier.size > 0; k++) {
    const prevArrival = arrivalByRound[k - 1];
    const arrival = new Map(prevArrival);
    const parent = new Map(parentByRound[k - 1]);
    const touchedByBus = new Set<string>();

    for (const stopKey of frontier) {
      const floor = prevArrival.get(stopKey)!;
      for (const occ of OCCURRENCES_BY_STOP_KEY.get(stopKey) ?? []) {
        const board = earliestRunAtOrAfter(occ.stop.times, floor, targetDate);
        if (!board) continue;
        for (const { stop, runIndex } of reachableStops(occ.seq, occ.stopIndex, board.index)) {
          const arrive = parseHHMM(stop.times[runIndex], targetDate);
          const existingArrival = arrival.get(stop.key);
          if (existingArrival && arrive >= existingArrival) continue;
          arrival.set(stop.key, arrive);
          parent.set(stop.key, {
            kind: 'bus', fromStopKey: stopKey, seq: occ.seq,
            boardStop: occ.stop, boardTime: board.time, alightStop: stop, alightTime: arrive,
          });
          touchedByBus.add(stop.key);
        }
      }
    }

    const touchedByWalk = new Set<string>();
    for (const stopKey of touchedByBus) {
      const arrive = arrival.get(stopKey)!;
      const fromStop = OCCURRENCES_BY_STOP_KEY.get(stopKey)?.[0]?.stop;
      if (!fromStop) continue;
      for (const { key: neighborKey, dist } of STOP_NEIGHBORS.get(stopKey) ?? []) {
        if (neighborKey === stopKey) continue;
        const toStop = OCCURRENCES_BY_STOP_KEY.get(neighborKey)?.[0]?.stop;
        if (!toStop) continue;
        const arriveAtNeighbor = new Date(arrive.getTime() + walkMinutes(dist) * 60000);
        const existingNeighborArrival = arrival.get(neighborKey);
        if (existingNeighborArrival && arriveAtNeighbor >= existingNeighborArrival) continue;
        arrival.set(neighborKey, arriveAtNeighbor);
        parent.set(neighborKey, { kind: 'walk', fromStopKey: stopKey, fromStop, toStop, distanceMiles: dist });
        touchedByWalk.add(neighborKey);
      }
    }

    arrivalByRound.push(arrival);
    parentByRound.push(parent);
    frontier = new Set([...touchedByBus, ...touchedByWalk]);
  }

  // Builds the full Leg[] for the chain of hops that reaches `destStopKey`
  // in round `k`, plus the closing walk to the actual destination
  // coordinate. Only ever called for a chain that includes at least one bus
  // hop (see the origin-walk-only guard where this is invoked below).
  function reconstruct(k: number, destStopKey: string, destWalkMiles: number): Itinerary {
    const parent = parentByRound[k];
    const chain: HopParent[] = [];
    let cur: string | undefined = destStopKey;
    while (cur !== undefined) {
      const hop = parent.get(cur);
      if (!hop) break;
      chain.push(hop);
      cur = hop.kind === 'origin-walk' ? undefined : hop.fromStopKey;
    }
    chain.reverse();

    const originHop = chain[0] as Extract<HopParent, { kind: 'origin-walk' }>;
    const firstBus = chain.find((h): h is Extract<HopParent, { kind: 'bus' }> => h.kind === 'bus')!;
    const walkToOriginMin = walkMinutes(originHop.distanceMiles);
    const idealLeave = new Date(firstBus.boardTime.getTime() - (walkToOriginMin + LEAVE_BUFFER_MINUTES) * 60000);
    const recommendedLeave = idealLeave > earliestDepart ? idealLeave : earliestDepart;

    const legs: Leg[] = [walkLeg(origin, { lat: originHop.toStop.lat, lon: originHop.toStop.lng }, `Walk to ${originHop.toStop.label}`, originHop.distanceMiles)];
    let arrivalAtPrevStop = new Date(recommendedLeave.getTime() + walkToOriginMin * 60000);

    for (let i = 1; i < chain.length; i++) {
      const hop = chain[i];
      if (hop.kind === 'bus') {
        const waitMinutes = Math.max(0, (hop.boardTime.getTime() - arrivalAtPrevStop.getTime()) / 60000);
        if (waitMinutes >= 1) {
          legs.push({
            type: 'wait',
            description: `Wait for the ${hop.seq.routeName} Route`,
            minutes: Math.round(waitMinutes),
            departTime: hop.boardTime.toISOString(),
          });
        }
        const rideMinutes = (hop.alightTime.getTime() - hop.boardTime.getTime()) / 60000;
        legs.push({
          type: 'bus',
          description: `Take the ${hop.seq.routeName} Route to ${hop.alightStop.label}`,
          minutes: Math.round(rideMinutes),
          route: hop.seq.routeNum,
          routeName: hop.seq.routeName,
          color: hop.seq.color,
          path: routeSegmentPath(hop.seq.routeNum, hop.boardStop, hop.alightStop),
        });
        arrivalAtPrevStop = hop.alightTime;
      } else if (hop.kind === 'walk') {
        const nextBus = chain[i + 1] as Extract<HopParent, { kind: 'bus' }>; // structurally always a bus hop
        const transferWalkMin = walkMinutes(hop.distanceMiles);
        legs.push({
          type: 'walk',
          description: hop.distanceMiles <= 0.01
            ? `Transfer to the ${nextBus.seq.routeName} Route at ${hop.toStop.label}`
            : `Walk to ${hop.toStop.label}`,
          minutes: Math.round(transferWalkMin),
          distanceMiles: round2(hop.distanceMiles),
          path: [{ lat: hop.fromStop.lat, lon: hop.fromStop.lng }, { lat: hop.toStop.lat, lon: hop.toStop.lng }],
        });
        arrivalAtPrevStop = new Date(arrivalAtPrevStop.getTime() + transferWalkMin * 60000);
      }
    }

    const lastHop = chain[chain.length - 1];
    const lastStop = lastHop.kind === 'bus' ? lastHop.alightStop : (lastHop as Extract<HopParent, { kind: 'walk' }>).toStop;
    const finalWalkMin = walkMinutes(destWalkMiles);
    legs.push(walkLeg({ lat: lastStop.lat, lon: lastStop.lng }, destination, 'Walk to destination', destWalkMiles));
    const arriveTime = new Date(arrivalAtPrevStop.getTime() + finalWalkMin * 60000);

    return {
      totalMinutes: Math.round((arriveTime.getTime() - recommendedLeave.getTime()) / 60000),
      departTime: recommendedLeave.toISOString(),
      arriveTime: arriveTime.toISOString(),
      missesDeadline: !!latestArrive && arriveTime > latestArrive,
      legs,
    };
  }

  // For each round (= transfer count), find the best-finishing destination
  // candidate and keep it only if it's a genuine improvement over the best
  // itinerary already found with fewer transfers - a 3-transfer trip no
  // faster than the 1-transfer one already found isn't worth surfacing,
  // but if 3 transfers really is the fastest (or only) way, it's kept.
  // Skips any candidate whose arrival is still just the round-0 origin-walk
  // carried forward unimproved (i.e. no bus actually helped reach it) -
  // that's not a real itinerary, just the walk-only fallback in disguise.
  let bestFinish: Date | null = null;
  for (let k = 1; k < arrivalByRound.length; k++) {
    let best: { stopKey: string; distanceMiles: number; finish: Date } | null = null;
    for (const { dist, occ } of destCandidates) {
      if (parentByRound[k].get(occ.stop.key)?.kind === 'origin-walk') continue;
      const arrive = arrivalByRound[k].get(occ.stop.key);
      if (!arrive) continue;
      const finish = new Date(arrive.getTime() + walkMinutes(dist) * 60000);
      if (!best || finish < best.finish) best = { stopKey: occ.stop.key, distanceMiles: dist, finish };
    }
    if (!best) continue;
    if (bestFinish && best.finish.getTime() >= bestFinish.getTime()) continue;
    bestFinish = best.finish;
    candidates.push(reconstruct(k, best.stopKey, best.distanceMiles));
  }

  candidates.sort((a, b) => a.totalMinutes - b.totalMinutes);
  const itineraries = candidates.slice(0, MAX_ITINERARIES);

  return {
    feasible: itineraries.length > 0,
    itineraries,
    message: itineraries.length
      ? null
      : 'No walking or bus route found for this trip. Try a different starting point or destination.',
  };
}
