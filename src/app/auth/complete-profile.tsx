import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { AppText, Button, FooterBar, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk } from '@/lib/queries';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const nameError = touched && fullName.trim().length < 2 ? t.auth.required : undefined;
  const emailError = touched && !EMAIL_RE.test(email.trim()) ? t.auth.invalidEmail : undefined;
  const valid = fullName.trim().length >= 2 && EMAIL_RE.test(email.trim());

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setLoading(true);
    try {
      const user = await api.auth.completeProfile({ fullName: fullName.trim(), email: email.trim() });
      setUser(user);
      await qc.invalidateQueries({ queryKey: qk.entitlements });
      router.dismissAll();
      router.replace((returnTo || '/') as Href);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={t.auth.completeTitle} hideBack />}
      background={colors.surface}
      keyboard
      footer={
        <FooterBar>
          <Button title={t.common.save} onPress={submit} loading={loading} />
        </FooterBar>
      }
    >
      <View style={styles.body}>
        <AppText variant="caption" color={colors.textMuted}>
          {t.auth.completeHint}
        </AppText>
        <Input
          label={t.auth.fullName}
          value={fullName}
          onChangeText={setFullName}
          error={nameError}
          autoFocus
          textContentType="name"
          leftIcon={<Ionicons name="person-outline" size={22} color={colors.textSecondary} />}
        />
        <Input
          label={t.auth.email}
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          leftIcon={<Ionicons name="mail-outline" size={22} color={colors.textSecondary} />}
          onSubmitEditing={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: layout.screenPadding, paddingTop: 24, gap: 12 },
});
