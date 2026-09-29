import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText, BottomSheet, Button, Card, FooterBar, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { contactInfo } from '@/i18n/legal';
import { formatDisplayPhone, formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii, shadows } from '@/theme';

export default function ContactScreen() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user ? user.phone.replace('+994', '') : '');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);

  const valid = name.trim().length >= 2 && isValidAzPhone(phone) && message.trim().length >= 5;

  const send = async () => {
    setTouched(true);
    if (!valid) return;
    setSending(true);
    try {
      await api.contact.send({ name: name.trim(), phone: normalizePhone(phone), message: message.trim() });
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
      <Card style={styles.card}>
        <Row icon="call-outline" label={t.info.phone} value={formatDisplayPhone(contactInfo.phone)} onPress={() => openUrl(`tel:${contactInfo.phone}`)} />
        <Row icon="mail-outline" label={t.info.email} value={contactInfo.email} onPress={() => openUrl(`mailto:${contactInfo.email}`)} />
        <Row icon="location-outline" label={t.info.address} value={contactInfo.address} />
      </Card>
      <View style={styles.socials}>
        <Social name="logo-facebook" color="#1877F2" onPress={() => openUrl(contactInfo.facebook)} />
        <Social name="logo-instagram" color="#E1306C" onPress={() => openUrl(contactInfo.instagram)} />
        <Social name="logo-tiktok" color="#000000" onPress={() => openUrl(contactInfo.tiktok)} />
      </View>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={t.info.contact} subtitle={t.info.contact247}>
        <Input label={t.info.yourName} value={name} onChangeText={setName} error={touched && name.trim().length < 2 ? t.auth.required : undefined} />
        <Input label={t.info.yourPhone} value={phone} onChangeText={(v) => setPhone(formatPhoneInput(v))} keyboardType="phone-pad" leftIcon={<AppText variant="body" color={colors.textSecondary}>+994</AppText>} error={touched && !isValidAzPhone(phone) ? t.auth.required : undefined} />
        <Input label={t.info.yourMessage} value={message} onChangeText={setMessage} multiline error={touched && message.trim().length < 5 ? t.auth.required : undefined} />
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
        <AppText variant="caption" color={colors.textMuted}>
          {label}
        </AppText>
        <AppText variant="smallMedium">{value}</AppText>
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
  card: { marginTop: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  socials: { flexDirection: 'row', gap: 12, paddingTop: layout.cardGap },
  social: { width: 60, height: 60, borderRadius: radii.sm, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.card },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 8 },
});
