import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@/components/icons/Icon';
import { t } from '@/i18n/az';
import { AppText } from '@/components/ui';
import { colors, layout, shadows, typography } from '@/theme';
import type { Category } from '@/types/domain';

/**
 * Figma "Filter → Kateqoriya" və "Yeni elan (Kataloq step 17)": ağ kartda axtarış +
 * kateqoriya siyahısı (24px ikon plitəsi, ad 16/18, adın altında xətt; sonuncuda yoxdur).
 */
export function CategoryCardList({ categories, onSelect }: { categories: Category[]; onSelect(category: Category): void }) {
  const [q, setQ] = useState('');
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? categories.filter((c) => c.name.toLowerCase().includes(needle)) : categories;
  }, [categories, q]);

  return (
    <View style={styles.body}>
      <View style={styles.card}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t.catalog.searchCategory}
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
          />
        </View>
        <FlatList
          data={items}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Pressable style={styles.row} onPress={() => onSelect(item)}>
              <View style={styles.tile}>
                {item.imageUrl ? <Image source={item.imageUrl} style={styles.tileImage} contentFit="contain" /> : null}
              </View>
              <View style={styles.rowText}>
                <AppText style={styles.label}>{item.name}</AppText>
                {index < items.length - 1 ? <View style={styles.line} /> : null}
              </View>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: layout.screenPadding },
  card: { maxHeight: '100%', backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, gap: 24, ...shadows.card },
  search: {
    height: 38, marginHorizontal: 16, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty,
    borderWidth: 1, borderColor: colors.divider, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16,
  },
  input: { flex: 1, ...typography.small, lineHeight: 22, color: colors.text, padding: 0 },
  list: { paddingHorizontal: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.inputBackgroundEmpty, overflow: 'hidden' },
  tileImage: { width: 24, height: 24 },
  rowText: { flex: 1, gap: 6, paddingTop: 4 },
  label: { ...typography.body, lineHeight: 18, color: colors.textSecondary },
  line: { height: 1, backgroundColor: colors.divider },
});
