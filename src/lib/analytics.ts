import { AppState } from 'react-native';
import { api, ApiError, type AnalyticsSource, type ListingEvent, type ListingEventType } from '@/services';

/**
 * Elan statistikası hadisələri (sahibin statistika ekranı: Əlaqə, CTR).
 *
 * - Əlaqə klikləri (zəng / WhatsApp) tətbiqdən çıxarır → dərhal göndərilir.
 * - Kart göstərilmələri və karta toxunuşlar paketlə: BATCH_SIZE yığılanda, FLUSH_DELAY_MS sonra və ya tətbiq
 *   arxa plana keçəndə.
 * - Şəbəkə / 429 / 5xx → növbədə qalır, sonra yenidən. 4xx → paket yarıya bölünüb yenidən göndərilir: backend
 *   paketdə bir dənə də aktiv olmayan elan görsə BÜTÜN paketi rədd edir; bölmə pis hadisəni təcrid edib atır.
 * - Server sahibin öz hadisələrini, botları və təkrarları (dəqiqəlik) süzür.
 */

const MAX_PENDING = 300;
const BATCH_SIZE = 20;
const FLUSH_DELAY_MS = 10_000;
const MAX_REQUEST = 100; // backend limiti

// Bir tətbiq açılışı = bir sessiya
const sessionKey = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
let pending: ListingEvent[] = [];
let flushing = false;
let timer: ReturnType<typeof setTimeout> | null = null;

const isClientError = (e: unknown) => e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429;

/** true — paket (və ya onun düzgün hissələri) qəbul olundu ya da atıldı; false — sonra yenidən cəhd. */
async function send(batch: ListingEvent[]): Promise<boolean> {
  try {
    await api.analytics.sendListingEvents(batch, sessionKey);
    return true;
  } catch (e) {
    if (!isClientError(e)) return false;
    if (batch.length === 1) return true; // tək pis hadisə — atılır
    const mid = Math.ceil(batch.length / 2);
    const [a, b] = await Promise.all([send(batch.slice(0, mid)), send(batch.slice(mid))]);
    return a && b;
  }
}

export async function flushAnalytics() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (flushing || pending.length === 0) return;
  flushing = true;
  try {
    while (pending.length > 0) {
      const batch = pending.slice(0, MAX_REQUEST);
      if (!(await send(batch))) break;
      pending = pending.slice(batch.length);
    }
  } finally {
    flushing = false;
  }
}

function schedule() {
  if (pending.length >= BATCH_SIZE) void flushAnalytics();
  else if (!timer) timer = setTimeout(() => void flushAnalytics(), FLUSH_DELAY_MS);
}

AppState.addEventListener('change', (state) => {
  if (state !== 'active') void flushAnalytics(); // arxa plana keçir — yığılanı göndər
  else if (pending.length) void flushAnalytics();
});

interface Trackable {
  pk?: number;
  status: string;
}

function enqueue(listing: Trackable, type: ListingEventType, extra: Pick<ListingEvent, 'source' | 'card'> = {}) {
  // Server yalnız aktiv elanlar üçün hadisə qəbul edir
  if (!listing.pk || listing.status !== 'active') return false;
  pending.push({ listingPk: listing.pk, type, occurredAt: new Date().toISOString(), ...extra });
  if (pending.length > MAX_PENDING) pending = pending.slice(-MAX_PENDING);
  return true;
}

export function trackListingEvent(listing: Trackable, type: 'phone_click' | 'whatsapp_click') {
  if (enqueue(listing, type)) void flushAnalytics();
}

export interface CardContext {
  source: AnalyticsSource;
  block: string;
  index: number;
}

export function trackCardImpression(listing: Trackable, ctx: CardContext) {
  if (enqueue(listing, 'card_impression', { source: ctx.source, card: { index: ctx.index, block: ctx.block } })) schedule();
}

export function trackCardOpen(listing: Trackable, ctx: CardContext) {
  if (enqueue(listing, 'detail_open_from_list', { source: ctx.source, card: { index: ctx.index, block: ctx.block } })) {
    schedule();
  }
}
