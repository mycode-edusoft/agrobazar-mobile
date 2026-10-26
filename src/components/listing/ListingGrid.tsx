import { useRef, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, type StyleProp, type ViewStyle, type ViewToken } from 'react-native';
import { trackCardImpression, trackCardOpen, type CardContext } from '@/lib/analytics';
import type { AnalyticsSource } from '@/services';
import { colors, layout } from '@/theme';
import type { ListingSummary } from '@/types/domain';
import { ListingCard } from './ListingCard';

interface Props {
  data: ListingSummary[];
  header?: ReactElement | null;
  footer?: ReactElement | null;
  empty?: ReactElement | null;
  onEndReached?: () => void;
  loadingMore?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showType?: boolean;
  onMenu?: (item: ListingSummary) => void;
  /**
   * Statistika (CTR): verilərsə kartın ≥50%-i 0.5 san görünəndə `card_impression`, toxunanda
   * `detail_open_from_list` göndərilir. Sahib siyahılarında (Elanlarım) verilmir.
   */
  analytics?: { source: AnalyticsSource; blockOf?: (item: ListingSummary, index: number) => string };
}

const VIEWABILITY = { itemVisiblePercentThreshold: 50, minimumViewTime: 500 };

export function ListingGrid({
  data, header, footer, empty, onEndReached, loadingMore, refreshing, onRefresh,
  selectable, selectedIds, onToggleSelect, contentContainerStyle, showType, onMenu, analytics,
}: Props) {
  // Tək saylı siyahıda son kart bütün eni tutmasın deyə yanına görünməz boş yuva qoyulur
  const cells: (ListingSummary | null)[] = data.length % 2 ? [...data, null] : data;

  // FlatList onViewableItemsChanged-in dəyişməsinə icazə vermir — ən son props ref-dən oxunur
  const analyticsRef = useRef(analytics);
  analyticsRef.current = analytics;
  const seen = useRef(new Set<string>()); // bu siyahı açıq olduğu müddətdə hər kart bir dəfə sayılır
  const contextOf = (item: ListingSummary, index: number): CardContext | null => {
    const a = analyticsRef.current;
    return a ? { source: a.source, block: a.blockOf?.(item, index) ?? 'standart', index } : null;
  };
  const onViewable = useRef(({ viewableItems }: { viewableItems: ViewToken<ListingSummary | null>[] }) => {
    for (const v of viewableItems) {
      const item = v.item;
      if (!item || v.index == null || seen.current.has(item.id)) continue;
      const ctx = contextOf(item, v.index);
      if (!ctx) return;
      seen.current.add(item.id);
      trackCardImpression(item, ctx);
    }
  }).current;

  return (
    <FlatList
      viewabilityConfig={VIEWABILITY}
      onViewableItemsChanged={onViewable}
      data={cells}
      keyExtractor={(i) => i?.id ?? 'spacer'}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      ListHeaderComponent={header}
      ListFooterComponent={
        <>
          {loadingMore ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
          {footer}
        </>
      }
      ListEmptyComponent={empty}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) =>
        item ? (
          <ListingCard
            item={item}
            onOpen={analytics ? () => { const ctx = contextOf(item, index); if (ctx) trackCardOpen(item, ctx); } : undefined}
            selectable={selectable}
            selected={selectedIds?.has(item.id)}
            onToggleSelect={onToggleSelect}
            showType={showType}
            onMenu={onMenu}
          />
        ) : (
          <View style={styles.spacer} />
        )
      }
    />
  );
}

export function ListingRow({ data }: { data: ListingSummary[] }) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(i) => i.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.hRow}
      renderItem={({ item }) => (
        <View style={styles.hItem}>
          <ListingCard item={item} width={174} />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  spacer: { flex: 1 },
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: 24, gap: layout.cardGap },
  row: { gap: layout.cardGap },
  loader: { paddingVertical: 16 },
  hRow: { paddingHorizontal: layout.screenPadding, gap: 12 },
  hItem: { width: 174 },
});
