import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Card, FooterBar, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount, formatDateTime } from '@/lib/format';
import { usePaymentFlow } from '@/lib/payment';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii } from '@/theme';
import type { PaymentMethod, PromotionKind } from '@/types/domain';

const titles: Record<PromotionKind, string> = {
  bump: t.promote.bumpTitle,
  vip: t.promote.vipTitle,
  premium: t.promote.premiumTitle,
};

export default function PromoteScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { id, kind } = useLocalSearchParams<{ id: string; kind: PromotionKind }>();
  const user = useAuthStore((s) => s.user);
  const { verifying, complete } = usePaymentFlow();
  const [optionId, setOptionId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('balance');
  const [paying, setPaying] = useState(false);

  const offer = useQuery({
    queryKey: ['promotion', id, kind],
    queryFn: () => api.listings.promotionOffer(id, kind),
  });

  useEffect(() => {
    if (!optionId && offer.data) setOptionId(offer.data.options[0].id);
  }, [offer.data, optionId]);

  const selected = offer.data?.options.find((o) => o.id === optionId) ?? null;
  const isFree = (offer.data?.freeLeft ?? 0) > 0;

  const pay = async () => {
    if (!selected) return;
    setPaying(true);
    try {
      const intent = await api.listings.promote({ listingId: id, kind, optionId: selected.id, method });
      const status = await complete(intent);
      if (status === 'completed') {
        await Promise.all([
          qc.invalidateQueries({ queryKey: ['listing', id] }),
          qc.invalidateQueries({ queryKey: ['listings'] }),
          qc.invalidateQueries({ queryKey: ['notifications'] }),
        ]);
        toast(t.promote.success);
        router.back();
      } else {
        toast(t.balance.paymentFailed, 'error');
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setPaying(false);
    }
  };

  if (offer.isLoading || !offer.data) {
    return (
      <Screen header={<ScreenHeader title={titles[kind] ?? ''} />}>
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      </Screen>
    );
  }

  const data = offer.data;

  return (
    <Screen
      header={<ScreenHeader title={titles[kind]} />}
      scroll
      padded
      footer={
        <FooterBar>
          <Button title={t.promote.pay} onPress={pay} loading={paying} disabled={!selected} />
          <AppText variant="caption" color={colors.textMuted} center>
            {t.promote.legal}
          </AppText>
        </FooterBar>
      }
    >
      <AppText variant="small" color={colors.textMuted} style={styles.subtitle}>
        {data.subtitle}
      </AppText>

      {data.bonus ? (
        <View style={styles.bonusCard}>
          <View style={styles.bonusTag}>
            <AppText variant="caption" color={colors.surface}>
              {t.promote.bonus}
            </AppText>
          </View>
          <View style={styles.bonusRow}>
            <AppText variant="small" color={colors.textMuted} style={styles.bonusLabel}>
              {t.promote.before}
            </AppText>
            <AppText variant="small" color={colors.textMuted} style={styles.strike}>
              {data.bonus.before}
            </AppText>
          </View>
          <View style={styles.bonusRow}>
            <AppText variant="small" color={colors.textMuted} style={styles.bonusLabel}>
              {t.promote.now}
            </AppText>
            <AppText variant="smallMedium">{data.bonus.now}</AppText>
          </View>
          <AppText variant="caption" color={colors.textMuted} center style={styles.paidUntil}>
            {t.promote.paidUntil(formatDateTime(data.bonus.paidUntil))}
          </AppText>
        </View>
      ) : null}

      <Card style={styles.card}>
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.promote.duration}
        </AppText>
        {data.options.map((o) => (
          <RadioRow
            key={o.id}
            selected={optionId === o.id}
            onPress={() => setOptionId(o.id)}
            label={`${o.label}/ ${o.price.toFixed(2).replace('.', ',')} ${t.common.currency}`}
            hot={o.hot}
          />
        ))}
      </Card>

      {isFree ? (
        <Card flat style={styles.freeCard}>
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <AppText variant="small" color={colors.primaryDark} style={styles.flex}>
            {t.promote.freeLeft(data.freeLeft)}
          </AppText>
        </Card>
      ) : (
        <Card style={styles.card}>
          <AppText variant="bodyBold" color={colors.textSecondary}>
            {t.promote.paymentMethod}
          </AppText>
          <RadioRow
            selected={method === 'balance'}
            onPress={() => setMethod('balance')}
            label={t.promote.balanceAccount(formatAmount(user?.balance ?? 0))}
          />
          <RadioRow selected={method === 'card'} onPress={() => setMethod('card')} label={t.promote.card} />
        </Card>
      )}

      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

function RadioRow({
  selected, onPress, label, hot,
}: { selected: boolean; onPress(): void; label: string; hot?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.radioRow} accessibilityRole="radio" accessibilityState={{ selected }}>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <AppText variant="body" color={colors.textSecondary} style={styles.flex}>
        {label}
      </AppText>
      {hot ? <AppText variant="body">🔥</AppText> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: 60 },
  subtitle: { paddingTop: 16 },
  card: { marginTop: 16, gap: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.textPlaceholder,
    alignItems: 'center', justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  bonusCard: {
    marginTop: 16, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.sm,
    padding: 12, gap: 4, backgroundColor: colors.surface,
  },
  bonusTag: {
    position: 'absolute', top: -10, right: 12, backgroundColor: colors.danger,
    paddingHorizontal: 8, height: 20, borderRadius: 4, justifyContent: 'center',
  },
  bonusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bonusLabel: { width: 48 },
  strike: { textDecorationLine: 'line-through' },
  paidUntil: { paddingTop: 8 },

  freeCard: {
    marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.primaryTint, paddingVertical: 12, marginBottom: layout.screenPadding,
  },
});
