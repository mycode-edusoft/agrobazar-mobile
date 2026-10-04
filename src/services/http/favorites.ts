import type { FavoriteStore } from '@/types/domain';
import type { FavoriteApi } from '../api';
import { request, unwrapList } from './client';
import { mapSummary, type ApiListing } from './mappers';

interface ApiFavorite {
  id: number;
  listing: ApiListing;
}

const listingOf = (f: ApiFavorite | ApiListing): ApiListing =>
  'listing' in f && f.listing ? f.listing : (f as ApiListing);

async function loadFavorites(): Promise<ApiListing[]> {
  const res = await request<unknown>('listings/favorites/', { query: { page_size: 100 } });
  return unwrapList<ApiFavorite | ApiListing>(res).items.map(listingOf).filter(Boolean);
}

interface ApiFavoriteStore {
  id: number;
  slug: string;
  store_name: string;
  logo?: { url?: string } | string | null;
  published_listings_count?: number;
}

// Giriş edilibsə profilə, edilməyibsə qonağa (visitor cookie) bağlıdır — elan seçilmişləri ilə eyni
async function loadFavoriteStores(): Promise<FavoriteStore[]> {
  const res = await request<unknown>('auth/customers/store-favorites/', { query: { page_size: 100 } });
  return unwrapList<ApiFavoriteStore>(res).items.map((s) => ({
    id: s.slug || String(s.id),
    name: s.store_name,
    logoUrl: typeof s.logo === 'string' ? s.logo : s.logo?.url ?? null,
    activeListingsCount: s.published_listings_count ?? 0,
  }));
}

/** Backend favoritləri listing pk ilə saxlayır, UI isə slug ilə işləyir. */
const slugToPk = new Map<string, number>();

function remember(items: ApiListing[]) {
  for (const l of items) slugToPk.set(l.slug || String(l.id), l.id);
}

async function pkOf(id: string): Promise<number> {
  const known = slugToPk.get(id);
  if (known != null) return known;
  const numeric = Number(id);
  if (Number.isFinite(numeric)) return numeric;
  const res = await request<unknown>('listings/es_filter_search/', {
    auth: false,
    query: { q: id, page_size: 20 },
  });
  const items = unwrapList<ApiListing>(res).items;
  remember(items);
  const found = items.find((l) => l.slug === id);
  if (!found) throw new Error('listing not found');
  return found.id;
}

export const httpFavorites: FavoriteApi = {
  async listings() {
    const items = await loadFavorites();
    remember(items);
    return items.map(mapSummary);
  },

  async stores() {
    return loadFavoriteStores();
  },

  async ids() {
    const [items, stores] = await Promise.all([loadFavorites(), loadFavoriteStores().catch(() => [])]);
    remember(items);
    return { listings: items.map((l) => l.slug || String(l.id)), stores: stores.map((s) => s.id) };
  },

  async addListing(id) {
    await request('listings/favorites/create/', { method: 'POST', body: { listing_id: await pkOf(id) } });
  },

  async removeListing(id) {
    await request(`listings/favorites/${await pkOf(id)}/delete/`, { method: 'DELETE' });
  },

  // UI mağazanı slug ilə tanıyır; backend həm slug, həm id qəbul edir
  async addStore(id) {
    await request('auth/customers/store-favorites/create/', { method: 'POST', body: { store_slug: id } });
  },

  async removeStore(id) {
    await request(`auth/customers/store-favorites/${encodeURIComponent(id)}/delete/`, { method: 'DELETE' });
  },

  async removeListings(ids) {
    await Promise.all(ids.map((id) => this.removeListing(id, null)));
  },

  async mergeGuest() {
    // Qonaq favoritləri serverdə visitor_id ilə saxlanılır və girişdə avtomatik köçürülür
  },
};
