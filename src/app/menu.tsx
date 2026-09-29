import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AppText, Button, Divider, IconButton, Screen } from '@/components/ui';
import { t } from '@/i18n/az';
import { useAuthGate } from '@/lib/authGate';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';

const items: { label: string; icon: keyof typeof Ionicons.glyphMap; href: Href }[] = [
  { label: t.menu.business, icon: 'briefcase-outline', href: '/cabinet/plans' },
  { label: t.menu.contact, icon: 'call-outline', href: '/info/contact' },
  { label: t.menu.rules, icon: 'document-text-outline', href: '/info/rules' },
  { label: t.menu.about, icon: 'help-circle-outline', href: '/info/about' },
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
          <Ionicons name="close" size={16} color={colors.textMuted} />
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
            <Ionicons name="person" size={22} color={colors.textMuted} />
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
            <Ionicons name={it.icon} size={22} color={colors.textMuted} />
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
          icon={<Ionicons name="add" size={20} color={colors.primary} />}
          style={styles.flex}
          onPress={() => {
            router.back();
            setTimeout(() => gate('/listing/create'), 50);
          }}
        />
        <Button
          title={t.menu.createStore}
          icon={<Ionicons name="add" size={20} color={colors.surface} />}
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
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.background,
    borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  list: { paddingTop: 28, gap: 32, flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actions: { flexDirection: 'row', gap: 12, paddingBottom: layout.screenPadding },
});
