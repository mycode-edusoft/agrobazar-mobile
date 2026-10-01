import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/ui';
import { colors, typography } from '@/theme';

/** Kataloq/Filter seçim çipi — Figma: 38px, padding 8/12, radius 8, #F5F5F5; seçilmiş #52C234, mətn 14/22 */
export function SelectChip({ label, active, onPress }: { label: string; active: boolean; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]} accessibilityState={{ selected: active }}>
      <AppText style={[styles.text, active && styles.textActive]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 38, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center',
  },
  active: { backgroundColor: colors.primary },
  text: { ...typography.small, lineHeight: 22, color: colors.textSecondary },
  textActive: { color: colors.surface },
});
