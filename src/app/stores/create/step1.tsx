import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Field, FormCard, ImageField, RulesAccordion, Section, SelectField, StepTitle } from '@/components/store/FormKit';
import { Button, FooterBar, Screen, ScreenHeader, SelectSheet } from '@/components/ui';
import { t } from '@/i18n/az';
import { qk, useCategories } from '@/lib/queries';
import { STORE_DEFAULTS } from '@/lib/rules';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useStoreDraft } from '@/store/storeDraft';
import { layout } from '@/theme';

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

  const reset = () => (editing && myStore.data ? startFrom(myStore.data, user?.phone.replace('+994', '') ?? '') : start());

  return (
    <Screen
      header={<ScreenHeader title={editing ? t.createStore.editTitle : t.createStore.title} rightText={t.common.reset} onRightPress={reset} />}
      scroll
      keyboard
      footer={
        <FooterBar>
          <Button title={t.common.continue} onPress={next} />
        </FooterBar>
      }
    >
      {/* Figma "Mağaza yarat / Düzəliş et 1/3": qaydalar akkordeonu (kənarlardan 10), başlıq + 1/3, ağ kartda bölmələr.
          Cover şəkil Figma-da yoxdur — redaktədə mövcud cover draft-da saxlanılır, toxunulmur. */}
      <View style={styles.body}>
        <View style={styles.promo}>
          <RulesAccordion />
        </View>
        <StepTitle step={1} />
        <FormCard>
          <Section title={t.createStore.name}>
            <Field
              value={draft.name}
              onChangeText={(v) => set({ name: v })}
              placeholder={t.common.enter}
              error={touched && draft.name.trim().length < 2 ? t.auth.required : undefined}
            />
          </Section>
          <Section title={t.createStore.description}>
            <Field
              value={draft.description}
              onChangeText={(v) => set({ description: v })}
              placeholder={t.createStore.descriptionPlaceholder}
              multiline
              error={touched && draft.description.trim().length < 10 ? t.auth.required : undefined}
            />
          </Section>
          <Section title={t.createStore.category}>
            <SelectField value={category?.name ?? ''} placeholder={t.createStore.categoryPlaceholder} onPress={() => setSheet(true)} />
          </Section>
          <Section title={t.createStore.logo}>
            <ImageField uri={draft.logoUri} onChange={(logoUri) => set({ logoUri })} hint={t.createStore.logoHint} maxBytes={STORE_DEFAULTS.maxImageBytes} />
          </Section>
        </FormCard>
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
  body: { padding: layout.screenPadding, gap: 16 },
  promo: { marginHorizontal: -6 },
});
