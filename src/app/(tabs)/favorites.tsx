import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { StoreCard } from '@/components/store/StoreCard';
import {
  AppText, Checkbox, ConfirmSheet, EmptyState, IconButton, Screen, ScreenHeader, useToast,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useGuestStore } from '@/store/guest';
import { colors, layout } from '@/theme';

type Tab = 'listings' | 'stores';

export default function FavoritesScreen() {
  const [tab, setTab] = useState<Tab>('listings');
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.token != null);
  const anonId = useGuestStore((s) => s.anonId);
  const favVersion = useFavoritesStore((s) => s.listingIds.size + s.storeIds.size);
  const removeListings = useFavoritesStore((s) => s.removeListings);

  const listings = useQuery({
    queryKey: [...qk.favListings, loggedIn, favVersion],
    queryFn: () => api.favorites.listings(loggedIn ? null : anonId),
  });
  const stores = useQuery({
    queryKey: [...qk.favStores, loggedIn, favVersion],
    queryFn: () => api.favorites.stores(loggedIn ? null : anonId),
    enabled: tab === 'stores',
  });

  const items = listings.data ?? [];
  const allSelected = items.length > 0 && selected.size === items.length;

  const exitSelection = () => {
    setSelecting(false);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const onDelete = async () => {
    setDeleting(true);
    try {
      await removeListings([...selected]);
      await qc.invalidateQueries({ queryKey: qk.favListings });
      exitSelection();
      setConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const header = (
    <ScreenHeader
      title={t.favorites.title}
      hideBack
      right={
        tab === 'listings' && items.length > 0 ? (
          selecting ? (
            <Pressable onPress={exitSelection} hitSlop={8}>
              <AppText variant="bodyMedium">{t.common.cancel}</AppText>
            </Pressable>
          ) : (
            <IconButton onPress={() => setSelecting(true)} accessibilityLabel="Seçim rejimi">
              <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
            </IconButton>
          )
        ) : null
      }
    />
  );

  const tabs = (
    <View style={styles.tabs}>
      {(['listings', 'stores'] as Tab[]).map((k) => (
        <Pressable
          key={k}
          onPress={() => {
            setTab(k);
            exitSelection();
          }}
          style={[styles.tab, tab === k && styles.tabActive]}
        >
          <AppText variant="smallMedium" color={tab === k ? colors.primary : colors.textMuted}>
            {k === 'listings' ? t.favorites.listings : t.favorites.stores}
          </AppText>
        </Pressable>
      ))}
    </View>
  );

  const selectionBar = selecting ? (
    <View style={styles.selectionBar}>
      <Checkbox
        checked={allSelected}
        onChange={(v) => setSelected(v ? new Set(items.map((i) => i.id)) : new Set())}
        label={t.favorites.selectAll}
      />
      <Pressable
        disabled={selected.size === 0}
        onPress={() => setConfirm(true)}
        hitSlop={8}
        style={selected.size === 0 && styles.disabled}
      >
        <AppText variant="smallMedium" color={colors.danger}>
          {t.common.delete} ({selected.size})
        </AppText>
      </Pressable>
    </View>
  ) : null;

  return (
    <Screen header={header}>
      {tabs}
      {selectionBar}
      {tab === 'listings' ? (
        <ListingGrid
          data={items}
          refreshing={listings.isFetching && !listings.isLoading}
          onRefresh={() => listings.refetch()}
          selectable={selecting}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          contentContainerStyle={styles.grid}
          empty={listings.isLoading ? null : <EmptyState text={t.favorites.empty} icon="heart-outline" />}
        />
      ) : (
        <FlatList
          data={stores.data ?? []}
          keyExtractor={(s) => s.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          ListEmptyComponent={stores.isLoading ? null : <EmptyState text={t.favorites.emptyStores} icon="storefront-outline" />}
          renderItem={({ item }) => <StoreCard {...item} />}
        />
      )}
      <ConfirmSheet
        visible={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => onDelete().catch(() => toast(t.common.error, 'error'))}
        title={t.favorites.confirmTitle}
        message={t.favorites.confirmDelete}
        confirmText={t.common.delete}
        danger
        loading={deleting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.surface },
  tab: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  selectionBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: layout.screenPadding, paddingVertical: 10, backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  disabled: { opacity: 0.4 },
  grid: { paddingTop: 16, paddingHorizontal: layout.screenPadding, gap: layout.cardGap },
  row: { gap: layout.cardGap },
});
