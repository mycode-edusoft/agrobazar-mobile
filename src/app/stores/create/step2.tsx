import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StepHeader } from '@/components/store/StepHeader';
import { AppText, Button, FooterBar, Input, Screen, ScreenHeader, SelectSheet } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCities } from '@/lib/queries';
import { useStoreDraft } from '@/store/storeDraft';
import { colors, layout } from '@/theme';

const hours = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);
const hourOptions = hours.map((h) => ({ value: h, label: h }));

export default function CreateStoreStep2() {
  const router = useRouter();
  const { data: cities } = useCities();
  const regionOptions = (cities ?? []).map((r) => ({ value: r, label: r }));
  const draft = useStoreDraft((s) => s.draft);
  const set = useStoreDraft((s) => s.set);
  const [sheet, setSheet] = useState<'region' | 'open' | 'close' | null>(null);
  const [touched, setTouched] = useState(false);
  const valid = !!draft.city && draft.address.trim().length >= 3;

  const chevron = <Ionicons name="chevron-down" size={20} color={colors.textMuted} />;

  return (
    <Screen
      header={<ScreenHeader title={t.createStore.title} />}
      scroll
      padded
      keyboard
      footer={
        <FooterBar>
          <Button
            title={t.common.continue}
            onPress={() => {
              setTouched(true);
              if (valid) router.push('/stores/create/step3');
            }}
          />
        </FooterBar>
      }
    >
      <StepHeader step={2} total={3} title={t.createStore.step2} />
      <View style={styles.form}>
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.createStore.region}
        </AppText>
        <Input label={t.createStore.region} value={draft.city} placeholder={t.common.select} onPressContainer={() => setSheet('region')} rightElement={chevron} error={touched && !draft.city ? t.auth.required : undefined} />
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.createStore.address}
        </AppText>
        <Input
          label={t.createStore.address}
          value={draft.address}
          onChangeText={(v) => set({ address: v })}
          placeholder={t.createStore.addressPlaceholder}
          leftIcon={<Ionicons name="location-outline" size={22} color={colors.textSecondary} />}
          error={touched && draft.address.trim().length < 3 ? t.auth.required : undefined}
        />
        <AppText variant="bodyBold" color={colors.textSecondary}>
          {t.createStore.workingHours}
        </AppText>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Input label="Açılış" value={draft.open} onPressContainer={() => setSheet('open')} rightElement={chevron} />
          </View>
          <View style={styles.flex}>
            <Input label="Bağlanış" value={draft.close} onPressContainer={() => setSheet('close')} rightElement={chevron} />
          </View>
        </View>
      </View>
      <SelectSheet visible={sheet === 'region'} onClose={() => setSheet(null)} title={t.createStore.region} options={regionOptions} value={draft.city || null} onSelect={(v) => set({ city: v ?? '' })} searchable />
      <SelectSheet visible={sheet === 'open'} onClose={() => setSheet(null)} title="Açılış" options={hourOptions} value={draft.open} onSelect={(v) => set({ open: v ?? '09:00' })} />
      <SelectSheet visible={sheet === 'close'} onClose={() => setSheet(null)} title="Bağlanış" options={hourOptions} value={draft.close} onSelect={(v) => set({ close: v ?? '18:00' })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { paddingTop: 16, gap: 12, paddingBottom: layout.screenPadding },
  row: { flexDirection: 'row', gap: 8 },
});
