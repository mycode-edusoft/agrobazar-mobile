import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingsEmpty } from '@/components/listing/ListingsEmpty';
import { useListingActions } from '@/components/listing/useListingActions';
import { TierDot } from '@/components/plans/TierDot';
import { AppText, Button, Card, IconButton, ListRow, Pill, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount } from '@/lib/format';
import { qk, useEntitlements } from '@/lib/queries';
import { MY_LISTING_TABS } from '@/lib/rules';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii, shadows } from '@/theme';
import type { ListingStatus } from '@/types/domain';
import { Icon } from '@/components/icons/Icon';

// Figma: Şəxsi kabinet (2137:14480)
export default function CabinetScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const ent = useEntitlements();
  const [status, setStatus] = useState<ListingStatus>('active');
  const actions = useListingActions();

  const sub = useQuery({ queryKey: qk.subscription, queryFn: () => api.plans.current(), enabled: !!user });
  const listings = useQuery({
    queryKey: qk.myListings(status),
    queryFn: () => api.listings.mine(status),
    enabled: !!user,
  });

  const settings = (
    <IconButton onPress={() => router.push('/cabinet/settings')} accessibilityLabel={t.cabinet.settings}>
      <Icon name="setting" size={18} color={colors.textMuted} />
    </IconButton>
  );

  if (!user) {
    return (
      <Screen header={<ScreenHeader title={t.cabinet.title} hideBack right={settings} />} padded>
        <Card style={styles.guest}>
          <Ionicons name="person-circle-outline" size={64} color={colors.textPlaceholder} />
          <AppText variant="body" color={colors.textMuted} center>
            {t.auth.loginRequired}
          </AppText>
          <Button
            title={t.common.login}
            onPress={() => router.push({ pathname: '/auth/phone', params: { returnTo: '/cabinet' } })}
            style={styles.stretch}
          />
        </Card>
        <Card style={styles.guestMenu}>
          <ListRow
            icon={<Icon name="setting" size={22} color={colors.textMuted} />}
            label={t.cabinet.settings}
            onPress={() => router.push('/cabinet/settings')}
            last
          />
        </Card>
      </Screen>
    );
  }

  const tier = sub.data?.tier ?? 'green';
  const planName = sub.data?.planName ?? ent.data?.planName ?? 'Standard';
  const preview = (listings.data ?? []).slice(0, 2);

  return (
    <Screen header={<ScreenHeader title={t.cabinet.title} hideBack right={settings} />}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profil */}
        <View style={styles.profile}>
          <View>
            <View style={styles.avatar}>
              {user.avatarUrl ? (
                <Image source={user.avatarUrl} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={32} color={colors.textMuted} />
              )}
            </View>
            <View style={styles.avatarBadge}>
              <TierDot tier={tier} size={20} />
            </View>
          </View>
          <View style={styles.nameBlock}>
            <AppText variant="bodyMedium" color="#181818" center style={styles.lh14}>
              {user.fullName ?? user.phone}
            </AppText>
            <AppText variant="small" color={colors.textHelper} center style={styles.lh14}>
              {user.phone}
            </AppText>
          </View>
          <Pressable onPress={() => router.push('/cabinet/edit-profile')} style={styles.editBtn}>
            <AppText variant="captionMedium" color={colors.textHelper}>
              {t.cabinet.edit}
            </AppText>
          </Pressable>
        </View>

        {/* Balans */}
        <InfoCard
          onPress={() => router.push('/cabinet/balance')}
          icon={
            <View style={styles.iconBox}>
              <Icon name="bankCard" size={22} color={colors.primary} />
            </View>
          }
          title={t.balance.title}
          value={formatAmount(user.balance)}
        />

        {/* Aktiv tarif */}
        <InfoCard
          onPress={() => router.push(sub.data ? '/cabinet/plans/active' : '/cabinet/plans')}
          icon={
            <View style={styles.iconBox}>
              <TierDot tier={tier} />
            </View>
          }
          title={t.cabinet.activePlan}
          value={planName}
          valueColor={colors.tier[tier].text}
        />

        {/* Elanlarım */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyBold" color={colors.textSecondary} style={styles.flex}>
            {t.cabinet.myListings}
          </AppText>
          <Pressable onPress={() => router.push('/cabinet/my-listings')} hitSlop={8}>
            <AppText variant="bodyMedium" color={colors.textSecondary} style={styles.underline}>
              {t.cabinet.seeAll}
            </AppText>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {MY_LISTING_TABS.map((s) => (
            <Pill key={s} variant="outline" label={t.listing.status[s]} active={status === s} onPress={() => setStatus(s)} />
          ))}
        </ScrollView>

        <View style={styles.previewWrap}>
          {preview.length === 0 ? (
            listings.isLoading ? null : <ListingsEmpty text={t.favorites.empty} />
          ) : (
            <View style={styles.previewRow}>
              {preview.map((item) => (
                <ListingCard key={item.id} item={item} showType={false} onMenu={actions.open} />
              ))}
              {preview.length === 1 ? <View style={styles.flex} /> : null}
            </View>
          )}
        </View>
      </ScrollView>
      {actions.sheets}
    </Screen>
  );
}

function InfoCard({
  icon, title, value, valueColor = colors.textSecondary, onPress,
}: { icon: React.ReactNode; title: string; value: string; valueColor?: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.infoCard}>
      {icon}
      <View style={styles.infoText}>
        <AppText variant="captionMedium" color={colors.textSecondary} style={styles.lh13}>
          {title}
        </AppText>
        <AppText variant="captionMedium" color={valueColor} style={styles.lh13}>
          {value}
        </AppText>
      </View>
      <Icon name="chevron" direction="right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  stretch: { alignSelf: 'stretch' },
  guest: { alignItems: 'center', gap: 16, paddingVertical: 32, marginTop: 16 },
  guestMenu: { marginTop: layout.cardGap, paddingVertical: 4 },

  content: { paddingTop: 16, paddingBottom: 24, gap: 16 },

  profile: { alignItems: 'center', gap: 12, paddingHorizontal: layout.screenPadding },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarBadge: { position: 'absolute', right: -2, bottom: 2 },
  nameBlock: { gap: 4, marginTop: -4 },
  lh14: { lineHeight: 22 },
  editBtn: {
    height: 36, paddingHorizontal: 22, borderRadius: 24, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.borderSubtle, alignItems: 'center', justifyContent: 'center',
  },

  infoCard: {
    marginHorizontal: layout.screenPadding, backgroundColor: colors.surface, borderRadius: radii.md,
    paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12,
    ...shadows.card,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.iconBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1, gap: 6 },
  lh13: { lineHeight: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.screenPadding, marginBottom: -4 },
  underline: { textDecorationLine: 'underline' },
  tabs: { paddingHorizontal: layout.screenPadding, gap: 10 },

  previewWrap: { paddingHorizontal: layout.screenPadding },
  previewRow: { flexDirection: 'row', gap: 10 },
});
