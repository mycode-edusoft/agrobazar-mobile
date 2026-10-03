import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/icons/Icon';
import { Field, FormCard, Section, StepTitle } from '@/components/store/FormKit';
import { AppText, BottomSheet, Button, Checkbox, FooterBar, Screen, ScreenHeader, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useStoreDraft } from '@/store/storeDraft';
import { colors, layout, typography } from '@/theme';

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

  const linkError = (v: string) => (touched && v.trim() && !URL_RE.test(v.trim()) ? t.createStore.linkInvalid : undefined);
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
      workingHours: draft.week.find((d) => d.enabled) ?? null,
      schedule: draft.week,
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

  const prefix = (
    <View style={styles.prefix}>
      <AppText style={styles.prefixText}>+994</AppText>
    </View>
  );
  const phoneIcon = <Icon name="phone" size={24} color={colors.textSecondary} />;
  const linkField = (key: 'website' | 'youtube' | 'facebook' | 'instagram' | 'tiktok', placeholder: string) => (
    <Field
      value={draft[key]}
      onChangeText={(v) => set({ [key]: v })}
      placeholder={placeholder}
      keyboardType="url"
      autoCapitalize="none"
      link
      numberOfLines={1}
      error={linkError(draft[key])}
    />
  );

  return (
    <Screen
      header={<ScreenHeader title={editing ? t.createStore.editTitle : t.createStore.title} />}
      scroll
      keyboard
      footer={
        <FooterBar>
          {/* Figma: yaradılışda "+ Mağaza yarat", redaktədə "Yadda saxla" */}
          <Button
            title={editing ? t.common.save : t.createStore.submit}
            icon={editing ? undefined : <Ionicons name="add" size={20} color={colors.surface} />}
            onPress={submit}
            loading={submitting}
          />
        </FooterBar>
      }
    >
      {/* Figma "Düzəliş et 3/3": nömrələr (+994 qutusu + telefon ikonlu sahə), linklər, razılıq */}
      <View style={styles.body}>
        <StepTitle step={3} />
        <FormCard>
          <Section title={t.createStore.phone}>
            <View style={styles.phoneRow}>
              {prefix}
              <Field
                style={styles.flex}
                left={phoneIcon}
                value={draft.phone}
                onChangeText={(v) => set({ phone: formatPhoneInput(v) })}
                keyboardType="phone-pad"
                placeholder={t.auth.phonePlaceholder}
                error={touched && !isValidAzPhone(draft.phone) ? t.auth.required : undefined}
              />
            </View>
          </Section>
          <Section title={t.createStore.whatsapp}>
            <View style={styles.phoneRow}>
              {prefix}
              <Field
                style={styles.flex}
                left={phoneIcon}
                value={draft.whatsapp}
                onChangeText={(v) => set({ whatsapp: formatPhoneInput(v) })}
                keyboardType="phone-pad"
                placeholder={t.auth.phonePlaceholder}
                error={touched && !isValidAzPhone(draft.whatsapp) ? t.auth.required : undefined}
              />
            </View>
          </Section>
          <Section title={t.createStore.website}>{linkField('website', t.createStore.linkPlaceholder)}</Section>
          <View style={styles.pair}>
            <Section title={t.createStore.youtube} style={styles.half}>{linkField('youtube', t.createStore.linkPlaceholder)}</Section>
            <Section title={t.createStore.facebook} style={styles.half}>{linkField('facebook', t.createStore.linkPlaceholder)}</Section>
          </View>
          <View style={styles.pair}>
            <Section title={t.createStore.instagram} style={styles.half}>{linkField('instagram', t.createStore.linkPlaceholder)}</Section>
            <Section title={t.createStore.tiktok} style={styles.half}>{linkField('tiktok', t.createStore.linkPlaceholder)}</Section>
          </View>
          <View style={styles.agree}>
            <Checkbox
              checked={draft.agreed}
              onChange={(v) => set({ agreed: v })}
              label={
                <AppText style={[styles.agreeText, touched && !draft.agreed && styles.agreeError]}>
                  {t.createStore.agreePrefix}
                  <AppText style={styles.agreeLink} onPress={() => router.push('/info/rules')}>
                    {t.createStore.agreeLink}
                  </AppText>
                  {t.createStore.agreeSuffix}
                </AppText>
              }
            />
          </View>
        </FormCard>
      </View>

      {/* Figma "Müraciətiniz qəbul edildi": mərkəzdə Bold 16 başlıq, xətt, 16/24 #8C8C8C mətn, tək yaşıl düymə */}
      <BottomSheet visible={doneId != null} onClose={finish} title={t.createStore.successTitle} dismissOnBackdrop={false}>
        <AppText style={styles.successText}>{t.createStore.successHint}</AppText>
        <Button title={t.createStore.successOk} onPress={finish} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: layout.screenPadding, gap: 16 },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  // Figma: 71×56 #F5F5F5 qutu, "+994" 16 #BFBFBF
  prefix: { width: 71, height: 56, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty, alignItems: 'center', justifyContent: 'center' },
  prefixText: { ...typography.body, color: colors.textPlaceholder },
  // Figma: iki link yan-yana, aralarında 12
  pair: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  half: { flex: 1, paddingHorizontal: 0 },
  agree: { paddingHorizontal: 16 },
  agreeText: { flex: 1, ...typography.smallMedium, lineHeight: 20, color: colors.textMuted },
  agreeError: { color: colors.danger },
  agreeLink: { color: colors.primary, textDecorationLine: 'underline' },
  successText: { ...typography.body, color: colors.textMuted },
});
