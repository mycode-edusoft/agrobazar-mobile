import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AppText, Chip } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDate, formatPrice } from '@/lib/format';
import { useFavoritesStore } from '@/store/favorites';
import { colors, radii, shadows } from '@/theme';
import type { ListingSummary } from '@/types/domain';
import { Icon } from '@/components/icons/Icon';

interface Props {
  item: ListingSummary;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  showFavorite?: boolean;
  width?: number;
  /** Sahib rejimi (Elanlarım): elan tipi nişanı gizlənir */
  showType?: boolean;
  /** Verildikdə sağ yuxarıda ⋮ düyməsi göstərilir (redaktə / sil / yenilə) */
  onMenu?: (item: ListingSummary) => void;
}

export const ListingCard = memo(function ListingCard({
  item, selectable, selected, onToggleSelect, showFavorite = true, width, showType = true, onMenu,
}: Props) {
  const router = useRouter();
  const isFav = useFavoritesStore((s) => s.listingIds.has(item.id));
  const toggle = useFavoritesStore((s) => s.toggleListing);
  const isPremium = !!item.promotions.premiumUntil && new Date(item.promotions.premiumUntil) > new Date();

  const onPress = () => {
    if (selectable) onToggleSelect?.(item.id);
    else router.push({ pathname: '/listing/[id]', params: { id: item.id } });
  };

  return (
    <Pressable onPress={onPress} style={[styles.card, width != null && { width }]}>
      <View style={[styles.imageWrap, isPremium && styles.imageWrapPremium]}>
        <Image source={item.image} style={styles.image} contentFit="cover" transition={150} />

        <View style={styles.topRow}>
          {showType ? (
            <View style={styles.statusChip}>
              <AppText variant="captionMedium" color={colors.chipText} style={styles.statusText}>
                {t.listingType[item.type]}
              </AppText>
            </View>
          ) : (
            <View />
          )}
          {onMenu ? (
            <Pressable onPress={() => onMenu(item)} hitSlop={8} style={styles.action} accessibilityLabel="Əməliyyatlar">
              <Ionicons name="ellipsis-vertical" size={13} color={colors.textSecondary} />
            </Pressable>
          ) : selectable ? (
            <View style={[styles.action, styles.check, selected && styles.checkOn]}>
              {selected ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
            </View>
          ) : showFavorite ? (
            <Pressable
              onPress={() => toggle(item.id).catch(() => undefined)}
              hitSlop={8}
              style={styles.action}
              accessibilityLabel="Seçdiklərimə əlavə et"
            >
              <Icon name="heart" size={12} color={isFav ? colors.price : colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {isPremium ? (
          <LinearGradient
            colors={[colors.premiumBadge.from, colors.premiumBadge.to]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.premium}
          >
            <Icon name="crown" size={20} />
          </LinearGradient>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.priceRow}>
          <AppText variant="price" color={colors.price}>
            {formatPrice(item.price, item.negotiable)}
          </AppText>
          {item.price != null ? (
            // Figma: tabler currency-manat ikonu, 15px, qiymət rəngində
            <Icon name="manat" size={15} color={colors.price} style={styles.manat} />
          ) : null}
        </View>
        <AppText variant="caption" color={colors.textDark} numberOfLines={1} style={styles.title}>
          {item.subsubName ? `${item.subsubName} ${item.title.toLowerCase()}` : item.title}
        </AppText>
        <AppText variant="caption" color={META_COLOR} numberOfLines={1} style={styles.meta}>
          {item.city} - {formatDate(item.createdAt)}
        </AppText>
        {item.internationalDelivery ? <Chip label={t.listing.intlDelivery} style={styles.chip} /> : null}
      </View>
    </Pressable>
  );
});

// Figma kartı: şəhər/tarix — 9.33/21, rgba(53,64,82,0.63) (başlıq rənginin 63%-i)
const META_COLOR = 'rgba(53, 64, 82, 0.63)';

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  imageWrap: { aspectRatio: 174 / 186, backgroundColor: colors.surface },
  imageWrapPremium: { backgroundColor: colors.cardImageTint },
  image: { width: '100%', height: '100%' },
  topRow: {
    position: 'absolute', top: 10, left: 0, right: 0, paddingHorizontal: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  statusChip: {
    height: 22, paddingHorizontal: 12, borderRadius: 30, justifyContent: 'center',
    backgroundColor: colors.chipBackground, borderWidth: 1, borderColor: colors.divider,
  },
  statusText: { lineHeight: 16 },
  // Figma "App Favorite": kölgə -2 2 10 rgba(0,0,0,.15)
  action: {
    width: 24, height: 24, borderRadius: 14, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 5, shadowOffset: { width: -2, height: 2 }, elevation: 3,
  },
  check: { borderWidth: 1.5, borderColor: colors.textPlaceholder },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  premium: {
    position: 'absolute', left: 8, bottom: 8, width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  // Figma: şəkildən 6 aşağı, mətn bloku 21 + 24 + 21, altda 2
  body: { paddingHorizontal: 8, paddingTop: 6, paddingBottom: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  manat: { marginLeft: 3 },
  title: { lineHeight: 24 },
  meta: { fontSize: 9.33, lineHeight: 21 },
  chip: { alignSelf: 'flex-start', marginTop: 4 },
});
