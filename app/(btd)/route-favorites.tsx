import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { BTD_TINT } from '@/constants/btd-theme';
import { useFavorites } from '@/context/favorites-context';
import { useLanguage } from '@/context/language-context';
import { useThemeColors } from '@/context/theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { translate } from '@/lib/translations';
import btdRoutesRaw from '../../btd_routes.json';

type BtdRoute = { name: string; color: string };
const btdRoutes = btdRoutesRaw as Record<string, BtdRoute>;
const ALL_BTD_ROUTES = Object.keys(btdRoutes).sort();

export default function BtdFavoritesScreen() {
  const scheme = useColorScheme();
  const c = useThemeColors();
  const tint = BTD_TINT[scheme];
  const { isFavorite, toggleFavorite } = useFavorites();
  const { language } = useLanguage();
  const t = (s: string) => translate(s, language);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel={t('Back')}
          hitSlop={8}
        >
          <Text style={[styles.backArrow, { color: tint }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: c.text }]} accessibilityRole="header">{t('Favorite Routes')}</Text>
      </View>
      <Text style={[styles.hint, { color: c.textSecondary }]}>
        {t('Favorited routes appear at the top of the route selector on the map.')}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          {ALL_BTD_ROUTES.map((route, i) => {
            const info = btdRoutes[route];
            const fav = isFavorite(route, 'btd');
            return (
              <TouchableOpacity
                key={route}
                style={[
                  styles.row,
                  i < ALL_BTD_ROUTES.length - 1 && [styles.rowBorder, { borderBottomColor: c.border }],
                ]}
                onPress={() => toggleFavorite(route, 'btd')}
                activeOpacity={0.6}
                accessibilityRole="checkbox"
                accessibilityLabel={`${info?.name ?? `Route ${route}`}, route ${route}`}
                accessibilityHint={fav ? t('Removes this route from favorites') : t('Adds this route to favorites')}
                accessibilityState={{ checked: fav }}
              >
                <View style={[styles.routeTag, { backgroundColor: info?.color ?? tint }]}>
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
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  backBtn: { paddingRight: 10, paddingVertical: 4 },
  backArrow: { fontSize: 30, fontWeight: '300' },
  pageTitle: { fontSize: 28, fontWeight: '700', flex: 1 },
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
