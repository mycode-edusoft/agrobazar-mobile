import { create } from 'zustand';
import type { ListingType } from '@/types/domain';

export interface ListingDraft {
  categoryId: string | null;
  subcategoryId: string | null;
  subsubId: string | null;
  type: ListingType;
  price: string;
  negotiable: boolean;
  city: string;
  title: string;
  description: string;
  whatsapp: string;
  images: string[];
  videoUri: string | null;
  fields: Record<string, string>;
  agreed: boolean;
}

const empty: ListingDraft = {
  categoryId: null,
  subcategoryId: null,
  subsubId: null,
  type: 'sale',
  price: '',
  negotiable: false,
  city: '',
  title: '',
  description: '',
  whatsapp: '',
  images: [],
  videoUri: null,
  fields: {},
  agreed: false,
};

interface DraftState {
  draft: ListingDraft;
  editingId: string | null;
  set(patch: Partial<ListingDraft>): void;
  // BRD: kateqoriya dəyişəndə əvvəlki kateqoriyaya xas cavablar silinir
  setCategory(categoryId: string | null): void;
  setSubcategory(subcategoryId: string | null): void;
  start(editingId?: string | null, initial?: Partial<ListingDraft>): void;
  clear(): void;
}

export const useListingDraft = create<DraftState>((set) => ({
  draft: empty,
  editingId: null,
  set: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  setCategory: (categoryId) =>
    set((s) => ({ draft: { ...s.draft, categoryId, subcategoryId: null, subsubId: null, fields: {} } })),
  setSubcategory: (subcategoryId) =>
    set((s) => ({ draft: { ...s.draft, subcategoryId, subsubId: null, fields: {} } })),
  start: (editingId = null, initial = {}) => set({ draft: { ...empty, ...initial }, editingId }),
  clear: () => set({ draft: empty, editingId: null }),
}));
