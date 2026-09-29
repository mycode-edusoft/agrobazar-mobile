import { useLocalSearchParams, useRouter } from 'expo-router';
import { PickerList } from '@/components/listing/PickerList';
import { Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategory } from '@/lib/queries';
import { useListingDraft } from '@/store/listingDraft';

export default function CreateListingSubcategoryScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const { category } = useCategory(categoryId);
  const setSubcategory = useListingDraft((s) => s.setSubcategory);

  return (
    <Screen header={<ScreenHeader title={category?.name ?? t.createListing.productCategory} />}>
      <PickerList
        items={(category?.subcategories ?? []).map((s) => ({ id: s.id, name: s.name }))}
        searchPlaceholder={t.common.search}
        onSelect={(item) => {
          setSubcategory(item.id);
          const sub = category?.subcategories.find((s) => s.id === item.id);
          if (sub && sub.subsubcategories.length > 0) {
            router.push({ pathname: '/listing/create/subsubcategory', params: { categoryId, subcategoryId: item.id } });
          } else {
            router.push('/listing/create/form');
          }
        }}
      />
    </Screen>
  );
}
