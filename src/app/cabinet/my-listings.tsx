import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { ListingsEmpty } from '@/components/listing/ListingsEmpty';
import { useListingActions } from '@/components/listing/useListingActions';
import { Pill, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { MY_LISTING_TABS } from '@/lib/rules';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';
import type { ListingStatus } from '@/types/domain';

export default function MyListingsScreen() {
  const loggedIn = useAuthStore((s) => s.token != null);
  const [status, setStatus] = useState<ListingStatus>('active');
  const actions = useListingActions();

  const list = useQuery({ queryKey: qk.myListings(status), queryFn: () => api.listings.mine(status), enabled: loggedIn });
  const items = list.data ?? [];

  return (
    <Screen header={<ScreenHeader title={t.cabinet.myListings} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={[styles.tabs, styles.dim]}>
        {MY_LISTING_TABS.map((s) => (
          <Pill key={s} variant="outline" label={t.listing.status[s]} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>
      {items.length === 0 && !list.isLoading ? (
        <View style={styles.emptyWrap}>
          <ListingsEmpty text={t.favorites.empty} tall />
        </View>
      ) : (
        <ListingGrid
          data={items}
          showType={false}
          onMenu={actions.open}
          refreshing={list.isRefetching}
          onRefresh={() => list.refetch()}
          contentContainerStyle={styles.grid}
        />
      )}
      {actions.sheets}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabsWrap: { flexGrow: 0, backgroundColor: colors.surface },
  // Figma: çip sırası opacity .8
  tabs: { paddingHorizontal: layout.screenPadding, paddingTop: 16, paddingBottom: 16, gap: 10 },
  emptyWrap: { flex: 1, padding: layout.screenPadding },
  grid: { paddingTop: 16 },
  dim: { opacity: 0.8 },
});
