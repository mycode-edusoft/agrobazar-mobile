import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, layout } from '@/theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { Icon } from '@/components/icons/Icon';

interface Props {
  title: string;
  onBack?: () => void;
  hideBack?: boolean;
  rightText?: string;
  onRightPress?: () => void;
  right?: ReactNode;
  divider?: boolean;
}

export function ScreenHeader({ title, onBack, hideBack, rightText, onRightPress, right, divider = true }: Props) {
  const router = useRouter();
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')));

  return (
    <View style={[styles.wrap, divider && styles.divider]}>
      <View style={styles.side}>
        {hideBack ? null : (
          <IconButton onPress={back} accessibilityLabel="Geri">
            {/* Figma: "angle" 20px, 28px ağ dairədə */}
            <Icon name="chevron" direction="left" size={20} color={colors.textMuted} />
          </IconButton>
        )}
      </View>
      <AppText variant="title" center numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
      <View style={[styles.side, styles.sideRight]}>
        {right ??
          (rightText ? (
            <Pressable onPress={onRightPress} hitSlop={8}>
              <AppText variant="bodyMedium">{rightText}</AppText>
            </Pressable>
          ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.surface,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  side: { width: 64, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  title: { flex: 1 },
});
