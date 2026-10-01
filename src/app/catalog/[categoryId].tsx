import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AppText, EmptyState, Pill, Screen, ScreenHeader, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk, useCategory } from '@/lib/queries';
import { api } from '@/services';
import { activeFilterCount, useFilterStore } from '@/store/filter';
import { colors, layout } from '@/theme';
import { Icon } from '@/components/icons/Icon';

export default function CategoryListingScreen() {
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const isAll = categoryId === 'all';
  const { category } = useCategory(isAll ? undefined : categoryId);
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.set);
  const [q, setQ] = useState(filter.query ?? '');

  useEffect(() => {
    if (!isAll && filter.categoryId !== categoryId) setFilter({ categoryId, subcategoryId: undefined, subsubIds: undefined });
  }, [categoryId, isAll, filter.categoryId, setFilter]);

  const effective = useMemo(() => ({ ...filter, categoryId: isAll ? undefined : categoryId }), [filter, categoryId, isAll]);
  const searching = !!effective.query;

  const list = useInfiniteQuery({
    queryKey: qk.search(effective, 0),
    queryFn: ({ pageParam }) => api.listings.search(effective, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });
  const premium = useQuery({
    queryKey: qk.premium(effective),
    queryFn: () => api.listings.premium(effective),
    enabled: !searching,
  });
  const vip = useQuery({
    queryKey: qk.vip(effective.categoryId),
    queryFn: () => api.listings.vip(effective.categoryId),
    enabled: !searching,
    staleTime: 0,
  });

  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const title = isAll ? (effective.query ? `"${effective.query}"` : t.catalog.title) : category?.name ?? t.catalog.title;

  // Figma: çiplər növlərdir (Bizon, Buğa, Dana…) — alt kateqoriya seçilibsə yalnız onunkular.
  // Axtarışda (məs. "buğa") çip sırası gizlənir — dizayner qeydi.
  const chosenSub = category?.subcategories.find((s) => s.id === filter.subcategoryId);
  const chips = chosenSub ? chosenSub.subsubcategories : (category?.subcategories ?? []).flatMap((s) => s.subsubcategories);
  const activeSubsub = filter.subsubIds?.[0] ?? null;

  const header = (
    <View style={styles.headerBlock}>
      {!searching && chips.length > 0 ? (
        // Figma (App 2): "Hamısı" çipi yoxdur — seçilmiş çipə yenidən toxunmaq seçimi ləğv edir
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {chips.map((s) => (
            <Pill
              key={s.id}
              label={s.name}
              active={activeSubsub === s.id}
              onPress={() => setFilter({ subsubIds: activeSubsub === s.id ? undefined : [s.id] })}
            />
          ))}
        </ScrollView>
      ) : null}
      {!searching && premium.data && premium.data.length > 0 ? (
        <View style={styles.sectionTitleRow}>
          <AppText variant="body" color={colors.heading}>
            {t.catalog.premium}
          </AppText>
          <Icon name="crownTitle" size={20} />
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen header={<ScreenHeader title={title} />}>
      <View style={styles.search}>
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder={category ? t.catalog.searchIn(category.name) : t.catalog.searchProduct}
          onSubmit={() => setFilter({ query: q.trim() || undefined })}
          onFilterPress={() => router.push('/catalog/filter')}
          filterActive={activeFilterCount(filter) > 0}
        />
      </View>
      <ListingGrid
        data={searching ? items : [...(premium.data ?? []), ...items]}
        header={header}
        empty={list.isLoading ? null : <EmptyState text={t.catalog.noResults} icon="search-outline" />}
        onEndReached={() => list.hasNextPage && !list.isFetchingNextPage && list.fetchNextPage()}
        loadingMore={list.isFetchingNextPage}
        refreshing={list.isRefetching && !list.isFetchingNextPage}
        onRefresh={() => {
          list.refetch();
          vip.refetch();
        }}
        contentContainerStyle={styles.grid}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: layout.screenPadding, paddingTop: 16, paddingBottom: 12, backgroundColor: colors.surface },
  headerBlock: { marginHorizontal: -layout.screenPadding, gap: 8 },
  chips: { paddingHorizontal: layout.screenPadding, paddingBottom: 16, gap: 10, backgroundColor: colors.surface },
  sectionTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: layout.screenPadding, paddingTop: 12,
  },
  grid: { paddingTop: 0 },
});
