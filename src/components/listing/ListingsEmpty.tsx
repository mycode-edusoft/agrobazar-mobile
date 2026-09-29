import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '@/components/ui';
import { colors, radii, shadows } from '@/theme';

// Figma "Rectangle 4369": iki boz skelet kart + "Elanınız yoxdur".
// Rəsm faylı əvəzinə kodla çəkilir — istənilən ölçüdə kəskin qalır.
function SkeletonCard() {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={[styles.bar, styles.barShort]} />
      <View style={styles.bar} />
      <View style={[styles.bar, styles.barThin]} />
    </View>
  );
}

export function ListingsEmpty({ text, style, tall }: { text: string; style?: StyleProp<ViewStyle>; tall?: boolean }) {
  return (
    <View style={[styles.wrap, tall && styles.tall, style]}>
      <View style={styles.cards}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <AppText variant="caption" color={colors.textPlaceholder} center style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const GRAY = '#F2F2F2';

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  tall: { flex: 1, minHeight: 480 },
  cards: { flexDirection: 'row', gap: 6 },
  card: { width: 88, backgroundColor: '#FAFAFA', borderRadius: 4, padding: 0, gap: 4, paddingBottom: 6, ...shadows.smallButton },
  image: { height: 56, backgroundColor: GRAY, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  bar: { height: 6, backgroundColor: GRAY, marginHorizontal: 6, borderRadius: 2 },
  barShort: { width: 36 },
  barThin: { height: 4, width: 48 },
  text: { lineHeight: 24, letterSpacing: -0.24, marginTop: 4 },
});
