import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { TierIconBox } from '@/components/plans/TierDot';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, shadows, typography } from '@/theme';
import type { PlanTier } from '@/types/domain';

/**
 * Figma "Aktiv tarifim" / tarif səhifəsi: ekran tarifin rəngindədir, header-dən 86px aşağıda tam enli
 * ağ kart (radius 14, padding-top 38) başlayır; kartın yuxarı kənarının ortasında 40px tarif ikonu,
 * altında tarifin adı (16 SemiBold, tarif rəngi). Bölmələr arası 24.
 */
export function PlanSheet({ tier, name, popular, children }: { tier: PlanTier; name: string; popular?: boolean; children: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.titleRow}>
          <AppText style={[styles.title, { color: colors.tier[tier].text }]}>{name}</AppText>
          {popular ? <PopularPill /> : null}
        </View>
        {children}
      </View>
      <View style={styles.icon}>
        <TierIconBox tier={tier} tinted />
      </View>
    </View>
  );
}

// Figma "Frame 237901": 1px #1977F2 haşiyə, radius 20, 8px Medium mətn
export function PopularPill() {
  return (
    <View style={styles.pill}>
      <AppText style={styles.pillText}>{t.plans.popular}</AppText>
    </View>
  );
}

export function SheetSection({ children }: { children: ReactNode }) {
  return <View style={styles.section}>{children}</View>;
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, paddingTop: 86 },
  card: {
    flexGrow: 1, backgroundColor: colors.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingTop: 38, paddingBottom: 40, gap: 24,
    ...shadows.card,
  },
  icon: { position: 'absolute', top: 86 - 24, left: 0, right: 0, alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingHorizontal: 16 },
  title: { fontFamily: typography.tabLabelActive.fontFamily, fontSize: 16, lineHeight: 21 },
  section: { paddingHorizontal: 16, gap: 16 },
  pill: { height: 16, paddingHorizontal: 6, borderRadius: 20, borderWidth: 1, borderColor: '#1977F2', justifyContent: 'center' },
  pillText: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 8, lineHeight: 10, color: '#1977F2' },
});
