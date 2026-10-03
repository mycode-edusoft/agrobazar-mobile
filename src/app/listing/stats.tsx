import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { InsightsChart } from '@/components/listing/InsightsChart';
import { AppText, BottomSheet, Button, Pill, Screen, ScreenHeader, SegmentedControl } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDecimal, formatSigned, ordinal } from '@/lib/format';
import { WEEK_DAYS } from '@/lib/storeHours';
import { api } from '@/services';
import { colors, layout, shadows } from '@/theme';
import type { InsightPeriod, ListingInsights, PromotionImpact } from '@/types/domain';

type TabKey = keyof typeof t.stats.tabs;

const NEGATIVE = '#FF5964';
const ACCENT = '#276EF1';

interface Row {
  /** Backend metrik kodu — izah (`metric_descriptions`) üçün */
  code: string;
  label: string;
  /** `undefined` — tarifə daxil deyil (sətir gizlənir); `null` — məlumat yoxdur ("-") */
  value: string | null | undefined;
  color?: string;
}

const hour = (h: number) => `${String(h).padStart(2, '0')}:00`;
const pct = (r: number) => `${formatDecimal(r * 100)}%`;
/** undefined → gizlət, null → "-", əks halda formatla */
const show = <T,>(v: T | null | undefined, f: (x: T) => string) => (v === undefined ? undefined : v === null ? null : f(v));
const trend = (n: number | null | undefined) => (n == null || n === 0 ? undefined : n < 0 ? NEGATIVE : colors.primary);

function impactRow(code: string, label: string, impact: PromotionImpact | null | undefined, p: InsightPeriod): Row {
  return {
    code,
    label,
    value: show(impact, (i) => t.stats.impact(formatSigned(i.diff[p]), i.pct[p] != null ? formatDecimal(i.pct[p]!) : null)),
    color: impact ? trend(impact.diff[p]) : undefined,
  };
}

function buildRows(d: ListingInsights, p: InsightPeriod): Record<TabKey, Row[]> {
  const views = { '24h': d.viewsLast24h, '7d': d.viewsLast7d, '30d': d.viewsLast30d }[p];
  // Backend əlaqə kliklərini 24 saat / 7 gün, seçilmişləri yalnız 7 gün üçün sayır — qalan dövrlərdə "-"
  const contacts = p === '24h' ? d.contactsLast24h : p === '7d' ? d.contactsLast7d : d.contactsLast7d === undefined ? undefined : null;
  const favorites = d.favoritesLast7d === undefined ? undefined : p === '7d' ? d.favoritesLast7d : null;
  return {
    traffic: [
      { code: `views_last_${p}`, label: t.stats.lastViews[p], value: show(views, t.stats.viewsCount) },
      { code: 'peak_interval', label: t.stats.peakHours, value: show(d.peakInterval, (i) => `${hour(i.start)} – ${hour(i.end)}`) },
      { code: 'best_weekday', label: t.stats.bestDay, value: show(d.bestWeekday, (w) => WEEK_DAYS[w] ?? '-') },
      { code: 'best_hour', label: t.stats.bestHour, value: show(d.bestHour, hour) },
    ],
    contacts: [
      { code: p === '24h' ? 'contacts_last_24h' : 'contacts_last_7d', label: t.stats.calls, value: show(contacts, String) },
      { code: 'favorites_last_7d', label: t.stats.favorites, value: show(favorites, String) },
    ],
    benchmarks: [
      { code: 'category_rank_band', label: t.stats.rank, value: show(d.categoryRankBand, (b) => t.stats.rankBand[b] ?? b) },
      { code: 'category_avg_views', label: t.stats.categoryAvg, value: show(d.categoryAvgViews, (n) => formatDecimal(n)) },
      {
        code: 'category_views_ratio',
        label: t.stats.categoryRatio,
        value: show(d.categoryViewsRatio, (r) => `${formatDecimal(r)}x`),
        // 1.0 — kateqoriya ortası: altı qırmızı, üstü yaşıl
        color: d.categoryViewsRatio == null ? undefined : d.categoryViewsRatio < 1 ? NEGATIVE : colors.primary,
      },
      { code: 'price_bucket_avg_views', label: t.stats.priceBucketAvg, value: show(d.priceBucketAvgViews, (n) => formatDecimal(n)) },
    ],
    gallery: [
      { code: 'top_viewed_image_position', label: t.stats.topImage, value: show(d.topViewedImage, ordinal) },
      { code: 'avg_last_image_position', label: t.stats.avgLastImage, value: show(d.avgLastImagePosition, (n) => formatDecimal(n)) },
      { code: 'last_image_reach_rate', label: t.stats.lastImageReach, value: show(d.lastImageReachRate, pct) },
      { code: 'gallery_view_to_detail_ratio', label: t.stats.galleryToDetail, value: show(d.galleryToDetailRatio, (r) => `${formatDecimal(r)}x`) },
    ],
    promotion: [
      impactRow('premium_promotion_impact', t.stats.premium, d.premiumImpact, p),
      impactRow('vip_promotion_impact', t.stats.vip, d.vipImpact, p),
      impactRow('bump_promotion_impact', t.stats.bump, d.bumpImpact, p),
    ],
    engagement: [{ code: 'ctr', label: t.stats.ctr, value: show(d.ctr, pct), color: d.ctr != null ? ACCENT : undefined }],
  };
}

