import { StyleSheet, TextInput, View } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { t } from '@/i18n/az';
import { colors, typography } from '@/theme';

/** Kataloq kartları içindəki "Axtar" sahəsi — Figma: 38px, #F5F5F5, #F0F0F0 haşiyə, radius 8 */
export function CardSearchField({ value, onChange }: { value: string; onChange(v: string): void }) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={t.common.search}
        placeholderTextColor={colors.textPlaceholder}
        style={styles.input}
        returnKeyType="search"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 38, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty, borderWidth: 1, borderColor: colors.divider,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16,
  },
  input: { flex: 1, ...typography.small, lineHeight: 22, color: colors.text, padding: 0 },
});
