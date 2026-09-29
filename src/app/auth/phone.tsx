import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText, Button, FooterBar, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { AZ_COUNTRY_CODE, formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { api, ApiError } from '@/services';
import { colors, layout, radii } from '@/theme';

export default function PhoneScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [local, setLocal] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const valid = isValidAzPhone(local);

  const submit = async () => {
    if (!valid) return;
    setLoading(true);
    const phone = normalizePhone(local);
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
    <Screen
      header={<ScreenHeader title={t.auth.title} />}
      background={colors.surface}
      keyboard
      footer={
        <FooterBar>
          <Button title={t.common.continue} onPress={submit} disabled={!valid} loading={loading} />
          <AppText variant="caption" color={colors.textMuted} center>
            {t.auth.legal}
          </AppText>
        </FooterBar>
      }
    >
      <View style={styles.body}>
        <AppText variant="caption" color={colors.textMuted}>
          {t.auth.phoneHint}
        </AppText>
        <View style={styles.row}>
          <View style={styles.code}>
            <AppText variant="body">🇦🇿</AppText>
            <AppText variant="body" color={colors.textSecondary}>
              {AZ_COUNTRY_CODE}
            </AppText>
          </View>
          <View style={styles.flex}>
            <Input
              label={t.auth.phoneLabel}
              placeholder={t.auth.phonePlaceholder}
              value={local}
              onChangeText={(v) => setLocal(formatPhoneInput(v))}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              autoFocus
              leftIcon={<Ionicons name="call-outline" size={22} color={colors.textSecondary} />}
              onSubmitEditing={submit}
              returnKeyType="done"
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { paddingHorizontal: layout.screenPadding, paddingTop: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 8 },
  code: {
    height: layout.inputHeight, paddingHorizontal: 12, borderRadius: radii.sm,
    backgroundColor: colors.inputBackgroundEmpty, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
});
