import { create } from 'zustand';
import { api } from '@/services';
import { useAuthStore } from './auth';
import { useGuestStore } from './guest';

interface FavoritesState {
  listingIds: Set<string>;
  storeIds: Set<string>;
  loaded: boolean;
  load(): Promise<void>;
  toggleListing(id: string): Promise<boolean>;
  toggleStore(id: string): Promise<boolean>;
  removeListings(ids: string[]): Promise<void>;
  mergeGuestIntoAccount(): Promise<void>;
}

const anon = () => (useAuthStore.getState().token ? null : useGuestStore.getState().anonId);

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  listingIds: new Set(),
  storeIds: new Set(),
  loaded: false,

  async load() {
    const ids = await api.favorites.ids(anon());
    set({ listingIds: new Set(ids.listings), storeIds: new Set(ids.stores), loaded: true });
  },

  async toggleListing(id) {
    const has = get().listingIds.has(id);
    const next = new Set(get().listingIds);
    if (has) next.delete(id);
    else next.add(id);
    set({ listingIds: next });
    try {
      if (has) await api.favorites.removeListing(id, anon());
      else await api.favorites.addListing(id, anon());
    } catch (e) {
      set({ listingIds: get().listingIds.has(id) === has ? get().listingIds : new Set(get().listingIds) });
      await get().load();
      throw e;
    }
    return !has;
  },

  async toggleStore(id) {
    const has = get().storeIds.has(id);
    const next = new Set(get().storeIds);
    if (has) next.delete(id);
    else next.add(id);
    set({ storeIds: next });
    try {
      if (has) await api.favorites.removeStore(id, anon());
      else await api.favorites.addStore(id, anon());
    } catch (e) {
      await get().load().catch(() => undefined);
      throw e;
    }
    return !has;
  },

  async removeListings(ids) {
    const next = new Set(get().listingIds);
    ids.forEach((id) => next.delete(id));
    set({ listingIds: next });
    await api.favorites.removeListings(ids, anon());
  },

  async mergeGuestIntoAccount() {
    const anonId = useGuestStore.getState().anonId;
    if (anonId) await api.favorites.mergeGuest(anonId).catch(() => undefined);
    await get().load();
  },
}));
