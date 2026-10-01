import { create } from 'zustand';
import type { ListingFilter } from '@/types/domain';

/**
 * Filter ekranının redaktə olunan nüsxəsi. Kateqoriya seçimi ayrı ekranlarda (Kateqoriya → alt → növ)
 * aparıldığı üçün qaralama ortaq store-da saxlanılır; "Elanı göstər" basılanda əsas filtrə köçürülür.
 */
interface DraftState {
  draft: ListingFilter;
  init(from: ListingFilter): void;
  patch(p: Partial<ListingFilter>): void;
}

export const useFilterDraft = create<DraftState>((set) => ({
  draft: { sort: 'date' },
  init: (from) => set({ draft: { ...from } }),
  patch: (p) => set((s) => ({ draft: { ...s.draft, ...p } })),
}));
