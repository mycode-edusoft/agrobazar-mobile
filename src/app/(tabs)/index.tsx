import { Dimensions, FlatList, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CategoryIcon } from '@/components/listing/CategoryIcon';
import { ListingCard } from '@/components/listing/ListingCard';
import { HomeHeader } from '@/components/navigation/HomeHeader';
import { AppText, Screen, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk, useBanners, useCategories } from '@/lib/queries';
import { api } from '@/services';
import { activeFilterCount, useFilterStore } from '@/store/filter';
import { colors, layout, radii, shadows } from '@/theme';
import type { Banner, Category } from '@/types/domain';

const BANNER_WIDTH = Math.min(356, Dimensions.get('window').width - 2 * layout.screenPadding);

export default function HomeScreen() {
  const router = useRouter();
  const banners = useBanners();
  const { data: categories } = useCategories();
  const filter = useFilterStore((s) => s.filter);
  const reset = useFilterStore((s) => s.reset);

  const premium = useQuery({ queryKey: qk.premium(), queryFn: () => api.listings.premium() });

  const openCategory = (id: string) => {
    reset({ categoryId: id });
    router.push({ pathname: '/catalog/[categoryId]', params: { categoryId: id } });
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

      <FlatList
        data={banners.data ?? []}
        keyExtractor={(b) => b.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bannerRow}
        snapToInterval={BANNER_WIDTH + 6}
        decelerationRate="fast"
        renderItem={({ item }) => (
          <BannerCard
            banner={item}
            onPress={() => {
              if (item.categoryId) openCategory(item.categoryId);
              else if (item.link) Linking.openURL(item.link).catch(() => undefined);
            }}
          />
        )}
      />

      <View style={styles.categoryCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <CategoryTile label={t.catalog.title} onPress={() => router.push('/catalog')}>
            <Ionicons name="grid" size={26} color={colors.textSecondary} />
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
            <MaterialCommunityIcons name="crown" size={19} color="#F7B500" />
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

      <View style={styles.servicesBlock}>
        <ServiceCard icon="pricetag-outline" label={t.home.services.plans} onPress={() => router.push('/cabinet/plans')} />
      </View>
    </Screen>
  );
}

function BannerCard({ banner, onPress }: { banner: Banner; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.banner}>
      <Image source={banner.image} style={styles.bannerImage} contentFit="cover" transition={150} />
      {banner.title ? (
        <View style={styles.bannerText}>
          <AppText variant="bodyBold" color={colors.surface} style={styles.bannerTitle}>
            {banner.title}
          </AppText>
          {banner.highlight ? (
            <AppText variant="bodyBold" color={colors.bannerAccent} style={styles.bannerTitle}>
              {banner.highlight}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

function CategoryTile({ label, onPress, children }: { label: string; onPress(): void; children: React.ReactNode }) {
  return (
    <Pressable onPress={onPress} style={styles.categoryTile}>
      <View style={styles.categoryIcon}>{children}</View>
      <AppText variant="tabLabel" color={colors.textSecondary} center numberOfLines={2} style={styles.categoryLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

function ServiceCard({
  icon, label, onPress,
}: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.service}>
      <View style={styles.serviceCircle}>
        <Ionicons name={icon} size={22} color={colors.textSecondary} />
      </View>
      <AppText variant="body" color={colors.serviceLabel} style={styles.serviceLabel}>
        {label}
      </AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.textPlaceholder} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24, gap: 16 },
  searchBlock: { backgroundColor: colors.surface, paddingHorizontal: layout.screenPadding, paddingVertical: 16 },

  bannerRow: { paddingLeft: layout.screenPadding, paddingRight: layout.screenPadding, gap: 6 },
  banner: {
    width: BANNER_WIDTH, height: 168, borderRadius: 20, overflow: 'hidden',
    backgroundColor: colors.surface, justifyContent: 'center',
  },
  bannerImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerText: { position: 'absolute', right: 16, top: 47, alignItems: 'flex-start' },
  bannerTitle: { fontSize: 23, lineHeight: 34, letterSpacing: -1.38 },

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

  servicesBlock: { paddingHorizontal: layout.screenPadding },
  service: {
    height: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16,
    backgroundColor: colors.surface, borderRadius: radii.sm, ...shadows.card,
  },
  serviceCircle: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceLabel: { flex: 1 },
});
