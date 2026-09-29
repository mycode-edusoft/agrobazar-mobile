import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TierBadge } from '@/components/plans/TierBadge';
import { AppText, Button, Card, Divider, EmptyState, ListRow, Screen, ScreenHeader, Switch } from '@/components/ui';
import { t } from '@/i18n/az';
import { daysBetween, formatAmount, formatDateTime } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii } from '@/theme';

export default function ActivePlanScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const loggedIn = useAuthStore((s) => s.token != null);
  const sub = useQuery({ queryKey: qk.subscription, queryFn: () => api.plans.current(), enabled: loggedIn });

  if (sub.isFetched && !sub.data) {
    return (
      <Screen header={<ScreenHeader title={t.cabinet.myPlan} />} padded>
        <View style={styles.emptyWrap}>
          <EmptyState text={t.plans.noPlan} icon="ribbon-outline" />
          <Button title={t.cabinet.plans} onPress={() => router.replace('/cabinet/plans')} />
        </View>
      </Screen>
    );
  }
  if (!sub.data) return <Screen header={<ScreenHeader title={t.cabinet.myPlan} />} />;

  const s = sub.data;
  const tint = colors.tier[s.tier];
  const total = daysBetween(s.startedAt, s.endsAt);
  const left = daysBetween(new Date().toISOString(), s.endsAt);
  const progress = total > 0 ? Math.min(1, Math.max(0, (total - left) / total)) : 0;

  const rows = [
    { label: t.plans.status, value: t.plans.active, color: colors.primary },
    { label: t.plans.type, value: s.cycle === 'monthly' ? t.plans.monthly : t.plans.yearly },
    { label: t.plans.startDate, value: formatDateTime(s.startedAt) },
    { label: t.plans.endDate, value: formatDateTime(s.endsAt) },
    { label: t.plans.listingsCount, value: `${s.listingsUsed}/${s.listingsLimit}` },
    { label: t.plans.paid, value: formatAmount(s.paidAmount) },
  ];

  return (
    <Screen header={<ScreenHeader title={t.cabinet.myPlan} />} background={tint.to} scroll padded>
      <Card style={styles.card}>
        <View style={styles.badge}>
          <TierBadge tier={s.tier} size={56} />
        </View>
        <AppText variant="buttonLarge" color={tint.text} center>
          {s.planName}
        </AppText>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: tint.to }]} />
        </View>
        <AppText variant="small" color={colors.textMuted} center>
          {t.plans.daysLeft(left)}
        </AppText>
        <AppText variant="bodyBold" color={colors.textSecondary} style={styles.details}>
          {t.plans.details}
        </AppText>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <AppText variant="small" color={colors.textSecondary}>
              {r.label}
            </AppText>
            <AppText variant="smallMedium" color={r.color ?? colors.text}>
              {r.value}
            </AppText>
          </View>
        ))}
        <Divider style={styles.divider} />
        <ListRow icon={<Ionicons name="add-circle-outline" size={22} color={colors.textMuted} />} label={t.plans.upgrade} onPress={() => router.push('/cabinet/plans')} />
        <ListRow
          icon={<Ionicons name="repeat-outline" size={22} color={colors.textMuted} />}
          label={t.plans.autoRenew}
          right={
            <Switch
              value={s.autoRenew}
              onChange={async (v) => {
                await api.plans.setAutoRenew(v).catch(() => undefined);
                await qc.invalidateQueries({ queryKey: qk.subscription });
              }}
            />
          }
          last
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: { paddingTop: 16, gap: 16 },
  card: { marginTop: 24, gap: 10, paddingTop: 40, marginBottom: layout.screenPadding },
  badge: { position: 'absolute', top: -28, left: 0, right: 0, alignItems: 'center' },
  progressTrack: { height: 6, borderRadius: radii.pill, backgroundColor: colors.divider, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%' },
  details: { paddingTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  divider: { marginVertical: 8 },
});
