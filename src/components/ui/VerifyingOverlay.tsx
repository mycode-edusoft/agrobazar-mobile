import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { colors, radii } from '@/theme';
import { AppText } from './AppText';

export function VerifyingOverlay({ visible, title, hint }: { visible: boolean; title: string; hint: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodyMedium" center>
            {title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} center>
            {hint}
          </AppText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 24, gap: 12, alignItems: 'center', width: '100%' },
});
