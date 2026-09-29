import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Card, ConfirmSheet, ListRow, Screen, ScreenHeader, Switch } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout } from '@/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.token != null);
  const signOut = useAuthStore((s) => s.signOut);
  const reloadFavorites = useFavoritesStore((s) => s.load);
  const [push, setPush] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const sub = useQuery({ queryKey: qk.subscription, queryFn: () => api.plans.current(), enabled: loggedIn });

  const toggleAutoRenew = async (v: boolean) => {
    await api.plans.setAutoRenew(v).catch(() => undefined);
    await qc.invalidateQueries({ queryKey: qk.subscription });
  };

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

  const icon = (name: keyof typeof Ionicons.glyphMap, color: string = colors.textMuted) => <Ionicons name={name} size={22} color={color} />;

  return (
    <Screen header={<ScreenHeader title={t.cabinet.settings} />} scroll padded>
      <View style={styles.body}>
        <Card flat style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={styles.flex}>
              <AppText variant="body" color={colors.textSecondary}>
                {t.settings.push}
              </AppText>
              <AppText variant="small" color={colors.textHelper}>
                {t.settings.pushHint}
              </AppText>
            </View>
            <Switch value={push} onChange={setPush} />
          </View>
        </Card>
        {loggedIn && sub.data ? (
          <Card flat style={styles.toggleCard}>
            <View style={styles.toggleRow}>
              <AppText variant="body" color={colors.textSecondary} style={styles.flex}>
                {t.settings.autoRenew}
              </AppText>
              <Switch value={sub.data.autoRenew} onChange={toggleAutoRenew} />
            </View>
          </Card>
        ) : null}

        <Card style={styles.menu}>
          <ListRow icon={icon('headset-outline')} label={t.settings.help} onPress={() => router.push('/info/contact')} />
          <ListRow icon={icon('call-outline')} label={t.settings.contact} onPress={() => router.push('/info/contact')} />
          <ListRow icon={icon('information-circle-outline')} label={t.settings.aboutApp} onPress={() => router.push('/info/about')} />
          <ListRow icon={icon('document-text-outline')} label={t.settings.userAgreement} onPress={() => router.push({ pathname: '/info/rules', params: { tab: 'agreement' } })} />
          <ListRow icon={icon('shield-checkmark-outline')} label={t.settings.rules} onPress={() => router.push('/info/rules')} />
          <ListRow icon={icon('lock-closed-outline')} label={t.settings.privacy} onPress={() => router.push({ pathname: '/info/rules', params: { tab: 'agreement' } })} last />
        </Card>

        {loggedIn ? (
          <Card style={styles.menu}>
            <ListRow icon={icon('log-out-outline', colors.dangerIcon)} label={t.cabinet.logout} onPress={() => setLogoutOpen(true)} right={<View />} last />
          </Card>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: 16, gap: layout.cardGap, paddingBottom: layout.screenPadding },
  toggleCard: { paddingVertical: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menu: { paddingVertical: 4 },
});
