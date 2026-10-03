import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppText, BottomSheet, Button, IconButton, Screen, ScreenHeader, useToast,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDate, localDayKey } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii, shadows, typography } from '@/theme';
import type { AppNotification, NotificationKind, NotificationSort } from '@/types/domain';

const sortOptions: { value: NotificationSort; label: string }[] = [
  { value: 'newest', label: t.notifications.sortNewest },
  { value: 'oldest', label: t.notifications.sortOldest },
  { value: 'read', label: t.notifications.sortRead },
  { value: 'unread', label: t.notifications.sortUnread },
];

// Figma-da bütün növlər üçün yaşıl kontur zəng çəkilib; digər növlər üçün eyni üslubda kontur ikonlar
const icons: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  vip: 'notifications-outline',
  premium: 'diamond-outline',
  listing: 'document-text-outline',
  payment: 'card-outline',
  system: 'information-circle-outline',
};

// Figma "Bildirişlər" rəngləri
const SECTION_LINE = '#ECEDF2';
const BODY = '#7C7C7C';
const TIME = '#3D3D3D';
const UNREAD = '#22C55E';
const DELETE_RED = '#E1260D';

export default function NotificationsScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const loggedIn = useAuthStore((s) => s.token != null);
  const [sort, setSort] = useState<NotificationSort>('newest');
  const [draftSort, setDraftSort] = useState<NotificationSort>('newest');
  const [sortOpen, setSortOpen] = useState(false);
  const [detail, setDetail] = useState<AppNotification | null>(null);

  const list = useQuery({
    queryKey: qk.notifications(sort),
    queryFn: () => api.notifications.list(sort),
    enabled: loggedIn,
  });

  const sections = useMemo(() => {
    const groups = new Map<string, AppNotification[]>();
    for (const n of list.data ?? []) {
      const key = localDayKey(n.createdAt);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(n);
    }
    const today = localDayKey(new Date());
    return [...groups.entries()].map(([key, data]) => ({
      key,
      title: key === today ? t.notifications.today : formatDate(data[0].createdAt),
      data,
    }));
  }, [list.data]);

  const refresh = () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['notifications'] }),
      qc.invalidateQueries({ queryKey: qk.unreadCount }),
    ]);

  const open = async (n: AppNotification) => {
    if (!n.read) {
      await api.notifications.markRead(n.id).catch(() => undefined);
      await refresh();
    }
    if (n.listingId) router.push({ pathname: '/listing/[id]', params: { id: n.listingId } });
    else setDetail(n);
  };

  const remove = async (id: string) => {
    try {
      await api.notifications.remove(id);
      await refresh();
    } catch {
      toast(t.common.error, 'error');
    }
  };

  return (
    <Screen
      header={
        <ScreenHeader
          title={t.notifications.title}
          right={
            <IconButton
              onPress={() => {
                setDraftSort(sort);
                setSortOpen(true);
              }}
              accessibilityLabel={t.notifications.sort}
            >
              <Ionicons name="swap-vertical" size={16} color={colors.textMuted} />
            </IconButton>
          }
        />
      }
    >
      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        refreshing={list.isRefetching}
        onRefresh={() => list.refetch()}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle}>{section.title}</AppText>
            <View style={styles.sectionLine} />
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => open(item)} onDelete={() => remove(item.id)} />
        )}
        ListEmptyComponent={
          list.isLoading ? null : (
            // Figma "No Notifications": 96px ikon sahəsi (58px boz söhbət ikonu), Bold 16 başlıq, 16/22 #797979 izah
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="chatbox-ellipses-outline" size={58} color={colors.textPlaceholder} />
              </View>
              <View style={styles.emptyText}>
                <AppText style={styles.emptyTitle}>{t.notifications.emptyTitle}</AppText>
                <AppText style={styles.emptyHint}>{t.notifications.emptyHint}</AppText>
              </View>
            </View>
          )
        }
      />

      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title={t.notifications.sort}>
        {/* Figma "Sıralama": #F5F5F5 çiplər (radius 8, 8×12, 14/22 #595959), seçilmiş yaşıl fonda ağ mətn */}
        <View style={styles.chips}>
          {sortOptions.map((o) => {
            const active = draftSort === o.value;
            return (
              <Pressable
                key={o.value}
                onPress={() => setDraftSort(o.value)}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
              >
                <AppText style={[styles.chipText, active && styles.chipTextActive]}>{o.label}</AppText>
              </Pressable>
            );
          })}
        </View>
        <Button
          title={t.notifications.apply}
          onPress={() => {
            setSort(draftSort);
            setSortOpen(false);
          }}
        />
      </BottomSheet>

      <BottomSheet visible={detail != null} onClose={() => setDetail(null)} title={detail?.title ?? ''}>
        <AppText style={styles.detailBody}>{detail?.body}</AppText>
        <Button title={t.notifications.understood} onPress={() => setDetail(null)} />
      </BottomSheet>
    </Screen>
  );
}

