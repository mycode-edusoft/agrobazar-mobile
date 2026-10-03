import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, typography } from '@/theme';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const ROW = 28;

/**
 * Figma "Picker-Dropdown/Time": ağ pop-over (radius 8, kölgə), saat və dəqiqə sütunları,
 * seçilmiş sətir #EBFFF0, altda yaşıl "Ok". Ekranın ortasında açılır.
 */
export function TimePicker({
  visible, value, onClose, onSelect,
}: { visible: boolean; value: string; onClose(): void; onSelect(v: string): void }) {
  const [h, setH] = useState('09');
  const [m, setM] = useState('00');

  useEffect(() => {
    if (!visible) return;
    const [vh, vm] = value.split(':');
    setH(vh ?? '09');
    setM(vm ?? '00');
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.popover} onPress={() => undefined}>
          <View style={styles.body}>
            <Column items={HOURS} value={h} onChange={setH} />
            <Column items={MINUTES} value={m} onChange={setM} />
          </View>
          <View style={styles.footer}>
            <Pressable
              onPress={() => {
                onSelect(`${h}:${m}`);
                onClose();
              }}
              style={styles.ok}
            >
              <AppText style={styles.okText}>{t.createStore.ok}</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Column({ items, value, onChange }: { items: string[]; value: string; onChange(v: string): void }) {
  const ref = useRef<FlatList<string>>(null);
  const index = Math.max(0, items.indexOf(value));
  return (
    <FlatList
      ref={ref}
      data={items}
      keyExtractor={(i) => i}
      style={styles.column}
      contentContainerStyle={styles.columnContent}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={index}
      getItemLayout={(_, i) => ({ length: ROW, offset: ROW * i, index: i })}
      renderItem={({ item }) => (
        <Pressable onPress={() => onChange(item)} style={[styles.item, item === value && styles.itemActive]}>
          <AppText style={styles.itemText}>{item}</AppText>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', alignItems: 'center', justifyContent: 'center' },
  popover: {
    width: 200, backgroundColor: colors.surface, borderRadius: 8, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  body: { flexDirection: 'row', height: 226 },
  column: { flex: 1 },
  columnContent: { alignItems: 'center', paddingTop: 4, paddingBottom: 2 },
  item: { width: 64, height: ROW, borderRadius: 4, justifyContent: 'center', paddingLeft: 18 },
  itemActive: { backgroundColor: '#EBFFF0' },
  itemText: { ...typography.small, lineHeight: 22, color: 'rgba(0, 0, 0, 0.85)' },
  footer: { borderTopWidth: 1, borderTopColor: colors.divider, paddingVertical: 9, paddingHorizontal: 12, alignItems: 'flex-end' },
  ok: { height: 26, paddingHorizontal: 10, borderRadius: 4, backgroundColor: colors.primary, justifyContent: 'center' },
  okText: { ...typography.small, lineHeight: 22, color: colors.surface },
});
