import { create } from 'zustand';
import type { Store } from '@/types/domain';

export interface StoreDraft {
  name: string;
  description: string;
  categoryId: string | null;
  logoUri: string | null;
  coverUri: string | null;
  city: string;
  address: string;
  open: string;
  close: string;
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
  city: '', address: '', open: '09:00', close: '18:00',
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
        open: store.workingHours?.open ?? '09:00', close: store.workingHours?.close ?? '18:00',
        phone: ownerLocalPhone, whatsapp: store.whatsapp.replace('+994', ''),
        website: store.website ?? '', youtube: store.youtube ?? '', facebook: store.facebook ?? '',
        instagram: store.instagram ?? '', tiktok: store.tiktok ?? '', agreed: true,
      },
    }),
  clear: () => set({ draft: empty, editing: false }),
}));
