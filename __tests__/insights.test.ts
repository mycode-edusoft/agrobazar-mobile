import { mapInsights } from '@/services/http/insights';
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
