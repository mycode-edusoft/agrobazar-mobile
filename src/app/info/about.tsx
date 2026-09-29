import { StyleSheet, View } from 'react-native';
import { AppText, Card, Divider, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { aboutSections } from '@/i18n/legal';
import { colors, layout } from '@/theme';

export default function AboutScreen() {
  return (
    <Screen header={<ScreenHeader title={t.info.about} />} scroll padded>
      <Card flat style={styles.card}>
        {aboutSections.map((s, i) => (
          <View key={s.title} style={styles.section}>
            <AppText variant="bodyMedium" color="rgba(0,0,0,0.85)">
              {s.title}
            </AppText>
            <Divider />
            <AppText variant="small" color="rgba(0,0,0,0.45)">
              {s.body}
            </AppText>
            {i < aboutSections.length - 1 ? <View style={styles.gap} /> : null}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16, marginBottom: layout.screenPadding, gap: 12, backgroundColor: colors.surface },
  section: { gap: 12 },
  gap: { height: 4 },
});
