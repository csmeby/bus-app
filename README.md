# TAMU Bus Tracker (app)

Expo / React Native app for tracking Texas A&M's AggieSpirit buses live, planning
rides, and browsing schedules. Talks to the Flask backend in `../server`
(base URL in `lib/api-base.ts`).

## Screens

- **Map** (`app/(tabs)/index.tsx`) — live bus positions, route polylines,
  stop departure times, reroute overlays, timepoint hold countdowns.
- **Plan** (`app/(tabs)/plan.tsx`) — trip planner (origin/destination search
  via bundled stops + Photon, `/trip-plan` on the server).
- **Calendar** (`app/(tabs)/calendar.tsx`) — service calendar.
- **More** (`app/(tabs)/settings.tsx`) — theme, favorites, disruptions,
  help, notifications, plus the separate Brazos Transit District mode
  (`app/(btd)/`, fixed schedules only).

`routes_patterns.json` is a bundled snapshot of route geometry/stops used for
cold-start/offline; the server's `/route-patterns` (rebuilt every 12 h) is the
source of truth for current-semester direction UUIDs.

## Development

```bash
npm install
npx expo start
```

Type-check and lint:

```bash
npx tsc --noEmit
npm run lint
```
