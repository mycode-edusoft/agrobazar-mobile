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

// tall: Figma "Elanlarım" tam ekran vəziyyəti — rəsm 268×164 (1.47x), yuxarıdan 103, mətn 16/24
export function ListingsEmpty({ text, style, tall }: { text: string; style?: StyleProp<ViewStyle>; tall?: boolean }) {
  return (
    <View style={[styles.wrap, tall && styles.tall, style]}>
      <View style={[styles.cards, tall && styles.cardsLarge]}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
      <AppText variant={tall ? 'body' : 'caption'} color={colors.textPlaceholder} center style={[styles.text, tall && styles.textLarge]}>
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
  tall: { flex: 1, minHeight: 480, justifyContent: 'flex-start', paddingTop: 103 },
  cardsLarge: { transform: [{ scale: 1.47 }], marginVertical: 26 },
  textLarge: { marginTop: 16 },
  cards: { flexDirection: 'row', gap: 6 },
  card: { width: 88, backgroundColor: '#FAFAFA', borderRadius: 4, padding: 0, gap: 4, paddingBottom: 6, ...shadows.smallButton },
  image: { height: 56, backgroundColor: GRAY, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  bar: { height: 6, backgroundColor: GRAY, marginHorizontal: 6, borderRadius: 2 },
  barShort: { width: 36 },
  barThin: { height: 4, width: 48 },
  text: { lineHeight: 24, letterSpacing: -0.24, marginTop: 4 },
});
