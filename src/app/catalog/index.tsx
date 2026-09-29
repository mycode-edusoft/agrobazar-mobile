import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CategoryIcon } from '@/components/listing/CategoryIcon';
import { AppText, Screen, ScreenHeader, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories } from '@/lib/queries';
import { activeFilterCount, useFilterStore } from '@/store/filter';
import { colors, layout, radii, shadows } from '@/theme';

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

  const openCategory = (id: string) => {
    reset({ categoryId: id });
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: id } });
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
        data={data ?? []}
        keyExtractor={(c) => c.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable onPress={() => openCategory(item.id)} style={styles.cell}>
            <CategoryIcon icon={item.icon} imageUrl={item.imageUrl} />
            <AppText variant="caption" color={colors.textSecondary} center numberOfLines={2} style={styles.label}>
              {item.name}
            </AppText>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: layout.screenPadding, paddingVertical: 12, backgroundColor: colors.surface },
  grid: { padding: layout.screenPadding, gap: 12 },
  row: { gap: 12 },
  cell: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.sm, paddingVertical: 12, paddingHorizontal: 6,
    alignItems: 'center', gap: 8, ...shadows.card,
  },
  label: { lineHeight: 16, minHeight: 32 },
});
