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

  // Mağaza favoritləri üçün backend endpoint-i yoxdur
  async stores() {
    return [];
  },

  async ids() {
    const items = await loadFavorites();
    remember(items);
    return { listings: items.map((l) => l.slug || String(l.id)), stores: [] };
  },

  async addListing(id) {
    await request('listings/favorites/create/', { method: 'POST', body: { listing_id: await pkOf(id) } });
  },

  async removeListing(id) {
    await request(`listings/favorites/${await pkOf(id)}/delete/`, { method: 'DELETE' });
  },

  async addStore() {
    // dəstəklənmir
  },

  async removeStore() {
    // dəstəklənmir
  },

  async removeListings(ids) {
    await Promise.all(ids.map((id) => this.removeListing(id, null)));
  },

  async mergeGuest() {
    // Qonaq favoritləri serverdə visitor_id ilə saxlanılır və girişdə avtomatik köçürülür
  },
};
