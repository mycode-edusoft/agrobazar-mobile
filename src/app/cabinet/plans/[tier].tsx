import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { TierBadge } from '@/components/plans/TierBadge';
import { AppText, BottomSheet, Button, Card, FooterBar, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount } from '@/lib/format';
import { usePaymentFlow } from '@/lib/payment';
import { qk } from '@/lib/queries';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii } from '@/theme';
import type { BillingCycle, PaymentMethod, PlanTier } from '@/types/domain';

export default function PlanPurchaseScreen() {
  const router = useRouter();
  const toast = useToast();
  const { tier, planId, cycle } = useLocalSearchParams<{ tier: PlanTier; planId: string; cycle: BillingCycle }>();
  const user = useAuthStore((s) => s.user);
  const { verifying, complete } = usePaymentFlow();
  const [methodOpen, setMethodOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const plans = useQuery({ queryKey: qk.plans(user?.type ?? 'individual'), queryFn: () => api.plans.plans(user?.type ?? 'individual') });
  const plan = plans.data?.find((p) => p.id === planId);
  const tint = colors.tier[tier ?? 'green'];
  const price = plan ? (cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : 0;

  const purchase = async (method: PaymentMethod) => {
    if (!plan) return;
    setMethodOpen(false);
    setLoading(true);
    try {
      const intent = await api.plans.purchase(plan.id, cycle ?? 'monthly', method);
      const status = await complete(intent);
      if (status === 'completed') {
        toast(t.balance.paymentSuccess);
        router.dismissAll();
        router.replace('/cabinet/plans/active');
      } else {
        toast(t.balance.paymentFailed, 'error');
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={t.cabinet.plans} />}
      background={tint.to}
      scroll
      padded
      footer={
        <FooterBar style={styles.footer}>
          <View style={styles.amountRow}>
            <AppText variant="body" color={colors.textMuted}>
              {t.plans.amount}
            </AppText>
            <AppText variant="bodyBold">{formatAmount(price)}</AppText>
          </View>
          <Button title={t.plans.buy} onPress={() => setMethodOpen(true)} loading={loading} disabled={!plan} />
        </FooterBar>
      }
    >
      {plan ? (
        <Card style={styles.card}>
          <View style={styles.badge}>
            <TierBadge tier={tier} size={56} />
          </View>
          <AppText variant="buttonLarge" color={tint.text} center>
            {plan.name}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center>
            {t.cabinet.userType[plan.userType]} · {cycle === 'yearly' ? t.plans.yearly : t.plans.monthly}
          </AppText>
          <AppText variant="bodyBold" color={colors.textSecondary} style={styles.includes}>
            {t.plans.includes}
          </AppText>
          {plan.benefits.map((b) => (
            <View key={b} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={20} color={colors.successAlt} />
              <AppText variant="body" color={colors.textSecondary}>
                {b}
              </AppText>
            </View>
          ))}
          <AppText variant="caption" color={colors.textMuted} style={styles.note}>
            {t.plans.subtitleHint}
          </AppText>
        </Card>
      ) : null}

      <BottomSheet visible={methodOpen} onClose={() => setMethodOpen(false)} title={t.plans.buy}>
        <Button title={`${t.balance.title} (${formatAmount(user?.balance ?? 0)})`} variant="outline" size="lg" onPress={() => purchase('balance')} disabled={(user?.balance ?? 0) < price} />
        <Button title="Kartla ödə" onPress={() => purchase('card')} />
      </BottomSheet>
      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 24, gap: 10, paddingTop: 40, marginBottom: layout.screenPadding },
  badge: { position: 'absolute', top: -28, alignSelf: 'center', left: 0, right: 0, alignItems: 'center' },
  includes: { paddingTop: 12 },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  note: { paddingTop: 8 },
  footer: { borderTopLeftRadius: radii.md, borderTopRightRadius: radii.md },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
