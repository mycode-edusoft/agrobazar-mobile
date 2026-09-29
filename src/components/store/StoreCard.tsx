import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, radii, shadows } from '@/theme';

interface Props {
  id: string;
  name: string;
  logoUrl: string | null;
  activeListingsCount: number;
}

export function StoreCard({ id, name, logoUrl, activeListingsCount }: Props) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/stores/[id]', params: { id } })}
      style={styles.card}
    >
      <View style={styles.logoWrap}>
        {logoUrl ? (
          <Image source={logoUrl} style={styles.logo} contentFit="cover" />
        ) : (
          <Ionicons name="storefront-outline" size={28} color={colors.textPlaceholder} />
        )}
      </View>
      <AppText variant="smallMedium" numberOfLines={1} center>
        {name}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} center>
        {t.stores.listingsShared(activeListingsCount)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    ...shadows.card,
  },
  logoWrap: {
    width: 124, height: 61, borderRadius: 6, backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  logo: { width: '100%', height: '100%' },
});
