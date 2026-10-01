import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText, Button, ConfirmSheet, FooterBar, Input, Screen, ScreenHeader, SelectSheet, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { AZ_COUNTRY_CODE } from '@/lib/format';
import { useCities } from '@/lib/queries';
import { PROFILE_DEFAULTS } from '@/lib/rules';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout } from '@/theme';
import { Icon } from '@/components/icons/Icon';

const APP_VERSION = '1.0.0';

export default function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: cities } = useCities();
  const regionOptions = (cities ?? []).map((r) => ({ value: r, label: r }));
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
  const [city, setCity] = useState(user?.city ?? '');
  const [avatar, setAvatar] = useState<string | null>(user?.avatarUrl ?? null);
  const [regionOpen, setRegionOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (res.canceled) return;
    const a = res.assets[0];
    if (a.fileSize != null && a.fileSize > PROFILE_DEFAULTS.maxAvatarBytes) {
      toast(`Şəkil limitdən böyükdür (max ${PROFILE_DEFAULTS.maxAvatarBytes / 1024} KB)`, 'error');
      return;
    }
    setAvatar(a.uri);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.auth.updateProfile({ city: city || undefined, avatarUri: avatar ?? undefined });
      setUser(updated);
      toast(t.common.save);
      router.back();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.auth.deleteAccount();
      await signOut();
      setDeleteOpen(false);
      router.dismissAll();
      router.replace('/');
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Screen
      header={<ScreenHeader title={t.cabinet.editProfile} />}
      background={colors.surface}
      scroll
      padded
      footer={
        <FooterBar>
          <Button title={t.common.save} onPress={save} loading={saving} />
          <AppText variant="caption" color={colors.textMuted} center>
            {t.cabinet.version(APP_VERSION)}
          </AppText>
          <Pressable onPress={() => setDeleteOpen(true)} style={styles.deleteLink}>
            <AppText variant="caption" color={colors.textMuted}>
              {t.cabinet.deleteAccount}
            </AppText>
          </Pressable>
        </FooterBar>
      }
    >
      <View style={styles.avatarWrap}>
        <Pressable onPress={pickAvatar} style={styles.avatar}>
          {avatar ? <Image source={avatar} style={styles.avatarImg} contentFit="cover" /> : <Ionicons name="person" size={32} color={colors.textMuted} />}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={12} color={colors.surface} />
          </View>
        </Pressable>
      </View>
      <View style={styles.form}>
        {/* Figma: Ad, Soyad / Email / bayraq + Mobil. BRD: ad, email, telefon bu ekranda dəyişdirilmir. */}
        <Input label={t.auth.fullName} value={user.fullName ?? ''} placeholder={t.auth.fullName} editable={false} />
        <Input label={t.auth.email} value={user.email ?? ''} placeholder={t.auth.email} editable={false} />
        <View style={styles.phoneRow}>
          <View style={styles.codeBox}>
            <AppText variant="body">🇦🇿</AppText>
            <AppText variant="body" color={colors.textPlaceholder}>
              {AZ_COUNTRY_CODE}
            </AppText>
          </View>
          <View style={styles.flex}>
            <Input label={t.cabinet.mobile} value={user.phone.replace(/^\+994/, '')} editable={false} />
          </View>
        </View>
        <Input
          label={t.cabinet.city}
          value={city}
          placeholder={t.cabinet.city}
          onPressContainer={() => setRegionOpen(true)}
          rightElement={<Icon name="chevron" direction="down" size={20} color={colors.textMuted} />}
        />
      </View>
      <SelectSheet visible={regionOpen} onClose={() => setRegionOpen(false)} title={t.cabinet.city} options={regionOptions} value={city || null} onSelect={(v) => setCity(v ?? '')} searchable />
      <ConfirmSheet
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        title={t.cabinet.deleteAccount}
        message={t.cabinet.deleteAccountHint}
        items={[t.cabinet.deleteAccountItem]}
        confirmText={t.common.delete}
        danger
        loading={deleting}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderSubtle,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 36 },
  editBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface,
  },
  form: { gap: 12, paddingBottom: layout.screenPadding },
  flex: { flex: 1 },
  phoneRow: { flexDirection: 'row', gap: 8 },
  codeBox: {
    height: layout.inputHeight, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  deleteLink: { alignSelf: 'center', paddingVertical: 4 },
});
