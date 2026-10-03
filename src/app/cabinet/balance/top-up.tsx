import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Field, Section } from '@/components/store/FormKit';
import { AppText, Button, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { usePaymentFlow } from '@/lib/payment';
import { api, ApiError } from '@/services';
import { colors, layout, shadows, typography } from '@/theme';

/**
 * Figma "Balansı artırmaq": tək ağ kart — məbləğ sahəsi, "Bank kartı ilə ödə" və razılıq mətni.
 * Düymə bankın 3D Secure səhifəsini açır (gateway-in öz dizaynı), qayıdanda ödəniş statusu yoxlanılır.
 */
export default function TopUpScreen() {
  const router = useRouter();
  const toast = useToast();
  const { verifying, complete } = usePaymentFlow();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const value = Number(amount.replace(',', '.'));
  const valid = value > 0;

  const pay = async () => {
    if (!valid) {
      toast(t.balance.invalidAmount, 'error');
      return;
    }
    setLoading(true);
    try {
      const intent = await api.balance.topUp(value);
      const status = await complete(intent);
      if (status === 'completed') {
        toast(t.balance.paymentSuccess);
        router.back();
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
    <Screen header={<ScreenHeader title={t.balance.topUpTitle} />} keyboard scroll>
      <View style={styles.card}>
        <Section title={t.balance.amountLabel}>
          <Field
            value={amount}
            onChangeText={(v) => setAmount(v.replace(/[^\d.,]/g, ''))}
            keyboardType="decimal-pad"
            placeholder={t.balance.amountPlaceholder}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={pay}
          />
        </Section>
        <View style={styles.actions}>
          <Button title={t.balance.payByCard} onPress={pay} disabled={!valid} loading={loading} />
          <AppText style={styles.legal}>
            {t.balance.payLegalPrefix}
            <AppText style={[styles.legal, styles.link]} onPress={() => router.push('/info/rules')}>
              {t.balance.payLegalLink}
            </AppText>
            {t.balance.payLegalSuffix}
          </AppText>
        </View>
      </View>
      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Figma: kart radius 14, kölgə, padding 16 0; sahə bölməsindən sonra düymə bloku 24 16 16, aralıq 12
  card: {
    margin: layout.screenPadding, backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, ...shadows.card,
  },
  actions: { paddingTop: 24, paddingHorizontal: 16, gap: 12 },
  legal: { ...typography.caption, lineHeight: 20, letterSpacing: -0.24, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 23 },
  link: { paddingHorizontal: 0, textDecorationLine: 'underline' },
});
