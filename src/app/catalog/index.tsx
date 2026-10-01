import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { CategoryIcon } from '@/components/listing/CategoryIcon';
import { AppText, Screen, ScreenHeader, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { openCategoryFlow } from '@/lib/catalogNav';
import { useCategories } from '@/lib/queries';
import { activeFilterCount, useFilterStore } from '@/store/filter';
import { colors, layout, shadows } from '@/theme';
import type { Category } from '@/types/domain';

export default function CatalogScreen() {
  const router = useRouter();
  const { data } = useCategories();
  const [q, setQ] = useState('');
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.set);
  const reset = useFilterStore((s) => s.reset);

  const submitSearch = () => {
    if (!q.trim()) return;
    reset();
    setFilter({ query: q.trim() });
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: 'all' } });
  };

  // Figma App 2: kateqoriya → alt kateqoriyalar → növlər → elanlar
  const openCategory = (id: string) => {
    const category = (data ?? []).find((c) => c.id === id);
    if (category) openCategoryFlow(router, category);
  };

  return (
    <Screen header={<ScreenHeader title={t.catalog.title} />}>
      <View style={styles.search}>
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={t.catalog.searchProduct}
          onSubmit={submitSearch}
          onFilterPress={() => router.push('/catalog/filter')}
          filterActive={activeFilterCount(filter) > 0}
        />
      </View>
      <FlatList
        data={padToColumns(data ?? [])}
        keyExtractor={(c) => c.id}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => item.id.startsWith(PAD) ? <View style={styles.cell} /> : (
          <Pressable onPress={() => openCategory(item.id)} style={styles.cell}>
            {/* Figma: 98×82 plitə, radius 18, #F5F5F5, şəkil 83×72 */}
            <View style={styles.tile}>
              {item.imageUrl ? (
                <Image source={item.imageUrl} style={styles.tileImage} contentFit="contain" transition={120} />
              ) : (
                <CategoryIcon icon={item.icon} size={56} />
              )}
            </View>
            <AppText variant="captionMedium" color={colors.textSecondary} center numberOfLines={3} style={styles.label}>
              {item.name}
            </AppText>
          </Pressable>
        )}
      />
    </Screen>
  );
}

// Son sətir natamamdırsa boş yerlər — tək qalan plitə bütün eni tutmasın
const COLUMNS = 3;
const PAD = '__pad';
function padToColumns(items: Category[]): Category[] {
  const rest = (COLUMNS - (items.length % COLUMNS)) % COLUMNS;
  return [...items, ...Array.from({ length: rest }, (_, i) => ({ ...items[0], id: `${PAD}${i}` }))];
}

const styles = StyleSheet.create({
  // Figma: axtarış bloku ağ, 16 daxili boşluq
  search: { paddingHorizontal: layout.screenPadding, paddingVertical: 16, backgroundColor: colors.surface },
  // Figma: bütün kateqoriyalar bir ağ kartda — radius 14, kölgə 0 0 14 .08, 3 sütun, aralar 16
  grid: {
    margin: layout.screenPadding, padding: 16, gap: 16, borderRadius: 14,
    backgroundColor: colors.surface, ...shadows.card,
  },
  row: { gap: 16 },
  cell: { flex: 1, alignItems: 'center', gap: 6 },
  tile: {
    width: '100%', height: 82, borderRadius: 18, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center', padding: 5,
  },
  tileImage: { width: 83, height: 72 },
  label: { lineHeight: 18 },
});
