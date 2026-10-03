import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PowerBadgeIcon } from '@/components/icons/BadgeIcons';
import { colors } from '@/theme';
import type { PlanTier } from '@/types/domain';

// Figma "Upgrade Container": 20–24px dairə, şaquli tarif gradienti + 15% qara, içində ağ xətti ikon —
// yaşıl "ideate/power2" (ulduz+✓), bənövşəyi "Crown", qırmızı "Diamond-2"
export function TierDot({ tier, size = 24 }: { tier: PlanTier; size?: number }) {
  const c = colors.tier[tier];
  const icon = Math.round(size * 0.7);
  return (
    <View style={[styles.dot, { width: size, height: size, borderRadius: size / 2 }]}>
      <LinearGradient colors={[c.from, c.to]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.shade]} />
      {tier === 'green' ? (
        // View-a bükülür: web-də absolute qatlar statik <svg>-nin üstünə düşür
        <View>
          <PowerBadgeIcon variant="line" size={icon} />
        </View>
      ) : (
        <MaterialCommunityIcons name={tier === 'purple' ? 'crown-outline' : 'diamond-outline'} size={icon} color={colors.surface} />
      )}
    </View>
  );
}

/** Figma "Frame 2147225828": 40×40 kvadrat (radius 12) — siyahıda boz, tarif səhifəsində tarifin açıq rəngi */
export function TierIconBox({ tier, tinted }: { tier: PlanTier; tinted?: boolean }) {
  return (
    <View style={[styles.box, { backgroundColor: tinted ? colors.tier[tier].soft : colors.iconBackground }]}>
      <TierDot tier={tier} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // Figma: gradientin üstündə 15% qara — ağ ikon açıq (sarı) tonda da oxunsun
  shade: { backgroundColor: 'rgba(0, 0, 0, 0.15)' },
  box: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
