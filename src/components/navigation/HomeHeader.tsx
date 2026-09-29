import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { useUnreadNotifications } from '@/lib/queries';
import { colors, layout } from '@/theme';

const logo = require('../../../assets/brand/logo-color.png');

export function HomeHeader() {
  const router = useRouter();
  const unread = useUnreadNotifications();
  const count = unread.data ?? 0;

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => router.push('/menu')} hitSlop={10} accessibilityLabel="Menyu">
        <Ionicons name="menu-outline" size={28} color={colors.textMuted} />
      </Pressable>
      <Image source={logo} style={styles.logo} contentFit="contain" />
      <Pressable onPress={() => router.push('/notifications')} hitSlop={10} accessibilityLabel={t.notifications.title}>
        <Ionicons name="notifications-outline" size={26} color={colors.textMuted} />
        {count > 0 ? (
          <View style={styles.badge}>
            <AppText variant="tabLabel" color={colors.surface}>
              {count > 99 ? '99+' : count}
            </AppText>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  logo: { width: 80, height: 37 },
  badge: {
    position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.badge, borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
});
