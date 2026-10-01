import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  AppText, BottomSheet, Button, Card, Checkbox, FooterBar, ImagesPicker, Input, Screen, ScreenHeader,
  SelectSheet, VideoPicker, useToast,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { qk, useCategories, useCities, useEntitlements, useSubsubAttributes } from '@/lib/queries';
import { LISTING_DEFAULTS } from '@/lib/rules';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useListingDraft } from '@/store/listingDraft';
import { colors, layout } from '@/theme';
import type { ListingType } from '@/types/domain';
import { Icon } from '@/components/icons/Icon';

const listingTypes: ListingType[] = ['sale', 'rent', 'wanted', 'offer'];

export default function CreateListingFormScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  const ent = useEntitlements();
  const draft = useListingDraft((s) => s.draft);
  const editingId = useListingDraft((s) => s.editingId);
  const set = useListingDraft((s) => s.set);
  const clear = useListingDraft((s) => s.clear);
  const [sheet, setSheet] = useState<'region' | 'subsub' | string | null>(null);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const category = categories?.find((c) => c.id === draft.categoryId) ?? null;
  const subcategory = category?.subcategories.find((s) => s.id === draft.subcategoryId) ?? null;
  const subsub = subcategory?.subsubcategories.find((b) => b.id === draft.subsubId) ?? null;
  const attributes = useSubsubAttributes(draft.subsubId);
  const fieldDefs = attributes.data ?? subcategory?.fields ?? [];
  const imageLimit = ent.data?.imageLimit ?? { min: LISTING_DEFAULTS.minImages, max: LISTING_DEFAULTS.maxImages };

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!draft.categoryId || !draft.subcategoryId) e.category = t.auth.required;
    if (subcategory && subcategory.subsubcategories.length > 0 && !draft.subsubId) e.subsub = t.auth.required;
    if (draft.type !== 'offer' && !draft.negotiable && !(Number(draft.price.replace(',', '.')) > 0)) e.price = t.auth.required;
    if (!draft.city) e.city = t.auth.required;
    if (draft.title.trim().length < 3) e.title = t.auth.required;
    if (draft.description.trim().length < 10) e.description = t.auth.required;
    if (!isValidAzPhone(draft.whatsapp)) e.whatsapp = t.auth.required;
    for (const f of fieldDefs) if (f.required && !draft.fields[f.key]) e[`field:${f.key}`] = t.auth.required;
    if (draft.images.length < imageLimit.min) e.images = t.createListing.imagesHint(imageLimit.min, imageLimit.max);
    if (!draft.agreed) e.agreed = t.auth.required;
    return e;
  }, [draft, subcategory, fieldDefs, imageLimit]);

  const err = (k: string) => (touched ? errors[k] : undefined);

  const submit = async () => {
    setTouched(true);
    if (Object.keys(errors).length > 0) {
      toast(t.auth.required, 'error');
      return;
    }
    setSubmitting(true);
    const fields: Record<string, string | number> = {};
    for (const f of fieldDefs) {
      const v = draft.fields[f.key];
      if (v) fields[f.key] = f.type === 'number' ? Number(v) : v;
    }
    const input = {
      categoryId: draft.categoryId!,
      subcategoryId: draft.subcategoryId!,
      subsubId: draft.subsubId,
      type: draft.type,
      price: draft.negotiable || draft.type === 'offer' && !draft.price ? null : Number(draft.price.replace(',', '.')),
      negotiable: draft.negotiable,
      city: draft.city,
      title: draft.title.trim(),
      description: draft.description.trim(),
      whatsapp: normalizePhone(draft.whatsapp),
      images: draft.images,
      videoUri: draft.videoUri,
      fields,
    };
    try {
      if (editingId) await api.listings.update(editingId, input);
      else await api.listings.create(input);
      await qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
      await qc.invalidateQueries({ queryKey: qk.entitlements });
      setDone(true);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    setDone(false);
    clear();
    router.dismissAll();
    router.replace('/cabinet/my-listings');
  };

  const chevron = <Icon name="chevron" direction="down" size={20} color={colors.textMuted} />;
  const categoryLabel = [category?.name, subcategory?.name].filter(Boolean).join(' / ');

  return (
    <Screen
      header={<ScreenHeader title={editingId ? t.listing.edit : t.createListing.title} rightText={t.common.reset} onRightPress={() => set({ price: '', negotiable: false, city: '', title: '', description: '', whatsapp: '', images: [], videoUri: null, fields: {}, agreed: false })} />}
      scroll
      padded
      keyboard
      footer={
        <FooterBar>
          <Button title={editingId ? t.common.save : t.createListing.submit} onPress={submit} loading={submitting} />
        </FooterBar>
      }
    >
      <View style={styles.form}>
        {editingId ? (
          <AppText variant="caption" color={colors.danger}>
            {t.listing.editWarning}
          </AppText>
        ) : null}
        <Input label={t.createListing.selectCategory} value={categoryLabel} error={err('category')} onPressContainer={() => router.push('/listing/create')} rightElement={chevron} />
        {subcategory && subcategory.subsubcategories.length > 0 ? (
          <Input label={t.createListing.subsubcategory} value={subsub?.name ?? ''} placeholder={t.common.select} error={err('subsub')} onPressContainer={() => setSheet('subsub')} rightElement={chevron} />
        ) : null}

        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.createListing.service}
        </AppText>
        <Card flat style={styles.group}>
          {listingTypes.map((type) => (
            <Checkbox key={type} checked={draft.type === type} onChange={() => set({ type, negotiable: type === 'offer' ? draft.negotiable : false })} label={t.listingType[type]} />
          ))}
        </Card>

        <Input
          label={t.createListing.price}
          value={draft.price}
          onChangeText={(v) => set({ price: v.replace(/[^\d.,]/g, '') })}
          keyboardType="decimal-pad"
          placeholder={t.createListing.pricePlaceholder}
          error={err('price')}
          editable={!draft.negotiable}
        />
        {draft.type === 'offer' ? (
          <Checkbox checked={draft.negotiable} onChange={(v) => set({ negotiable: v, price: v ? '' : draft.price })} label={t.common.negotiable} />
        ) : null}

        <Input label={t.createListing.region} value={draft.city} placeholder={t.common.select} error={err('city')} onPressContainer={() => setSheet('region')} rightElement={chevron} />

        {fieldDefs.map((f) =>
          f.type === 'select' ? (
            <Input
              key={f.key}
              label={f.label + (f.required ? ' *' : '')}
              value={draft.fields[f.key] ?? ''}
              placeholder={t.common.select}
              error={err(`field:${f.key}`)}
              onPressContainer={() => setSheet(`field:${f.key}`)}
              rightElement={chevron}
            />
          ) : (
            <Input
              key={f.key}
              label={`${f.label}${f.unit ? ` (${f.unit})` : ''}${f.required ? ' *' : ''}`}
              value={draft.fields[f.key] ?? ''}
              onChangeText={(v) => set({ fields: { ...draft.fields, [f.key]: f.type === 'number' ? v.replace(/[^\d.]/g, '') : v } })}
              keyboardType={f.type === 'number' ? 'numeric' : 'default'}
              error={err(`field:${f.key}`)}
            />
          ),
        )}

        <Input label={t.createListing.listingTitle} value={draft.title} onChangeText={(v) => set({ title: v })} placeholder={t.common.enter} error={err('title')} maxLength={80} />
        <Input label={t.createListing.description} value={draft.description} onChangeText={(v) => set({ description: v })} placeholder={t.createListing.descriptionPlaceholder} error={err('description')} multiline maxLength={2000} />
        <Input
          label={t.createListing.whatsapp}
          value={draft.whatsapp}
          onChangeText={(v) => set({ whatsapp: formatPhoneInput(v) })}
          keyboardType="phone-pad"
          placeholder={t.auth.phonePlaceholder}
          error={err('whatsapp')}
          leftIcon={<AppText variant="body" color={colors.textSecondary}>+994</AppText>}
        />
        {user ? (
          <AppText variant="caption" color={colors.textMuted}>
            {t.listing.seller}: {user.phone}
          </AppText>
        ) : null}

        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.createListing.images}
        </AppText>
        <ImagesPicker uris={draft.images} onChange={(images) => set({ images })} min={imageLimit.min} max={imageLimit.max} hint={t.createListing.imagesHint(imageLimit.min, imageLimit.max)} error={err('images')} />
        <VideoPicker uri={draft.videoUri} onChange={(videoUri) => set({ videoUri })} label={t.createListing.video} maxBytes={LISTING_DEFAULTS.maxVideoBytes} />

        <Checkbox
          checked={draft.agreed}
          onChange={(v) => set({ agreed: v })}
          label={
            <Pressable onPress={() => router.push('/info/rules')} style={styles.flex}>
              <AppText variant="small" color={err('agreed') ? colors.danger : colors.textSecondary}>
                {t.createListing.agreeRules}
              </AppText>
            </Pressable>
          }
        />
      </View>

      <SelectSheet visible={sheet === 'region'} onClose={() => setSheet(null)} title={t.createListing.region} options={(cities ?? []).map((c) => ({ value: c, label: c }))} value={draft.city || null} onSelect={(v) => set({ city: v ?? '' })} searchable />
      {subcategory ? (
        <SelectSheet visible={sheet === 'subsub'} onClose={() => setSheet(null)} title={t.createListing.subsubcategory} options={subcategory.subsubcategories.map((b) => ({ value: b.id, label: b.name }))} value={draft.subsubId} onSelect={(v) => set({ subsubId: v })} searchable />
      ) : null}
      {fieldDefs
        .filter((f) => f.type === 'select')
        .map((f) => (
          <SelectSheet
            key={f.key}
            visible={sheet === `field:${f.key}`}
            onClose={() => setSheet(null)}
            title={f.label}
            options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
            value={draft.fields[f.key] ?? null}
            onSelect={(v) => set({ fields: { ...draft.fields, [f.key]: v ?? '' } })}
          />
        ))}

      <BottomSheet visible={done} onClose={finish} title={t.createListing.submitted} dismissOnBackdrop={false}>
        <AppText variant="body" color={colors.textMuted} center>
          {t.createListing.submittedHint}
        </AppText>
        <Button title={t.cabinet.myListings} onPress={finish} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  group: { gap: 14 },
});
