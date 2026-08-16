import bundledRoutePatterns from '../routes_patterns.json';

// Standalone stop-catalog reader for the proximity-alert wizard. Deliberately
// NOT sharing app/(tabs)/index.tsx's stopMapRef/applyPatterns machinery -
// that component's map/marker state is fragile (see prior map-marker-churn
// fixes) and none of its live-polling/reroute-aware bookkeeping is needed
// here; this only ever runs once per wizard step, not every 10s.

export type RouteStopRow = {
  code: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
};

export type DirectionPattern = {
  // The upstream direction_key UUID for this pattern - matches what the live
  // /routes API and server/alerts.py's _stop_directions use to tell one
  // route's directions apart. Undefined for a synthetic "pattern_N" key
  // (circulator routes with no real direction split), same case
  // server/alerts.py already treats as "no direction to filter on."
  directionKey?: string;
  coordinates: { latitude: number; longitude: number }[];
  stops: RouteStopRow[];
};

export type RoutePatterns = {
  color: string;
  inbound?: DirectionPattern;
  outbound?: DirectionPattern;
  // Rare, but a single-pattern ("circulator") route can in principle have
  // more than one pattern with neither an inbound nor outbound label - kept
  // as separate entries (not merged) so each pattern's own polyline draws
  // as its own line instead of a nonsense line connecting two patterns.
  circulator?: DirectionPattern[];
};

const CAMPUS_REGION = { latitude: 30.615, longitude: -96.34, latitudeDelta: 0.03, longitudeDelta: 0.03 };

// Fits a region around every given stop, with padding so markers aren't
// flush against the map edge - same shape/padding as plan.tsx's
// regionForItinerary, just over stop coordinates instead of a trip path.
export function regionForStops(stops: RouteStopRow[]) {
  if (stops.length === 0) return CAMPUS_REGION;
  const lats = stops.map(s => s.coordinate.latitude);
  const lons = stops.map(s => s.coordinate.longitude);
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

async function loadPatternsSource(apiBase: string): Promise<Record<string, any>> {
  try {
    const res = await fetch(`${apiBase}/route-patterns`);
    const data = res.ok ? await res.json() : null;
    if (data && Object.keys(data).length > 0) return data;
  } catch {
    // fall through to the bundled snapshot
  }
  return bundledRoutePatterns as Record<string, any>;
}

function stopsFromPattern(pattern: any): RouteStopRow[] {
  return ((pattern?.stops as any[]) ?? [])
    .filter(s => s.lat && s.lng)
    .map(s => ({
      code: s.code,
      name: s.name,
      coordinate: { latitude: s.lat, longitude: s.lng },
    }));
}

// One route's own brand color, polylines, and stops - split by that route's
// own inbound/outbound patterns (or a list of "circulator" patterns for
// single-direction routes) - this is what the wizard's "pick a stop" step
// draws, deliberately not merged with any other route's geometry.
export async function getRoutePatterns(route: string, apiBase: string): Promise<RoutePatterns> {
  const source = await loadPatternsSource(apiBase);
  const routeData = source[route] ?? {};
  const patterns = routeData.patterns ?? {};
  const result: RoutePatterns = { color: routeData.color || '#888888' };
  Object.entries(patterns).forEach(([patternKey, pattern]) => {
    const key = patternKey.toLowerCase();
    const entry: DirectionPattern = {
      directionKey: (pattern as any)?.direction_key || undefined,
      coordinates: ((pattern as any)?.coordinates as any[] ?? []).map(p => ({ latitude: p.lat, longitude: p.lng })),
      stops: stopsFromPattern(pattern),
    };
    // Deliberately swapped: routes_patterns.json's own "inbound"/"outbound"
    // pattern keys are just a stable artifact of the order paths.py received
    // patterns in (see app/(tabs)/index.tsx's DirKind comment) and don't
    // reliably match the real-world direction those words mean on this
    // system - confirmed backwards against the live map.
    if (key === 'inbound') result.outbound = entry;
    else if (key === 'outbound') result.inbound = entry;
    else result.circulator = [...(result.circulator ?? []), entry];
  });
  return result;
}

// Every route (besides `exceptRoute`, if given) whose patterns include a
// stop with this exact code - used to detect "this stop is shared" in the
// wizard's shared-stop step. Physical-stop identity is the upstream `code`
// field, same merge key app/(tabs)/index.tsx's applyPatterns uses.
export async function getRoutesForStopCode(stopCode: string, apiBase: string): Promise<string[]> {
  const source = await loadPatternsSource(apiBase);
  const routes = new Set<string>();
  Object.entries(source).forEach(([route, routeData]) => {
    const patterns = (routeData as any)?.patterns ?? {};
    Object.values(patterns as Record<string, any>).forEach(pattern => {
      if ((pattern?.stops as any[] | undefined)?.some(s => s.code === stopCode)) {
        routes.add(route);
      }
    });
  });
  return [...routes].sort();
}
