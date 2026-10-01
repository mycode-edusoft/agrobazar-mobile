import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/icons/Icon';
import { AppText, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories } from '@/lib/queries';
import { useFilterDraft } from '@/store/filterDraft';
import { colors, layout, shadows, typography } from '@/theme';

/**
 * Figma "Filter → Kateqoriya": axtarışlı kateqoriya siyahısı (24px ikon plitəsi + ad).
 * Seçim zənciri filter rejimində davam edir: alt kateqoriyalar → növlər → "Tətbiq et" → Filter.
 */
export default function FilterCategoryScreen() {
  const router = useRouter();
  const { data } = useCategories();
  const patch = useFilterDraft((s) => s.patch);
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const all = data ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((c) => c.name.toLowerCase().includes(needle)) : all;
  }, [data, q]);

  return (
    <Screen header={<ScreenHeader title={t.filter.category} />}>
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
              <Pressable
                style={styles.row}
                onPress={() => {
                  patch({ categoryId: item.id, subcategoryId: undefined, subsubIds: undefined });
                  if (item.subcategories.length > 0) {
                    router.push({ pathname: '/catalog/sub/[categoryId]', params: { categoryId: item.id, mode: 'filter' } });
                  } else {
                    router.dismissTo('/catalog/filter');
                  }
                }}
              >
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
    </Screen>
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
  // Figma: 24px plitə (radius 4, #F5F5F5), ad 16/18 #595959, xətt adın altında (sonuncuda yoxdur)
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tile: { width: 24, height: 24, borderRadius: 4, backgroundColor: colors.inputBackgroundEmpty, overflow: 'hidden' },
  tileImage: { width: 24, height: 24 },
  rowText: { flex: 1, gap: 6, paddingTop: 4 },
  label: { ...typography.body, lineHeight: 18, color: colors.textSecondary },
  line: { height: 1, backgroundColor: colors.divider },
});
