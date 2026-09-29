import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText, Button, Card, FooterBar, Input, Screen, ScreenHeader, VerifyingOverlay, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { usePaymentFlow } from '@/lib/payment';
import { api, ApiError } from '@/services';
import { colors, layout } from '@/theme';

const presets = [5, 10, 20, 50];

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
    <Screen
      header={<ScreenHeader title={t.balance.topUpTitle} rightText={t.common.reset} onRightPress={() => setAmount('')} />}
      keyboard
      padded
      footer={
        <FooterBar>
          <Button title={t.balance.pay} onPress={pay} disabled={!valid} loading={loading} />
          <AppText variant="caption" color={colors.textMuted} center>
            {t.balance.payLegal}
          </AppText>
        </FooterBar>
      }
    >
      <Card style={styles.card}>
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.balance.amountLabel}
        </AppText>
        <Input value={amount} onChangeText={(v) => setAmount(v.replace(/[^\d.,]/g, ''))} keyboardType="decimal-pad" placeholder="0" autoFocus rightElement={<AppText variant="body" color={colors.textMuted}>{t.common.currency}</AppText>} />
        <View style={styles.presets}>
          {presets.map((p) => (
            <Button key={p} title={`${p} ₼`} variant={value === p ? 'primary' : 'outline'} size="sm" onPress={() => setAmount(String(p))} style={styles.preset} />
          ))}
        </View>
      </Card>
      <VerifyingOverlay visible={verifying} title={t.balance.verifying} hint={t.balance.verifyingHint} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, gap: 12 },
  presets: { flexDirection: 'row', gap: 8 },
  preset: { flex: 1 },
});
