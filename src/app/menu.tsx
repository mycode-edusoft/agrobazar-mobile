import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import {
  CallMenuIcon, DangerMenuIcon, PeopleMenuIcon, StoreMenuIcon, WorkMenuIcon, type MenuIconProps,
} from '@/components/navigation/MenuIcons';
import { Icon } from '@/components/icons/Icon';
import { ProfileTabIcon } from '@/components/navigation/TabIcons';
import { AppText, Button, Divider, IconButton, Screen } from '@/components/ui';
import { t } from '@/i18n/az';
import { useAuthGate } from '@/lib/authGate';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';

// Figma "Burger menu": sıra və ikonlar dizayndakı kimi
const items: { label: string; Icon: ComponentType<MenuIconProps>; href: Href }[] = [
  { label: t.menu.stores, Icon: StoreMenuIcon, href: '/stores' },
  { label: t.menu.business, Icon: WorkMenuIcon, href: '/cabinet/plans' },
  { label: t.menu.contact, Icon: CallMenuIcon, href: '/info/contact' },
  { label: t.menu.rules, Icon: DangerMenuIcon, href: '/info/rules' },
  { label: t.menu.about, Icon: PeopleMenuIcon, href: '/info/about' },
];

export default function MenuScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const gate = useAuthGate();

  const go = (href: Href) => {
    router.back();
    setTimeout(() => router.push(href), 50);
  };

  return (
    <Screen background={colors.surface} padded>
      <View style={styles.closeRow}>
        <IconButton onPress={() => router.back()} accessibilityLabel={t.common.close}>
          {/* Figma xmark: 20px çərçivədə 10px, #8C8C8C */}
          <Icon name="cancel" size={23} color={colors.textMuted} />
        </IconButton>
      </View>

      <Pressable
        style={styles.profileRow}
        onPress={() => (user ? go('/cabinet') : go({ pathname: '/auth/phone', params: { returnTo: '/cabinet' } }))}
      >
        <View style={styles.avatar}>
          {user?.avatarUrl ? (
            <Image source={user.avatarUrl} style={styles.avatarImg} contentFit="cover" />
          ) : (
            <ProfileTabIcon color={colors.textMuted} />
          )}
        </View>
        <AppText variant="body" color={colors.textSecondary}>
          {user ? user.fullName ?? user.phone : t.common.login}
        </AppText>
      </Pressable>
      <Divider />

      <View style={styles.list}>
        {items.map((it) => (
          <Pressable key={it.label} onPress={() => go(it.href)} style={styles.item}>
            <it.Icon color={colors.textMuted} />
            <AppText variant="body" color={colors.textSecondary}>
              {it.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title={t.menu.postListing}
          variant="outline"
          icon={<Icon name="plus" size={20} color={colors.primary} />}
          style={styles.flex}
          onPress={() => {
            router.back();
            setTimeout(() => gate('/listing/create'), 50);
          }}
        />
        <Button
          title={t.menu.createStore}
          icon={<Icon name="plus" size={20} color={colors.surface} />}
          style={styles.flex}
          onPress={() => {
            router.back();
            setTimeout(() => gate('/stores/create/step1'), 50);
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  closeRow: { alignItems: 'flex-end', paddingTop: 18 },
  // Figma: bağlama sətri ilə profil arası 8, profilin altında 16, sonra xətt
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 16 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  // Figma: bəndlər arası 32, düymələr siyahının düz altında (ekranın dibində yox)
  list: { paddingTop: 28, paddingBottom: 52, gap: 32 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 32, paddingBottom: layout.screenPadding },
});
