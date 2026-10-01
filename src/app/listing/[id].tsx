import { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Linking, Pressable, Share, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
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

  const rows: { label: string; value: string }[] = [
    { label: t.listing.city, value: listing.city },
    ...(category ? [{ label: t.listing.topCategory, value: category.name }] : []),
    ...(subcategory ? [{ label: t.listing.category, value: subcategory.name }] : []),
    ...(subsub ? [{ label: t.listing.subsubcategory, value: subsub.name }] : []),
    ...fieldDefs
      .filter((f) => listing.fields[f.key] != null && listing.fields[f.key] !== '')
      .map((f) => ({ label: f.label, value: `${listing.fields[f.key]}${f.unit ? ` ${f.unit}` : ''}` })),
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
          <View style={styles.dots}>
            {listing.images.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
        ) : null}
        <View style={styles.galleryBar}>
          <IconButton onPress={() => router.back()} accessibilityLabel={t.common.back}>
            <Icon name="chevron" direction="left" size={18} color={colors.textMuted} />
          </IconButton>
          <View style={styles.galleryRight}>
            <IconButton onPress={share} accessibilityLabel="Paylaş">
              <Ionicons name="share-outline" size={16} color={colors.textMuted} />
            </IconButton>
            <IconButton
              onPress={() => toggleFav(listing.id).catch(() => undefined)}
              accessibilityLabel={t.tabs.favorites}
              style={isFav ? styles.favActive : undefined}
            >
              <Icon name="heart" size={16} color={isFav ? colors.surface : colors.textMuted} />
            </IconButton>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleBlock}>
          <AppText variant="bodyBold" style={styles.tight}>
            {formatPrice(listing.price, listing.negotiable)}{listing.price != null ? ` ${t.common.currency}` : ''}
          </AppText>
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
          <View style={styles.about}>
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
        </View>
      </View>
    </Screen>
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
  dots: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotActive: { backgroundColor: colors.surface, width: 16 },
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
  about: { gap: 12 },
  more: { alignSelf: 'flex-start', height: 32, justifyContent: 'center', paddingHorizontal: 12, marginLeft: -12 },
  sellerValue: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerAvatar: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
  },
  footer: { borderTopLeftRadius: radii.md, borderTopRightRadius: radii.md, ...shadows.nav },
  footerRow: { flexDirection: 'row', gap: 12 },
});
