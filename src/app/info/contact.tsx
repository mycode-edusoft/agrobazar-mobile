import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, BottomSheet, Button, Card, FooterBar, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { contactInfo } from '@/i18n/legal';
import { formatDisplayPhone, formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, radii, shadows, typography } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user ? user.phone.replace('+994', '') : '');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);

  const emailOk = EMAIL_RE.test(email.trim());
  const valid = name.trim().length >= 2 && emailOk && isValidAzPhone(phone) && message.trim().length >= 5;

  const send = async () => {
    setTouched(true);
    if (!valid) return;
    setSending(true);
    try {
      await api.contact.send({ name: name.trim(), email: email.trim(), phone: normalizePhone(phone), message: message.trim() });
      setOpen(false);
      setMessage('');
      setTouched(false);
      toast(t.info.sent);
    } catch {
      toast(t.common.error, 'error');
    } finally {
      setSending(false);
    }
  };

  const openUrl = (url: string) => Linking.openURL(url).catch(() => undefined);

  return (
    // Figma "Bizimlə əlaqə": başlıq mətni, əlaqə kartı (sətirlər arası xətt), sosial kartlar,
    // altda "Bizimlə əlaqə" düyməsi → forma paneli; göndərişdən sonra yuxarıda "uğurla qəbul edildi" bildirişi
    <Screen
      header={<ScreenHeader title={t.info.contact} />}
      scroll
      padded
      footer={
        <FooterBar>
          <Button title={t.info.write} size="lg" onPress={() => setOpen(true)} />
        </FooterBar>
      }
    >
      <AppText style={styles.headline}>{t.info.contactHeadline}</AppText>
      <Card style={styles.card}>
        <Row icon="call-outline" label={t.info.phone} value={formatDisplayPhone(contactInfo.phone)} onPress={() => openUrl(`tel:${contactInfo.phone}`)} />
        <View style={styles.line} />
        <Row icon="mail-outline" label={t.info.email} value={contactInfo.email} onPress={() => openUrl(`mailto:${contactInfo.email}`)} />
        <View style={styles.line} />
        <Row icon="location" label={t.info.address} value={contactInfo.address} />
      </Card>
      <View style={styles.socials}>
        <Social name="logo-facebook" color="#1877F2" onPress={() => openUrl(contactInfo.facebook)} />
        <Social name="logo-tiktok" color="#000000" onPress={() => openUrl(contactInfo.tiktok)} />
        <Social name="logo-instagram" color="#E1306C" onPress={() => openUrl(contactInfo.instagram)} />
      </View>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t.info.contact} subtitle={t.info.contact247}>
        <Input label={t.info.yourName} value={name} onChangeText={setName} error={touched && name.trim().length < 2 ? t.auth.required : undefined} />
        <Input
          label={t.info.yourEmail}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={touched && !emailOk ? t.auth.invalidEmail : undefined}
        />
        <Input label={t.info.yourPhone} value={phone} onChangeText={(v) => setPhone(formatPhoneInput(v))} keyboardType="phone-pad" leftIcon={<AppText variant="body" color={colors.textSecondary}>+994</AppText>} error={touched && !isValidAzPhone(phone) ? t.auth.required : undefined} />
        <Input label={t.info.yourMessage} value={message} onChangeText={setMessage} multiline containerStyle={styles.message} error={touched && message.trim().length < 5 ? t.auth.required : undefined} />
        <View style={styles.actions}>
          <Button title={t.common.cancel} variant="outline" size="lg" onPress={() => setOpen(false)} style={styles.flex} />
          <Button title={t.info.send} onPress={send} loading={sending} style={styles.flex} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

function Row({ icon, label, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText style={styles.rowLabel}>{label}</AppText>
        <AppText style={styles.rowValue}>{value}</AppText>
      </View>
    </Pressable>
  );
}

function Social({ name, color, onPress }: { name: keyof typeof Ionicons.glyphMap; color: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.social}>
      <Ionicons name={name} size={26} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Figma: 18/25 Medium #181818, mərkəzdə, 24 yuxarı boşluq
  headline: { ...typography.bodyMedium, fontSize: 18, lineHeight: 25, color: '#181818', textAlign: 'center', paddingTop: 8, paddingHorizontal: 20, paddingBottom: 24 },
  card: { gap: 16, paddingHorizontal: 16, paddingVertical: 16 },
  line: { height: 1, backgroundColor: colors.divider },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { ...typography.caption, lineHeight: 22, color: colors.textMuted },
  rowValue: { ...typography.smallMedium, lineHeight: 22, color: colors.text },
  message: { minHeight: 209 },
  iconBox: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  socials: { flexDirection: 'row', gap: 11, paddingTop: 16 },
  social: { width: 60, height: 60, borderRadius: radii.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 8 },
});
