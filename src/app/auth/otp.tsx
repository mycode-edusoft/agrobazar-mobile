import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { AppText, OtpInput, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatCountdown, formatDisplayPhone } from '@/lib/format';
import { useInvalidateAfterAuth } from '@/lib/queries';
import { OTP } from '@/lib/rules';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { colors, layout } from '@/theme';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; returnTo?: string; resendAfter?: string; codeLength?: string }>();
  const phone = params.phone;
  const codeLength = Number(params.codeLength) || OTP.length;
  const returnTo = params.returnTo || '/';
  const toast = useToast();
  const setSession = useAuthStore((s) => s.setSession);
  const mergeFavorites = useFavoritesStore((s) => s.mergeGuestIntoAccount);
  const invalidate = useInvalidateAfterAuth();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [seconds, setSeconds] = useState(Number(params.resendAfter) || OTP.resendCooldownSeconds);
  const [resendsLeft, setResendsLeft] = useState<number>(OTP.maxResends);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const verify = useCallback(
    async (value: string) => {
      if (verifying) return;
      setVerifying(true);
      setError(null);
      try {
        const session = await api.auth.verifyOtp(phone, value);
        await setSession(session);
        await mergeFavorites();
        await invalidate();
        const needsProfile = session.user.type === 'individual' && (!session.user.fullName || !session.user.email);
        const target = returnTo as Href;
        if (needsProfile && returnTo.startsWith('/listing/create')) {
          router.replace({ pathname: '/auth/complete-profile', params: { returnTo } });
        } else {
          // dismissTo: auth ekranlarını bağlayıb hədəfə tək addımda qayıdır (tab-ı sıfırlamır);
          // hədəf tarixçədə yoxdursa, cari ekranı onunla əvəz edir
          router.dismissTo(target);
        }
      } catch (e) {
        setCode('');
        if (e instanceof ApiError && e.code === 'blocked') setError(t.auth.blocked);
        else setError(t.auth.wrongCode);
      } finally {
        setVerifying(false);
      }
    },
    [verifying, phone, setSession, mergeFavorites, invalidate, returnTo, router],
  );

  const resend = async () => {
    if (seconds > 0 || resendsLeft <= 0) return;
    try {
      const res = await api.auth.requestOtp(phone);
      setSeconds(res.resendAfterSeconds);
      setResendsLeft(res.resendsLeft);
      setError(null);
      setCode('');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    }
  };

  const canResend = seconds <= 0 && resendsLeft > 0;

  return (
    <Screen
      header={<ScreenHeader title={t.auth.title} />}
      background={colors.surface}
      keyboard
      footer={
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textMuted} center>
            {t.auth.legalPrefix}
            <AppText variant="caption" color={colors.textMuted} style={styles.link} onPress={() => router.push('/info/rules')}>
              {t.auth.legalAgreement}
            </AppText>
            {t.auth.legalAnd}
            <AppText variant="caption" color={colors.textMuted} style={styles.link} onPress={() => router.push('/info/rules')}>
              {t.auth.legalRules}
            </AppText>
            {t.auth.legalSuffix}
          </AppText>
        </View>
      }
    >
      {/* Figma "Log in" 3: hər şey mərkəzə düzülür, "yenidən göndər" linkinin altında taymer */}
      <View style={styles.body}>
        <AppText variant="small" color={colors.textMuted} center>
          {t.auth.otpSent(formatDisplayPhone(phone))}
        </AppText>
        <OtpInput length={codeLength} value={code} onChange={setCode} onComplete={verify} error={!!error} />
        {error ? (
          <AppText variant="caption" color={colors.danger} center>
            {error}
          </AppText>
        ) : null}
        <Pressable onPress={resend} disabled={!canResend} hitSlop={8}>
          <AppText variant="bodyMedium" color={canResend ? colors.link : colors.textPlaceholder} center>
            {resendsLeft <= 0 ? t.auth.resendLimit : t.auth.resend}
          </AppText>
        </Pressable>
        {seconds > 0 ? (
          <AppText variant="bodyMedium" color={colors.textSecondary} center>
            {formatCountdown(seconds)}
          </AppText>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: layout.screenPadding, paddingTop: 24, gap: 16, alignItems: 'center' },
  footer: { paddingHorizontal: layout.screenPadding * 2, paddingVertical: 12 },
  link: { textDecorationLine: 'underline' },
});
