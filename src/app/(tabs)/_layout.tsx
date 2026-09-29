import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { CenterActionButton, TabBarContainer, TabButton } from '@/components/navigation/TabBar';
import { t } from '@/i18n/az';
import { useAuthGate } from '@/lib/authGate';
import { useFavoritesStore } from '@/store/favorites';

export default function TabsLayout() {
  const router = useRouter();
  const gate = useAuthGate();
  const favCount = useFavoritesStore((s) => s.listingIds.size);

  return (
    <Tabs>
      <TabSlot />
      <TabBarContainer>
        <TabTrigger name="home" asChild>
          <TabButton label={t.tabs.home} icon="home-outline" iconActive="home" />
        </TabTrigger>
        <TabTrigger name="stores" asChild>
          <TabButton label={t.tabs.stores} icon="storefront-outline" iconActive="storefront" />
        </TabTrigger>
        <CenterActionButton
          label={t.tabs.newListing}
          onPress={() => gate('/listing/create', () => router.push('/listing/create'))}
        />
        <TabTrigger name="favorites" asChild>
          <TabButton label={t.tabs.favorites} icon="heart-outline" iconActive="heart" badge={favCount} />
        </TabTrigger>
        <TabTrigger name="cabinet" asChild>
          <TabButton label={t.tabs.cabinet} icon="person-outline" iconActive="person" />
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

const styles = StyleSheet.create({ hidden: { display: 'none' } });
