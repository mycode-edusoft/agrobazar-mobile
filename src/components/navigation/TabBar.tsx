import { forwardRef } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { colors, layout, shadows } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface TabButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  icon: IconName;
  iconActive: IconName;
  isFocused?: boolean;
  badge?: number;
}

export const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { label, icon, iconActive, isFocused, badge, ...rest },
  ref,
) {
  const color = isFocused ? colors.primary : colors.textPlaceholder;
  return (
    <Pressable ref={ref} {...rest} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: !!isFocused }}>
      <View>
        <Ionicons name={isFocused ? iconActive : icon} size={24} color={color} />
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="tabLabel" color={colors.surface}>
              {badge > 99 ? '99+' : badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant="tabLabel" color={color}>
        {label}
      </AppText>
    </Pressable>
  );
});

export function CenterActionButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.tab} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.center}>
        <Ionicons name="add" size={30} color={colors.surface} />
      </View>
      <AppText variant="tabLabel" color={colors.textPlaceholder}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function TabBarContainer({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <View style={styles.row}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...shadows.nav,
  },
  row: { flexDirection: 'row', height: layout.tabBarHeight, paddingHorizontal: 8, alignItems: 'center' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, height: '100%' },
  center: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: -28,
    borderWidth: 3.5, borderColor: colors.surface, ...shadows.nav,
  },
  badge: {
    position: 'absolute', top: -6, right: -10, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.badge, borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
});
