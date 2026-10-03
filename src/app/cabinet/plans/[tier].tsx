import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { PlanSheet, SheetSection } from '@/components/plans/PlanSheet';
import { AppText, BottomSheet, Button, Divider, FooterBar, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount } from '@/lib/format';
import { usePaymentFlow } from '@/lib/payment';
import { planPrice } from '@/lib/plans';
import { qk } from '@/lib/queries';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, typography } from '@/theme';
import type { BillingCycle, PaymentMethod, PlanTier, UserType } from '@/types/domain';

/** Figma tarif səhifəsi: tarif rəngli fon, "Tarifə daxildir" siyahısı, altda "Məbləğ" + ödəniş düyməsi */
export default function PlanPurchaseScreen() {
  const router = useRouter();
  const toast = useToast();
  const { tier, planId, cycle, userType } = useLocalSearchParams<{ tier: PlanTier; planId: string; cycle: BillingCycle; userType?: UserType }>();
  const user = useAuthStore((s) => s.user);
  const { verifying, complete } = usePaymentFlow();
  const [methodOpen, setMethodOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const type = userType ?? user?.type ?? 'individual';
  const plans = useQuery({ queryKey: qk.plans(type), queryFn: () => api.plans.plans(type) });
  const plan = plans.data?.find((p) => p.id === planId);
  const { price, old } = plan ? planPrice(plan, cycle ?? 'monthly') : { price: 0, old: null };
  // Başqa hesab tipinin tarifi yalnız məlumat üçündür (BRD: tarif hesab tipinə bağlıdır)
  const foreign = !!user && user.type !== type;

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
      background={colors.tier[tier ?? 'green'].text}
      scroll
      contentStyle={styles.grow}
      footer={
        <FooterBar style={styles.footer}>
          <View style={styles.amountRow}>
            <AppText style={[styles.amount, styles.flex]}>{t.plans.amount}</AppText>
            {old != null ? <AppText style={styles.old}>{formatAmount(old)}</AppText> : null}
            <AppText style={styles.amount}>{formatAmount(price)}</AppText>
          </View>
          <Button
            title={t.plans.buy}
            onPress={() => (user ? setMethodOpen(true) : router.push('/auth/phone'))}
            loading={loading}
            disabled={!plan || foreign}
          />
        </FooterBar>
      }
    >
      {plan ? (
        <PlanSheet tier={plan.tier} name={plan.name} popular={plan.popular}>
          <SheetSection>
            <Divider />
            <AppText variant="bodyBold" color={colors.textSecondary}>
              {t.plans.includes}
            </AppText>
            <View style={styles.benefits}>
              {plan.benefits.map((b) => (
                <View key={b} style={styles.benefit}>
                  <View style={styles.tick}>
                    <Ionicons name="checkmark" size={12} color={colors.surface} />
                  </View>
                  <AppText style={styles.benefitText}>{b}</AppText>
                </View>
              ))}
            </View>
            <AppText variant="caption" color={colors.textMuted}>
              {foreign ? t.plans.foreignType(t.cabinet.userType[user!.type]) : t.plans.subtitleHint}
            </AppText>
          </SheetSection>
        </PlanSheet>
      ) : null}

      <BottomSheet visible={methodOpen} onClose={() => setMethodOpen(false)} title={t.plans.buy}>
        <Button
          title={`${t.balance.title} (${formatAmount(user?.balance ?? 0)})`}
          variant="outline"
          size="lg"
          onPress={() => purchase('balance')}
          disabled={(user?.balance ?? 0) < price}
        />
        <Button title={t.promote.card} onPress={() => purchase('card')} />
      </BottomSheet>
      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  grow: { flexGrow: 1, paddingBottom: 0 },
  benefits: { gap: 4 },
  // Figma "Benefit": 40px sətir, 18px yaşıl (#0BBA20) dairəvi ✓, 16/19 #595959
  benefit: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tick: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#0BBA20', alignItems: 'center', justifyContent: 'center' },
  benefitText: { flex: 1, ...typography.body, lineHeight: 19, color: colors.textSecondary },
  // Figma: ağ panel, yuxarı radius 14, kölgə 0 0 4 .08; "Məbləğ" sətri 52px, sonra 56px düymə
  // Figma-da panel radius 14-dür, amma ağ kartın üstündədir — fon rəngli künclər görünməsin deyə düz
  footer: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 14, paddingLeft: 12, paddingRight: 16 },
  amount: { fontFamily: typography.bodyBold.fontFamily, fontSize: 14, lineHeight: 22, color: colors.textSecondary },
  old: { ...typography.caption, lineHeight: 16, color: 'rgba(157, 164, 174, 0.71)', textDecorationLine: 'line-through' },
});
