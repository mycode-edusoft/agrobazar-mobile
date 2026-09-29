import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { StepHeader } from '@/components/store/StepHeader';
import { AppText, BottomSheet, Button, Checkbox, FooterBar, Input, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useStoreDraft } from '@/store/storeDraft';
import { colors, layout } from '@/theme';

const URL_RE = /^https?:\/\/\S+$/i;
const opt = (v: string) => (v.trim() ? v.trim() : null);

export default function CreateStoreStep3() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const draft = useStoreDraft((s) => s.draft);
  const editing = useStoreDraft((s) => s.editing);
  const set = useStoreDraft((s) => s.set);
  const clear = useStoreDraft((s) => s.clear);
  const setUser = useAuthStore((s) => s.setUser);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const linkError = (v: string) => (touched && v.trim() && !URL_RE.test(v.trim()) ? 'Link https:// ilə başlamalıdır' : undefined);
  const valid =
    isValidAzPhone(draft.phone) && isValidAzPhone(draft.whatsapp) && draft.agreed &&
    [draft.website, draft.youtube, draft.facebook, draft.instagram, draft.tiktok].every((v) => !v.trim() || URL_RE.test(v.trim()));

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    setSubmitting(true);
    const input = {
      name: draft.name.trim(), description: draft.description.trim(), categoryId: draft.categoryId,
      logoUri: draft.logoUri, coverUri: draft.coverUri, city: draft.city, address: draft.address.trim(),
      workingHours: { open: draft.open, close: draft.close },
      phone: normalizePhone(draft.phone), whatsapp: normalizePhone(draft.whatsapp),
      website: opt(draft.website), youtube: opt(draft.youtube), facebook: opt(draft.facebook),
      instagram: opt(draft.instagram), tiktok: opt(draft.tiktok),
    };
    try {
      const store = editing ? await api.stores.update(input) : await api.stores.create(input);
      const me = await api.auth.me();
      setUser(me);
      await qc.invalidateQueries({ queryKey: qk.myStore });
      await qc.invalidateQueries({ queryKey: qk.store(store.id) });
      if (editing) {
        clear();
        router.dismissAll();
        router.replace({ pathname: '/stores/[id]', params: { id: store.id } });
      } else {
        setDoneId(store.id);
      }
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    const id = doneId!;
    setDoneId(null);
    clear();
    router.dismissAll();
    router.replace({ pathname: '/stores/[id]', params: { id } });
  };

  const phoneIcon = <AppText variant="body" color={colors.textSecondary}>+994</AppText>;

  return (
    <Screen
      header={<ScreenHeader title={t.createStore.title} />}
      scroll
      padded
      keyboard
      footer={
        <FooterBar>
          <Button title={editing ? t.common.save : t.createStore.submit} onPress={submit} loading={submitting} />
        </FooterBar>
      }
    >
      <StepHeader step={3} total={3} title={t.createStore.step3} />
      <View style={styles.form}>
        <Input label={t.createStore.phone} value={draft.phone} onChangeText={(v) => set({ phone: formatPhoneInput(v) })} keyboardType="phone-pad" placeholder={t.auth.phonePlaceholder} leftIcon={phoneIcon} error={touched && !isValidAzPhone(draft.phone) ? t.auth.required : undefined} />
        <Input label={t.createStore.whatsapp} value={draft.whatsapp} onChangeText={(v) => set({ whatsapp: formatPhoneInput(v) })} keyboardType="phone-pad" placeholder={t.auth.phonePlaceholder} leftIcon={phoneIcon} error={touched && !isValidAzPhone(draft.whatsapp) ? t.auth.required : undefined} />
        <Input label={t.createStore.website} value={draft.website} onChangeText={(v) => set({ website: v })} placeholder="https://www..." keyboardType="url" autoCapitalize="none" error={linkError(draft.website)} />
        <Input label={t.createStore.youtube} value={draft.youtube} onChangeText={(v) => set({ youtube: v })} placeholder="https://www.youtube.com/..." keyboardType="url" autoCapitalize="none" error={linkError(draft.youtube)} />
        <Input label={t.createStore.facebook} value={draft.facebook} onChangeText={(v) => set({ facebook: v })} placeholder="https://www.facebook.com/..." keyboardType="url" autoCapitalize="none" error={linkError(draft.facebook)} />
        <Input label={t.createStore.instagram} value={draft.instagram} onChangeText={(v) => set({ instagram: v })} placeholder="https://www.instagram.com/..." keyboardType="url" autoCapitalize="none" error={linkError(draft.instagram)} />
        <Input label={t.createStore.tiktok} value={draft.tiktok} onChangeText={(v) => set({ tiktok: v })} placeholder="https://www.tiktok.com/@..." keyboardType="url" autoCapitalize="none" error={linkError(draft.tiktok)} />
        <Checkbox
          checked={draft.agreed}
          onChange={(v) => set({ agreed: v })}
          label={
            <Pressable onPress={() => router.push('/info/rules')} style={styles.flex}>
              <AppText variant="small" color={touched && !draft.agreed ? colors.danger : colors.textSecondary}>
                {t.createStore.agree}
              </AppText>
            </Pressable>
          }
        />
      </View>

      <BottomSheet visible={doneId != null} onClose={finish} title={t.createStore.successTitle} dismissOnBackdrop={false}>
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={56} color={colors.primary} />
          <AppText variant="body" color={colors.textMuted} center>
            {t.createStore.successHint}
          </AppText>
        </View>
        <Button title={t.cabinet.myStore} onPress={finish} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  success: { alignItems: 'center', gap: 12, paddingVertical: 8 },
});
