import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import type { PlanTier } from '@/types/domain';

const icons: Record<PlanTier, keyof typeof Ionicons.glyphMap> = {
  green: 'flash',
  purple: 'ribbon',
  red: 'diamond',
};

// Figma "Upgrade Container": 20–24px dairə, şaquli gradient, eyni rəngli 1px haşiyə
export function TierDot({ tier, size = 24 }: { tier: PlanTier; size?: number }) {
  const c = colors.tier[tier];
  return (
    <LinearGradient
      colors={[c.from, c.to]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.dot, { width: size, height: size, borderRadius: size / 2, borderColor: c.from }]}
    >
      <Ionicons name={icons[tier]} size={size * 0.55} color={colors.surface} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  dot: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});
