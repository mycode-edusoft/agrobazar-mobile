const AZ_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr',
];

export function formatPrice(price: number | null, negotiable = false): string {
  if (price == null) return negotiable ? 'Razılaşma yolu ilə' : '—';
  const [int, frac] = price.toFixed(2).split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return frac === '00' ? grouped : `${grouped},${frac}`;
}

export function formatAmount(amount: number): string {
  return `${amount.toFixed(2)} AZN`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mi}`;
}

export function formatDayHeading(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]}`;
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const AZ_COUNTRY_CODE = '+994';

export function normalizePhone(local: string): string {
  const digits = local.replace(/\D/g, '');
  return `${AZ_COUNTRY_CODE}${digits.startsWith('0') ? digits.slice(1) : digits}`;
}

export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)];
  return parts.filter(Boolean).join(' ');
}

/** Azərbaycan mobil operator kodları (yerli formatda, aparıcı 0 ilə göstərilir) */
export const AZ_OPERATORS = ['10', '50', '51', '55', '60', '70', '77', '99'] as const;

/**
 * Tap.az məntiqi: tək sahə, "(0" silinməz prefiks. İstənilən mətndən (yazma, autofill, yapışdırma —
 * "+994 55 729 37 91", "055…", "55…") operator+abunəçi 9 rəqəmini çıxarır.
 */
export function parseAzPhoneDigits(text: string): string {
  let digits = text.replace(/\D/g, '');
  if (digits.startsWith('994') && digits.length >= 12) digits = digits.slice(3);
  return digits.replace(/^0+/, '').slice(0, 9);
}

/** 9 rəqəm → "(055) 729-37-91". Ayırıcılar yalnız növbəti rəqəmdən əvvəl qoyulur ki, silmə ilişməsin. */
export function maskAzPhone(digits: string): string {
  const d = digits.slice(0, 9);
  let out = `(0${d.slice(0, 2)}`;
  if (d.length > 2) out += `) ${d.slice(2, 5)}`;
  if (d.length > 5) out += `-${d.slice(5, 7)}`;
  if (d.length > 7) out += `-${d.slice(7, 9)}`;
  return out;
}

export const isKnownAzOperator = (digits: string) =>
  digits.length < 2 || (AZ_OPERATORS as readonly string[]).includes(digits.slice(0, 2));

export function isValidAzPhone(local: string): boolean {
  return local.replace(/\D/g, '').length === 9;
}

export function formatDisplayPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '');
  const local = digits.startsWith('994') ? digits.slice(3) : digits;
  return `${AZ_COUNTRY_CODE} ${formatPhoneInput(local)}`;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Yerli (cihaz) tarixinə görə gün açarı — ISO sətrinin ilk 10 simvolu UTC günüdür, qruplaşdırma üçün yararsızdır. */
export function localDayKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Onluq vergüllə: 1015.846 → "1015,8" */
export const formatDecimal = (n: number, digits = 1) => n.toFixed(digits).replace('.', ',');

/** İşarəli: 12 → "+12", -4 → "-4", 0 → "0" */
export const formatSigned = (n: number) => (n > 0 ? `+${n}` : String(n));

/** Azərbaycan sıra sayı şəkilçisi: 1-ci, 3-cü, 6-cı, 9-cu */
export function ordinal(n: number) {
  const last = n % 10;
  const tens = n % 100;
  const key = last !== 0 ? last : tens !== 0 ? tens : 100;
  const suffix: Record<number, string> = {
    1: 'ci', 2: 'ci', 3: 'cü', 4: 'cü', 5: 'ci', 6: 'cı', 7: 'ci', 8: 'ci', 9: 'cu',
    10: 'cu', 20: 'ci', 30: 'cu', 40: 'cı', 50: 'ci', 60: 'cı', 70: 'ci', 80: 'ci', 90: 'cı', 100: 'cü',
  };
  return `${n}-${suffix[key] ?? 'ci'}`;
}

/** Figma "Aktiv tarifim": "03 - 08 - 2026 20:29" */
export function formatDateTimeDashed(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())} - ${p(d.getMonth() + 1)} - ${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Figma tarixçə sətri: "15 iyun 2026 • 11:40" */
export function formatTxTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${AZ_MONTHS[d.getMonth()]} ${d.getFullYear()} • ${hh}:${mi}`;
}
