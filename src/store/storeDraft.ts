import { create } from 'zustand';
import { defaultWeek, weekOf, type WeeklyHours } from '@/lib/storeHours';
import type { Store } from '@/types/domain';

export interface StoreDraft {
  name: string;
  description: string;
  categoryId: string | null;
  logoUri: string | null;
  coverUri: string | null;
  city: string;
  address: string;
  week: WeeklyHours;
  phone: string;
  whatsapp: string;
  website: string;
  youtube: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  agreed: boolean;
}

const empty: StoreDraft = {
  name: '', description: '', categoryId: null, logoUri: null, coverUri: null,
  city: '', address: '', week: defaultWeek(),
  phone: '', whatsapp: '', website: '', youtube: '', facebook: '', instagram: '', tiktok: '', agreed: false,
};

interface State {
  draft: StoreDraft;
  editing: boolean;
  set(patch: Partial<StoreDraft>): void;
  start(): void;
  startFrom(store: Store, ownerLocalPhone: string): void;
  clear(): void;
}

export const useStoreDraft = create<State>((set) => ({
  draft: empty,
  editing: false,
  set: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  start: () => set({ draft: empty, editing: false }),
  startFrom: (store, ownerLocalPhone) =>
    set({
      editing: true,
      draft: {
        name: store.name, description: store.description, categoryId: store.categoryId,
        logoUri: store.logoUrl, coverUri: store.coverUrl, city: store.city, address: store.address,
        week: weekOf(store) ?? defaultWeek(),
        phone: ownerLocalPhone, whatsapp: store.whatsapp.replace('+994', ''),
        website: store.website ?? '', youtube: store.youtube ?? '', facebook: store.facebook ?? '',
        instagram: store.instagram ?? '', tiktok: store.tiktok ?? '', agreed: true,
      },
    }),
  clear: () => set({ draft: empty, editing: false }),
}));
