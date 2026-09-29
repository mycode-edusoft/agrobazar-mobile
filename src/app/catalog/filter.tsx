import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  AppText, Button, Card, Checkbox, FooterBar, Input, MultiSelectSheet, Screen, ScreenHeader, SelectSheet,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories, useCities } from '@/lib/queries';
import { useFilterStore } from '@/store/filter';
import { colors, layout } from '@/theme';
import type { ListingFilter, ListingType, SortOption } from '@/types/domain';

const listingTypes: ListingType[] = ['sale', 'rent', 'wanted', 'offer'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date', label: t.catalog.sortDate },
  { value: 'price_desc', label: t.catalog.sortPriceDesc },
  { value: 'price_asc', label: t.catalog.sortPriceAsc },
];

export default function FilterScreen() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  const regionOptions = (cities ?? []).map((r) => ({ value: r, label: r }));
  const stored = useFilterStore((s) => s.filter);
  const apply = useFilterStore((s) => s.set);
  const [f, setF] = useState<ListingFilter>(stored);
  const [sheet, setSheet] = useState<'category' | 'subcategory' | 'breed' | 'region' | null>(null);

  const category = categories?.find((c) => c.id === f.categoryId) ?? null;
  const subcategory = category?.subcategories.find((s) => s.id === f.subcategoryId) ?? null;
  const patch = (p: Partial<ListingFilter>) => setF((prev) => ({ ...prev, ...p }));

  const toggleType = (type: ListingType) => {
    const set = new Set(f.types ?? []);
    if (set.has(type)) set.delete(type);
    else set.add(type);
    patch({ types: [...set] });
  };

  const submit = () => {
    apply({ ...f, priceMin: f.priceMin || undefined, priceMax: f.priceMax || undefined });
    if (f.categoryId !== stored.categoryId) {
      router.dismiss();
      router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: f.categoryId ?? 'all' } });
    } else {
      router.back();
    }
  };

  const chevron = <Ionicons name="chevron-down" size={20} color={colors.textMuted} />;

  return (
    <Screen
      header={<ScreenHeader title={t.filter.title} rightText={t.common.reset} onRightPress={() => setF({ sort: 'date', categoryId: f.categoryId })} />}
      scroll
      padded
      footer={
        <FooterBar>
          <Button title={t.common.apply} onPress={submit} />
        </FooterBar>
      }
    >
      <View style={styles.form}>
        <Input label={t.filter.category} value={category?.name ?? ''} placeholder={t.common.select} onPressContainer={() => setSheet('category')} rightElement={chevron} />
        {category && category.subcategories.length > 0 ? (
          <Input label={t.filter.subcategory} value={subcategory?.name ?? ''} placeholder={t.common.select} onPressContainer={() => setSheet('subcategory')} rightElement={chevron} />
        ) : null}
        {subcategory && subcategory.subsubcategories.length > 0 ? (
          <Input
            label={t.filter.subsubcategory}
            value={(f.subsubIds ?? []).map((id) => subcategory.subsubcategories.find((b) => b.id === id)?.name).filter(Boolean).join(', ')}
            placeholder={t.common.all}
            onPressContainer={() => setSheet('breed')}
            rightElement={chevron}
          />
        ) : null}

        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.filter.price}
        </AppText>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Input label={t.filter.min} value={f.priceMin != null ? String(f.priceMin) : ''} onChangeText={(v) => patch({ priceMin: v ? Number(v.replace(/[^\d.]/g, '')) : undefined })} keyboardType="numeric" />
          </View>
          <View style={styles.flex}>
            <Input label={t.filter.max} value={f.priceMax != null ? String(f.priceMax) : ''} onChangeText={(v) => patch({ priceMax: v ? Number(v.replace(/[^\d.]/g, '')) : undefined })} keyboardType="numeric" />
          </View>
        </View>

        <Input label={t.filter.region} value={f.city ?? ''} placeholder={t.common.all} onPressContainer={() => setSheet('region')} rightElement={chevron} />

        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.filter.service}
        </AppText>
        <Card flat style={styles.group}>
          {listingTypes.map((type) => (
            <Checkbox key={type} checked={(f.types ?? []).includes(type)} onChange={() => toggleType(type)} label={t.listingType[type]} />
          ))}
        </Card>

        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.filter.sort}
        </AppText>
        <Card flat style={styles.group}>
          {sortOptions.map((o) => (
            <Checkbox key={o.value} checked={(f.sort ?? 'date') === o.value} onChange={() => patch({ sort: o.value })} label={o.label} />
          ))}
        </Card>
      </View>

      <SelectSheet
        visible={sheet === 'category'}
        onClose={() => setSheet(null)}
        title={t.filter.category}
        options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        value={f.categoryId ?? null}
        onSelect={(v) => patch({ categoryId: v ?? undefined, subcategoryId: undefined, subsubIds: undefined })}
        searchable
        searchPlaceholder={t.catalog.searchCategory}
        allowClear
      />
      <SelectSheet
        visible={sheet === 'subcategory'}
        onClose={() => setSheet(null)}
        title={t.filter.subcategory}
        options={(category?.subcategories ?? []).map((s) => ({ value: s.id, label: s.name }))}
        value={f.subcategoryId ?? null}
        onSelect={(v) => patch({ subcategoryId: v ?? undefined, subsubIds: undefined })}
        searchable
        allowClear
      />
      {subcategory ? (
        <MultiSelectSheet
          visible={sheet === 'breed'}
          onClose={() => setSheet(null)}
          title={`${subcategory.name}:`}
          options={subcategory.subsubcategories.map((b) => ({ value: b.id, label: b.name }))}
          values={f.subsubIds ?? []}
          onApply={(values) => patch({ subsubIds: values.length ? values : undefined })}
        />
      ) : null}
      <SelectSheet
        visible={sheet === 'region'}
        onClose={() => setSheet(null)}
        title={t.filter.region}
        options={regionOptions}
        value={f.city ?? null}
        onSelect={(v) => patch({ city: v ?? undefined })}
        searchable
        allowClear
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  row: { flexDirection: 'row', gap: 8 },
  group: { gap: 14 },
});
