import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { CirclePlusIcon } from '@/components/icons/BadgeIcons';
import { Icon } from '@/components/icons/Icon';
import { AppText, EmptyState, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount, formatDayHeading, formatTxTime, localDayKey } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, shadows, typography } from '@/theme';
import type { Transaction } from '@/types/domain';

/**
 * Figma "Balans": mərkəzdə məbləğ (Inter 29 SemiBold) + "Balans artır", altında tam enli ağ panel —
 * günlərə görə qruplanmış əməliyyatlar (Məxaric / Mədaxil / Xəta).
 */
export default function BalanceScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const tx = useQuery({ queryKey: qk.transactions, queryFn: () => api.balance.transactions(), enabled: !!user });

  const sections = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const item of tx.data ?? []) {
      const key = localDayKey(item.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([key, data]) => ({ key, title: formatDayHeading(data[0].createdAt), data }));
  }, [tx.data]);

  return (
    <Screen header={<ScreenHeader title={t.balance.title} />}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={tx.isRefetching} onRefresh={() => tx.refetch()} tintColor={colors.primary} />}
      >
        <View style={styles.summary}>
          <AppText style={styles.amount}>{formatAmount(user?.balance ?? 0)}</AppText>
          <Pressable onPress={() => router.push('/cabinet/balance/top-up')} style={styles.topUp}>
            <CirclePlusIcon size={18} bg={colors.primary} />
            <AppText variant="bodyMedium" color={colors.surface}>
              {t.cabinet.topUpBalance}
            </AppText>
          </Pressable>
        </View>

        <View style={styles.panel}>
          {sections.length === 0 && !tx.isLoading ? <EmptyState text={t.balance.empty} icon="receipt-outline" /> : null}
          {sections.map((s) => (
            <View key={s.key}>
              <AppText variant="bodyBold" color={colors.textSecondary} style={styles.heading}>
                {s.title}
              </AppText>
              {s.data.map((item) => (
                <TransactionRow key={item.id} item={item} />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

// Figma "placeholder": 60px sətir, 40px boz dairədə kart ikonu, aralıq 24, ayırıcı yalnız mətn sütununun altında
function TransactionRow({ item }: { item: Transaction }) {
  const failed = item.status === 'failed';
  const pending = item.status === 'pending';
  const income = item.direction === 'in';
  const amountColor = failed ? colors.error : income ? colors.success : '#1F2937';
  const sign = failed || pending ? '' : income ? '+' : '-';
  const label = failed ? t.balance.failed : pending ? t.balance.pending : income ? t.balance.in : t.balance.out;

  return (
    <View style={styles.row}>
      <View style={styles.icon}>
        <Icon name="bankCard" size={22} color={failed ? '#DC0812' : colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowText}>
          <View style={styles.flex}>
            <AppText style={styles.title} numberOfLines={1}>
              {item.title}
            </AppText>
            <AppText style={styles.sub}>{formatTxTime(item.createdAt)}</AppText>
          </View>
          <View style={styles.right}>
            <View style={styles.amountRow}>
              {failed ? <Ionicons name="ban" size={12} color={colors.error} /> : null}
              <AppText style={[styles.title, { color: amountColor }]}>
                {sign}{formatAmount(item.amount)}
              </AppText>
            </View>
            <AppText style={[styles.sub, styles.label, failed && { color: colors.error }]}>{label}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingTop: 42 },
  summary: { alignItems: 'center', gap: 16, paddingHorizontal: 12, paddingBottom: 42 },
  amount: { fontFamily: typography.tabLabelActive.fontFamily, fontSize: 29, lineHeight: 44, letterSpacing: 0.4, color: '#181818' },
  topUp: { height: 40, paddingHorizontal: 12, borderRadius: 8, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Figma: tam enli ağ panel (radius 14, kölgə), daxili padding 16
  panel: { flexGrow: 1, backgroundColor: colors.surface, borderTopLeftRadius: 14, borderTopRightRadius: 14, paddingHorizontal: 16, paddingVertical: 16, ...shadows.card },
  heading: { paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 24, height: 60 },
  icon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.iconBackground, alignItems: 'center', justifyContent: 'center' },
  rowBody: { flex: 1, alignSelf: 'stretch', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowText: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: typography.bodyMedium.fontFamily, fontSize: 14, lineHeight: 20, letterSpacing: 0.28, color: '#000' },
  sub: { ...typography.small, fontSize: 13, lineHeight: 16, marginTop: 4, color: '#4B5563' },
  right: { alignItems: 'flex-end' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { color: '#1F2937', textAlign: 'right' },
});
