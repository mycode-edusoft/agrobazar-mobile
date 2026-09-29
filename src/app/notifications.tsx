import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AppText, BottomSheet, Button, IconButton, Pill, Screen, ScreenHeader, useToast,
} from '@/components/ui';
import { t } from '@/i18n/az';
import { formatDate, localDayKey } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii, shadows } from '@/theme';
import type { AppNotification, NotificationKind, NotificationSort } from '@/types/domain';

const sortOptions: { value: NotificationSort; label: string }[] = [
  { value: 'newest', label: t.notifications.sortNewest },
  { value: 'oldest', label: t.notifications.sortOldest },
  { value: 'read', label: t.notifications.sortRead },
  { value: 'unread', label: t.notifications.sortUnread },
];

const icons: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  vip: 'notifications',
  premium: 'diamond',
  listing: 'document-text',
  payment: 'card',
  system: 'information-circle',
};

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
            <AppText variant="smallMedium" color={colors.textSecondary}>
              {section.title}
            </AppText>
            <View style={styles.sectionLine} />
          </View>
        )}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => open(item)} onDelete={() => remove(item.id)} />
        )}
        ListEmptyComponent={
          list.isLoading ? null : (
            <View style={styles.empty}>
              <Ionicons name="chatbox-ellipses-outline" size={64} color={colors.textPlaceholder} />
              <AppText variant="bodyBold" color={colors.textSecondary} center>
                {t.notifications.emptyTitle}
              </AppText>
              <AppText variant="small" color={colors.textMuted} center>
                {t.notifications.emptyHint}
              </AppText>
            </View>
          )
        }
      />

      <BottomSheet visible={sortOpen} onClose={() => setSortOpen(false)} title={t.notifications.sort}>
        <View style={styles.chips}>
          {sortOptions.map((o) => (
            <Pill key={o.value} label={o.label} active={draftSort === o.value} onPress={() => setDraftSort(o.value)} style={styles.chip} />
          ))}
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
        <AppText variant="body" color={colors.textSecondary}>
          {detail?.body}
        </AppText>
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
          <Ionicons name="trash-outline" size={26} color={colors.surface} />
        </Pressable>
      )}
    >
      <Pressable onPress={onPress} style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={icons[item.kind]} size={22} color={colors.primary} />
          {!item.read ? <View style={styles.dot} /> : null}
        </View>
        <View style={styles.rowBody}>
          <AppText variant="smallMedium" numberOfLines={1}>
            {item.title}
          </AppText>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={2}>
            {item.body}
          </AppText>
        </View>
        <AppText variant="caption" color={colors.textMuted} style={styles.time}>
          {new Date(item.createdAt).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}
        </AppText>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: 16, gap: 8 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: layout.screenPadding, paddingTop: 12, paddingBottom: 6,
  },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.divider },

  row: {
    marginHorizontal: layout.screenPadding, minHeight: 88, backgroundColor: colors.surface,
    borderRadius: radii.sm, paddingVertical: 12, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 12, ...shadows.card,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    position: 'absolute', right: -2, bottom: -2, width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.surface,
  },
  rowBody: { flex: 1, gap: 4 },
  time: { lineHeight: 16 },

  deleteAction: {
    width: 88, marginRight: layout.screenPadding, backgroundColor: colors.danger,
    borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center',
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 8 },
  chip: { paddingHorizontal: 12, borderWidth: 1, borderColor: colors.divider },

  empty: { alignItems: 'center', gap: 8, paddingTop: 120, paddingHorizontal: 40 },
});
