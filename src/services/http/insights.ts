import type { CategoryRankBand, ListingInsights, PromotionImpact } from '@/types/domain';

/**
 * GET plan/listings/<id>/metrics/ cavabının domenə çevrilməsi (şəbəkədən asılı deyil — test olunur).
 * Backend metrikləri kateqoriya üzrə qruplaşdırır və yalnız sahibin tarifinə daxil kodları qaytarır.
 */

interface ApiImpact {
  diff_24h: number;
  diff_7d: number;
  diff_30d: number;
  pct_24h: number | null;
  pct_7d: number | null;
  pct_30d: number | null;
}

export interface ApiMetrics {
  visibility?: { tariff_code?: string | null; metric_descriptions?: Record<string, string> };
  /** Kateqoriya (traffic, gallery, …) → metrik kodu → dəyər; tarifdə olmayan kod heç gəlmir */
  metrics?: Record<string, Record<string, unknown>>;
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function mapImpact(v: unknown): PromotionImpact | null {
  if (!v || typeof v !== 'object') return null;
  const i = v as ApiImpact;
  return {
    diff: { '24h': i.diff_24h ?? 0, '7d': i.diff_7d ?? 0, '30d': i.diff_30d ?? 0 },
    pct: { '24h': num(i.pct_24h), '7d': num(i.pct_7d), '30d': num(i.pct_30d) },
  };
}

export function mapInsights(res: ApiMetrics): ListingInsights {
  const flat: Record<string, unknown> = Object.assign({}, ...Object.values(res.metrics ?? {}));
  const has = (code: string) => code in flat;
  // Tarifdə olmayan metrik `undefined` qalır — ekran onu göstərmir
  const pick = <T,>(code: string, map: (v: unknown) => T): T | undefined => (has(code) ? map(flat[code]) : undefined);
  const count = (v: unknown) => num(v) ?? 0;
  const field = (key: string) => (v: unknown) =>
    v && typeof v === 'object' ? num((v as Record<string, unknown>)[key]) : null;

  return {
    tariffCode: res.visibility?.tariff_code ?? null,
    descriptions: res.visibility?.metric_descriptions ?? {},
    viewsLast24h: pick('views_last_24h', count),
    viewsLast7d: pick('views_last_7d', count),
    viewsLast30d: pick('views_last_30d', count),
    bestWeekday: pick('best_weekday', field('weekday')),
    bestHour: pick('best_hour', field('hour')),
    peakInterval: pick('peak_interval', (v) => {
      const start = field('start_hour')(v);
      const end = field('end_hour')(v);
      // Heç baxış yoxdursa backend 0–4 aralığını 0 cəmlə qaytarır — mənasızdır
      return start != null && end != null && (field('views_total')(v) ?? 0) > 0 ? { start, end } : null;
    }),
    ctr: pick('ctr', num),
    topViewedImage: pick('top_viewed_image_position', num),
    avgLastImagePosition: pick('avg_last_image_position', num),
    lastImageReachRate: pick('last_image_reach_rate', num),
    galleryToDetailRatio: pick('gallery_view_to_detail_ratio', num),
    contactsLast24h: pick('contacts_last_24h', count),
    contactsLast7d: pick('contacts_last_7d', count),
    favoritesLast7d: pick('favorites_last_7d', count),
    categoryRankBand: pick('category_rank_band', (v) => (typeof v === 'string' ? (v as CategoryRankBand) : null)),
    categoryAvgViews: pick('category_avg_views', num),
    categoryViewsRatio: pick('category_views_ratio', num),
    priceBucketAvgViews: pick('price_bucket_avg_views', num),
    premiumImpact: pick('premium_promotion_impact', mapImpact),
    vipImpact: pick('vip_promotion_impact', mapImpact),
    bumpImpact: pick('bump_promotion_impact', mapImpact),
    // Gün-gün seriya ayrıca endpoint-dən gəlir (`metrics/daily/`) — listings.insights() birləşdirir
    series: null,
  };
}

/** GET plan/listings/<id>/metrics/daily/?days=N */
export interface ApiDailySeries {
  visibility?: { series?: Record<string, { enabled: boolean; max_days: number }> };
  points?: { date: string; views: number | null; contacts: number | null; favorites: number | null }[];
}

/**
 * Baxış seriyasını qrafik nöqtələrinə çevirir ("dd.MM" etiketi). Tarif seriyaya icazə vermirsə null.
 * Tarix "YYYY-MM-DD" kimi gəlir — Date-ə çevrilmir ki, saat qurşağı günü sürüşdürməsin.
 */
export function mapDailyViews(res: ApiDailySeries): { label: string; value: number }[] | null {
  if (res.visibility?.series?.views?.enabled === false) return null;
  const points = res.points ?? [];
  if (!points.length || points.some((p) => typeof p.views !== 'number')) return null;
  return points.map((p) => {
    const [, month, day] = p.date.split('-');
    return { label: `${day}.${month}`, value: p.views as number };
  });
}
