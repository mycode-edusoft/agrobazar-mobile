import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { AppText } from './AppText';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import { Checkbox, SearchBar } from './controls';

export interface SelectOption {
  value: string;
  label: string;
}

interface SingleProps {
  visible: boolean;
  onClose(): void;
  title: string;
  options: SelectOption[];
  value: string | null;
  onSelect(value: string | null): void;
  searchable?: boolean;
  searchPlaceholder?: string;
  allowClear?: boolean;
  clearLabel?: string;
}

export function SelectSheet({
  visible, onClose, title, options, value, onSelect, searchable, searchPlaceholder = 'Axtar', allowClear, clearLabel = 'Hamısı',
}: SingleProps) {
  const [q, setQ] = useState('');
  const data = useMemo(() => {
    const list = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;
    return allowClear ? [{ value: '', label: clearLabel }, ...list] : list;
  }, [options, q, allowClear, clearLabel]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {searchable ? <SearchBar value={q} onChange={setQ} placeholder={searchPlaceholder} /> : null}
      <FlatList
        data={data}
        keyExtractor={(o) => o.value || '__all'}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const selected = (item.value || null) === value;
          return (
            <Pressable
              onPress={() => {
                onSelect(item.value || null);
                onClose();
              }}
              style={styles.row}
            >
              <AppText variant="body" color={selected ? colors.primary : colors.textSecondary} style={styles.flex}>
                {item.label}
              </AppText>
              {selected ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        }}
      />
    </BottomSheet>
  );
}

interface MultiProps {
  visible: boolean;
  onClose(): void;
  title: string;
  options: SelectOption[];
  values: string[];
  onApply(values: string[]): void;
  applyLabel?: string;
  allLabel?: string;
}

export function MultiSelectSheet({ visible, onClose, title, options, values, onApply, applyLabel = 'Tətbiq et', allLabel = 'Hamısı' }: MultiProps) {
  const [local, setLocal] = useState<Set<string>>(new Set(values));
  const [q, setQ] = useState('');
  const data = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;
  const all = local.size === options.length && options.length > 0;

  const toggle = (v: string) => {
    const next = new Set(local);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setLocal(next);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <SearchBar value={q} onChange={setQ} placeholder="Axtar" />
      <View style={styles.allRow}>
        <Checkbox
          checked={all}
          onChange={(v) => setLocal(v ? new Set(options.map((o) => o.value)) : new Set())}
          label={allLabel}
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(o) => o.value}
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Checkbox checked={local.has(item.value)} onChange={() => toggle(item.value)} label={item.label} />
          </View>
        )}
      />
      <Button
        title={applyLabel}
        onPress={() => {
          onApply([...local]);
          onClose();
        }}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { maxHeight: 420 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.divider },
  allRow: { paddingVertical: 8 },
});
