import type { useRouter } from 'expo-router';
import { useFilterStore } from '@/store/filter';
import type { Category } from '@/types/domain';

/**
 * Figma "App 2 → Kataloq" axını:
 *   kateqoriya → alt kateqoriyalar siyahısı (step 15) → növ çipləri + "Elanı göstər" (step 13) → elanlar.
 * Alt səviyyəsi olmayan addımlar atlanır.
 */
export function openCategoryFlow(router: ReturnType<typeof useRouter>, category: Category) {
  useFilterStore.getState().reset({ categoryId: category.id });
  if (category.subcategories.length > 0) {
    router.push({ pathname: '/catalog/sub/[categoryId]', params: { categoryId: category.id } });
  } else {
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: category.id } });
  }
}

export function openSubcategoryFlow(router: ReturnType<typeof useRouter>, categoryId: string, subcategoryId: string, hasTypes: boolean) {
  const store = useFilterStore.getState();
  store.reset({ categoryId });
  store.set({ subcategoryId });
  if (hasTypes) {
    router.push({ pathname: '/catalog/types', params: { categoryId, subcategoryId } });
  } else {
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId } });
  }
}
