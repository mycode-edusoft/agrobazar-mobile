import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CardSearchField } from '@/components/catalog/CardSearchField';
import { Icon } from '@/components/icons/Icon';
import { AppText, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { openSubcategoryFlow } from '@/lib/catalogNav';
import { useCategory } from '@/lib/queries';
import { useFilterDraft } from '@/store/filterDraft';
import { useListingDraft } from '@/store/listingDraft';
import { colors, layout, shadows, typography } from '@/theme';

/** Figma "App 2 → Kataloq step 15": kateqoriyanın alt kateqoriyaları, kart içində axtarış + siyahı. */
export default function SubcategoryScreen() {
  const router = useRouter();
  // mode=filter — Filter ekranının Kateqoriya seçimindən açılıb: seçim filter qaralamasına yazılır
  const { categoryId, mode } = useLocalSearchParams<{ categoryId: string; mode?: string }>();
  const forFilter = mode === 'filter';
  // mode=create — "Yeni elan" axını (Figma: Business account / Elan yerləşdir): seçim elan qaralamasına yazılır
  const forCreate = mode === 'create';
  const setSubcategory = useListingDraft((s) => s.setSubcategory);
  const patchDraft = useFilterDraft((s) => s.patch);
  const { category } = useCategory(categoryId);
  const [q, setQ] = useState('');

  const items = useMemo(() => {
    const all = category?.subcategories ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((s) => s.name.toLowerCase().includes(needle)) : all;
  }, [category, q]);

  return (
    <Screen header={<ScreenHeader title={category?.name ?? t.catalog.title} />}>
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.searchWrap}>
            <CardSearchField value={q} onChange={setQ} />
          </View>
          <FlatList
            data={items}
            keyExtractor={(s) => s.id}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            renderItem={({ item, index }) => (
              <Pressable
                style={styles.row}
                onPress={() => {
                  const hasTypes = item.subsubcategories.length > 0;
                  if (forCreate) {
                    setSubcategory(item.id);
                    return hasTypes
                      ? router.push({ pathname: '/catalog/types', params: { categoryId, subcategoryId: item.id, mode: 'create' } })
                      : router.push('/listing/create/form');
                  }
                  if (!forFilter) return openSubcategoryFlow(router, categoryId, item.id, hasTypes);
                  patchDraft({ categoryId, subcategoryId: item.id, subsubIds: undefined });
                  if (hasTypes) {
                    router.push({ pathname: '/catalog/types', params: { categoryId, subcategoryId: item.id, mode: 'filter' } });
                  } else {
                    router.dismissTo('/catalog/filter');
                  }
                }}
              >
                <View style={styles.rowText}>
                  <AppText style={styles.rowLabel}>{item.name}</AppText>
                  {/* Ayırıcı yalnız mətnin altında, sonuncu sətirdə yoxdur */}
                  {index < items.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.chevron}>
                  <Icon name="chevron" direction="right" size={24} color={colors.textMuted} />
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
  // Figma: ağ kart, radius 14, kölgə 0 0 14 .08, yuxarı-aşağı 16, axtarışla siyahı arası 24
  card: { maxHeight: '100%', backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, gap: 24, ...shadows.card },
  searchWrap: { paddingHorizontal: 16 },
  // Figma: siyahı kartdan 16 + əlavə 16 sol boşluq, sətirlər arası 16
  list: { paddingLeft: 32, paddingRight: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  rowText: { flex: 1, gap: 8 },
  rowLabel: { ...typography.body, color: colors.textSecondary },
  line: { height: 1, backgroundColor: colors.divider },
  chevron: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center' },
});
