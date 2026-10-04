import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, ConfirmSheet, Screen, ScreenHeader, Switch, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout, shadows, typography } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Figma "Tənzimləmələr": Push bildirişlər kartı, menyu kartı (Yardım … Məxfilik siyasəti) və ayrıca
 * "Çıxış" kartı. Çıxış "Hesabdan çıxış" təsdiq panelini açır.
 */
export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.token != null);
  const signOut = useAuthStore((s) => s.signOut);
  const reloadFavorites = useFavoritesStore((s) => s.load);
  const toast = useToast();
  // Hesab səviyyəsində (mobil + web ortaq): söndürüləndə bildirişlər tətbiqdə yaranır, push getmir
  const pushSetting = useQuery({ queryKey: qk.pushEnabled, queryFn: () => api.notifications.pushEnabled(), enabled: loggedIn });
  const setPushEnabled = useMutation({
    mutationFn: (enabled: boolean) => api.notifications.setPushEnabled(enabled),
    onMutate: (enabled) => qc.setQueryData(qk.pushEnabled, enabled),
    onSuccess: (enabled) => qc.setQueryData(qk.pushEnabled, enabled),
    onError: () => {
      qc.invalidateQueries({ queryKey: qk.pushEnabled });
      toast(t.common.error, 'error');
    },
  });
  const push = pushSetting.data ?? true;
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await signOut();
    qc.clear();
    await reloadFavorites().catch(() => undefined);
    setLoggingOut(false);
    setLogoutOpen(false);
    router.dismissAll();
    router.replace('/');
  };

  const menu: { icon: IconName; label: string; href: Href }[] = [
    { icon: 'headset-outline', label: t.settings.help, href: '/info/contact' },
    { icon: 'call-outline', label: t.settings.contact, href: '/info/contact' },
    { icon: 'phone-portrait-outline', label: t.settings.aboutApp, href: '/info/about' },
    { icon: 'document-lock-outline', label: t.settings.userAgreement, href: { pathname: '/info/rules', params: { tab: 'agreement' } } },
    { icon: 'warning-outline', label: t.settings.rules, href: { pathname: '/info/rules', params: { tab: 'listing' } } },
    { icon: 'shield-checkmark-outline', label: t.settings.privacy, href: { pathname: '/info/rules', params: { tab: 'privacy' } } },
  ];

  return (
    <Screen header={<ScreenHeader title={t.cabinet.settings} />} scroll>
      <View style={styles.body}>
        {/* Figma: kölgəsiz ağ kart; izah sətri ikon sütunundan sonra (54px) başlayır */}
        <View style={styles.pushCard}>
          <MenuRow icon="notifications-outline" label={t.settings.push} />
          <View style={styles.pushRow}>
            <AppText style={[styles.label, styles.hint]}>{t.settings.pushHint}</AppText>
            <Switch value={loggedIn && push} onChange={(v) => setPushEnabled.mutate(v)} disabled={!loggedIn || pushSetting.isLoading} />
          </View>
        </View>

        <View style={[styles.card, styles.menu]}>
          {menu.map((m, i) => (
            <MenuRow key={m.label} icon={m.icon} label={m.label} onPress={() => router.push(m.href)} last={i === menu.length - 1} />
          ))}
        </View>

        {loggedIn ? (
          <View style={[styles.card, styles.menu]}>
            <MenuRow icon="log-in-outline" iconColor="#DC0812" label={t.cabinet.logout} onPress={() => setLogoutOpen(true)} last />
          </View>
        ) : null}
      </View>
      <ConfirmSheet
        visible={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={logout}
        title={t.cabinet.logoutTitle}
        message={t.cabinet.logoutConfirm}
        confirmText={t.common.yes}
        danger
        loading={loggingOut}
      />
    </Screen>
  );
}

// Figma: 22px ikon, 16px aralıq, etiket 16/24 #595959; ayırıcı yalnız mətn sütununun altında
function MenuRow({
  icon, iconColor = colors.textMuted, label, onPress, last, right,
}: { icon: IconName; iconColor?: string; label: string; onPress?: () => void; last?: boolean; right?: ReactNode }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
      <View style={[styles.rowText, !last && styles.divider]}>
        <AppText style={styles.label}>{label}</AppText>
        {right}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: layout.screenPadding, gap: 16 },
  pushCard: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 4 },
  pushRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 38 },
  card: { backgroundColor: colors.surface, borderRadius: 14, ...shadows.card },
  menu: { padding: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  icon: { width: 22 },
  rowText: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: 15 },
  label: { flex: 1, ...typography.body, letterSpacing: -0.32, color: colors.textSecondary },
  hint: { color: '#9DA4AE' },
});
