import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StoreCard } from '@/components/store/StoreCard';
import { EmptyState, Screen, ScreenHeader, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { colors, layout } from '@/theme';

export default function StoresScreen() {
  const [q, setQ] = useState('');
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: qk.stores(q),
    queryFn: () => api.stores.list(q),
  });

  return (
    <Screen header={<ScreenHeader title={t.stores.title} hideBack />}>
      <View style={styles.search}>
        <SearchBar value={q} onChange={setQ} placeholder={t.stores.search} />
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(s) => s.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListEmptyComponent={isLoading ? null : <EmptyState text={t.catalog.noResults} icon="storefront-outline" />}
        renderItem={({ item }) => (
          <StoreCard id={item.id} name={item.name} logoUrl={item.logoUrl} activeListingsCount={item.activeListingsCount} totalViews={item.totalViews} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: layout.screenPadding, paddingVertical: 12, backgroundColor: colors.surface },
  // Figma: kartlar arası həm üfüqi, həm şaquli 16
  grid: { padding: layout.screenPadding, gap: 16 },
  row: { gap: 16 },
});
