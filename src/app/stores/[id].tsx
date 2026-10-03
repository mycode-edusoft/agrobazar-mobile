import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { EditSquareIcon } from '@/components/icons/BadgeIcons';
import { Icon } from '@/components/icons/Icon';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { AppText, Card, IconButton, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDisplayPhone } from '@/lib/format';
import { qk } from '@/lib/queries';
import { isOpenNow, todayIndex, weekOf, WEEK_DAYS } from '@/lib/storeHours';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout, typography } from '@/theme';

const META = 'rgba(53, 64, 82, 0.63)';
const OPEN_GREEN = '#0E8345';

/**
 * Figma "Business account / Mağazaya keçid → Mağazalar details": yuxarıda örtük şəkli,
 * üstünə 24px radiuslu ağ panel — loqo + ad + statistika, "Mağaza haqqında məlumat"
 * (4 sətir + "Daha çox"), sosial ikonlar, telefon / iş qrafiki / ünvan, sonra mağazanın elanları.
 */
export default function StoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const store = useQuery({ queryKey: qk.store(id), queryFn: () => api.stores.byId(id) });
  const listings = useQuery({ queryKey: qk.storeListings(id), queryFn: () => api.stores.listings(id) });
  const isFav = useFavoritesStore((s) => s.storeIds.has(id));
  const toggleFav = useFavoritesStore((s) => s.toggleStore);
  const [moreText, setMoreText] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);

  if (store.isLoading || !store.data) {
    return (
      <Screen header={<ScreenHeader title={t.stores.title} />}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  const s = store.data;
  const isOwner = id === 'me' || (!!user && user.id === s.ownerId);
  const open = (url: string | null) => url && Linking.openURL(url).catch(() => undefined);
  const week = weekOf(s);
  const today = week?.[todayIndex()];
  const openNow = week ? isOpenNow(week) : false;
  const longText = s.description.length > 140;

  const socials = [
    { key: 'facebook', url: s.facebook, icon: 'logo-facebook' as const },
    { key: 'instagram', url: s.instagram, icon: 'logo-instagram' as const },
    { key: 'youtube', url: s.youtube, icon: 'logo-youtube' as const },
    { key: 'tiktok', url: s.tiktok, icon: 'logo-tiktok' as const },
    { key: 'website', url: s.website, icon: 'globe-outline' as const },
  ].filter((x) => !!x.url);

  const header = (
    <View style={styles.headerBlock}>
      {s.coverUrl ? (
        <Image source={s.coverUrl} style={styles.cover} contentFit="cover" />
      ) : (
        <View style={[styles.cover, styles.coverEmpty]}>
          <Ionicons name="storefront-outline" size={48} color={colors.primary} />
        </View>
      )}

      <View style={styles.sheet}>
        <View style={styles.grabber} />
        {/* Loqo (42, haşiyə #D2D6DB) + ad Bold 16 + "N elan paylaşılıb · 👁 N" */}
        <View style={styles.identity}>
          <View style={styles.logo}>
            {s.logoUrl ? <Image source={s.logoUrl} style={styles.logoImg} contentFit="cover" /> : <Ionicons name="storefront-outline" size={20} color={colors.textMuted} />}
          </View>
          <View style={styles.flex}>
            <AppText style={styles.name} numberOfLines={1}>
              {s.name}
            </AppText>
            <View style={styles.stats}>
              <AppText style={styles.statText}>{t.stores.listingsShared(s.activeListingsCount)}</AppText>
              <AppText style={styles.dash}>-</AppText>
              <Ionicons name="eye" size={16} color={colors.textPlaceholder} />
              <AppText style={styles.views}>{s.totalViews}</AppText>
            </View>
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

        <View style={styles.line} />

        <View style={styles.about}>
          <AppText style={styles.sectionTitle}>{t.stores.about}</AppText>
          {s.description ? (
            <AppText style={styles.description} numberOfLines={moreText ? undefined : 4}>
              {s.description}
            </AppText>
          ) : null}
          {longText ? (
            <Pressable onPress={() => setMoreText((v) => !v)} style={styles.moreRow} hitSlop={6}>
              <AppText style={styles.moreText}>{moreText ? t.stores.less : t.stores.more}</AppText>
              <Icon name="chevron" direction={moreText ? 'up' : 'down'} size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}
          {socials.length ? (
            <View style={styles.socials}>
              {socials.map((x) => (
                <Pressable key={x.key} onPress={() => open(x.url)} style={styles.social}>
                  <Ionicons name={x.icon} size={22} color={colors.primary} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.line} />

        <View style={styles.contacts}>
          {s.phone ? (
            <Pressable onPress={() => open(`tel:${s.phone}`)} style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <AppText style={styles.contactText}>{formatDisplayPhone(s.phone)}</AppText>
            </Pressable>
          ) : null}
          {week && today ? (
            <>
              <View style={styles.thinLine} />
              <Pressable onPress={() => setWeekOpen((v) => !v)} style={styles.contactRow}>
                <Ionicons name="time-outline" size={20} color={colors.textMuted} />
                <AppText style={[styles.inlineText, { color: openNow ? OPEN_GREEN : colors.danger }]}>
                  {openNow ? t.stores.openNow : t.stores.closedNow}
                </AppText>
                <View style={styles.vLine} />
                <AppText style={[styles.inlineText, styles.muted, styles.shrink]} numberOfLines={1}>
                  {t.stores.schedule(today.enabled ? `${today.open} - ${today.close}` : t.stores.dayClosed)}
                </AppText>
                <Icon name="chevron" direction={weekOpen ? 'up' : 'down'} size={20} color={colors.textMuted} />
              </Pressable>
              {weekOpen ? (
                <View style={styles.week}>
                  {week.map((d, i) => (
                    <View key={WEEK_DAYS[i]} style={styles.weekRow}>
                      <AppText style={[styles.weekText, i === todayIndex() && styles.weekToday]}>{WEEK_DAYS[i]}</AppText>
                      <AppText style={[styles.weekText, i === todayIndex() && styles.weekToday]}>
                        {d.enabled ? `${d.open} - ${d.close}` : t.stores.dayClosed}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
          {s.address || s.city ? (
            <>
              <View style={styles.thinLine} />
              <View style={styles.contactRow}>
                <Ionicons name="location-outline" size={20} color={colors.textMuted} />
                <AppText style={[styles.contactText, styles.address]}>{[s.city, s.address].filter(Boolean).join(', ')}</AppText>
              </View>
            </>
          ) : null}
        </View>

        <AppText style={[styles.sectionTitle, styles.listingsTitle]}>{t.stores.storeListings}</AppText>
      </View>
    </View>
  );

  return (
    <Screen
      background={colors.surface}
      header={
        <ScreenHeader
          // Figma: kabinetdən öz mağazasına keçəndə başlıq "Mağazaya keçid", digər hallarda mağazanın adı
          title={id === 'me' ? t.stores.goToStore : s.name}
          right={
            isOwner ? (
              <IconButton onPress={() => router.push('/stores/create/step1')} accessibilityLabel={t.listing.edit}>
                <EditSquareIcon color={colors.textMuted} />
              </IconButton>
            ) : (
              <IconButton onPress={() => toggleFav(s.id).catch(() => undefined)} accessibilityLabel={t.tabs.favorites}>
                <Icon name="heart" size={16} color={isFav ? colors.price : colors.textMuted} />
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: 80 },
  headerBlock: { marginHorizontal: -layout.screenPadding },
  cover: { width: '100%', height: 260 },
  coverEmpty: { backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  // Figma: panel 24px radius, yuxarıda 77×5 #F5F5F5 tutacaq
  sheet: { marginTop: -24, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  grabber: { alignSelf: 'center', width: 77, height: 5, borderRadius: 100, backgroundColor: colors.inputBackgroundEmpty, marginTop: 14, marginBottom: 14 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: layout.screenPadding },
  logo: {
    width: 42, height: 42, borderRadius: 24, borderWidth: 1, borderColor: colors.borderSubtle,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: colors.surface,
  },
  logoImg: { width: '100%', height: '100%' },
  name: { ...typography.bodyBold, letterSpacing: -0.32, color: colors.text },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  statText: { ...typography.body, letterSpacing: -0.32, color: colors.textMuted },
  dash: { fontSize: 9.33, lineHeight: 21, color: META, marginHorizontal: 2 },
  views: { ...typography.body, lineHeight: 21, color: META },
  pending: { marginHorizontal: layout.screenPadding, marginTop: 12, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#EEF4FF' },
  line: { height: 1, backgroundColor: colors.divider, marginVertical: 16 },
  about: { paddingHorizontal: layout.screenPadding, gap: 12 },
  sectionTitle: { ...typography.bodyBold, color: colors.textSecondary },
  description: { ...typography.body, color: colors.text },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -4 },
  moreText: { ...typography.small, lineHeight: 22, color: colors.textMuted },
  socials: { flexDirection: 'row', gap: 12, paddingTop: 8 },
  social: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty, alignItems: 'center', justifyContent: 'center' },
  // Figma: telefon / qrafik / ünvan sətirləri 14/22, aralarında #F0F0F0 xətt, boşluq 8
  contacts: { paddingHorizontal: layout.screenPadding + 2, gap: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { flex: 1, ...typography.small, lineHeight: 22, color: colors.text },
  inlineText: { ...typography.small, lineHeight: 22, color: colors.text },
  shrink: { flexShrink: 1 },
  muted: { color: colors.textMuted },
  address: { fontFamily: typography.smallMedium.fontFamily },
  thinLine: { height: 1, backgroundColor: colors.divider },
  vLine: { width: 1, height: 18, backgroundColor: colors.divider, marginHorizontal: 4 },
  week: { gap: 4, paddingLeft: 24 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekText: { ...typography.small, lineHeight: 22, color: colors.textMuted },
  weekToday: { color: colors.text, fontFamily: typography.smallMedium.fontFamily },
  listingsTitle: { paddingHorizontal: layout.screenPadding, paddingTop: 32, paddingBottom: 12 },
  grid: { paddingTop: 0 },
});
