import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon } from '@/components/icons/Icon';
import { AppText, BottomSheet } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, typography } from '@/theme';

interface Props {
  visible: boolean;
  onClose(): void;
  regions: string[];
  value: string | null;
  onSelect(region: string): void;
}

/**
 * Figma "Filter → Bölgə" alt paneli: başlıq + ×, xətt, axtarış (yazanda × təmizləmə),
 * siyahı (aralar 32), seçilmiş bölgənin yanında yaşıl ✓. Toxunmaq seçir və paneli bağlayır.
 */
export function RegionSheet({ visible, onClose, regions, value, onSelect }: Props) {
  const [q, setQ] = useState('');
  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? regions.filter((r) => r.toLowerCase().includes(needle)) : regions;
  }, [regions, q]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.filter.region} height="85%">
      <View style={styles.search}>
        <Icon name="search" size={18} color={colors.textMuted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder={t.common.search}
          placeholderTextColor={colors.textPlaceholder}
          style={styles.input}
        />
        {q ? (
          <Pressable onPress={() => setQ('')} hitSlop={8} accessibilityLabel={t.common.close}>
            <Icon name="cancel" size={24} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(r) => r}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => {
              onSelect(item);
              setQ('');
              onClose();
            }}
          >
            <AppText style={styles.rowText}>{item}</AppText>
            {item === value ? <SelectedMark /> : null}
          </Pressable>
        )}
      />
    </BottomSheet>
  );
}

// Figma "Select": 16px yaşıl dairə, ağ ✓
function SelectedMark() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={8} fill={colors.primary} />
      <Path d="M4.6 8.2l2.2 2.2 4.6-4.6" stroke="#FFFFFF" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 38, borderRadius: 8, backgroundColor: colors.inputBackgroundEmpty, borderWidth: 1, borderColor: colors.divider,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16,
  },
  input: { flex: 1, ...typography.body, color: colors.textSecondary, padding: 0 },
  // Figma: siyahı yuxarıdan 8, sətirlər arası 32
  list: { paddingTop: 8, paddingBottom: 24, gap: 32 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 24 },
  rowText: { flex: 1, ...typography.body, color: colors.textSecondary },
});
