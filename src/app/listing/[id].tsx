import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Linking, Pressable, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ChartIcon, DeleteIcon, EditSquareIcon } from '@/components/icons/BadgeIcons';
import { useListingActions } from '@/components/listing/useListingActions';
import { AppText, Button, Divider, FooterBar, IconButton, Screen } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDate, formatPrice } from '@/lib/format';
import { qk, useCategory } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout, radii, shadows } from '@/theme';
import { Icon } from '@/components/icons/Icon';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: listing, isLoading } = useQuery({ queryKey: qk.listing(id), queryFn: () => api.listings.byId(id) });
  const { category } = useCategory(listing?.categoryId);
  const isFav = useFavoritesStore((s) => s.listingIds.has(id));
  const toggleFav = useFavoritesStore((s) => s.toggleListing);
  const user = useAuthStore((s) => s.user);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const actions = useListingActions({ onDeleted: () => router.back() });

  if (isLoading || !listing) {
    return (
      <Screen>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  const isOwner = !!user && listing.ownerId === user.id;
  const subcategory = category?.subcategories.find((s) => s.id === listing.subcategoryId);
  const subsub = subcategory?.subsubcategories.find((b) => b.id === listing.subsubId);
  const fieldDefs = subcategory?.fields ?? [];

  // Figma: yuxarıda kateqoriya cədvəli, dinamik sahələr "Xüsusiyyətlər" qutusunda, sonda satıcı + meta
  const rows: { label: string; value: string }[] = [
    { label: t.listing.city, value: listing.city },
    ...(category ? [{ label: t.listing.topCategory, value: category.name }] : []),
    ...(subcategory ? [{ label: t.listing.category, value: subcategory.name }] : []),
    ...(subsub ? [{ label: t.listing.productCategory, value: subsub.name }] : []),
  ];
  const features = fieldDefs
    .filter((f) => listing.fields[f.key] != null && listing.fields[f.key] !== '')
    .map((f) => `${f.label}: ${listing.fields[f.key]}${f.unit ? ` ${f.unit}` : ''}`);
  const meta: { label: string; value: string }[] = [
    { label: t.listing.number, value: listing.id.replace(/\D/g, '') || listing.id },
    { label: t.listing.views, value: String(listing.views) },
    { label: t.listing.updated, value: formatDate(listing.updatedAt) },
  ];

  const share = () => Share.share({ message: `${listing.title} — aqrobazar://listing/${listing.id}` }).catch(() => undefined);
  const call = () => Linking.openURL(`tel:${listing.phone}`).catch(() => undefined);
  const whatsapp = () => Linking.openURL(`https://wa.me/${listing.whatsapp.replace(/\D/g, '')}`).catch(() => undefined);

  return (
    <Screen
      edges={[]}
      scroll
      footer={
        <FooterBar style={styles.footer}>
          <View style={styles.footerRow}>
            <Button title={t.listing.call} variant="outline" icon={<Icon name="phone" size={20} color={colors.primary} />} onPress={call} style={styles.flex} />
            <Button title={t.listing.whatsapp} icon={<Icon name="whatsapp" size={20} color={colors.surface} />} onPress={whatsapp} style={styles.flex} />
          </View>
        </FooterBar>
      }
    >
      <View style={styles.gallery}>
        <FlatList
          data={listing.images}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
          renderItem={({ item }) => <Image source={item} style={styles.image} contentFit="cover" transition={150} />}
        />
        {listing.images.length > 1 ? (
          <View style={styles.counter}>
            <AppText variant="caption" color={colors.surface}>
              {index + 1}/{listing.images.length}
            </AppText>
          </View>
        ) : null}
        <View style={styles.galleryBar}>
          <IconButton onPress={() => router.back()} accessibilityLabel={t.common.back}>
            <Icon name="chevron" direction="left" size={18} color={colors.textMuted} />
          </IconButton>
          <View style={styles.galleryRight}>
            <IconButton onPress={share} accessibilityLabel={t.listing.share}>
              <Ionicons name="share-outline" size={16} color={colors.textMuted} />
            </IconButton>
            {/* Öz elanını seçilmişlərə əlavə etmək mənasızdır — Figma-da sahibə yalnız paylaş göstərilir */}
            {!isOwner ? (
              <IconButton
                onPress={() => toggleFav(listing.id).catch(() => undefined)}
                accessibilityLabel={t.tabs.favorites}
                style={isFav ? styles.favActive : undefined}
              >
                <Icon name="heart" size={16} color={isFav ? colors.surface : colors.textMuted} />
              </IconButton>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <View style={styles.priceRow}>
            <AppText variant="bodyBold" style={[styles.tight, styles.flex]}>
              {formatPrice(listing.price, listing.negotiable)}{listing.price != null ? ` ${t.common.currency}` : ''}
            </AppText>
            {isOwner ? (
              <View style={styles.ownerActions}>
                <OwnerAction
                  label={t.listing.stats}
                  onPress={() => router.push({ pathname: '/listing/stats', params: { id: listing.id } })}
                  icon={<ChartIcon size={18} color={colors.textMuted} />}
                />
                <OwnerAction
                  label={t.listing.edit}
                  onPress={() => actions.edit(listing)}
                  icon={<EditSquareIcon size={18} color={colors.textMuted} />}
                />
                <OwnerAction
                  label={t.common.delete}
                  onPress={() => actions.askDelete(listing)}
                  icon={<DeleteIcon size={18} color={DELETE_RED} />}
                />
              </View>
            ) : null}
          </View>
          <AppText variant="body" style={styles.tight}>
            {listing.title}
          </AppText>
        </View>
        <Divider style={styles.titleDivider} />

        {isOwner ? (
          <View style={styles.promoRow}>
            <PromoChip
              label={t.listing.bump}
              icon="arrow-up"
              tone={PROMO_TONES.bump}
              onPress={() => router.push({ pathname: '/listing/promote', params: { id: listing.id, kind: 'bump' } })}
            />
            <PromoChip
              label={t.listing.makePremium}
              icon="ribbon"
              tone={PROMO_TONES.premium}
              onPress={() => router.push({ pathname: '/listing/promote', params: { id: listing.id, kind: 'premium' } })}
            />
            <PromoChip
              label={t.listing.makeVip}
              icon="diamond"
              tone={PROMO_TONES.vip}
              onPress={() => router.push({ pathname: '/listing/promote', params: { id: listing.id, kind: 'vip' } })}
            />
          </View>
        ) : null}

        <View style={styles.info}>
          {rows.map((r) => (
            <View key={r.label} style={styles.infoRow}>
              <AppText variant="body" color={colors.textMuted} style={styles.infoLabel}>
                {r.label}
              </AppText>
              <AppText variant="body" style={styles.flex}>
                {r.value}
              </AppText>
            </View>
          ))}
          <Divider />
          {features.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="bodyBold" color={colors.textSecondary}>
                {t.listing.features}
              </AppText>
              <View style={styles.features}>
                {features.map((f, i) => (
                  <View key={f} style={styles.featureItem}>
                    {i > 0 ? <View style={styles.featureSep} /> : null}
                    <AppText variant="small" color={colors.textMuted} style={styles.featureText}>
                      {f}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <View style={styles.section}>
            <AppText variant="bodyBold" color={colors.textSecondary}>
              {t.listing.about}
            </AppText>
            <AppText variant="body" numberOfLines={expanded ? undefined : 5}>
              {listing.description}
            </AppText>
            {listing.description.length > 220 ? (
              <Pressable onPress={() => setExpanded((v) => !v)} style={styles.more} hitSlop={6}>
                <AppText variant="smallMedium" color={colors.primary}>
                  {expanded ? t.listing.less : t.common.more}
                </AppText>
              </Pressable>
            ) : null}
          </View>
          <Divider />
          <Pressable
            style={styles.infoRow}
            disabled={!listing.storeId}
            onPress={() => listing.storeId && router.push({ pathname: '/stores/[id]', params: { id: listing.storeId } })}
          >
            <AppText variant="body" color={colors.textMuted} style={styles.infoLabel}>
              {t.listing.seller}
            </AppText>
            <View style={styles.sellerValue}>
              <View style={styles.sellerAvatar}>
                <Ionicons name={listing.storeId ? 'storefront' : 'person'} size={13} color={colors.textMuted} />
              </View>
              <AppText variant="body" style={styles.flex} numberOfLines={1}>
                {listing.sellerName}
              </AppText>
            </View>
          </Pressable>
          {meta.map((r) => (
            <View key={r.label} style={styles.infoRow}>
              <AppText variant="body" color={colors.textMuted} style={styles.infoLabel}>
                {r.label}
              </AppText>
              <AppText variant="body" style={styles.flex}>
                {r.value}
              </AppText>
            </View>
          ))}
        </View>
      </View>
      {actions.sheets}
    </Screen>
  );
}

// Figma: 32×32, rgba(0,0,0,.08), radius 8, 18px Iconly ikon; silmə qırmızı #DC0812
const DELETE_RED = '#DC0812';

function OwnerAction({ icon, label, onPress }: { icon: ReactNode; label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.ownerAction} accessibilityLabel={label} hitSlop={4}>
      {icon}
    </Pressable>
  );
}

// Figma: "Main button" — İrəli çək / Premium et / VIP et
const PROMO_TONES = {
  bump: { bg: 'rgba(249,230,216,0.68)', border: '#FB7514', text: '#F87618' },
  premium: { bg: '#FEF8EA', border: '#FFBE21', text: '#FFBD2E' },
  vip: { bg: 'rgba(177,205,245,0.28)', border: '#3B7EE6', text: '#4186DF' },
} as const;

type Tone = (typeof PROMO_TONES)[keyof typeof PROMO_TONES];

function PromoChip({
  label, icon, tone, onPress,
}: { label: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={[styles.promoChip, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Ionicons name={icon} size={14} color={tone.text} />
      <AppText variant="smallMedium" color={tone.text} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: 80 },
  promoRow: { flexDirection: 'row', gap: 8, paddingHorizontal: layout.screenPadding, paddingTop: 6, paddingBottom: 24 },
  promoChip: {
    flex: 1, height: 32, borderRadius: radii.sm, borderWidth: 1, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  gallery: { width, height: 320, backgroundColor: colors.background },
  image: { width, height: 320 },
  counter: {
    position: 'absolute', bottom: 12, alignSelf: 'center', paddingHorizontal: 10, borderRadius: 100,
    backgroundColor: 'rgba(38, 38, 38, 0.45)',
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 24, minHeight: 32 },
  ownerActions: { flexDirection: 'row', gap: 12 },
  ownerAction: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(0, 0, 0, 0.08)', alignItems: 'center', justifyContent: 'center' },
  section: { gap: 12 },
  // Figma "Xüsusiyyətlər": #F5F5F5 qutu, padding 16, elementlər arası 18px şaquli ayırıcı
  features: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 4, padding: 16, borderRadius: 8, backgroundColor: colors.background },
  featureItem: { flexDirection: 'row', alignItems: 'center' },
  featureSep: { width: 1, height: 18, marginHorizontal: 8, backgroundColor: 'rgba(0, 0, 0, 0.08)' },
  featureText: { lineHeight: 22 },
  galleryBar: {
    position: 'absolute', top: 48, left: layout.screenPadding, right: layout.screenPadding,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  galleryRight: { flexDirection: 'row', gap: 8 },
  favActive: { backgroundColor: colors.badge },
  body: { backgroundColor: colors.surface, paddingTop: 16, paddingBottom: 24 },
  titleBlock: { paddingHorizontal: layout.screenPadding },
  tight: { letterSpacing: -0.32 },
  titleDivider: { marginVertical: 16 },
  info: { paddingHorizontal: layout.screenPadding, gap: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  infoLabel: { width: 172 },
  more: { alignSelf: 'flex-start', height: 32, justifyContent: 'center', paddingHorizontal: 12, marginLeft: -12 },
  sellerValue: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { borderTopLeftRadius: radii.md, borderTopRightRadius: radii.md, ...shadows.nav },
  footerRow: { flexDirection: 'row', gap: 12 },
});
