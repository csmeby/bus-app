import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScaledText as Text } from '@/components/scaled-text';
import { ScreenHeader } from '@/components/screen-header';
import { useThemeColors } from '@/context/theme-context';
import { API_BASE } from '@/lib/api-base';
import { cachedJsonFetch } from '@/lib/local-cache';

type NewsItem = {
  newsId: number;
  title: string;
  summary: string;
  routes: string[];
  affectsAllRoutes: boolean;
  publishDateUtc: string;
  postUrl: string;
};

function formatNewsDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function DisruptionsScreen() {
  const c = useThemeColors();
  const { route: focusRoute } = useLocalSearchParams<{ route?: string }>();
  const [news, setNews] = useState<NewsItem[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const itemY = useRef<Record<number, number>>({});

  useEffect(() => {
    cachedJsonFetch<NewsItem[]>(`${API_BASE}/news`, 'news')
      .then(data => setNews(Array.isArray(data) ? data : []))
      .catch(e => console.warn('News fetch failed:', e));
  }, []);

  useEffect(() => {
    if (!focusRoute || news.length === 0) return;
    const match = news.find(item => item.affectsAllRoutes || item.routes.includes(focusRoute));
    const y = match ? itemY.current[match.newsId] : undefined;
    if (y != null) {
      const id = setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true }), 150);
      return () => clearTimeout(id);
    }
  }, [focusRoute, news]);

  // Linking.openURL can reject even when the OS-level open actually succeeds
  // (a known RN/Expo quirk) — swallow it instead of letting it surface as an
  // uncaught promise rejection in the console.
  const openPost = (url: string) => {
    Linking.openURL(url).catch(e => console.warn('Linking.openURL rejected (link may have still opened):', e));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: c.background }]}>
      <ScreenHeader title="Service Disruptions" bottomMargin={16} />

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {news.length === 0 ? (
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>No active service disruptions.</Text>
        ) : (
          news.map(item => {
            const isFocused = !!focusRoute && (item.affectsAllRoutes || item.routes.includes(focusRoute));
            return (
              <TouchableOpacity
                key={item.newsId}
                onLayout={e => { itemY.current[item.newsId] = e.nativeEvent.layout.y; }}
                style={[
                  styles.newsCard,
                  { backgroundColor: c.surface, borderColor: isFocused ? '#EF4444' : c.border },
                  isFocused && styles.newsCardFocused,
                ]}
                onPress={() => openPost(item.postUrl)}
                activeOpacity={0.7}
                accessibilityRole="link"
                accessibilityLabel={`${item.title}. Affects ${item.affectsAllRoutes ? 'all routes' : `route${item.routes.length > 1 ? 's' : ''} ${item.routes.join(', ')}`}. ${item.summary}`}
                accessibilityHint="Opens the full post in your browser"
              >
                <View style={styles.newsCardHeader}>
                  <MaterialIcons name="warning-amber" size={16} color="#EF4444" />
                  <Text style={[styles.newsTitle, { color: c.text }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.newsDate, { color: c.textSecondary }]}>{formatNewsDate(item.publishDateUtc)}</Text>
                </View>
                <View style={styles.newsRoutesRow}>
                  {item.affectsAllRoutes ? (
                    <View style={[styles.newsRoutePill, { backgroundColor: c.tint }]}>
                      <Text style={styles.newsRoutePillText}>All Routes</Text>
                    </View>
                  ) : (
                    item.routes.map(r => (
                      <View key={r} style={[styles.newsRoutePill, { backgroundColor: c.tint }]}>
                        <Text style={styles.newsRoutePillText}>{r}</Text>
                      </View>
                    ))
                  )}
                </View>
                <Text style={[styles.newsSummary, { color: c.textSecondary }]}>{item.summary}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 24 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 40 },

  newsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  newsCardFocused: { borderWidth: 2 },
  newsCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  newsTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  newsDate: { fontSize: 11 },
  newsRoutesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  newsRoutePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  newsRoutePillText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  newsSummary: { fontSize: 13, lineHeight: 18 },
});
