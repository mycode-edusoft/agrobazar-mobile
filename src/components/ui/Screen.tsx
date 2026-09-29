import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, layout } from '@/theme';

interface Props {
  children?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  background?: string;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  keyboard?: boolean;
  padded?: boolean;
}

export function Screen({
  children,
  header,
  footer,
  scroll = false,
  background = colors.background,
  edges = ['top'],
  contentStyle,
  keyboard = false,
  padded = false,
}: Props) {
  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[padded && styles.padded, styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>{children}</View>
  );

  const body = keyboard ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
      {footer}
    </KeyboardAvoidingView>
  ) : (
    <>
      {content}
      {footer}
    </>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }]}>
      {header}
      {body}
    </SafeAreaView>
  );
}

export function FooterBar({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <SafeAreaView edges={['bottom']} style={[styles.footer, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.screenPadding },
  scrollContent: { paddingBottom: 24 },
  footer: {
    backgroundColor: colors.surface,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
});
