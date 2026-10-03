import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { RegionSheet } from '@/components/catalog/RegionSheet';
import { Field, FormCard, Section, SelectField, StepTitle } from '@/components/store/FormKit';
import { TimePicker } from '@/components/store/TimePicker';
import { AppText, Button, FooterBar, Screen, ScreenHeader, Switch } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCities } from '@/lib/queries';
import { defaultWeek, WEEK_DAYS } from '@/lib/storeHours';
import { useStoreDraft } from '@/store/storeDraft';
import { layout, typography } from '@/theme';

// Saat sahəsində Figma kimi "09 : 00"
const spaced = (v: string) => v.replace(':', ' : ');

/** Figma "Düzəliş et 2/3": Bölgə, Mağaza ünvanı, gün-gün iş saatları (açar + açılış/bağlanış). */
export default function CreateStoreStep2() {
  const router = useRouter();
  const { data: cities } = useCities();
  const draft = useStoreDraft((s) => s.draft);
  const editing = useStoreDraft((s) => s.editing);
  const set = useStoreDraft((s) => s.set);
  const [regionOpen, setRegionOpen] = useState(false);
  const [picker, setPicker] = useState<{ day: number; field: 'open' | 'close' } | null>(null);
  const [touched, setTouched] = useState(false);
  const valid = !!draft.city && draft.address.trim().length >= 3 && draft.week.some((d) => d.enabled);

  const patchDay = (day: number, patch: Partial<(typeof draft.week)[number]>) =>
    set({ week: draft.week.map((d, i) => (i === day ? { ...d, ...patch } : d)) });

  return (
    <Screen
      header={
        <ScreenHeader
          title={editing ? t.createStore.editTitle : t.createStore.title}
          rightText={t.common.reset}
          onRightPress={() => set({ city: '', address: '', week: defaultWeek() })}
        />
      }
      scroll
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
      <View style={styles.body}>
        <StepTitle step={2} />
        <FormCard>
          <Section title={t.createStore.region}>
            <SelectField
              value={draft.city}
              placeholder={t.common.select}
              onPress={() => setRegionOpen(true)}
              error={touched && !draft.city ? t.auth.required : undefined}
            />
          </Section>
          <Section title={t.createStore.address}>
            <Field
              value={draft.address}
              onChangeText={(v) => set({ address: v })}
              placeholder={t.createStore.addressPlaceholder}
              error={touched && draft.address.trim().length < 3 ? t.auth.required : undefined}
            />
          </Section>
          <Section title={t.createStore.workDays}>
            {draft.week.map((day, i) => (
              <View key={WEEK_DAYS[i]} style={styles.day}>
                <View style={styles.dayRow}>
                  <AppText style={styles.dayLabel}>{WEEK_DAYS[i]}</AppText>
                  <Switch value={day.enabled} onChange={(enabled) => patchDay(i, { enabled })} />
                </View>
                <View style={styles.times}>
                  <SelectField value={spaced(day.open)} faded={!day.enabled} dropdown onPress={() => setPicker({ day: i, field: 'open' })} style={styles.flex} />
                  <SelectField value={spaced(day.close)} faded={!day.enabled} dropdown onPress={() => setPicker({ day: i, field: 'close' })} style={styles.flex} />
                </View>
              </View>
            ))}
          </Section>
        </FormCard>
      </View>

      <RegionSheet
        visible={regionOpen}
        onClose={() => setRegionOpen(false)}
        regions={cities ?? []}
        value={draft.city || null}
        onSelect={(city) => set({ city })}
      />
      <TimePicker
        visible={picker != null}
        value={picker ? draft.week[picker.day][picker.field] : '09:00'}
        onClose={() => setPicker(null)}
        onSelect={(v) => picker && patchDay(picker.day, { [picker.field]: v, enabled: true })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: layout.screenPadding, gap: 16 },
  // Figma: hər gün bloku yuxarı-aşağı 8, sətirlə saatlar arası 8, iki saat arası 16
  day: { paddingVertical: 8, gap: 8 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dayLabel: { flex: 1, ...typography.body, lineHeight: 22, color: 'rgba(0, 0, 0, 0.85)' },
  times: { flexDirection: 'row', gap: 16 },
});
