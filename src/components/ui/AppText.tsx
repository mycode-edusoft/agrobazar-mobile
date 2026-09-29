import { Text, type TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
}

export function AppText({ variant = 'body', color = colors.text, center, style, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[typography[variant], { color }, center && styles.center, style]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});
