import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
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
}

export function ListingGrid({
  data, header, footer, empty, onEndReached, loadingMore, refreshing, onRefresh,
  selectable, selectedIds, onToggleSelect, contentContainerStyle, showType, onMenu,
}: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
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
      renderItem={({ item }) => (
        <ListingCard
          item={item}
          selectable={selectable}
          selected={selectedIds?.has(item.id)}
          onToggleSelect={onToggleSelect}
          showType={showType}
          onMenu={onMenu}
        />
      )}
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
  content: { paddingHorizontal: layout.screenPadding, paddingBottom: 24, gap: layout.cardGap },
  row: { gap: layout.cardGap },
  loader: { paddingVertical: 16 },
  hRow: { paddingHorizontal: layout.screenPadding, gap: 12 },
  hItem: { width: 174 },
});
