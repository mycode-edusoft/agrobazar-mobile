import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { AppText, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { LEGAL_TABS, legalDocuments, type LegalTab } from '@/i18n/legal';
import { colors, layout, shadows, typography } from '@/theme';

/**
 * Figma "Qaydalar": ağ zolaqda sənəd tabları (aqrobazar.com/qaydalar ilə eyni 8 sənəd) (aktiv — yaşıl, digərləri ağ fonda boz mətn),
 * altında sənəd kartı: başlıq, giriş mətni və "+ / −" ilə açılan nömrəli bölmələr.
 */
export default function RulesScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const initial = (LEGAL_TABS as readonly string[]).includes(params.tab ?? '') ? (params.tab as LegalTab) : 'agreement';
  const [tab, setTab] = useState<LegalTab>(initial);
  const [open, setOpen] = useState<number | null>(null);
  const tabsRef = useRef<ScrollView>(null);
  const tabX = useRef<Partial<Record<LegalTab, number>>>({});
  // Başqa ekrandan konkret tabla açılanda (məs. Məxfilik siyasəti) həmin tab görünən sahəyə bir dəfə sürüşdürülür
  const scrolledInitial = useRef(initial === 'agreement');
  const doc = legalDocuments[tab];

  const select = (k: LegalTab) => {
    setTab(k);
    setOpen(null);
    tabsRef.current?.scrollTo({ x: Math.max(0, (tabX.current[k] ?? 0) - layout.screenPadding), animated: true });
  };

  return (
    <Screen header={<ScreenHeader title={t.info.rules} />}>
      <ScrollView
        ref={tabsRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrap}
        contentContainerStyle={styles.tabs}
        onContentSizeChange={() => {
          if (scrolledInitial.current) return;
          scrolledInitial.current = true;
          select(initial);
        }}
      >
        {LEGAL_TABS.map((k) => (
          <Pressable
            key={k}
            onLayout={(e) => (tabX.current[k] = e.nativeEvent.layout.x)}
            onPress={() => select(k)}
            style={[styles.tab, tab === k && styles.tabActive]}
          >
            <AppText variant="smallMedium" color={tab === k ? colors.surface : colors.textPlaceholder}>
              {t.info.rulesTabs[k]}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <AppText variant="bodyMedium" color={colors.text}>
            {doc.title}
          </AppText>
          <LegalText text={doc.intro} />
          {doc.sections.length > 0 ? (
            <View>
              {doc.sections.map((s, i) => {
                const expanded = open === i;
                return (
                  <View key={s.title} style={styles.section}>
                    <Pressable onPress={() => setOpen(expanded ? null : i)} style={styles.accHeader} accessibilityState={{ expanded }}>
                      <AppText variant="smallMedium" color={colors.text} style={styles.flex}>
                        {s.title}
                      </AppText>
                      <Ionicons name={expanded ? 'remove' : 'add'} size={20} color={colors.textMuted} />
                    </Pressable>
                    {expanded ? (
                      <View style={styles.accBody}>
                        <LegalText text={s.body} />
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

// Sayt mətni: "## " ilə başlayan sətir alt başlıqdır (məs. Ödənişli xidmətlərdəki suallar), boş sətir yeni paraqrafdır
function LegalText({ text }: { text: string }) {
  const blocks: { heading?: string; lines: string[] }[] = [{ lines: [] }];
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) blocks.push({ heading: line.slice(3), lines: [] });
    else if (line === '') blocks.push({ lines: [] });
    else blocks[blocks.length - 1].lines.push(line);
  }
  return (
    <View style={styles.legal}>
      {blocks.map((b, i) =>
        b.heading || b.lines.length ? (
          <View key={i}>
            {b.heading ? (
              <AppText variant="smallMedium" color={colors.text}>
                {b.heading}
              </AppText>
            ) : null}
            {b.lines.length ? <AppText style={styles.text}>{b.lines.join('\n')}</AppText> : null}
          </View>
        ) : null,
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Figma "List FAQ": ağ zolaq, padding 16, aralıq 12; çip padding 4 8, radius 8, 14/22 Medium
  tabsWrap: { flexGrow: 0, flexShrink: 0, backgroundColor: colors.surface },
  tabs: { padding: layout.screenPadding, gap: 12 },
  tab: { height: 30, paddingHorizontal: 8, borderRadius: 8, justifyContent: 'center', backgroundColor: colors.surface },
  tabActive: { backgroundColor: colors.primary },
  content: { padding: layout.screenPadding, paddingBottom: 32 },
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 16, ...shadows.card },
  text: { ...typography.small, lineHeight: 22, color: colors.textMuted },
  section: { borderTopWidth: 1, borderTopColor: colors.divider },
  accHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  accBody: { paddingBottom: 12 },
  legal: { gap: 12 },
});
