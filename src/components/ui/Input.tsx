import { forwardRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, layout, radii, typography } from '@/theme';
import { AppText } from './AppText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  onPressContainer?: () => void;
  multiline?: boolean;
}

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, leftIcon, rightElement, containerStyle, onPressContainer, multiline, value, style, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!value && value.length > 0;

  const body = (
    <View
      style={[
        styles.container,
        multiline && styles.multiline,
        { backgroundColor: hasValue ? colors.inputBackground : colors.inputBackgroundEmpty },
        focused && styles.focused,
        !!error && styles.errored,
        containerStyle,
      ]}
    >
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <View style={styles.fields}>
        {label && (hasValue || focused) ? (
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
            {label}
          </AppText>
        ) : null}
        <TextInput
          ref={ref}
          value={value}
          multiline={multiline}
          editable={!onPressContainer}
          pointerEvents={onPressContainer ? 'none' : 'auto'}
          placeholderTextColor={colors.textPlaceholder}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
          placeholder={rest.placeholder ?? label}
          style={[styles.input, multiline && styles.inputMultiline, style]}
        />
      </View>
      {rightElement ? <View style={styles.icon}>{rightElement}</View> : null}
    </View>
  );

  return (
    <View>
      {onPressContainer ? <Pressable onPress={onPressContainer}>{body}</Pressable> : body}
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    minHeight: layout.inputHeight,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multiline: { minHeight: 120, alignItems: 'flex-start', paddingVertical: 12 },
  focused: { borderColor: colors.focus },
  errored: { borderColor: colors.danger },
  icon: { justifyContent: 'center' },
  fields: { flex: 1, justifyContent: 'center' },
  input: {
    ...typography.input,
    color: colors.text,
    padding: 0,
    margin: 0,
  },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
  error: { marginTop: 4, marginLeft: 4 },
});
