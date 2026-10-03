import { defaultWeek, formatWeek, isOpenNow, parseWeek } from '@/lib/storeHours';

describe('storeHours', () => {
  it('köhnə tək aralığı bütün günlərə aid edir', () => {
    const week = parseWeek('09:00-18:00')!;
    expect(week).toHaveLength(7);
    expect(week.every((d) => d.enabled && d.open === '09:00' && d.close === '18:00')).toBe(true);
    expect(formatWeek(week)).toBe('09:00 - 18:00');
  });

  it('gün-gün qrafiki mətnə çevirib geri oxuyur', () => {
    const week = defaultWeek();
    week[5] = { enabled: true, open: '10:00', close: '15:00' };
    week[6] = { ...week[6], enabled: false };
    const text = formatWeek(week);
    expect(text).toContain('Şənbə 10:00 - 15:00');
    expect(text).toContain('Bazar bağlı');
    expect(parseWeek(text)).toEqual(week.map((d, i) => (i === 6 ? { ...d, open: '09:00', close: '18:00' } : d)));
  });

  it('açıq/bağlı vəziyyətini hesablayır', () => {
    const week = defaultWeek('09:00', '18:00');
    expect(isOpenNow(week, new Date(2026, 9, 5, 10, 0))).toBe(true); // bazar ertəsi 10:00
    expect(isOpenNow(week, new Date(2026, 9, 5, 19, 0))).toBe(false);
  });
});
