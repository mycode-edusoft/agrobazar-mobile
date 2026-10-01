import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CardSearchField } from '@/components/catalog/CardSearchField';
import { SelectChip } from '@/components/catalog/SelectChip';
import { AppText, Button, FooterBar, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategory } from '@/lib/queries';
import { useFilterStore } from '@/store/filter';
import { useFilterDraft } from '@/store/filterDraft';
import { colors, layout, shadows, typography } from '@/theme';

/** Figma "App 2 → Kataloq step 13": alt kateqoriyanın növləri çip kimi + "Elanı göstər". */
export default function SubsubcategoryScreen() {
  const router = useRouter();
  const { categoryId, subcategoryId, mode } = useLocalSearchParams<{ categoryId: string; subcategoryId: string; mode?: string }>();
  // mode=filter — "Kataloq step 14": düymə "Tətbiq et", seçim Filter qaralamasına yazılıb Filter-ə qayıdılır
  const forFilter = mode === 'filter';
  const draft = useFilterDraft((s) => s.draft);
  const patchDraft = useFilterDraft((s) => s.patch);
  const { category } = useCategory(categoryId);
  const sub = category?.subcategories.find((s) => s.id === subcategoryId);
  const setFilter = useFilterStore((s) => s.set);
  const [q, setQ] = useState('');
  // Dizaynda bir çip seçili göstərilir; "Hamısı" = növ məhdudiyyəti yoxdur
  const [selected, setSelected] = useState<string | null>(
    forFilter && draft.subcategoryId === subcategoryId ? draft.subsubIds?.[0] ?? null : null,
  );

  const types = useMemo(() => {
    const all = sub?.subsubcategories ?? [];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((s) => s.name.toLowerCase().includes(needle)) : all;
  }, [sub, q]);

  const show = () => {
    if (forFilter) {
      patchDraft({ categoryId, subcategoryId, subsubIds: selected ? [selected] : undefined });
      router.dismissTo('/catalog/filter');
      return;
    }
    setFilter({ subcategoryId, subsubIds: selected ? [selected] : undefined });
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId } });
  };

  return (
    <Screen
      header={<ScreenHeader title={category?.name ?? t.catalog.title} />}
      footer={
        <FooterBar style={styles.footer}>
          <Button title={forFilter ? t.common.apply : t.catalog.showListings} onPress={show} />
        </FooterBar>
      }
    >
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.pad}>
            <CardSearchField value={q} onChange={setQ} />
          </View>
          <ScrollView contentContainerStyle={[styles.pad, styles.section]} keyboardShouldPersistTaps="handled">
            {sub ? <AppText style={styles.label}>{`${sub.name}:`}</AppText> : null}
            <View style={styles.chips}>
              {!q.trim() ? <SelectChip label={t.common.all} active={selected == null} onPress={() => setSelected(null)} /> : null}
              {types.map((s) => (
                <SelectChip
                  key={s.id}
                  label={s.name}
                  active={selected === s.id}
                  onPress={() => setSelected(selected === s.id ? null : s.id)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, padding: layout.screenPadding, paddingBottom: 0 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, gap: 24, ...shadows.card },
  pad: { paddingHorizontal: 16 },
  section: { gap: 16 },
  label: { ...typography.smallMedium, lineHeight: 22, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  // Figma: düymə bloku 24 yuxarı boşluq, fon səhifə ilə eyni
  footer: { backgroundColor: 'transparent', paddingTop: 24 },
});
