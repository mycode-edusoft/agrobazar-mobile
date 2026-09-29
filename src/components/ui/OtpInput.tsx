import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, radii, typography } from '@/theme';
import { AppText } from './AppText';

interface Props {
  length: number;
  value: string;
  onChange(value: string): void;
  onComplete?(value: string): void;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ length, value, onChange, onComplete, error, autoFocus = true }: Props) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const digits = value.split('');
  const activeIndex = Math.min(value.length, length - 1);

  return (
    <Pressable onPress={() => ref.current?.focus()} style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const isActive = focused && i === activeIndex;
        return (
          <View
            key={i}
            style={[styles.box, isActive && styles.active, error && styles.error]}
          >
            <AppText variant="otp" color={colors.textSecondary}>
              {digits[i] ?? ''}
            </AppText>
            {isActive && !digits[i] ? <View style={styles.caret} /> : null}
          </View>
        );
      })}
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.hidden}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radii.sm,
    backgroundColor: colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  active: { borderColor: colors.focus },
  error: { borderColor: colors.danger },
  caret: { width: 1.5, height: 16, backgroundColor: colors.focus, position: 'absolute' },
  hidden: { position: 'absolute', opacity: 0, width: 1, height: 1, ...typography.otp },
});
