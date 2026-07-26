import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { useFavorites } from '@/context/favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ALL_ROUTES } from '@/constants/routes';
import routePatterns from '../routes_patterns.json';

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const c = Colors[scheme];
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Favorite Routes" bottomMargin={8} />
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        Favorited routes appear at the top of the route selector on the map.
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {ALL_ROUTES.map((route, i) => {
            const info = (routePatterns as any)[route];
            const fav = isFavorite(route);
            return (
              <TouchableOpacity
                key={route}
                style={[
                  styles.row,
                  i < ALL_ROUTES.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
                ]}
                onPress={() => toggleFavorite(route)}
                activeOpacity={0.6}
                accessibilityRole="checkbox"
                accessibilityLabel={`${info?.name ?? `Route ${route}`}, route ${route}`}
                accessibilityHint={fav ? 'Removes this route from favorites' : 'Adds this route to favorites'}
                accessibilityState={{ checked: fav }}
              >
                <View style={[styles.routeTag, { backgroundColor: info?.color ?? c.tint }]}>
                  <Text style={styles.routeTagText}>{route}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowLabel, { color: c.text }]} numberOfLines={1}>
                    {info?.name ?? `Route ${route}`}
                  </Text>
                </View>
                <Text style={[styles.star, { color: fav ? '#F59E0B' : c.border }]}>{fav ? '★' : '☆'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  hint: { fontSize: 13, marginBottom: 16 },
  scrollContent: { paddingBottom: 24 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 16, fontWeight: '500' },
  routeTag: { minWidth: 46, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: 'center' },
  routeTagText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  star: { fontSize: 22 },
});
