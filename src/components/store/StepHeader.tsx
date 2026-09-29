import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { colors } from '@/theme';

export function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.dot, i < step && styles.dotDone]} />
        ))}
      </View>
      <AppText variant="bodyBold" color={colors.textSecondary}>
        {step}/{total} · {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingTop: 16 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.divider },
  dotDone: { backgroundColor: colors.primary },
});
