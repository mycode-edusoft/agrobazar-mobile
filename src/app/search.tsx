import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, IconButton, Screen, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { api } from '@/services';
import { useFilterStore } from '@/store/filter';
import { useSearchHistory, type SearchEntry } from '@/store/searchHistory';
import { colors, layout, shadows, typography } from '@/theme';
import { Icon } from '@/components/icons/Icon';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const entries = useSearchHistory((s) => s.entries);
  const hydrate = useSearchHistory((s) => s.hydrate);
  const addEntry = useSearchHistory((s) => s.add);
  const removeEntry = useSearchHistory((s) => s.remove);
  const clearHistory = useSearchHistory((s) => s.clear);
  const setFilter = useFilterStore((s) => s.set);
  const reset = useFilterStore((s) => s.reset);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const trimmed = query.trim();
  const suggestions = useQuery({
    queryKey: ['suggestions', trimmed],
    queryFn: () => api.catalog.suggestions(trimmed),
    enabled: trimmed.length > 0,
  });

  const run = (entry: SearchEntry) => {
    addEntry(entry);
    reset({ categoryId: entry.categoryId ?? undefined });
    setFilter({ query: entry.query });
    router.replace({ pathname: '/catalog/[categoryId]', params: { categoryId: entry.categoryId ?? 'all' } });
  };

  const showSuggestions = trimmed.length > 0;
  const data: SearchEntry[] = showSuggestions ? suggestions.data ?? [] : entries;

  return (
    <Screen background={colors.background}>
      {/* Figma "Search page" (2137:29391): ağ başlıq, alt küncləri 16, altında ayırıcı xətt */}
      <View style={styles.header}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={t.search.placeholder}
          autoFocus
          onSubmit={() => trimmed && run({ query: trimmed, categoryId: null, categoryName: t.search.allCategories })}
          onFilterPress={() => router.push('/catalog/filter')}
          left={
            <IconButton onPress={() => router.back()} accessibilityLabel={t.common.back}>
              <Icon name="chevron" direction="left" size={20} color={colors.textMuted} />
            </IconButton>
          }
        />
        <View style={styles.headerLine} />
      </View>

      <View style={styles.body}>
        <View style={styles.card}>
          {!showSuggestions ? (
            <>
              <View style={styles.cardHeader}>
                <AppText variant="bodyLight" color={colors.textSecondary}>
                  {t.search.history}
                </AppText>
                {entries.length > 0 ? (
                  <Pressable onPress={() => clearHistory()} hitSlop={8}>
                    <AppText variant="smallMedium" color={colors.text} style={styles.clear}>
                      {t.search.clear}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
              <View style={styles.fullLine} />
            </>
          ) : null}

          <FlatList
            data={data}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, i) => `${item.query}-${i}`}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              showSuggestions && !suggestions.isLoading ? (
                <AppText variant="small" color={colors.textPlaceholder}>
                  {t.search.noSuggestions}
                </AppText>
              ) : null
            }
            renderItem={({ item, index }) => (
              <Pressable onPress={() => run(item)} style={styles.row}>
                <View style={styles.rowText}>
                  {/* Figma: bir mətn blokunda iki üslub — söz 16/20 #595959, kateqoriya 14 #BFBFBF (CSS eksportu yalnız birincisini göstərir) */}
                  <SuggestionText text={item.query} match={showSuggestions ? trimmed : ''} />
                  <AppText style={styles.rowCategory}>{item.categoryName}</AppText>
                  {/* Ayırıcı yalnız mətnin altında, sonuncu sətirdə yoxdur */}
                  {index < data.length - 1 ? <View style={styles.itemLine} /> : null}
                </View>
                {showSuggestions ? (
                  <Icon name="chevron" direction="right" size={20} color={colors.textMuted} />
                ) : (
                  <Pressable onPress={() => removeEntry(item.query)} hitSlop={10} style={styles.remove}>
                    <Icon name="cancel" size={24} color={colors.textMuted} />
                  </Pressable>
                )}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Screen>
  );
}

// Uyğun gələn hissə adi, qalan hissə qalın — Figma-dakı "gübrə|lər" görünüşü
function SuggestionText({ text, match }: { text: string; match: string }) {
  const index = match ? text.toLowerCase().indexOf(match.toLowerCase()) : -1;
  if (index < 0) return <AppText style={styles.rowLine}>{text}</AppText>;
  return (
    <AppText style={styles.rowLine}>
      {text.slice(0, index + match.length)}
      <AppText style={[styles.rowLine, styles.rowMatch]}>{text.slice(index + match.length)}</AppText>
    </AppText>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface, paddingTop: 16, paddingHorizontal: layout.screenPadding,
    borderBottomLeftRadius: 16, borderBottomRightRadius: 16, overflow: 'hidden',
  },
  headerLine: { height: 1, backgroundColor: colors.divider, marginTop: 16, marginHorizontal: -layout.screenPadding },
  body: { flex: 1, padding: layout.screenPadding },
  // Figma: ağ blok, radius 14, kölgə 0 0 14 rgba(0,0,0,.08), yuxarı-aşağı 16, bölmələr arası 16
  card: {
    maxHeight: '100%', backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, gap: 16, ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, minHeight: 28,
  },
  clear: { lineHeight: 24 },
  fullLine: { height: 1, backgroundColor: colors.divider },
  list: { paddingHorizontal: 16, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { flex: 1 },
  rowLine: { ...typography.body, lineHeight: 20, color: colors.textSecondary },
  rowCategory: { ...typography.small, lineHeight: 20, color: colors.textPlaceholder },
  rowMatch: { fontFamily: typography.bodyBold.fontFamily, color: colors.text },
  itemLine: { height: 1, backgroundColor: colors.divider, marginTop: 8 },
  remove: { width: 28, height: 32, alignItems: 'center', justifyContent: 'center' },
});
