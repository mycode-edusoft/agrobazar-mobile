import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CategoryIcon } from '@/components/listing/CategoryIcon';
import { ListingCard } from '@/components/listing/ListingCard';
import { CategoryBulkIcon } from '@/components/navigation/HeaderIcons';
import { HomeHeader } from '@/components/navigation/HomeHeader';
import { AppText, Screen, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { openCategoryFlow } from '@/lib/catalogNav';
import { qk, useCategories } from '@/lib/queries';
import { api } from '@/services';
import { activeFilterCount, useFilterStore } from '@/store/filter';
import { colors, layout, radii, shadows } from '@/theme';
import type { Category } from '@/types/domain';
import { Icon } from '@/components/icons/Icon';

export default function HomeScreen() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const filter = useFilterStore((s) => s.filter);
  const reset = useFilterStore((s) => s.reset);

  const premium = useQuery({ queryKey: qk.premium(), queryFn: () => api.listings.premium() });

  // Figma App 2: kateqoriya → alt kateqoriyalar → növlər → elanlar
  const openCategory = (id: string) => {
    const category = (categories ?? []).find((c) => c.id === id);
    if (category) openCategoryFlow(router, category);
  };

  return (
    <Screen header={<HomeHeader />} scroll contentStyle={styles.content}>
      <View style={styles.searchBlock}>
        <SearchBar
          value=""
          onChange={() => undefined}
          placeholder={t.catalog.searchProduct}
          onPress={() => router.push('/search')}
          onFilterPress={() => router.push('/catalog/filter')}
          filterActive={activeFilterCount(filter) > 0}
        />
      </View>

      {/* Bannerlər hələlik götürülüb (məhsul qərarı, 2026-09-30) — API: api.catalog.banners() qalır */}
      <View style={styles.categoryCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <CategoryTile label={t.catalog.title} onPress={() => router.push('/catalog')} medium>
            <CategoryBulkIcon color={colors.textMuted} />
          </CategoryTile>
          {(categories ?? []).map((c: Category) => (
            <CategoryTile key={c.id} label={c.name} onPress={() => openCategory(c.id)}>
              <CategoryIcon icon={c.icon} imageUrl={c.imageUrl} size={54} />
            </CategoryTile>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <AppText variant="body" color={colors.heading}>
              {t.catalog.premium}
            </AppText>
            <Icon name="crownTitle" size={20} />
          </View>
          <Pressable onPress={() => { reset(); router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: 'all' } }); }} hitSlop={8}>
            <AppText variant="body" color={colors.linkGreen}>
              {t.catalog.latest}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.premiumRow}>
          {(premium.data ?? []).slice(0, 2).map((item) => (
            <ListingCard key={item.id} item={item} />
          ))}
        </View>
      </View>

    </Screen>
  );
}

// Figma: "Kataloq" plitəsinin adı Medium, kateqoriyalarınkı Regular (10px)
function CategoryTile({
  label, onPress, children, medium,
}: { label: string; onPress(): void; children: React.ReactNode; medium?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.categoryTile}>
      <View style={styles.categoryIcon}>{children}</View>
      <AppText variant={medium ? 'tabLabel' : 'tabLabelRegular'} color={colors.textSecondary} center numberOfLines={2} style={styles.categoryLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, gap: 16 },
  searchBlock: { backgroundColor: colors.surface, paddingHorizontal: layout.screenPadding, paddingVertical: 16 },

  categoryCard: {
    marginHorizontal: layout.screenPadding, backgroundColor: colors.surface,
    borderRadius: radii.sm, paddingVertical: 16,
  },
  categoryRow: { paddingHorizontal: 16, gap: 16 },
  categoryTile: { width: 62, alignItems: 'center', gap: 6 },
  categoryIcon: {
    width: 54, height: 54, borderRadius: radii.sm, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  categoryLabel: { lineHeight: 12 },

  section: { paddingHorizontal: layout.screenPadding, gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumRow: { flexDirection: 'row', gap: 10 },
});
