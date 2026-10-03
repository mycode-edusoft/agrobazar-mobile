import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon } from '@/components/icons/Icon';
import { AppText, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, shadows, typography } from '@/theme';

/**
 * Figma "Mağaza yarat / Düzəliş et" formasının ortaq hissələri:
 * ağ kart (radius 14, kölgə, bölmələr arası 24), Bold 16 bölmə başlığı (sahədən 12 yuxarı),
 * #F5F5F5 56px sahələr (radius 8, dəyər 16/24 #595959).
 */

export function FormCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Section({ title, children, style }: { title?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.section, style]}>
      {title ? <AppText style={styles.sectionTitle}>{title}</AppText> : null}
      {children}
    </View>
  );
}

interface FieldProps extends Omit<TextInputProps, 'style'> {
  error?: string;
  left?: ReactNode;
  /** Linklər Figma-da mavi altıxətli göstərilir */
  link?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Field({ error, left, link, multiline, style, value, ...rest }: FieldProps) {
  return (
    <View style={[styles.fieldWrap, style]}>
      <View style={[styles.field, multiline && styles.multiline, !!error && styles.fieldError]}>
        {left ? <View style={styles.left}>{left}</View> : null}
        <TextInput
          value={value}
          multiline={multiline}
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, multiline && styles.inputMultiline, link && !!value && styles.link]}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...rest}
        />
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

export function SelectField({
  value, placeholder, onPress, error, faded, style,
}: { value: string; placeholder?: string; onPress(): void; error?: string; faded?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.fieldWrap, style]}>
      <Pressable onPress={onPress} style={[styles.field, !!error && styles.fieldError]}>
        <AppText style={[styles.input, !value && styles.placeholder, faded && styles.faded]} numberOfLines={1}>
          {value || placeholder}
        </AppText>
        <Icon name="chevron" direction="right" size={20} color={colors.textMuted} />
      </Pressable>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

// Figma "Circles (Pie chart)": 33px, #E4E4E7 3.3px halqa, yaşıl irəliləyiş, ortada "1/3" 12 SemiBold
function ProgressPie({ step, total }: { step: number; total: number }) {
  const size = 33;
  const stroke = 3.3;
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  return (
    <View style={styles.pie}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E4E4E7" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={colors.primary} strokeWidth={stroke} fill="none"
          strokeDasharray={`${(len * step) / total} ${len}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <AppText style={styles.pieText}>
        {step}/{total}
      </AppText>
    </View>
  );
}

export function StepTitle({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <View style={styles.stepRow}>
      <AppText style={styles.stepTitle}>{t.createStore.completeInfo}</AppText>
      <ProgressPie step={step} total={total} />
    </View>
  );
}

// Figma "Service Card": açıq yaşıl fon, yaşıl haşiyə; başlığa toxunanda qaydalar açılır
export function RulesAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <Pressable onPress={() => setOpen((v) => !v)} style={styles.promo}>
      <View style={styles.promoRow}>
        <View style={styles.promoIcon}>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            <Circle cx={12} cy={12} r={10} fill={colors.primary} />
            <Path d="M12 7.5v6M12 16.6v.1" stroke={colors.surface} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <AppText style={styles.promoTitle}>{t.createStore.promoTitle}</AppText>
        <Icon name="chevron" direction={open ? 'up' : 'down'} size={24} color={colors.textSecondary} />
      </View>
      {open ? (
        <View style={styles.rules}>
          {t.createStore.rules.map((r) => (
            <AppText key={r} style={styles.ruleText}>
              {'• '}
              {r}
            </AppText>
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, gap: 24, ...shadows.card },
  section: { paddingHorizontal: 16, gap: 12 },
  sectionTitle: { ...typography.bodyBold, color: colors.textSecondary },
  fieldWrap: { gap: 4 },
  field: {
    minHeight: 56, paddingHorizontal: 16, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty,
    flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'transparent',
  },
  multiline: { height: 112, alignItems: 'flex-start', paddingTop: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  fieldError: { borderColor: colors.danger, backgroundColor: 'rgba(249, 249, 249, 0.85)' },
  left: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, ...typography.body, color: colors.textSecondary, padding: 0 },
  inputMultiline: { height: '100%', paddingTop: 4 },
  link: { color: '#276EF1', textDecorationLine: 'underline' },
  placeholder: { color: colors.textPlaceholder },
  faded: { color: 'rgba(89, 89, 89, 0.5)' },
  error: { ...typography.captionMedium, color: colors.danger, paddingHorizontal: 16 },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepTitle: { flex: 1, fontFamily: typography.bodyMedium.fontFamily, fontSize: 17, lineHeight: 24, color: '#181818' },
  pie: { width: 33, height: 33, alignItems: 'center', justifyContent: 'center' },
  pieText: { fontFamily: typography.tabLabelActive.fontFamily, fontSize: 12, lineHeight: 14, color: '#18181B' },

  promo: {
    padding: 16, gap: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(82, 194, 52, 0.5)',
    backgroundColor: 'rgba(220, 243, 214, 0.27)',
  },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoIcon: { width: 32, height: 32, borderRadius: 17, backgroundColor: 'rgba(82, 194, 52, 0.2)', alignItems: 'center', justifyContent: 'center' },
  promoTitle: { flex: 1, fontFamily: typography.tabLabelActive.fontFamily, fontSize: 20, lineHeight: 22, letterSpacing: -1, color: colors.textSecondary },
  rules: { gap: 4, paddingTop: 4 },
  ruleText: { ...typography.small, lineHeight: 22, color: colors.textMuted },
});

// Figma "Mağaza loqosu": 130×130 (radius 14) şəkil, sağ üst küncdə 24px tünd "×",
// altda mərkəzdə mavi 16/32 yükləmə mətni (toxunanda qalereya açılır)
export function ImageField({
  uri, onChange, hint, maxBytes, wide,
}: { uri: string | null; onChange(uri: string | null): void; hint: string; maxBytes: number; wide?: boolean }) {
  const toast = useToast();
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: wide ? [16, 7] : [1, 1], quality: 0.8,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize != null && asset.fileSize > maxBytes) {
      toast(`Şəkil limitdən böyükdür (maks. ${Math.round(maxBytes / 1024)} KB)`, 'error');
      return;
    }
    onChange(asset.uri);
  };
  return (
    <View style={imageStyles.imageWrap}>
      <View style={[imageStyles.imageBox, wide && imageStyles.imageWide]}>
        <Pressable onPress={pick} style={imageStyles.imageInner}>
          {uri ? <Image source={uri} style={imageStyles.imageFill} contentFit="cover" /> : <Icon name="plus" size={28} color={colors.textMuted} />}
        </Pressable>
        {uri ? (
          <Pressable onPress={() => onChange(null)} style={imageStyles.imageRemove} hitSlop={8} accessibilityLabel={t.common.delete}>
            <Icon name="cancel" size={14} color={colors.surface} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={pick}>
        <AppText style={imageStyles.imageHint}>{hint}</AppText>
      </Pressable>
    </View>
  );
}

const imageStyles = StyleSheet.create({
  imageWrap: { gap: 8 },
  imageBox: { width: 130, height: 130 },
  imageWide: { width: '100%', height: 140 },
  imageInner: {
    flex: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center',
  },
  imageFill: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.54)', borderWidth: 2, borderColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  imageHint: { ...typography.body, lineHeight: 32, color: '#1977F2', textAlign: 'center' },
});
