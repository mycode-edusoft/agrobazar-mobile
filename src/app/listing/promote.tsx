import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppText, Button, Card, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount, formatDateTime } from '@/lib/format';
import { usePaymentFlow } from '@/lib/payment';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, typography } from '@/theme';
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
    // Figma "Elanı irəli çək / Premium et / VIP et": ağ izah zolağı, (bonus varsa) boz fonda bonus kartı,
    // kartlarda müddət və ödəniş üsulu, "Ödə" düyməsi və razılıq mətni məzmunun içində
    <Screen header={<ScreenHeader title={titles[kind]} />} scroll>
      <View style={styles.subtitleBar}>
        <AppText style={styles.subtitle}>{data.subtitle}</AppText>
      </View>

      {data.bonus ? (
        <View style={styles.bonusBand}>
          <View style={styles.bonusCard}>
            <View style={styles.bonusRow}>
              <AppText style={styles.bonusLabel}>{t.promote.before}</AppText>
              <AppText style={[styles.bonusValue, styles.strike]}>{data.bonus.before}</AppText>
            </View>
            <View style={styles.bonusRow}>
              <AppText style={styles.bonusLabel}>{t.promote.now}</AppText>
              <AppText style={styles.bonusValue}>{data.bonus.now}</AppText>
            </View>
            <BonusRibbon />
          </View>
          <AppText style={styles.paidUntil}>{t.promote.paidUntil(formatDateTime(data.bonus.paidUntil))}</AppText>
        </View>
      ) : null}

      <View style={styles.body}>
        <Card style={styles.card}>
          <AppText variant="bodyBold" color={colors.textSecondary}>
            {t.promote.duration}
          </AppText>
          <View style={styles.options}>
            {data.options.map((o) => (
              <RadioRow
                key={o.id}
                selected={optionId === o.id}
                onPress={() => setOptionId(o.id)}
                label={`${o.label}/ ${o.price.toFixed(2).replace('.', ',')} ${t.common.currency}`}
                hot={o.hot}
              />
            ))}
          </View>
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
            <View style={styles.options}>
              <RadioRow
                selected={method === 'balance'}
                onPress={() => setMethod('balance')}
                label={t.promote.balanceAccount(formatAmount(user?.balance ?? 0))}
              />
              <RadioRow selected={method === 'card'} onPress={() => setMethod('card')} label={t.promote.card} />
            </View>
          </Card>
        )}

        <View style={styles.payBlock}>
          <Button title={t.promote.pay} onPress={pay} loading={paying} disabled={!selected} />
          <AppText style={styles.legal}>
            {t.promote.legalPrefix}
            <AppText style={[styles.legal, styles.link]} onPress={() => router.push({ pathname: '/info/rules', params: { tab: 'agreement' } })}>
              {t.promote.legalAgreement}
            </AppText>
            {t.promote.legalAnd}
            <AppText style={[styles.legal, styles.link]} onPress={() => router.push({ pathname: '/info/rules', params: { tab: 'paid' } })}>
              {t.promote.legalRules}
            </AppText>
            {t.promote.legalSuffix}
          </AppText>
        </View>
      </View>

      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

// Figma "Frame 100": kartın sağ üst küncündən asılan qırmızı lent (#F65151) + solda qatlanma (#940909)
function BonusRibbon() {
  return (
    <View style={styles.ribbon} pointerEvents="none">
      <View style={styles.ribbonFold} />
      <View style={styles.ribbonBody}>
        <AppText style={styles.ribbonText}>{t.promote.bonus}</AppText>
      </View>
    </View>
  );
}

// Figma "& RadioButton": 20px dairə, 2px çərçivə (#8C8C8C / seçiləndə yaşıl + 10px nöqtə), mətn 16/24 #595959
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
        {hot ? ' 🔥' : ''}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { marginTop: 60 },
  // Figma "Frame 1618873060": ağ zolaq, padding 8 16, 14/24 #595959
  subtitleBar: { backgroundColor: colors.surface, paddingHorizontal: layout.screenPadding, paddingVertical: 8 },
  subtitle: { ...typography.small, lineHeight: 24, color: colors.textSecondary },

  // Figma "Frame 2147225832": #F3F3F3 zolaq (padding 16 16 0), ağ kart yaşıl çərçivə radius 14, altında tarix
  bonusBand: { backgroundColor: '#F3F3F3', paddingTop: 16, paddingHorizontal: layout.screenPadding, gap: 12 },
  bonusCard: {
    borderWidth: 1, borderColor: colors.primary, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  bonusRow: { flexDirection: 'row', gap: 12 },
  bonusLabel: { ...typography.smallMedium, width: 74, color: colors.textPlaceholder },
  bonusValue: { ...typography.small, lineHeight: 22, color: colors.textSecondary },
  strike: { textDecorationLine: 'line-through' },
  paidUntil: { ...typography.smallMedium, lineHeight: 20, color: colors.textPlaceholder, textAlign: 'center' },
  ribbon: { position: 'absolute', top: -1, right: 16, flexDirection: 'row', alignItems: 'flex-start' },
  ribbonFold: { width: 7, height: 8, backgroundColor: '#940909', borderTopLeftRadius: 4 },
  ribbonBody: {
    height: 32, paddingHorizontal: 8, justifyContent: 'center', backgroundColor: '#F65151',
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  ribbonText: { ...typography.bodyBold, fontSize: 14, lineHeight: 20, color: colors.surface },

  body: { padding: layout.screenPadding, gap: 10 },
  card: { borderRadius: 14, gap: 16 },
  // Figma: başlıqdan 16+8, sətirlər 24px + 32 aralıq (burada 44px toxunma sahəsi + 12)
  options: { marginTop: -2, gap: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.textMuted,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 2,
  },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  freeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.primaryTint, paddingVertical: 12,
  },
  // Figma "Frame 1000001204": düymə + 12/20 #8C8C8C razılıq mətni (248px, mərkəzdə)
  payBlock: { paddingTop: 16, paddingHorizontal: 16, gap: 12, alignItems: 'stretch' },
  legal: { ...typography.caption, lineHeight: 20, letterSpacing: -0.24, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 23 },
  link: { paddingHorizontal: 0, textDecorationLine: 'underline' },
});