function NotificationRow({
  item, onPress, onDelete,
}: { item: AppNotification; onPress(): void; onDelete(): void }) {
  return (
    <Swipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable onPress={onDelete} style={styles.deleteAction} accessibilityLabel={t.common.delete}>
          <Ionicons name="trash-outline" size={28} color={colors.surface} />
        </Pressable>
      )}
    >
      <Pressable onPress={onPress} style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={icons[item.kind]} size={20} color={colors.primary} />
          {!item.read ? <View style={styles.dot} /> : null}
        </View>
        <View style={styles.rowBody}>
          {item.title ? (
            <AppText style={styles.rowTitle} numberOfLines={1}>
              {item.title}
            </AppText>
          ) : null}
          <AppText style={styles.rowText} numberOfLines={2}>
            {item.body}
          </AppText>
        </View>
        <AppText style={styles.time}>
          {new Date(item.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 24, gap: 8 },
  // Figma: "Bugün" / tarix SemiBold 14/24 #595959 + #ECEDF2 xətt; bölmələr arası 16
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: layout.screenPadding, paddingTop: 8, paddingBottom: 8,
  },
  sectionTitle: { ...typography.smallMedium, fontWeight: '600', lineHeight: 24, letterSpacing: 0.28, color: colors.textSecondary },
  sectionLine: { flex: 1, height: 1, backgroundColor: SECTION_LINE },

  // Figma "Snackbar but Cooler": ağ kart radius 14, kölgə, 12×16; 48px dairəvi #F5F5F5 ikon
  row: {
    marginHorizontal: layout.screenPadding, backgroundColor: colors.surface,
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, ...shadows.card,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center',
  },
  // Oxunmamış: ikonun sağ altında 10px #22C55E nöqtə
  dot: { position: 'absolute', right: 1, bottom: 3, width: 10, height: 10, borderRadius: 5, backgroundColor: UNREAD },
  rowBody: { flex: 1, gap: 4 },
  rowTitle: { ...typography.smallMedium, fontFamily: typography.bodyBold.fontFamily, lineHeight: 20, color: '#000000' },
  rowText: { ...typography.small, lineHeight: 20, color: BODY },
  time: { ...typography.caption, fontFamily: typography.smallMedium.fontFamily, fontWeight: '600', lineHeight: 14, color: TIME },

  // Figma "swipe to delete": #E1260D, sağ küncləri yuvarlaq, 28px ağ zibil qutusu
  deleteAction: {
    width: 88, marginRight: layout.screenPadding, marginLeft: -14, paddingLeft: 14, backgroundColor: DELETE_RED,
    borderTopRightRadius: 8, borderBottomRightRadius: 8, alignItems: 'center', justifyContent: 'center',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingBottom: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radii.sm, backgroundColor: colors.inputBackgroundEmpty },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.small, lineHeight: 22, color: colors.textSecondary },
  chipTextActive: { color: colors.surface },
  detailBody: { ...typography.small, lineHeight: 20, color: BODY },

  empty: { alignItems: 'center', gap: 20, paddingTop: 166, paddingHorizontal: 32 },
  emptyIcon: { width: 96, height: 96, alignItems: 'center', justifyContent: 'center' },
  emptyText: { alignItems: 'center', gap: 12 },
  emptyTitle: { ...typography.bodyBold, lineHeight: 19, letterSpacing: -0.24, color: '#000000', textAlign: 'center' },
  emptyHint: { ...typography.body, lineHeight: 22, letterSpacing: -0.24, color: '#797979', textAlign: 'center' },
});
