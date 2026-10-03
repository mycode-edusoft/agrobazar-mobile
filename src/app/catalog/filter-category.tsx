import { useRouter } from 'expo-router';
import { CategoryCardList } from '@/components/catalog/CategoryCardList';
import { Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories } from '@/lib/queries';
import { useFilterDraft } from '@/store/filterDraft';

/**
 * Figma "Filter → Kateqoriya": axtarışlı kateqoriya siyahısı.
 * Seçim zənciri filter rejimində davam edir: alt kateqoriyalar → növlər → "Tətbiq et" → Filter.
 */
export default function FilterCategoryScreen() {
  const router = useRouter();
  const { data } = useCategories();
  const patch = useFilterDraft((s) => s.patch);

  return (
    <Screen header={<ScreenHeader title={t.filter.category} />}>
      <CategoryCardList
        categories={data ?? []}
        onSelect={(item) => {
          patch({ categoryId: item.id, subcategoryId: undefined, subsubIds: undefined });
          if (item.subcategories.length > 0) {
            router.push({ pathname: '/catalog/sub/[categoryId]', params: { categoryId: item.id, mode: 'filter' } });
          } else {
            router.dismissTo('/catalog/filter');
          }
        }}
      />
    </Screen>
  );
}
