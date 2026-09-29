import { useLocalSearchParams, useRouter } from 'expo-router';
import { PickerList } from '@/components/listing/PickerList';
import { Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategory } from '@/lib/queries';
import { useListingDraft } from '@/store/listingDraft';

export default function CreateListingSubSubcategoryScreen() {
  const router = useRouter();
  const { categoryId, subcategoryId } = useLocalSearchParams<{ categoryId: string; subcategoryId: string }>();
  const { category } = useCategory(categoryId);
  const sub = category?.subcategories.find((s) => s.id === subcategoryId);
  const set = useListingDraft((s) => s.set);
  const subsubId = useListingDraft((s) => s.draft.subsubId);

  return (
    <Screen header={<ScreenHeader title={sub ? `${sub.name}: ${t.createListing.subsubcategory}` : t.createListing.subsubcategory} />}>
      <PickerList
        items={(sub?.subsubcategories ?? []).map((b) => ({ id: b.id, name: b.name }))}
        searchPlaceholder={t.common.search}
        selectedId={subsubId}
        onSelect={(item) => {
          set({ subsubId: item.id });
          router.push('/listing/create/form');
        }}
      />
    </Screen>
  );
}
