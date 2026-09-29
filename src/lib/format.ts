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
