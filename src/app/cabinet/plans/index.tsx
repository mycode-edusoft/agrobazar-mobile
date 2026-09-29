import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { TierBadge } from '@/components/plans/TierBadge';
import { AppText, Card, Screen, ScreenHeader, SegmentedControl } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';
import type { BillingCycle, Plan, UserType } from '@/types/domain';

const userTypeOptions: { value: UserType; label: string }[] = [
  { value: 'individual', label: t.plans.individual },
  { value: 'corporate', label: t.plans.corporate },
];
const cycleOptions: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: t.plans.monthly },
  { value: 'yearly', label: t.plans.yearly },
];

export default function PlansScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [userType, setUserType] = useState<UserType>(user?.type ?? 'individual');
  const [expanded, setExpanded] = useState<string | null>(null);

  const plans = useQuery({ queryKey: qk.plans(userType), queryFn: () => api.plans.plans(userType) });
  const sub = useQuery({ queryKey: qk.subscription, queryFn: () => api.plans.current(), enabled: !!user });
  const foreignType = !!user && user.type !== userType;

  return (
    <Screen
      header={
        <ScreenHeader
          title={t.cabinet.plans}
          right={
            sub.data ? (
              <Pressable onPress={() => router.push('/cabinet/plans/active')} hitSlop={8}>
                <AppText variant="smallMedium" color={colors.primary}>
                  {t.cabinet.myPlan}
                </AppText>
              </Pressable>
            ) : null
          }
        />
      }
      scroll
      padded
    >
      <View style={styles.body}>
        <SegmentedControl<UserType> options={userTypeOptions} value={userType} onChange={setUserType} />
        <SegmentedControl<BillingCycle> options={cycleOptions} value={cycle} onChange={setCycle} />
        <View style={styles.subtitle}>
          <AppText variant="buttonLarge" center>
            {t.plans.subtitle}
          </AppText>
          <AppText variant="small" color={colors.textMuted} center>
            {foreignType ? `Sizin hesabınız ${t.cabinet.userType[user!.type]} tiplidir — bu tariflər yalnız məlumat üçündür.` : t.plans.subtitleHint}
          </AppText>
        </View>

        {(plans.data ?? []).map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            expanded={expanded === plan.id}
            onToggle={() => setExpanded(expanded === plan.id ? null : plan.id)}
            active={sub.data?.planId === plan.id}
            disabled={foreignType}
            onSelect={() => router.push({ pathname: '/cabinet/plans/[tier]', params: { tier: plan.tier, planId: plan.id, cycle } })}
          />
        ))}
      </View>
    </Screen>
  );
}

function PlanCard({
  plan, cycle, expanded, onToggle, active, disabled, onSelect,
}: { plan: Plan; cycle: BillingCycle; expanded: boolean; onToggle(): void; active: boolean; disabled: boolean; onSelect(): void }) {
  const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const old = cycle === 'monthly' ? plan.oldMonthlyPrice : plan.oldMonthlyPrice != null ? plan.oldMonthlyPrice * 10 : null;
  const tint = colors.tier[plan.tier].text;

  return (
    <Card style={styles.plan}>
      <Pressable onPress={onToggle} style={styles.planRow}>
        <TierBadge tier={plan.tier} />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <AppText variant="bodyBold" color={tint}>
              {plan.name}
            </AppText>
            {plan.popular ? (
              <View style={styles.popular}>
                <AppText variant="caption" color={colors.link} style={styles.popularText}>
                  {t.plans.popular}
                </AppText>
              </View>
            ) : null}
            {active ? (
              <View style={[styles.popular, styles.activeBadge]}>
                <AppText variant="caption" color={colors.primary} style={styles.popularText}>
                  {t.plans.active}
                </AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.priceRow}>
            {old != null ? (
              <AppText variant="caption" color={colors.textPlaceholder} style={styles.old}>
                {old.toFixed(2)} ₼
              </AppText>
            ) : null}
            <AppText variant="bodyMedium">
              {price.toFixed(2)} ₼ {cycle === 'monthly' ? t.plans.perMonth : t.plans.perYear}
            </AppText>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>
      {expanded ? (
        <View style={styles.benefits}>
          {plan.benefits.map((b) => (
            <View key={b} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={18} color={colors.successAlt} />
              <AppText variant="small" color={colors.textSecondary}>
                {b}
              </AppText>
            </View>
          ))}
          <Pressable onPress={onSelect} disabled={disabled || active} style={[styles.selectBtn, { backgroundColor: disabled || active ? colors.disabledBackground : colors.primary }]}>
            <AppText variant="button" color={disabled || active ? colors.disabledText : colors.surface}>
              {active ? t.plans.active : t.plans.buy}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  subtitle: { gap: 4, paddingVertical: 8 },
  plan: { gap: 12 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  popular: { borderWidth: 1, borderColor: colors.link, borderRadius: 100, paddingHorizontal: 8, height: 20, justifyContent: 'center' },
  activeBadge: { borderColor: colors.primary },
  popularText: { lineHeight: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  old: { textDecorationLine: 'line-through' },
  benefits: { gap: 10, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 12 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectBtn: { height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
