import { AppState } from 'react-native';
import { api, ApiError, type ListingEvent, type ListingEventType } from '@/services';

/**
 * Elan statistikası: əlaqə klikləri (zəng / WhatsApp) — sahibin statistikasında «Əlaqə» göstəricisi.
 *
 * - Klik tətbiqdən çıxarır (zəng/WhatsApp açılır), ona görə hadisə növbədə gözləmir, dərhal göndərilir.
 * - Şəbəkə xətasında yaddaşda saxlanılır və növbəti klikdə / tətbiq ön plana qayıdanda yenidən göndərilir.
 * - 4xx (elan artıq aktiv deyil və s.) — təkrar mənasızdır, atılır. Sahibin öz klikləri serverdə süzülür.
 * - Baxış (detail_view) və seçilmişə əlavə (favorite_add) serverdə özü yazılır — buradan göndərilmir.
 */

const MAX_PENDING = 50;
// Bir tətbiq açılışı = bir sessiya (server təkrarları bununla da ayırd edir)
const sessionKey = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
let pending: ListingEvent[] = [];
let flushing = false;

async function flush() {
  if (flushing || pending.length === 0) return;
  flushing = true;
  const batch = pending.slice(0, 100);
  try {
    await api.analytics.sendListingEvents(batch, sessionKey);
    pending = pending.slice(batch.length);
  } catch (e) {
    if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 429) {
      pending = pending.slice(batch.length);
    }
  } finally {
    flushing = false;
  }
}

AppState.addEventListener('change', (state) => {
  if (state === 'active') void flush();
});

export function trackListingEvent(listing: { pk?: number; status: string }, type: ListingEventType) {
  // Server yalnız aktiv elanlar üçün hadisə qəbul edir (qarışıq batch bütövlükdə rədd olunar)
  if (!listing.pk || listing.status !== 'active') return;
  pending.push({ listingPk: listing.pk, type, occurredAt: new Date().toISOString() });
  if (pending.length > MAX_PENDING) pending = pending.slice(-MAX_PENDING);
  void flush();
}
