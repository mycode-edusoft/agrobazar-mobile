import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RegionSheet } from '@/components/catalog/RegionSheet';
import { SelectChip } from '@/components/catalog/SelectChip';
import { Icon } from '@/components/icons/Icon';
import { AppText, Button, FooterBar, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories, useCities } from '@/lib/queries';
import { useFilterStore } from '@/store/filter';
import { useFilterDraft } from '@/store/filterDraft';
import { colors, layout, shadows, typography } from '@/theme';
import type { ListingType, SortOption } from '@/types/domain';

const listingTypes: ListingType[] = ['sale', 'rent', 'wanted', 'offer'];
const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date', label: t.catalog.sortDate },
  { value: 'price_desc', label: t.catalog.sortPriceDesc },
  { value: 'price_asc', label: t.catalog.sortPriceAsc },
];

/**
 * Figma "App 2 → Filter": bir ağ kartda Kateqoriya / Qiymət AZN / Bölgə / Xidmət / Sıralama.
 * Kateqoriya ayrıca ekranlar zənciri ilə seçilir (Kateqoriya → alt kateqoriya → növ → "Tətbiq et"),
 * Bölgə alt paneldə. Redaktə qaralamada aparılır, "Elanı göstər" onu tətbiq edir.
 */
export default function FilterScreen() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  const stored = useFilterStore((s) => s.filter);
  const apply = useFilterStore((s) => s.set);
  const f = useFilterDraft((s) => s.draft);
  const init = useFilterDraft((s) => s.init);
  const patch = useFilterDraft((s) => s.patch);
  const [regionOpen, setRegionOpen] = useState(false);

  // Ekran açılanda qaralama cari filtrdən başlayır
  useEffect(() => {
    init(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const category = categories?.find((c) => c.id === f.categoryId) ?? null;
  const subcategory = category?.subcategories.find((s) => s.id === f.subcategoryId) ?? null;
  const subsub = subcategory?.subsubcategories.find((s) => s.id === f.subsubIds?.[0]) ?? null;
  // Figma: sahədə ən dərin seçim görünür (məs. "Buğa")
  const categoryLabel = subsub?.name ?? subcategory?.name ?? category?.name ?? '';

  const priceError = f.priceMin != null && f.priceMax != null && f.priceMin > f.priceMax;

  const toggleType = (type: ListingType) => {
    const set = new Set(f.types ?? []);
    if (set.has(type)) set.delete(type);
    else set.add(type);
    patch({ types: [...set] });
  };

  const submit = () => {
    if (priceError) return;
    apply({ ...f, priceMin: f.priceMin || undefined, priceMax: f.priceMax || undefined });
    if (f.categoryId !== stored.categoryId) {
      router.dismiss();
      router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: f.categoryId ?? 'all' } });
    } else {
      router.back();
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={t.filter.title} rightText={t.common.reset} onRightPress={() => init({ sort: 'date' })} />}
      scroll
      footer={
        <FooterBar style={styles.footer}>
          {/* Figma: xəta vəziyyətində də düymə aktiv görünür — göndərmə bloklanır, xəta sahələrdə göstərilir */}
          <Button title={t.catalog.showListings} onPress={submit} />
        </FooterBar>
      }
    >
      {/* Figma: bölmələr bir ağ kartda — radius 14, kölgə 0 0 14 .08, bölmələr arası 24 */}
      <View style={styles.card}>
        <Section title={t.filter.category}>
          <SelectField
            value={categoryLabel}
            placeholder={t.filter.selectCategory}
            placeholderDark
            onPress={() => router.push('/catalog/filter-category')}
          />
        </Section>

        <Section title={t.filter.priceAzn}>
          <View style={styles.row}>
            <PriceField
              placeholder={t.filter.min}
              value={f.priceMin}
              onChange={(v) => patch({ priceMin: v })}
              error={priceError ? t.filter.minTooHigh : undefined}
            />
            <PriceField
              placeholder={t.filter.max}
              value={f.priceMax}
              onChange={(v) => patch({ priceMax: v })}
              error={priceError ? t.filter.maxTooLow : undefined}
            />
          </View>
        </Section>

        {/* Figma: Bölgə sahəsinin ayrıca başlığı yoxdur */}
        <View style={styles.section}>
          <SelectField value={f.city ?? ''} placeholder={t.filter.region} onPress={() => setRegionOpen(true)} />
        </View>

        <Section title={t.filter.service}>
          <View style={styles.chips}>
            {listingTypes.map((type) => (
              <SelectChip key={type} label={t.listingType[type]} active={(f.types ?? []).includes(type)} onPress={() => toggleType(type)} />
            ))}
          </View>
        </Section>

        <Section title={t.filter.sort}>
          <View style={styles.chips}>
            {sortOptions.map((o) => (
              <SelectChip key={o.value} label={o.label} active={(f.sort ?? 'date') === o.value} onPress={() => patch({ sort: o.value })} />
            ))}
          </View>
        </Section>
      </View>

      <RegionSheet
        visible={regionOpen}
        onClose={() => setRegionOpen(false)}
        regions={cities ?? []}
        value={f.city ?? null}
        onSelect={(city) => patch({ city })}
      />
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {children}
    </View>
  );
}

// Figma App/Inputs: 56px, padding 16, #F5F5F5, radius 8; dəyər 16/24 #595959; sağda ox
function SelectField({
  value, placeholder, placeholderDark, onPress,
}: { value: string; placeholder: string; placeholderDark?: boolean; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.field}>
      {/* Figma: "Kateqoriya seç" tünd (#595959), "Bölgə" isə açıq (#BFBFBF) placeholder-dir */}
      <AppText style={[styles.fieldText, !value && !placeholderDark && styles.placeholder]} numberOfLines={1}>
        {value || placeholder}
      </AppText>
      <Icon name="chevron" direction="right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

// Figma xəta vəziyyəti: haşiyə və mətn #EF4444, fon rgba(249,249,249,.85), altda 12/20 Medium mesaj
function PriceField({
  placeholder, value, onChange, error,
}: { placeholder: string; value?: number; onChange(v?: number): void; error?: string }) {
  return (
    <View style={styles.priceCol}>
      <View style={[styles.field, error && styles.fieldError]}>
        <TextInput
          value={value != null ? String(value) : ''}
          onChangeText={(v) => {
            const digits = v.replace(/[^\d.]/g, '');
            onChange(digits ? Number(digits) : undefined);
          }}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.danger : colors.textPlaceholder}
          keyboardType="numeric"
          style={[styles.fieldText, styles.input, error && styles.textError]}
        />
      </View>
      {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: layout.screenPadding, paddingVertical: 16, gap: 24, borderRadius: 14,
    backgroundColor: colors.surface, ...shadows.card,
  },
  section: { paddingHorizontal: 16, gap: 12 },
  // Figma: bölmə adları Roboto Bold 16/24 #595959
  sectionTitle: { ...typography.bodyBold, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  priceCol: { flex: 1, gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  field: {
    height: 56, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'transparent',
  },
  fieldError: { borderColor: colors.danger, backgroundColor: 'rgba(249, 249, 249, 0.85)' },
  fieldText: { flex: 1, ...typography.body, color: colors.textSecondary },
  placeholder: { color: colors.textPlaceholder },
  input: { padding: 0 },
  textError: { color: colors.danger },
  errorText: { ...typography.captionMedium, color: colors.danger, paddingHorizontal: 16 },
  footer: { backgroundColor: 'transparent', paddingTop: 24 },
});
