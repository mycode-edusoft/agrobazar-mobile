import { create } from 'zustand';
import type { ListingFilter } from '@/types/domain';

interface FilterState {
  filter: ListingFilter;
  set(patch: Partial<ListingFilter>): void;
  reset(keep?: Pick<ListingFilter, 'categoryId'>): void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filter: { sort: 'date' },
  set: (patch) => set((s) => ({ filter: { ...s.filter, ...patch } })),
  reset: (keep) => set({ filter: { sort: 'date', ...keep } }),
}));

export function activeFilterCount(f: ListingFilter): number {
  let n = 0;
  if (f.subcategoryId) n++;
  if (f.subsubIds?.length) n++;
  if (f.city) n++;
  if (f.priceMin != null || f.priceMax != null) n++;
  if (f.types?.length) n++;
  if (f.sort && f.sort !== 'date') n++;
  return n;
}
