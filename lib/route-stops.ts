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

export type DirectionStops = {
  inbound?: RouteStopRow[];
  outbound?: RouteStopRow[];
  circulator?: RouteStopRow[];
};

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

// Every stop on ONE route, split by that route's own inbound/outbound
// patterns (or a single "circulator" list for single-pattern routes) - this
// is what the wizard's "pick a stop" step lists, deliberately not merged
// with any other route's stops.
export async function getDirectionStops(route: string, apiBase: string): Promise<DirectionStops> {
  const source = await loadPatternsSource(apiBase);
  const patterns = source[route]?.patterns ?? {};
  const result: DirectionStops = {};
  Object.entries(patterns).forEach(([patternKey, pattern]) => {
    const key = patternKey.toLowerCase();
    const stops = stopsFromPattern(pattern);
    if (key === 'inbound') result.inbound = stops;
    else if (key === 'outbound') result.outbound = stops;
    else result.circulator = [...(result.circulator ?? []), ...stops];
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
