import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AppText, Card, Divider, IconButton, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDisplayPhone } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout, radii } from '@/theme';

export default function StoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const store = useQuery({ queryKey: qk.store(id), queryFn: () => api.stores.byId(id) });
  const listings = useQuery({ queryKey: qk.storeListings(id), queryFn: () => api.stores.listings(id) });
  const isFav = useFavoritesStore((s) => s.storeIds.has(id));
  const toggleFav = useFavoritesStore((s) => s.toggleStore);

  if (store.isLoading || !store.data) {
    return (
      <Screen header={<ScreenHeader title={t.stores.title} />}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  const s = store.data;
  const isOwner = user?.id === s.ownerId;
  const open = (url: string | null) => url && Linking.openURL(url).catch(() => undefined);

  const header = (
    <View style={styles.headerBlock}>
      <View style={styles.coverWrap}>
        {s.coverUrl ? <Image source={s.coverUrl} style={styles.cover} contentFit="cover" /> : <View style={[styles.cover, styles.coverEmpty]} />}
        <View style={styles.logoWrap}>
          {s.logoUrl ? <Image source={s.logoUrl} style={styles.logo} contentFit="cover" /> : <Ionicons name="storefront-outline" size={28} color={colors.textMuted} />}
        </View>
      </View>

      {isOwner && s.status === 'pending' ? (
        <Card flat style={styles.pending}>
          <Ionicons name="time-outline" size={20} color={colors.link} />
          <View style={styles.flex}>
            <AppText variant="smallMedium" color={colors.link}>
              {t.stores.pending}
            </AppText>
            <AppText variant="caption" color={colors.textMuted}>
              {t.stores.pendingHint}
            </AppText>
          </View>
        </Card>
      ) : null}

      <Card style={styles.info}>
        <View style={styles.statRow}>
          <AppText variant="body" color={colors.textMuted}>
            {t.stores.listingsShared(s.activeListingsCount)}
          </AppText>
          <View style={styles.views}>
            <Ionicons name="eye-outline" size={16} color={colors.textMuted} />
            <AppText variant="body" color={colors.textMuted}>
              {s.totalViews}
            </AppText>
          </View>
        </View>
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.stores.about}
        </AppText>
        <AppText variant="body">{s.description}</AppText>
        <Divider />
        <View style={styles.socialRow}>
          {s.facebook ? <SocialIcon name="logo-facebook" color="#1877F2" onPress={() => open(s.facebook)} /> : null}
          {s.instagram ? <SocialIcon name="logo-instagram" color="#E1306C" onPress={() => open(s.instagram)} /> : null}
          {s.website ? <SocialIcon name="globe-outline" color={colors.textSecondary} onPress={() => open(s.website)} /> : null}
        </View>
        <InfoRow icon="call-outline" label={t.stores.phone} value={formatDisplayPhone(s.phone)} onPress={() => open(`tel:${s.phone}`)} />
        <InfoRow icon="location-outline" label={t.stores.address} value={`${s.city}, ${s.address}`} />
        {s.workingHours ? <InfoRow icon="time-outline" label={t.stores.workingHours} value={`${s.workingHours.open} – ${s.workingHours.close}`} /> : null}
      </Card>

      <AppText variant="bodyBold" color={colors.textSecondary} style={styles.sectionTitle}>
        {t.stores.storeListings}
      </AppText>
    </View>
  );

  return (
    <Screen
      header={
        <ScreenHeader
          title={s.name}
          right={
            isOwner ? (
              <IconButton onPress={() => router.push('/stores/create/step1')} accessibilityLabel={t.listing.edit}>
                <Ionicons name="create-outline" size={16} color={colors.textMuted} />
              </IconButton>
            ) : (
              <IconButton onPress={() => toggleFav(s.id).catch(() => undefined)} accessibilityLabel={t.tabs.favorites}>
                <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={16} color={isFav ? colors.price : colors.textMuted} />
              </IconButton>
            )
          }
        />
      }
    >
      <ListingGrid data={listings.data ?? []} header={header} contentContainerStyle={styles.grid} />
    </Screen>
  );
}

function SocialIcon({ name, color, onPress }: { name: keyof typeof Ionicons.glyphMap; color: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.social}>
      <Ionicons name={name} size={24} color={color} />
    </Pressable>
  );
}

function InfoRow({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="smallMedium">{value}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: 80 },
  headerBlock: { marginHorizontal: -layout.screenPadding, gap: layout.cardGap, paddingBottom: 4 },
  coverWrap: { height: 160, marginBottom: 32 },
  cover: { width: '100%', height: 160 },
  coverEmpty: { backgroundColor: colors.primaryTint },
  logoWrap: {
    position: 'absolute', bottom: -32, left: layout.screenPadding, width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.surface, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  logo: { width: '100%', height: '100%' },
  pending: { marginHorizontal: layout.screenPadding, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#EEF4FF' },
  info: { marginHorizontal: layout.screenPadding, gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  views: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  socialRow: { flexDirection: 'row', gap: 12 },
  social: { width: 44, height: 44, borderRadius: radii.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { paddingHorizontal: layout.screenPadding },
  grid: { paddingTop: 0 },
});
