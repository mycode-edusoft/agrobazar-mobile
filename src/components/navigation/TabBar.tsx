import { forwardRef, type ComponentType } from 'react';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui';
import { colors, layout, shadows } from '@/theme';
import { NewListingButtonIcon, type TabIconProps } from './TabIcons';

interface TabButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  Icon: ComponentType<TabIconProps>;
  isFocused?: boolean;
  badge?: number;
}

export const TabButton = forwardRef<View, TabButtonProps>(function TabButton(
  { label, Icon, isFocused, badge, ...rest },
  ref,
) {
  const color = isFocused ? colors.primary : colors.textPlaceholder;
  return (
    <Pressable ref={ref} {...rest} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: !!isFocused }}>
      <View>
        <Icon color={color} />
        {badge ? (
          <View style={styles.badge}>
            <AppText variant="captionMedium" color={colors.surface} style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </AppText>
          </View>
        ) : null}
      </View>
      <AppText variant={isFocused ? 'tabLabelActive' : 'tabLabel'} color={color}>
        {label}
      </AppText>
    </Pressable>
  );
});

export function CenterActionButton({ label, onPress }: { label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={styles.tab} accessibilityRole="button" accessibilityLabel={label}>
      <View style={styles.center}>
        <NewListingButtonIcon fill={colors.primary} />
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
  // Figma "Moleculs - Navbar": ikon 24, ikonla mətn arası 8
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%' },
  center: { marginTop: -28 },
  // Figma badge: 18×18, ikonun solundan 15, yuxarıdan -6
  badge: {
    position: 'absolute', top: -6, left: 15, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.badge, borderWidth: 1, borderColor: colors.surface,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { lineHeight: 16 },
});
