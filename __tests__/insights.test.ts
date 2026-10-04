import { mapDailyViews, mapInsights } from '@/services/http/insights';
import { ordinal } from '@/lib/format';

describe('mapInsights', () => {
  it('tarifdə olmayan metrikləri undefined, məlumatı olmayanları null qaytarır', () => {
    const d = mapInsights({
      visibility: { tariff_code: 'premium', metric_descriptions: { ctr: 'izah' } },
      metrics: {
        traffic: {
          views_last_24h: 5,
          best_weekday: { weekday: 2, views_total: 9 },
          peak_interval: { start_hour: 0, end_hour: 4, views_total: 0 },
        },
        engagement: { ctr: 0.008 },
        benchmarks: { category_rank_band: '50_plus', category_avg_views: null },
        promotion_impact: {
          premium_promotion_impact: { diff_24h: -4, diff_7d: 0, diff_30d: 0, pct_24h: -100, pct_7d: null, pct_30d: null },
        },
      },
    });
    expect(d.viewsLast24h).toBe(5);
    expect(d.viewsLast7d).toBeUndefined();
    expect(d.bestWeekday).toBe(2);
    expect(d.peakInterval).toBeNull(); // baxış yoxdursa 0–4 aralığı mənasızdır
    expect(d.ctr).toBe(0.008);
    expect(d.categoryRankBand).toBe('50_plus');
    expect(d.categoryAvgViews).toBeNull();
    expect(d.premiumImpact?.diff['24h']).toBe(-4);
    expect(d.premiumImpact?.pct['7d']).toBeNull();
    expect(d.vipImpact).toBeUndefined();
    expect(d.descriptions.ctr).toBe('izah');
    expect(d.series).toBeNull();
  });
});

describe('ordinal', () => {
  it('azərbaycan sıra şəkilçisi', () => {
    expect([1, 3, 6, 9, 10, 40, 100].map(ordinal)).toEqual(['1-ci', '3-cü', '6-cı', '9-cu', '10-cu', '40-cı', '100-cü']);
  });
});

describe('mapDailyViews', () => {
  it('baxış seriyasını dd.MM etiketləri ilə qaytarır (saat qurşağı günü sürüşdürmür)', () => {
    const points = mapDailyViews({
      visibility: { series: { views: { enabled: true, max_days: 30 } } },
      points: [
        { date: '2026-09-30', views: 4, contacts: 0, favorites: null },
        { date: '2026-10-01', views: 0, contacts: 1, favorites: null },
      ],
    });
    expect(points).toEqual([
      { label: '30.09', value: 4 },
      { label: '01.10', value: 0 },
    ]);
  });

  it('tarif seriyaya icazə vermirsə null qaytarır', () => {
    expect(
      mapDailyViews({
        visibility: { series: { views: { enabled: false, max_days: 7 } } },
        points: [{ date: '2026-10-01', views: null, contacts: null, favorites: null }],
      }),
    ).toBeNull();
    expect(mapDailyViews({ points: [] })).toBeNull();
  });
});
