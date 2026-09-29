import { useMemo } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AppText, Button, Card, EmptyState, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { formatAmount, formatDateTime, formatDayHeading, localDayKey } from '@/lib/format';
import { qk } from '@/lib/queries';
import { api } from '@/services';
import { useAuthStore } from '@/store/auth';
import { colors, layout, radii } from '@/theme';
import type { Transaction } from '@/types/domain';

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
      .map(([key, data]) => ({ title: formatDayHeading(data[0].createdAt), key, data }));
  }, [tx.data]);

  return (
    <Screen header={<ScreenHeader title={t.balance.title} />}>
      <SectionList
        sections={sections}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        refreshing={tx.isRefetching}
        onRefresh={() => tx.refetch()}
        ListHeaderComponent={
          <Card style={styles.balanceCard}>
            <View style={styles.balanceRow}>
              <View style={styles.bankIcon}>
                <Ionicons name="card-outline" size={28} color={colors.primary} />
              </View>
              <AppText variant="balance" style={styles.flex}>
                {formatAmount(user?.balance ?? 0)}
              </AppText>
            </View>
            <Button
              title={t.balance.topUp}
              size="sm"
              icon={<Ionicons name="add-circle-outline" size={18} color={colors.surface} />}
              onPress={() => router.push('/cabinet/balance/top-up')}
              style={styles.topUp}
            />
          </Card>
        }
        renderSectionHeader={({ section }) => (
          <AppText variant="bodyBold" color={colors.textSecondary} style={styles.sectionTitle}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => <TransactionRow item={item} />}
        ListEmptyComponent={tx.isLoading ? null : <EmptyState text={t.balance.empty} icon="receipt-outline" />}
      />
    </Screen>
  );
}

function TransactionRow({ item }: { item: Transaction }) {
  const failed = item.status === 'failed';
  const pending = item.status === 'pending';
  const income = item.direction === 'in';
  const amountColor = failed ? colors.error : income ? colors.primary : colors.text;
  const sign = failed || pending ? '' : income ? '+' : '-';
  const label = failed ? t.balance.failed : pending ? t.balance.verifying : income ? t.balance.in : t.balance.out;
  const icon: keyof typeof Ionicons.glyphMap = failed ? 'close-circle' : item.kind === 'topup' ? 'card-outline' : item.kind === 'plan' ? 'ribbon-outline' : 'diamond-outline';

  return (
    <Card flat style={styles.txRow}>
      <View style={[styles.txIcon, failed && styles.txIconFailed]}>
        <Ionicons name={icon} size={20} color={failed ? colors.error : colors.primary} />
      </View>
      <View style={styles.flex}>
        <AppText variant="smallMedium">{item.title}</AppText>
        <AppText variant="caption" color={colors.textMuted}>
          {formatDateTime(item.createdAt)}
        </AppText>
      </View>
      <View style={styles.txRight}>
        <AppText variant="smallMedium" color={amountColor}>
          {sign}{formatAmount(item.amount)}
        </AppText>
        <AppText variant="caption" color={failed ? colors.error : colors.textMuted}>
          {label}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: layout.screenPadding, gap: 8 },
  balanceCard: { gap: 12, marginBottom: 8 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIcon: { width: 48, height: 48, borderRadius: radii.sm, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  topUp: { alignSelf: 'flex-end', height: 36 },
  sectionTitle: { paddingTop: 12, paddingBottom: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  txIconFailed: { backgroundColor: '#FDECEE' },
  txRight: { alignItems: 'flex-end' },
});
