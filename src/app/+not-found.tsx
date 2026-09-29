import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { AppText, Button, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors } from '@/theme';

export default function NotFound() {
  return (
    <Screen header={<ScreenHeader title={t.common.pageNotFound} />} padded>
      <View style={styles.body}>
        <AppText variant="body" color={colors.textMuted} center>
          {t.common.pageNotFound}
        </AppText>
        <Link href="/" asChild>
          <Button title={t.tabs.home} />
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ body: { flex: 1, justifyContent: 'center', gap: 16 } });
