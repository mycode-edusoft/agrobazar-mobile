import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { CenterActionButton, TabBarContainer, TabButton } from '@/components/navigation/TabBar';
import { HeartTabIcon, HomeTabIcon, ProfileTabIcon, StoreTabIcon } from '@/components/navigation/TabIcons';
import { t } from '@/i18n/az';
import { useAuthGate } from '@/lib/authGate';
import { useFavoritesStore } from '@/store/favorites';

export default function TabsLayout() {
  const router = useRouter();
  const gate = useAuthGate();
  const favCount = useFavoritesStore((s) => s.listingIds.size);

  return (
    <Tabs style={styles.root}>
      <TabSlot style={styles.slot} />
      <TabBarContainer>
        <TabTrigger name="home" asChild>
          <TabButton label={t.tabs.home} Icon={HomeTabIcon} />
        </TabTrigger>
        <TabTrigger name="stores" asChild>
          <TabButton label={t.tabs.stores} Icon={StoreTabIcon} />
        </TabTrigger>
        <CenterActionButton
          label={t.tabs.newListing}
          onPress={() => gate('/listing/create', () => router.push('/listing/create'))}
        />
        <TabTrigger name="favorites" asChild>
          <TabButton label={t.tabs.favorites} Icon={HeartTabIcon} badge={favCount} />
        </TabTrigger>
        <TabTrigger name="cabinet" asChild>
          <TabButton label={t.tabs.cabinet} Icon={ProfileTabIcon} />
        </TabTrigger>
      </TabBarContainer>
      <TabList style={styles.hidden}>
        <TabTrigger name="home" href="/" />
        <TabTrigger name="stores" href="/stores" />
        <TabTrigger name="favorites" href="/favorites" />
        <TabTrigger name="cabinet" href="/cabinet" />
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // TabSlot standart olaraq flexShrink: 0-dır — web-də ekran məzmunu tab bar-ı görünən sahədən kənara itələyir
  slot: { flexShrink: 1, minHeight: 0 },
  hidden: { display: 'none' },
});
