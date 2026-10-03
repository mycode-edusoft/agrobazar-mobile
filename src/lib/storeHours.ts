/**
 * Mağazanın həftəlik iş qrafiki. Backend `business_hours`-u sərbəst mətn kimi saxlayır,
 * ona görə qrafik oxunaqlı mətnə çevrilir və geri oxunur:
 *   hamısı eyni  → "09:00 - 18:00" (köhnə format, geriyə uyğun)
 *   fərqli günlər → "Bazar ertəsi 09:00 - 18:00; …; Bazar bağlı"
 */
export interface DayHours {
  enabled: boolean;
  open: string;
  close: string;
}
export type WeeklyHours = DayHours[]; // 0 = Bazar ertəsi … 6 = Bazar

export const WEEK_DAYS = ['Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar'] as const;

const CLOSED = 'bağlı';
const RANGE = /(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/;
const norm = (t: string) => t.replace('.', ':').padStart(5, '0');

export const defaultWeek = (open = '09:00', close = '18:00'): WeeklyHours =>
  WEEK_DAYS.map(() => ({ enabled: true, open, close }));

export function parseWeek(value: string | null | undefined): WeeklyHours | null {
  if (!value?.trim()) return null;
  const parts = value.split(';').map((p) => p.trim()).filter(Boolean);
  const named = parts.some((p) => WEEK_DAYS.some((d) => p.startsWith(d)));
  if (!named) {
    const m = value.match(RANGE);
    return m ? defaultWeek(norm(m[1]), norm(m[2])) : null;
  }
  // Uzun adlar əvvəl yoxlanır ("Bazar ertəsi" ≠ "Bazar", "Cümə axşamı" ≠ "Cümə")
  const byLength = WEEK_DAYS.map((d, i) => [d, i] as const).sort((a, b) => b[0].length - a[0].length);
  const week: WeeklyHours = WEEK_DAYS.map(() => ({ enabled: false, open: '09:00', close: '18:00' }));
  for (const part of parts) {
    const hit = byLength.find(([d]) => part.startsWith(d));
    if (!hit) continue;
    const m = part.slice(hit[0].length).match(RANGE);
    week[hit[1]] = m ? { enabled: true, open: norm(m[1]), close: norm(m[2]) } : { ...week[hit[1]], enabled: false };
  }
  return week;
}

export function formatWeek(week: WeeklyHours): string {
  const on = week.filter((d) => d.enabled);
  const uniform = on.length === 7 && on.every((d) => d.open === on[0].open && d.close === on[0].close);
  if (uniform) return `${on[0].open} - ${on[0].close}`;
  return week.map((d, i) => `${WEEK_DAYS[i]} ${d.enabled ? `${d.open} - ${d.close}` : CLOSED}`).join('; ');
}

/** JS Date.getDay(): 0 = Bazar → bizim indeks: 6 */
export const todayIndex = (now = new Date()) => (now.getDay() + 6) % 7;

const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
};

export function isOpenNow(week: WeeklyHours, now = new Date()): boolean {
  const day = week[todayIndex(now)];
  if (!day?.enabled) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const o = minutes(day.open);
  const c = minutes(day.close);
  return c > o ? cur >= o && cur < c : cur >= o || cur < c; // gecə yarısını keçən qrafik
}

/** Mağazanın qrafiki: gün-gün varsa o, yoxsa tək aralıq bütün günlərə aid edilir */
export function weekOf(store: { schedule?: WeeklyHours | null; workingHours: { open: string; close: string } | null }): WeeklyHours | null {
  if (store.schedule) return store.schedule;
  return store.workingHours ? defaultWeek(store.workingHours.open, store.workingHours.close) : null;
}
