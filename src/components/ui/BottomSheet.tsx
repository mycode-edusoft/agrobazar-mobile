import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { IconButton } from './IconButton';

interface SheetProps {
  visible: boolean;
  onClose(): void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  dismissOnBackdrop?: boolean;
  /** Panelin sabit hündürlüyü (məs. '85%') — uzun siyahılar üçün */
  height?: DimensionValue;
}

export function BottomSheet({ visible, onClose, title, subtitle, children, dismissOnBackdrop = true, height }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={dismissOnBackdrop ? onClose : undefined} />
        <SafeAreaView edges={['bottom']} style={[styles.panel, height != null && { height }]}>
          {title ? (
            <View style={styles.header}>
              <View style={styles.headerSide} />
              <View style={styles.headerCenter}>
                <AppText variant="bodyBold" center>
                  {title}
                </AppText>
                {subtitle ? (
                  <AppText variant="body" color={colors.textMuted} center>
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
              <View style={[styles.headerSide, styles.headerRight]}>
                <IconButton onPress={onClose} accessibilityLabel="Bağla">
                  <Icon name="cancel" size={23} color={colors.textMuted} />
                </IconButton>
              </View>
            </View>
          ) : null}
          {title ? <View style={styles.divider} /> : null}
          <View style={styles.content}>{children}</View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface ConfirmProps {
  visible: boolean;
  onClose(): void;
  onConfirm(): void;
  title: string;
  /** Figma "Hesabı sil": mesajın üstündə Bold 16 #8C8C8C sual */
  heading?: string;
  message: string;
  /** Mesajı ⚠️ işarəsi ilə xəbərdarlıq kimi göstər */
  warning?: boolean;
  items?: string[];
  confirmText: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
}

export function ConfirmSheet({
  visible, onClose, onConfirm, title, heading, message, warning, items, confirmText, cancelText = 'Ləğv et', danger, loading,
}: ConfirmProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {heading ? (
        <AppText variant="bodyBold" color={colors.textMuted} style={styles.heading}>
          {heading}
        </AppText>
      ) : null}
      {warning ? (
        <View style={styles.warningRow}>
          <AppText variant="body" color={colors.textMuted}>⚠️</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.flex}>
            {message}
          </AppText>
        </View>
      ) : (
        <AppText variant="body" color={colors.textMuted}>
          {message}
        </AppText>
      )}
      {items?.map((item) => (
        <AppText key={item} variant="body" color={colors.textMuted}>
          {item}
        </AppText>
      ))}
      <View style={styles.actions}>
        <Button title={cancelText} variant="outline" size="lg" onPress={onClose} style={styles.flex} />
        <Button
          title={confirmText}
          variant={danger ? 'danger' : 'primary'}
          onPress={onConfirm}
          loading={loading}
          style={styles.flex}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  headerSide: { width: 28 },
  headerRight: { alignItems: 'flex-end' },
  headerCenter: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: colors.divider },
  content: { flexShrink: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, gap: 12 },
  actions: { flexDirection: 'row', gap: 12, paddingTop: 12 },
  // Figma: xəttdən 24 aşağı, sual ilə mətn arası 6
  heading: { marginTop: 8, marginBottom: -6 },
  warningRow: { flexDirection: 'row', gap: 4 },
});
