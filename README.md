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
cp .env.example .env   # fill in GOOGLE_MAPS_API_KEY, see below
npx expo start
```

Type-check and lint:

```bash
npx tsc --noEmit
npm run lint
```

## Secrets

App config (`app.config.js`, generated from what used to be `app.json`)
reads `GOOGLE_MAPS_API_KEY` from the environment instead of hardcoding it,
so it's safe to keep this repo public. Get a key from [Google Cloud
Console](https://console.cloud.google.com/apis/credentials) with the Maps
SDK for Android and Maps SDK for iOS enabled, restricted to this app's
package name / bundle ID (`com.csmeby.ctt`).

- **Local dev:** put it in `.env` (gitignored, see `.env.example`).
- **GitHub Actions:** add it as a repo secret named `GOOGLE_MAPS_API_KEY`
  (Settings → Secrets and variables → Actions → New repository secret) — the
  iOS build workflows read it from there during `expo prebuild`.
- **EAS Build:** `eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value <key> --type string`
  if you ever build through EAS instead of the GitHub Actions workflows.

The iOS signing files (`.p8`/`.p12`/`.mobileprovision`/`private.key`) live
outside this repo entirely and are gitignored as a second layer of
protection — see `SIGNING_KEYS_README.txt` in the parent folder for what
each one is and which GitHub secret it maps to.
