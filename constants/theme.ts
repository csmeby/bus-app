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

export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2d2d2d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#373737' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3c3c3c' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#b0b0b0' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000810' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] },
];