const TABS = Object.keys(t.stats.tabs) as TabKey[];
const PERIODS = (['24h', '7d', '30d'] as const).map((value) => ({ value, label: t.stats.periods[value] }));

/**
 * Figma "Elan statistikası": üfüqi tab sırası → "Statistika" qrafiki → 24 saat / 7 gün / 30 gün →
 * seçilmiş tabın göstəriciləri. Tarifə daxil olmayan göstəricilər və boş qalan tablar gizlənir;
 * heç biri yoxdursa tarif yüksəltmə bloku göstərilir. Sətrə toxunanda backend izahı açılır.
 */
export default function ListingStatsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>('traffic');
  const [period, setPeriod] = useState<InsightPeriod>('24h');
  const [hint, setHint] = useState<Row | null>(null);
  // Seçilmiş tab ekrandan kənardadırsa görünən sahəyə sürüşdürülür
  const tabsRef = useRef<ScrollView>(null);
  const tabX = useRef<Partial<Record<TabKey, number>>>({});
  const selectTab = (k: TabKey) => {
    setTab(k);
    tabsRef.current?.scrollTo({ x: Math.max(0, (tabX.current[k] ?? 0) - layout.screenPadding), animated: true });
  };
  const query = useQuery({ queryKey: ['listing', id, 'insights'], queryFn: () => api.listings.insights(id) });

  const rows = useMemo(() => (query.data ? buildRows(query.data, period) : null), [query.data, period]);
  // Dövrdən asılı olmayaraq tarifə daxil olan tablar (24 saat üzrə yoxlamaq kifayətdir)
  const tabs = useMemo(() => {
    if (!query.data) return [];
    const base = buildRows(query.data, '24h');
    return TABS.filter((k) => base[k].some((r) => r.value !== undefined));
  }, [query.data]);
  const active = tabs.includes(tab) ? tab : tabs[0];
  const visible = rows && active ? rows[active].filter((r) => r.value !== undefined) : [];

  let body;
  if (query.isLoading) {
    body = <ActivityIndicator color={colors.primary} style={styles.loader} />;
  } else if (query.isError || !query.data) {
    body = (
      <View style={styles.state}>
        <AppText variant="body" color={colors.textMuted} center>
          {t.common.error}
        </AppText>
        <Button title={t.common.retry} variant="outline" onPress={() => query.refetch()} />
      </View>
    );
  } else if (tabs.length === 0) {
    body = (
      <View style={[styles.card, styles.locked]}>
        <AppText variant="bodyBold" color={colors.textSecondary} center>
          {t.stats.lockedTitle}
        </AppText>
        <AppText variant="small" color={colors.textMuted} center>
          {t.stats.lockedText}
        </AppText>
        <Button title={t.stats.lockedCta} onPress={() => router.push('/cabinet/plans')} style={styles.lockedCta} />
      </View>
    );
  } else {
    body = (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InsightsChart points={query.data.series?.[period]} />
        <View style={styles.periodCard}>
          <SegmentedControl<InsightPeriod> options={PERIODS} value={period} onChange={setPeriod} tall />
        </View>
        <View style={[styles.card, styles.metrics]}>
          {visible.map((r) => (
            <Pressable
              key={r.label}
              style={styles.row}
              disabled={!query.data.descriptions[r.code]}
              onPress={() => setHint(r)}
            >
              <AppText variant="body" color={colors.textMuted} style={styles.label}>
                {r.label}
              </AppText>
              <AppText variant="body" color={r.color ?? colors.text} style={styles.value}>
                {r.value ?? '-'}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <Screen header={<ScreenHeader title={t.stats.title} />}>
      {tabs.length > 0 ? (
        <ScrollView ref={tabsRef} horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
          {tabs.map((k) => (
            <View key={k} onLayout={(e) => (tabX.current[k] = e.nativeEvent.layout.x)}>
              <Pill variant="outline" label={t.stats.tabs[k]} active={active === k} onPress={() => selectTab(k)} />
            </View>
          ))}
        </ScrollView>
      ) : null}
      {body}
      <BottomSheet visible={hint != null} onClose={() => setHint(null)} title={hint?.label ?? ''}>
        <AppText variant="body" color={colors.textMuted}>
          {hint ? query.data?.descriptions[hint.code] : ''}
        </AppText>
        <Button title={t.stats.gotIt} onPress={() => setHint(null)} style={styles.hintBtn} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 80 },
  // Figma: ağ zolaqda çiplər, padding 16, aralıq 10, opacity .8 (Elanlarım ilə eyni)
  tabsWrap: { flexGrow: 0, flexShrink: 0, backgroundColor: colors.surface },
  tabs: { paddingHorizontal: layout.screenPadding, paddingVertical: 16, gap: 10, opacity: 0.8 },
  content: { padding: layout.screenPadding, gap: 16, paddingBottom: 40 },
  periodCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 14, ...shadows.card },
  // Figma: kart padding 16 0, sətirlər arası 24, sətir padding 0 16; etiket 172px
  metrics: { paddingVertical: 16, gap: 24 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16 },
  label: { width: 172 },
  value: { flex: 1, textAlign: 'right' },
  state: { padding: 32, gap: 16, alignItems: 'center' },
  locked: { margin: layout.screenPadding, padding: 24, gap: 8 },
  lockedCta: { marginTop: 16, alignSelf: 'stretch' },
  hintBtn: { marginTop: 24 },
});
