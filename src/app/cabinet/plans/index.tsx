import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '@/components/icons/Icon';
import { PopularPill } from '@/components/plans/PlanSheet';
import { TierIconBox } from '@/components/plans/TierDot';
import { AppText, Screen, ScreenHeader, SegmentedControl } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount } from '@/lib/format';
import { planPrice } from '@/lib/plans';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, shadows, typography } from '@/theme';
import type { BillingCycle, Plan, UserType } from '@/types/domain';

const userTypeOptions: { value: UserType; label: string }[] = [
  { value: 'individual', label: t.plans.individual },
  { value: 'corporate', label: t.plans.corporate },
];
const cycleOptions: { value: BillingCycle; label: string }[] = [
  { value: 'monthly', label: t.plans.monthly },
  { value: 'yearly', label: t.plans.yearly },
];

/**
 * Figma "Tariflər aylıq / illik": ağ zolaqda Aylıq/İllik, başlıq + izah, 3 tarif kartı.
 * Kart toxunanda tarif səhifəsi açılır. Daxil olmuş istifadəçi yalnız öz hesab tipinin tariflərini görür;
 * qonaq üçün Fərdi/Korporativ seçimi də göstərilir (Figma-da yoxdur — bax designer-notes).
 */
export default function PlansScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [guestType, setGuestType] = useState<UserType>('individual');
  const userType = user?.type ?? guestType;

  const plans = useQuery({ queryKey: qk.plans(userType), queryFn: () => api.plans.plans(userType) });
  const sub = useQuery({ queryKey: qk.subscription, queryFn: () => api.plans.current(), enabled: !!user });

  return (
    <Screen header={<ScreenHeader title={t.cabinet.plans} />} background="#F2F2F2">
      <View style={styles.segments}>
        {!user ? <SegmentedControl<UserType> options={userTypeOptions} value={guestType} onChange={setGuestType} tall /> : null}
        <SegmentedControl<BillingCycle> options={cycleOptions} value={cycle} onChange={setCycle} tall />
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <AppText style={styles.title}>{t.plans.subtitle}</AppText>
          <AppText style={styles.hint}>{t.plans.subtitleHint}</AppText>
        </View>
        {(plans.data ?? []).map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            cycle={cycle}
            active={sub.data?.planId === plan.id && sub.data.status === 'active'}
            onPress={() =>
              sub.data?.planId === plan.id
                ? router.push('/cabinet/plans/active')
                : router.push({ pathname: '/cabinet/plans/[tier]', params: { tier: plan.tier, planId: plan.id, cycle, userType } })
            }
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

function PlanCard({ plan, cycle, active, onPress }: { plan: Plan; cycle: BillingCycle; active: boolean; onPress(): void }) {
  const { price, old } = planPrice(plan, cycle);
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <TierIconBox tier={plan.tier} />
      <View style={styles.cardText}>
        <View style={styles.nameRow}>
          <AppText style={[styles.label, { color: colors.tier[plan.tier].text }]}>{plan.name}</AppText>
          {plan.popular ? <PopularPill /> : null}
          {active ? (
            <AppText style={[styles.label, styles.activeTag]}>{t.plans.active}</AppText>
          ) : null}
        </View>
        <View style={styles.priceRow}>
          <AppText style={styles.label}>
            {formatAmount(price)} {cycle === 'monthly' ? t.plans.perMonth : t.plans.perYear}
          </AppText>
          {old != null ? <AppText style={styles.old}>{formatAmount(old)}</AppText> : null}
        </View>
      </View>
      <View style={styles.chevron}>
        <Icon name="chevron" direction="right" size={24} color={colors.textMuted} />
      </View>
      {/* Figma "ic_topi": ən populyar tarifin sol üst küncündə mavi lent + ağ ulduz */}
      {plan.popular ? (
        <View style={styles.ribbon} pointerEvents="none">
          <View style={styles.ribbonTriangle} />
          <Ionicons name="star" size={11} color={colors.surface} style={styles.ribbonStar} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Figma: ağ zolaq, padding 16; seqment 56px (4px daxili boşluq + 48px düymələr)
  segments: { backgroundColor: colors.surface, padding: 16, gap: 10 },
  body: { paddingTop: 16, paddingBottom: 32, gap: 16 },
  intro: { gap: 6, paddingHorizontal: 54 },
  title: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 18, lineHeight: 25, color: '#181818', textAlign: 'center' },
  hint: { ...typography.small, lineHeight: 20, color: '#9DA4AE', textAlign: 'center' },
  card: {
    marginHorizontal: layout.screenPadding, minHeight: 72, borderRadius: 14, backgroundColor: colors.surface,
    paddingVertical: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden',
    ...shadows.card,
  },
  cardText: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Figma: 12 SemiBold 130%, #595959
  label: { fontFamily: typography.tabLabelActive.fontFamily, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  activeTag: { color: colors.primary },
  old: { ...typography.caption, lineHeight: 16, color: 'rgba(157, 164, 174, 0.71)', textDecorationLine: 'line-through' },
  chevron: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center' },
  ribbon: { position: 'absolute', top: 0, left: 0, width: 40, height: 40 },
  ribbonTriangle: {
    width: 0, height: 0, borderTopWidth: 40, borderRightWidth: 40,
    borderTopColor: '#1977F2', borderRightColor: 'transparent',
  },
  ribbonStar: { position: 'absolute', top: 5, left: 5 },
});
