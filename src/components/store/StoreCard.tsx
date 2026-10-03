import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, radii, shadows, typography } from '@/theme';

interface Props {
  id: string;
  name: string;
  logoUrl: string | null;
  activeListingsCount: number;
  totalViews?: number;
}

const META = 'rgba(53, 64, 82, 0.63)';

/**
 * Figma "Mağazalar": ağ qutu (100px, radius 8, kölgə) ortada 124×61 loqo; altında fonsuz,
 * sola düzlənmiş ad (12/24 #354052) və "N elan paylaşılıb - 👁 N" (9.33/21).
 */
export function StoreCard({ id, name, logoUrl, activeListingsCount, totalViews }: Props) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push({ pathname: '/stores/[id]', params: { id } })} style={styles.card}>
      <View style={styles.box}>
        {logoUrl ? (
          <Image source={logoUrl} style={styles.logo} contentFit="contain" />
        ) : (
          <Ionicons name="storefront-outline" size={28} color={colors.textPlaceholder} />
        )}
      </View>
      <View style={styles.info}>
        <AppText style={styles.name} numberOfLines={1}>
          {name}
        </AppText>
        <View style={styles.meta}>
          <AppText style={styles.metaText} numberOfLines={1}>
            {t.stores.listingsShared(activeListingsCount)}
          </AppText>
          {totalViews != null ? (
            <>
              <AppText style={styles.metaText}>-</AppText>
              <Ionicons name="eye" size={10} color={colors.textPlaceholder} />
              <AppText style={styles.metaText}>{totalViews}</AppText>
            </>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 6 },
  box: {
    height: 100, borderRadius: radii.sm, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', ...shadows.card,
  },
  logo: { width: 124, height: 61 },
  info: { paddingHorizontal: 8 },
  name: { fontFamily: typography.body.fontFamily, fontSize: 12, lineHeight: 24, letterSpacing: -0.3, color: '#354052' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  metaText: { fontFamily: typography.body.fontFamily, fontSize: 9.33, lineHeight: 21, color: META },
});
