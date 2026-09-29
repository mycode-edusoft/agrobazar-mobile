import { useMemo, useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, SearchBar } from '@/components/ui';
import { colors, layout } from '@/theme';

export interface PickerItem {
  id: string;
  name: string;
  icon?: ReactNode;
}

interface Props {
  items: PickerItem[];
  onSelect(item: PickerItem): void;
  searchPlaceholder: string;
  selectedId?: string | null;
}

// Kataloq step 10 / alt-kateqoriya / cins seçim siyahıları üçün ortaq komponent
export function PickerList({ items, onSelect, searchPlaceholder, selectedId }: Props) {
  const [q, setQ] = useState('');
  const data = useMemo(
    () => (q ? items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase())) : items),
    [items, q],
  );

  return (
    <View style={styles.flex}>
      <View style={styles.search}>
        <SearchBar value={q} onChange={setQ} placeholder={searchPlaceholder} />
      </View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => onSelect(item)} style={styles.row}>
            {item.icon ? <View style={styles.icon}>{item.icon}</View> : null}
            <AppText variant="body" color={selectedId === item.id ? colors.primary : colors.textSecondary} style={styles.flex}>
              {item.name}
            </AppText>
            <Ionicons name="chevron-forward" size={18} color={colors.textPlaceholder} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  search: { paddingHorizontal: layout.screenPadding, paddingVertical: 12, backgroundColor: colors.surface },
  list: { backgroundColor: colors.surface, paddingHorizontal: layout.screenPadding },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  icon: { width: 40, alignItems: 'center' },
});
