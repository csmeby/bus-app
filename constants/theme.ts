export const BRAND_MAROON = '#A24857';

// tint vs tintText: `tint` is tuned as a FILL color (solid buttons, active
// icons) that stays legible under white text/glyphs on top of it. On dark
// backgrounds that same value is too low-contrast to use as the text/icon
// *color* sitting directly on background/surface (fails WCAG AA 4.5:1) -
// `tintText` is a lightened variant reserved for that case. In light mode
// the brand color already clears 4.5:1 both ways, so the two are identical.
export const Colors = {
  light: {
    text: '#202020',
    textSecondary: '#6E6E73',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F0F2',
    border: '#E5E5EA',
    tint: BRAND_MAROON,
    tintText: BRAND_MAROON,
    tabIconDefault: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#8E8E93',
    background: '#0D0D0E',
    surface: '#1C1C1E',
    surfaceAlt: '#2C2C2E',
    border: '#3A3A3C',
    tint: '#A24857',
    tintText: '#C0727F',
    tabIconDefault: '#9BA1A6',
  },
};

// Accessibility > High Contrast (see context/accessibility-context.tsx) -
// pure black/white text-on-background instead of the softer default grays,
// a stronger border so card/row edges read clearly instead of relying on
// subtle shadow, and a tint darkened/brightened further from the brand
// maroon so it still passes contrast against pure white/black rather than
// the softer #F2F2F7/#0D0D0E the default palette was tuned for.
export const HighContrastColors = {
  light: {
    text: '#000000',
    textSecondary: '#3A3A3A',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#E2E2E2',
    border: '#000000',
    tint: '#7A0018',
    tintText: '#7A0018',
    tabIconDefault: '#000000',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    background: '#000000',
    surface: '#000000',
    surfaceAlt: '#242424',
    border: '#FFFFFF',
    // #FF6B85 (moved to tintText) reads great as text on black but only
    // hits 2.7:1 as a filled button behind white labels - this deeper red
    // keeps ~5:1 with white text while still reading clearly on black.
    tint: '#E00027',
    tintText: '#FF6B85',
    tabIconDefault: '#FFFFFF',
  },
};

// Google's own published dark/"Night" palette (the same colors their
// official style examples and the real Google Maps app dark theme use),
// not an app-specific near-black palette - an earlier version tried tinting
// this to match the app's own near-black UI (#0D0D0E/#1C1C1E) more closely,
// but next to actual Google Maps it just read as "wrong", not "on brand"
// (screenshot comparison: this app's roads/water/labels were all a
// noticeably different, slightly-navy hue from stock Google dark mode).
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
];
