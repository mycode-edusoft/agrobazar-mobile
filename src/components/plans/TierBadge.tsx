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

export function TierBadge({ tier, size = 48 }: { tier: PlanTier; size?: number }) {
  const c = colors.tier[tier];
  return (
    <LinearGradient colors={[c.from, c.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.badge, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name={icons[tier]} size={size * 0.5} color={colors.surface} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});
