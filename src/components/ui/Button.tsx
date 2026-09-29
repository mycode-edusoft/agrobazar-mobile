import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, layout, radii, typography } from '@/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost' | 'dark';

interface Props extends Omit<PressableProps, 'style' | 'children'> {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  size?: 'md' | 'lg' | 'sm';
  style?: StyleProp<ViewStyle>;
}

const palette: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.surface },
  outline: { bg: colors.primaryTint, text: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, text: colors.surface },
  ghost: { bg: 'transparent', text: colors.textMuted },
  dark: { bg: colors.text, text: colors.surface },
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  size = 'md',
  style,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  const p = palette[variant];
  const bg = isDisabled && variant !== 'ghost' ? colors.disabledBackground : p.bg;
  const text = isDisabled && variant !== 'ghost' ? colors.disabledText : p.text;
  const border = isDisabled ? undefined : p.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        size === 'sm' && styles.sm,
        { backgroundColor: bg },
        border ? { borderWidth: 1, borderColor: border } : null,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <>
          {icon}
          <AppText
            variant={size === 'lg' ? 'buttonLarge' : size === 'sm' ? 'captionMedium' : 'button'}
            color={text}
            style={styles.label}
          >
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lg: { height: layout.buttonHeight },
  sm: { height: 32, paddingHorizontal: 12 },
  pressed: { opacity: 0.85 },
  label: { ...typography.button, textAlign: 'center' },
});
