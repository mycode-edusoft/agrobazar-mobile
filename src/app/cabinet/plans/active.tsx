import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/icons/Icon';
import { PlanSheet, SheetSection } from '@/components/plans/PlanSheet';
import { AppText, Button, Divider, EmptyState, Screen, ScreenHeader, Switch } from '@/components/ui';
import { t } from '@/i18n/az';
import { daysBetween, formatAmount, formatDateTimeDashed } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, typography } from '@/theme';

/** Figma "Aktiv tarifim": tarif rəngli fon, qalan günlər zolağı, "Ətraflı" cədvəli, limit artırma + avtomatik yenilənmə */
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
  const tint = colors.tier[s.tier].text;
  const total = daysBetween(s.startedAt, s.endsAt);
  const left = daysBetween(new Date().toISOString(), s.endsAt);
  // Zolaq qalan müddəti göstərir (Figma: 27 gün qalıb → ~77% dolu)
  const remaining = total > 0 ? Math.min(1, Math.max(0, left / total)) : 0;

  const rows = [
    { label: t.plans.status, value: s.status === 'active' ? t.plans.active : t.plans.expired, color: s.status === 'active' ? colors.primary : colors.danger },
    { label: t.plans.type, value: s.cycle === 'monthly' ? t.plans.monthly : t.plans.yearly },
    { label: t.plans.startDate, value: formatDateTimeDashed(s.startedAt) },
    { label: t.plans.endDate, value: formatDateTimeDashed(s.endsAt) },
    { label: t.plans.listingsCount, value: `${s.listingsUsed}/${s.listingsLimit}` },
    { label: t.plans.paid, value: formatAmount(s.paidAmount) },
  ];

  return (
    <Screen header={<ScreenHeader title={t.cabinet.myPlan} />} background={tint} edges={['top']} scroll contentStyle={styles.grow}>
      <PlanSheet tier={s.tier} name={s.planName}>
        <SheetSection>
          <View style={styles.progress}>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${remaining * 100}%`, backgroundColor: tint }]} />
            </View>
            <AppText style={styles.daysLeft}>{t.plans.daysLeft(left)}</AppText>
          </View>
        </SheetSection>
        <SheetSection>
          <AppText variant="bodyBold" color={colors.textSecondary}>
            {t.plans.details}
          </AppText>
          <View style={styles.rows}>
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <AppText style={[styles.rowText, styles.flex]}>{r.label}</AppText>
                <AppText style={[styles.rowText, r.color ? { color: r.color } : null]}>{r.value}</AppText>
              </View>
            ))}
          </View>
          <Divider />
          <View style={styles.actions}>
            <ActionRow
              icon={<MaterialCommunityIcons name="database-plus-outline" size={22} color={colors.textPlaceholder} />}
              label={t.plans.upgrade}
              onPress={() => router.push('/cabinet/plans')}
              right={<Icon name="chevron" direction="right" size={20} color={colors.textPlaceholder} />}
            />
            <ActionRow
              icon={<Ionicons name="repeat" size={22} color={colors.textPlaceholder} />}
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
            />
          </View>
        </SheetSection>
      </PlanSheet>
    </Screen>
  );
}

// Figma "Main button": 40px boz ikon kvadratı + 14 Medium etiket + sağda ox və ya açar
function ActionRow({ icon, label, right, onPress }: { icon: ReactNode; label: string; right: ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.action}>
      <View style={styles.iconBox}>{icon}</View>
      <AppText variant="smallMedium" color={colors.textSecondary} style={styles.flex}>
        {label}
      </AppText>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1, paddingBottom: 0 },
  emptyWrap: { paddingTop: 16, gap: 16 },
  progress: { gap: 7 },
  track: { height: 9, borderRadius: 3, backgroundColor: '#C4C4C4', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  daysLeft: { fontFamily: typography.small.fontFamily, fontSize: 12, lineHeight: 14, color: '#8F8F8F', textAlign: 'center' },
  rows: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  rowText: { ...typography.small, lineHeight: 22, color: colors.textSecondary },
  actions: { gap: 16 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.iconBackground, alignItems: 'center', justifyContent: 'center' },
});
