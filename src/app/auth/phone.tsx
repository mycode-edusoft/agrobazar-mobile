import { useReducer, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { AZ_COUNTRY_CODE, isKnownAzOperator, maskAzPhone, parseAzPhoneDigits } from '@/lib/format';
import { api, ApiError } from '@/services';
import { colors, layout } from '@/theme';
import { Icon } from '@/components/icons/Icon';

export default function PhoneScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  // Operator + abunəçi, 9 rəqəm, aparıcı 0-sız (məs. "557293791")
  const [digits, setDigits] = useState('');
  // Rəqəmlər dəyişməsə belə (məs. "(0"-ı silmək, "-" / "." yazmaq) yenidən render — native sahə maskaya qayıtsın
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const operatorOk = isKnownAzOperator(digits);
  const valid = digits.length === 9 && operatorOk;

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    const phone = `${AZ_COUNTRY_CODE}${digits}`;
    try {
      const res = await api.auth.requestOtp(phone);
      router.push({
        pathname: '/auth/otp',
        params: { phone, returnTo: returnTo ?? '', resendAfter: String(res.resendAfterSeconds), codeLength: String(res.codeLength) },
      });
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen header={<ScreenHeader title={t.auth.title} />} background={colors.surface} keyboard>
      <View style={styles.body}>
        <AppText variant="caption" color={colors.textMuted}>
          {t.auth.phoneHint}
        </AppText>
        {/* Tap.az məntiqi: tək sahə, "(0" həmişə yerindədir və silinmir */}
        <Input
          label={t.auth.phoneLabel}
          value={maskAzPhone(digits)}
          onChangeText={(text) => {
            setDigits(parseAzPhoneDigits(text));
            rerender();
          }}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          autoFocus
          focusBorder={false}
          maxLength={15}
          leftIcon={<Icon name="phone" size={22} color={colors.text} />}
          error={operatorOk ? undefined : t.auth.operatorInvalid}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Button title={t.auth.sendCode} onPress={submit} disabled={!valid} loading={loading} style={styles.submit} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: layout.screenPadding, paddingTop: 24, gap: 12 },
  submit: { marginTop: 8 },
});
