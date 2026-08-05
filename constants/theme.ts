export const BRAND_MAROON = '#A24857';

export const Colors = {
  light: {
    text: '#202020',
    textSecondary: '#6E6E73',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F0F2',
    border: '#E5E5EA',
    tint: BRAND_MAROON,
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
    tabIconDefault: '#000000',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    background: '#000000',
    surface: '#000000',
    surfaceAlt: '#242424',
    border: '#FFFFFF',
    tint: '#FF6B85',
    tabIconDefault: '#FFFFFF',
  },
};

// Colors pulled directly from Colors.dark above (background/surface/
// surfaceAlt/border/textSecondary) rather than independently-chosen grays -
// the previous palette (#1a1a2e geometry, #2d2d2d/#373737/#3c3c3c roads) was
// a plausible-looking dark map on its own, but sat next to this app's actual
// near-black UI (#0D0D0E/#1C1C1E) it read as a distinctly lighter, grayer,
// slightly-navy-tinted panel - "why does the map look gray" - rather than
// part of the same dark theme.
export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0D0D0E' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8E8E93' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0D0E' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#3A3A3C' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#ECEDEE' }] },
  // 'poi' (parent) off hides icons/labels for every poi.* subtype including
  // poi.park - that's fine for business/attraction clutter, but it was also
  // silently deleting parks/green space entirely rather than just muting
  // them, which is why the map read as one flat dark mass with nothing
  // distinguishing actual land use ("no green for the fields"). The
  // poi.park override below re-enables just that one subtype with a muted
  // (not bright/cartoonish) dark green geometry fill, still with its own
  // icons/labels off.
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: '#17261A' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#141A15' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#1C1C1E' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9BA1A6' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2C2C2E' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3A3A3C' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#ECEDEE' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3A3A3C' }] },
];
