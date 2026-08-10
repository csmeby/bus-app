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
// Searches direct (single-route) itineraries AND one-transfer itineraries
// (ride route1 partway, walk to a nearby stop, ride route2 the rest of the
// way) - same one-transfer cap as AggieSpirit's own planner.
import btdRoutesRaw from '../btd_routes.json';

const EARTH_RADIUS_MI = 3958.8;
const WALK_SPEED_MPH = 3.0;
const WALK_CIRCUITY_FACTOR = 1.3;
const MAX_WALK_MILES = 0.6;
const MAX_TRANSFER_WALK_MILES = 0.3;
const MAX_STOPS_PER_SIDE = 6;
const MAX_ITINERARIES = 5;
// Transfer search is combinatorial - once this many raw candidates are
// found there's already more than enough to pick a top MAX_ITINERARIES
// from, so searching further only burns time on a rider's phone for no
// benefit the final sort+cap would keep anyway.
const MAX_RAW_TRANSFER_CANDIDATES = 40;
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

// The departure floor (can't board a run that's already left, or before
// the rider said they're able to leave) is always a hard filter. The
// arrival DEADLINE is only a soft preference: a rider who can't walk the
// whole way needs to see the bus exists even if it misses their "arrive
// by" ask, not just a walking itinerary - BTD runs are infrequent enough
// that a strict deadline can otherwise zero out every remaining option.
// Runs that DO make the deadline always win over ones that don't; ties
// within the same tier fall back to earliest departure (or latest, in
// arrive-by mode).
function pickBest<T extends { board: Date; arrive: Date }>(
  options: T[],
  mustLeaveAfter: Date,
  latestArrive: Date | null,
  arriveByMode: boolean
): { option: T; inWindow: boolean } | null {
  let best: T | null = null;
  let bestInWindow = false;
  for (const opt of options) {
    if (opt.board < mustLeaveAfter) continue;
    const inWindow = !latestArrive || opt.arrive <= latestArrive;
    if (!best) {
      best = opt;
      bestInWindow = inWindow;
      continue;
    }
    if (inWindow !== bestInWindow) {
      if (inWindow) {
        best = opt;
        bestInWindow = true;
      }
      continue;
    }
    if (arriveByMode ? opt.board > best.board : opt.board < best.board) best = opt;
  }
  return best ? { option: best, inWindow: bestInWindow } : null;
}

