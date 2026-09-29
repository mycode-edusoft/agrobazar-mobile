import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { AppText, Card, Divider, Pill, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { legalDocuments } from '@/i18n/legal';
import { colors, layout } from '@/theme';

type Tab = keyof typeof legalDocuments;
const tabs: Tab[] = ['agreement', 'listing', 'paid', 'balance'];

export default function RulesScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>((tabs.includes(params.tab as Tab) ? params.tab : 'agreement') as Tab);
  const [open, setOpen] = useState<number | null>(2);
  const doc = legalDocuments[tab];

  return (
    <Screen header={<ScreenHeader title={t.info.rules} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsWrap} contentContainerStyle={styles.tabs}>
        {tabs.map((k) => (
          <Pill
            key={k}
            label={t.info.rulesTabs[k]}
            active={tab === k}
            onPress={() => {
              setTab(k);
              setOpen(null);
            }}
          />
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card flat style={styles.card}>
          <AppText variant="bodyMedium" color="rgba(0,0,0,0.85)">
            {doc.title}
          </AppText>
          <Divider />
          <AppText variant="small" color="rgba(0,0,0,0.65)">
            {doc.intro}
          </AppText>
          {doc.sections.map((s, i) => {
            const expanded = open === i;
            return (
              <View key={s.title}>
                <Pressable onPress={() => setOpen(expanded ? null : i)} style={styles.accHeader}>
                  <AppText variant="smallMedium" color={colors.textSecondary} style={styles.flex}>
                    {i + 1}. {s.title}
                  </AppText>
                  <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
                </Pressable>
                {expanded ? (
                  <AppText variant="small" color="rgba(0,0,0,0.45)" style={styles.accBody}>
                    {s.body}
                  </AppText>
                ) : null}
                <Divider />
              </View>
            );
          })}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabsWrap: { flexGrow: 0, backgroundColor: colors.surface },
  tabs: { paddingHorizontal: layout.screenPadding, paddingVertical: 12, gap: 8 },
  content: { padding: layout.screenPadding },
  card: { gap: 12 },
  accHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  accBody: { paddingBottom: 10 },
});
