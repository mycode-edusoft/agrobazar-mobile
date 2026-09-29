import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { StepHeader } from '@/components/store/StepHeader';
import { AppText, Button, Card, FooterBar, Input, Screen, ScreenHeader, SelectSheet, SingleImagePicker } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk, useCategories } from '@/lib/queries';
import { STORE_DEFAULTS } from '@/lib/rules';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useStoreDraft } from '@/store/storeDraft';
import { colors, layout } from '@/theme';

export default function CreateStoreStep1() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: categories } = useCategories();
  const draft = useStoreDraft((s) => s.draft);
  const editing = useStoreDraft((s) => s.editing);
  const set = useStoreDraft((s) => s.set);
  const start = useStoreDraft((s) => s.start);
  const startFrom = useStoreDraft((s) => s.startFrom);
  const [sheet, setSheet] = useState(false);
  const [touched, setTouched] = useState(false);
  const myStore = useQuery({ queryKey: qk.myStore, queryFn: () => api.stores.mine(), enabled: !!user });

  useEffect(() => {
    if (!user) router.replace({ pathname: '/auth/phone', params: { returnTo: '/stores/create/step1' } });
  }, [user, router]);

  useEffect(() => {
    if (myStore.data && !editing) startFrom(myStore.data, user?.phone.replace('+994', '') ?? '');
    else if (myStore.isFetched && !myStore.data && !editing && !draft.name) start();
  }, [myStore.data, myStore.isFetched, editing, draft.name, start, startFrom, user]);

  const category = categories?.find((c) => c.id === draft.categoryId);
  const valid = draft.name.trim().length >= 2 && draft.description.trim().length >= 10;

  const next = () => {
    setTouched(true);
    if (valid) router.push('/stores/create/step2');
  };

  return (
    <Screen
      header={<ScreenHeader title={editing ? t.cabinet.myStore : t.createStore.title} rightText={t.common.reset} onRightPress={start} />}
      scroll
      padded
      keyboard
      footer={
        <FooterBar>
          <Button title={t.common.continue} onPress={next} />
        </FooterBar>
      }
    >
      <StepHeader step={1} total={3} title={t.createStore.step1} />
      <View style={styles.form}>
        {editing ? (
          <Card flat style={styles.note}>
            <AppText variant="caption" color={colors.textMuted}>
              {t.createStore.alreadyHave}
            </AppText>
          </Card>
        ) : null}
        <Input label={t.createStore.name} value={draft.name} onChangeText={(v) => set({ name: v })} placeholder={t.common.enter} error={touched && draft.name.trim().length < 2 ? t.auth.required : undefined} />
        <Input label={t.createStore.description} value={draft.description} onChangeText={(v) => set({ description: v })} placeholder={t.createListing.descriptionPlaceholder} multiline error={touched && draft.description.trim().length < 10 ? t.auth.required : undefined} />
        <Input label={t.createStore.category} value={category?.name ?? ''} placeholder={t.common.select} onPressContainer={() => setSheet(true)} rightElement={<Ionicons name="chevron-down" size={20} color={colors.textMuted} />} />
        <SingleImagePicker label={t.createStore.logo} uri={draft.logoUri} onChange={(logoUri) => set({ logoUri })} hint={t.createStore.uploadHint} maxBytes={STORE_DEFAULTS.maxImageBytes} />
        <SingleImagePicker label={t.createStore.cover} uri={draft.coverUri} onChange={(coverUri) => set({ coverUri })} hint={t.createStore.uploadHint} maxBytes={STORE_DEFAULTS.maxImageBytes} aspect={[16, 7]} />
      </View>
      <SelectSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={t.createStore.category}
        options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
        value={draft.categoryId}
        onSelect={(v) => set({ categoryId: v })}
        searchable
        allowClear
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  note: { backgroundColor: colors.primaryTint },
});
