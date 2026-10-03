import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { RegionSheet } from '@/components/catalog/RegionSheet';
import { SelectChip } from '@/components/catalog/SelectChip';
import { Field, FormCard, Section, SelectField } from '@/components/store/FormKit';
import {
  AppText, BottomSheet, Button, Checkbox, FooterBar, ImagesPicker, Screen, ScreenHeader, useToast,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { formatPhoneInput, isValidAzPhone, normalizePhone } from '@/lib/format';
import { qk, useCategories, useCities, useEntitlements, useSubsubAttributes } from '@/lib/queries';
import { LISTING_DEFAULTS } from '@/lib/rules';
import { api, ApiError } from '@/services';
import { useAuthStore } from '@/store/auth';
import { useListingDraft } from '@/store/listingDraft';
import { colors, layout, typography } from '@/theme';
import type { DynamicFieldDef, ListingType } from '@/types/domain';
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

  // Əlaqə adı ilk dəfə profil adı ilə doldurulur (istifadəçi dəyişə bilər)
  useEffect(() => {
    if (!editingId && !draft.contactName && user?.fullName) set({ contactName: user.fullName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      contactName: draft.contactName.trim() || null,
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

  // Figma: yan-yana duran rəqəm sahələri (məs. "Yürüşü (km)" + "Buraxılış ili") cüt-cüt sıraya düzülür
  const fieldRows = useMemo(() => {
    const rows: DynamicFieldDef[][] = [];
    for (const f of fieldDefs) {
      const last = rows[rows.length - 1];
      if (f.type === 'number' && last?.length === 1 && last[0].type === 'number') last.push(f);
      else rows.push([f]);
    }
    return rows;
  }, [fieldDefs]);

  const fieldLabel = (f: DynamicFieldDef) => `${f.label}${f.unit ? ` (${f.unit})` : ''}`;
  const renderField = (f: DynamicFieldDef, style?: StyleProp<ViewStyle>) =>
    f.type === 'select' ? (
      <Section key={f.key} title={fieldLabel(f)} style={style}>
        <SelectField value={draft.fields[f.key] ?? ''} placeholder={t.common.select} onPress={() => setSheet(`field:${f.key}`)} error={err(`field:${f.key}`)} />
      </Section>
    ) : (
      <Section key={f.key} title={fieldLabel(f)} style={style}>
        <Field
          value={draft.fields[f.key] ?? ''}
          onChangeText={(v) => set({ fields: { ...draft.fields, [f.key]: f.type === 'number' ? v.replace(/[^\d.]/g, '') : v } })}
          keyboardType={f.type === 'number' ? 'numeric' : 'default'}
          placeholder={f.type === 'number' ? '0' : t.common.enter}
          error={err(`field:${f.key}`)}
        />
      </Section>
    );

  const sheetField = sheet?.startsWith('field:') ? fieldDefs.find((f) => `field:${f.key}` === sheet) : undefined;

  return (
    <Screen
      header={
        <ScreenHeader
          title={editingId ? t.listing.edit : t.createListing.title}
          rightText={t.common.reset}
          onRightPress={() => set({ price: '', negotiable: false, city: '', title: '', contactName: '', description: '', whatsapp: '', images: [], videoUri: null, fields: {}, agreed: false })}
        />
      }
      scroll
      keyboard
      footer={
        <FooterBar>
          <Button
            title={editingId ? t.common.save : t.createListing.submit}
            icon={editingId ? undefined : <Icon name="plus" size={20} color={colors.surface} />}
            onPress={submit}
            loading={submitting}
          />
        </FooterBar>
      }
    >
      {/* Figma "Business account / Elan yerləşdir → Yeni elan": bütün sahələr bir ağ kartda */}
      <View style={styles.body}>
        {editingId ? (
          <AppText variant="caption" color={colors.danger}>
            {t.listing.editWarning}
          </AppText>
        ) : null}
        <FormCard>
          <Section title={t.filter.category}>
            <SelectField value={category?.name ?? ''} placeholder={t.common.select} error={err('category')} onPress={() => router.dismissTo('/listing/create')} />
          </Section>
          {category ? (
            <Section title={t.createListing.productCategory}>
              <SelectField
                value={subsub?.name ?? subcategory?.name ?? ''}
                placeholder={t.common.select}
                error={err('subsub')}
                onPress={() => router.push({ pathname: '/catalog/sub/[categoryId]', params: { categoryId: category.id, mode: 'create' } })}
              />
            </Section>
          ) : null}

          {fieldRows.map((row) =>
            row.length === 2 ? (
              <View key={row[0].key} style={styles.pair}>
                {renderField(row[0], styles.half)}
                {renderField(row[1], styles.half)}
              </View>
            ) : (
              renderField(row[0])
            ),
          )}

          <Section title={t.createListing.service}>
            <View style={styles.chips}>
              {listingTypes.map((type) => (
                <SelectChip key={type} label={t.listingType[type]} active={draft.type === type} onPress={() => set({ type, negotiable: type === 'offer' ? draft.negotiable : false })} />
              ))}
            </View>
            {draft.type === 'offer' ? (
              <Checkbox checked={draft.negotiable} onChange={(v) => set({ negotiable: v, price: v ? '' : draft.price })} label={t.common.negotiable} />
            ) : null}
          </Section>

          <Section title={t.filter.priceAzn}>
            <Field
              value={draft.price}
              onChangeText={(v) => set({ price: v.replace(/[^\d.,]/g, '') })}
              keyboardType="decimal-pad"
              placeholder={t.createListing.pricePlaceholder}
              error={err('price')}
              editable={!draft.negotiable}
            />
          </Section>

          <Section title={t.createListing.region}>
            <SelectField value={draft.city} placeholder={t.common.select} error={err('city')} onPress={() => setSheet('region')} />
          </Section>

          <Section title={t.createListing.listingTitle}>
            <Field value={draft.title} onChangeText={(v) => set({ title: v })} placeholder={t.common.enter} error={err('title')} maxLength={80} />
          </Section>

          <Section title={t.createListing.contactName}>
            <Field value={draft.contactName} onChangeText={(v) => set({ contactName: v })} placeholder={t.common.enter} maxLength={80} />
          </Section>

          <Section title={t.createListing.description}>
            <Field
              value={draft.description}
              onChangeText={(v) => set({ description: v })}
              placeholder={t.createListing.descriptionPlaceholder}
              error={err('description')}
              multiline
              maxLength={2000}
            />
          </Section>

          <Section title={t.createListing.whatsapp}>
            <View style={styles.phoneRow}>
              <View style={styles.prefix}>
                <AppText style={styles.prefixText}>+994</AppText>
              </View>
              <Field
                style={styles.flex}
                left={<Icon name="phone" size={24} color={colors.textSecondary} />}
                value={draft.whatsapp}
                onChangeText={(v) => set({ whatsapp: formatPhoneInput(v) })}
                keyboardType="phone-pad"
                placeholder={t.auth.phonePlaceholder}
                error={err('whatsapp')}
              />
            </View>
          </Section>

          {/* Figma: şəkillər kartın içində 24px kənar boşluqla */}
          <View style={styles.images}>
            <ImagesPicker uris={draft.images} onChange={(images) => set({ images })} min={imageLimit.min} max={imageLimit.max} hint={t.createListing.imagesHint(imageLimit.min, imageLimit.max)} error={err('images')} />
          </View>

          <View style={styles.agree}>
            <Checkbox
              checked={draft.agreed}
              onChange={(v) => set({ agreed: v })}
              label={
                <AppText style={[styles.agreeText, !!err('agreed') && styles.agreeError]}>
                  {t.createListing.agreePrefix}
                  <AppText style={styles.agreeLink} onPress={() => router.push('/info/rules')}>
                    {t.createListing.agreeLink}
                  </AppText>
                  {t.createListing.agreeSuffix}
                </AppText>
              }
            />
          </View>
        </FormCard>
      </View>

      {/* Figma "Bölgə" və "Marka" panelləri eyni komponentdir: axtarış + siyahı + yaşıl ✓ */}
      <RegionSheet visible={sheet === 'region'} onClose={() => setSheet(null)} regions={cities ?? []} value={draft.city || null} onSelect={(city) => set({ city })} />
      <RegionSheet
        visible={!!sheetField}
        onClose={() => setSheet(null)}
        title={sheetField?.label}
        regions={sheetField?.options ?? []}
        value={sheetField ? draft.fields[sheetField.key] ?? null : null}
        onSelect={(v) => sheetField && set({ fields: { ...draft.fields, [sheetField.key]: v } })}
      />

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
  body: { padding: layout.screenPadding, gap: 12 },
  pair: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  half: { flex: 1, paddingHorizontal: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  phoneRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  prefix: { width: 71, height: 56, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty, alignItems: 'center', justifyContent: 'center' },
  prefixText: { ...typography.body, color: colors.textPlaceholder },
  images: { paddingHorizontal: 24, gap: 12 },
  agree: { paddingHorizontal: 16 },
  agreeText: { flex: 1, ...typography.smallMedium, lineHeight: 20, color: colors.textMuted },
  agreeError: { color: colors.danger },
  agreeLink: { color: colors.primary, textDecorationLine: 'underline' },
});