// Every feasible (board, arrive) pair for riding straight from occO to occD
// on their shared sequence, across every daily run. If occD sits EARLIER in
// the stop order than occO, the rider isn't going backward - the route
// eventually comes back around to it (Yellow's own two directions handle
// this the same way any loop route does), so that run's arrival is looked
// up on the NEXT run's times instead (run r+1).
function directOptions(occO: Occurrence, occD: Occurrence, dateStr: string): { board: Date; arrive: Date }[] {
  const timesO = occO.stop.times;
  const timesD = occD.stop.times;
  const runs = Math.min(timesO.length, timesD.length);
  const out: { board: Date; arrive: Date }[] = [];
  for (let r = 0; r < runs; r++) {
    const board = parseHHMM(timesO[r], dateStr);
    const arrive = occD.stopIndex > occO.stopIndex
      ? parseHHMM(timesD[r], dateStr)
      : r + 1 < runs ? parseHHMM(timesD[r + 1], dateStr) : null;
    if (arrive && arrive > board) out.push({ board, arrive });
  }
  return out;
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

  const destBySeq = new Map<string, { dist: number; occ: Occurrence }[]>();
  for (const c of destCandidates) {
    if (!destBySeq.has(c.occ.seq.seqId)) destBySeq.set(c.occ.seq.seqId, []);
    destBySeq.get(c.occ.seq.seqId)!.push(c);
  }

  const seenDirectPairs = new Set<string>();

  // ── Direct (single-route) search ───────────────────────────────────────
  for (const { dist: wdistO, occ: occO } of originCandidates) {
    const destOnSeq = destBySeq.get(occO.seq.seqId);
    if (!destOnSeq) continue;
    for (const { dist: wdistD, occ: occD } of destOnSeq) {
      if (occD.stop.key === occO.stop.key) continue;
      const pairKey = `${occO.seq.seqId}:${occO.stop.key}:${occD.stop.key}`;
      if (seenDirectPairs.has(pairKey)) continue;
      seenDirectPairs.add(pairKey);

      const walkToOrigin = walkMinutes(wdistO);
      const walkFromDest = walkMinutes(wdistD);
      const mustLeaveStopAfter = new Date(earliestDepart.getTime() + walkToOrigin * 60000);

      const options = directOptions(occO, occD, targetDate).map(o => ({
        ...o,
        arrive: new Date(o.arrive.getTime() + walkFromDest * 60000),
      }));
      const picked = pickBest(options, mustLeaveStopAfter, latestArrive, arriveByMode);
      if (!picked) continue;
      const { option: best, inWindow } = picked;

      const departDt = best.board;
      const arriveDt = best.arrive;
      const idealLeave = new Date(departDt.getTime() - (walkToOrigin + LEAVE_BUFFER_MINUTES) * 60000);
      const recommendedLeave = idealLeave > earliestDepart ? idealLeave : earliestDepart;
      const waitMinutes = Math.max(
        0,
        (departDt.getTime() - (recommendedLeave.getTime() + walkToOrigin * 60000)) / 60000
      );
      const rideMinutes = (arriveDt.getTime() - walkFromDest * 60000 - departDt.getTime()) / 60000;
      const totalMinutes = (arriveDt.getTime() - recommendedLeave.getTime()) / 60000;

      const legs: Leg[] = [walkLeg(origin, { lat: occO.stop.lat, lon: occO.stop.lng }, `Walk to ${occO.stop.label}`, wdistO)];
      if (waitMinutes >= 1) {
        legs.push({
          type: 'wait',
          description: `Wait for the ${occO.seq.routeName} Route`,
          minutes: Math.round(waitMinutes),
          departTime: departDt.toISOString(),
        });
      }
      legs.push({
        type: 'bus',
        description: `Take the ${occO.seq.routeName} Route to ${occD.stop.label}`,
        minutes: Math.round(rideMinutes),
        route: occO.seq.routeNum,
        routeName: occO.seq.routeName,
        color: occO.seq.color,
        path: routeSegmentPath(occO.seq.routeNum, occO.stop, occD.stop),
      });
      legs.push(walkLeg({ lat: occD.stop.lat, lon: occD.stop.lng }, destination, 'Walk to destination', wdistD));

      candidates.push({
        totalMinutes: Math.round(totalMinutes),
        departTime: recommendedLeave.toISOString(),
        arriveTime: arriveDt.toISOString(),
        missesDeadline: !inWindow,
        legs,
      });
    }
  }

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

  // ── One-transfer search ─────────────────────────────────────────────────
  // Ride sequence1 from an origin candidate stop to some reachable stop X,
  // walk (possibly 0 distance) to a nearby stop Y served by a DIFFERENT
  // route, then ride sequence2 onward to a destination candidate stop.
  // Each hop picks the earliest run at-or-after its own floor time
  // independently (rather than assuming aligned run indices ACROSS
  // routes, which only holds within a single sequence) - see
  // earliestRunAtOrAfter.
  let rawTransferCount = 0;
  transferSearch:
  for (const { dist: wdistO, occ: occO } of originCandidates) {
    const walkToOrigin = walkMinutes(wdistO);
    const mustLeaveOriginAfter = new Date(earliestDepart.getTime() + walkToOrigin * 60000);
    const boardO = earliestRunAtOrAfter(occO.stop.times, mustLeaveOriginAfter, targetDate);
    if (!boardO) continue;

    for (const { stop: stopX, runIndex: xRunIndex } of reachableStops(occO.seq, occO.stopIndex, boardO.index)) {
      const arriveAtX = parseHHMM(stopX.times[xRunIndex], targetDate);

      for (const { key: stopYKey, dist: transferDist } of STOP_NEIGHBORS.get(stopX.key) ?? []) {
        const transferWalkMin = walkMinutes(transferDist);
        const mustLeaveTransferAfter = new Date(arriveAtX.getTime() + transferWalkMin * 60000);

        for (const occY of OCCURRENCES_BY_STOP_KEY.get(stopYKey) ?? []) {
          if (occY.seq.routeNum === occO.seq.routeNum) continue;
          const boardY = earliestRunAtOrAfter(occY.stop.times, mustLeaveTransferAfter, targetDate);
          if (!boardY) continue;

          for (const { dist: wdistD, occ: occD } of destCandidates) {
            if (occD.seq.seqId !== occY.seq.seqId) continue;
            if (occD.stop.key === occY.stop.key) continue;
            const dRunIndex = occD.stopIndex > occY.stopIndex ? boardY.index : boardY.index + 1;
            if (dRunIndex >= occD.stop.times.length) continue;

            if (rawTransferCount >= MAX_RAW_TRANSFER_CANDIDATES) break transferSearch;
            rawTransferCount++;

            const walkFromDest = walkMinutes(wdistD);
            const arrive2 = parseHHMM(occD.stop.times[dRunIndex], targetDate);
            const finalArrive = new Date(arrive2.getTime() + walkFromDest * 60000);
            const inWindow = !latestArrive || finalArrive <= latestArrive;

            const ride1 = (arriveAtX.getTime() - boardO.time.getTime()) / 60000;
            const ride2 = (arrive2.getTime() - boardY.time.getTime()) / 60000;
            const idealLeave = new Date(boardO.time.getTime() - (walkToOrigin + LEAVE_BUFFER_MINUTES) * 60000);
            const recommendedLeave = idealLeave > earliestDepart ? idealLeave : earliestDepart;
            const wait1 = Math.max(0, (boardO.time.getTime() - (recommendedLeave.getTime() + walkToOrigin * 60000)) / 60000);
            const wait2 = Math.max(0, (boardY.time.getTime() - mustLeaveTransferAfter.getTime()) / 60000);
            const totalMinutes = (finalArrive.getTime() - recommendedLeave.getTime()) / 60000;
            const stopY = occY.stop;

            const legs: Leg[] = [walkLeg(origin, { lat: occO.stop.lat, lon: occO.stop.lng }, `Walk to ${occO.stop.label}`, wdistO)];
            if (wait1 >= 1) {
              legs.push({
                type: 'wait',
                description: `Wait for the ${occO.seq.routeName} Route`,
                minutes: Math.round(wait1),
                departTime: boardO.time.toISOString(),
              });
            }
            legs.push({
              type: 'bus',
              description: `Take the ${occO.seq.routeName} Route to ${stopX.label}`,
              minutes: Math.round(ride1),
              route: occO.seq.routeNum,
              routeName: occO.seq.routeName,
              color: occO.seq.color,
              path: routeSegmentPath(occO.seq.routeNum, occO.stop, stopX),
            });
            legs.push({
              type: 'walk',
              description: transferDist <= 0.01
                ? `Transfer to the ${occY.seq.routeName} Route at ${stopY.label}`
                : `Walk to ${stopY.label}`,
              minutes: Math.round(transferWalkMin),
              distanceMiles: round2(transferDist),
              path: [{ lat: stopX.lat, lon: stopX.lng }, { lat: stopY.lat, lon: stopY.lng }],
            });
            if (wait2 >= 1) {
              legs.push({
                type: 'wait',
                description: `Wait for the ${occY.seq.routeName} Route`,
                minutes: Math.round(wait2),
                departTime: boardY.time.toISOString(),
              });
            }
            legs.push({
              type: 'bus',
              description: `Take the ${occY.seq.routeName} Route to ${occD.stop.label}`,
              minutes: Math.round(ride2),
              route: occY.seq.routeNum,
              routeName: occY.seq.routeName,
              color: occY.seq.color,
              path: routeSegmentPath(occY.seq.routeNum, stopY, occD.stop),
            });
            legs.push(walkLeg({ lat: occD.stop.lat, lon: occD.stop.lng }, destination, 'Walk to destination', wdistD));

            candidates.push({
              totalMinutes: Math.round(totalMinutes),
              departTime: recommendedLeave.toISOString(),
              arriveTime: finalArrive.toISOString(),
              missesDeadline: !inWindow,
              legs,
            });
          }
        }
      }
    }
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
