import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Card, IconButton, Screen, SearchBar } from '@/components/ui';
import { t } from '@/i18n/az';
import { api } from '@/services';
import { useFilterStore } from '@/store/filter';
import { useSearchHistory, type SearchEntry } from '@/store/searchHistory';
import { colors, layout } from '@/theme';

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
    <Screen background={colors.surface}>
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
              <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
            </IconButton>
          }
        />
      </View>

      <View style={styles.body}>
        <Card style={styles.card}>
          {!showSuggestions ? (
            <View style={styles.cardHeader}>
              <AppText variant="body" color={colors.textSecondary}>
                {t.search.history}
              </AppText>
              {entries.length > 0 ? (
                <Pressable onPress={() => clearHistory()} hitSlop={8}>
                  <AppText variant="body" color={colors.textSecondary}>
                    {t.search.clear}
                  </AppText>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <FlatList
            data={data}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item, i) => `${item.query}-${i}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              showSuggestions && !suggestions.isLoading ? (
                <AppText variant="small" color={colors.textPlaceholder} style={styles.emptyText}>
                  {t.search.noSuggestions}
                </AppText>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => run(item)} style={styles.row}>
                <View style={styles.rowText}>
                  <SuggestionText text={item.query} match={showSuggestions ? trimmed : ''} />
                  <AppText variant="small" color={colors.textPlaceholder}>
                    {item.categoryName}
                  </AppText>
                </View>
                {showSuggestions ? (
                  <Ionicons name="chevron-forward" size={20} color={colors.textPlaceholder} />
                ) : (
                  <Pressable onPress={() => removeEntry(item.query)} hitSlop={10}>
                    <Ionicons name="close" size={20} color={colors.textPlaceholder} />
                  </Pressable>
                )}
              </Pressable>
            )}
          />
        </Card>
      </View>
    </Screen>
  );
}

// Uyğun gələn hissə adi, qalan hissə qalın — Figma-dakı "gübrə|lər" görünüşü
function SuggestionText({ text, match }: { text: string; match: string }) {
  const index = match ? text.toLowerCase().indexOf(match.toLowerCase()) : -1;
  if (index < 0) {
    return (
      <AppText variant="body" color={colors.textSecondary}>
        {text}
      </AppText>
    );
  }
  return (
    <AppText variant="body" color={colors.textSecondary}>
      {text.slice(0, index + match.length)}
      <AppText variant="bodyBold" color={colors.text}>
        {text.slice(index + match.length)}
      </AppText>
    </AppText>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: layout.screenPadding, paddingVertical: 12, backgroundColor: colors.surface },
  body: { flex: 1, backgroundColor: colors.background, padding: layout.screenPadding },
  card: { paddingVertical: 8, maxHeight: '100%' },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingBottom: 12, paddingTop: 4,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowText: { flex: 1, gap: 2 },
  separator: { height: 1, backgroundColor: colors.divider },
  emptyText: { paddingVertical: 16 },
});
