import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CategoryIcon } from '@/components/listing/CategoryIcon';
import { PickerList } from '@/components/listing/PickerList';
import { AppText, Button, Card, Screen, ScreenHeader } from '@/components/ui';
import { t } from '@/i18n/az';
import { useCategories, useEntitlements } from '@/lib/queries';
import { useAuthStore } from '@/store/auth';
import { useListingDraft } from '@/store/listingDraft';
import { colors, layout } from '@/theme';

export default function CreateListingCategoryScreen() {
  const router = useRouter();
  const loggedIn = useAuthStore((s) => s.token != null);
  const { data: categories } = useCategories();
  const ent = useEntitlements();
  const setCategory = useListingDraft((s) => s.setCategory);
  const editingId = useListingDraft((s) => s.editingId);
  const start = useListingDraft((s) => s.start);

  useEffect(() => {
    if (!loggedIn) router.replace({ pathname: '/auth/phone', params: { returnTo: '/listing/create' } });
  }, [loggedIn, router]);

  useEffect(() => {
    if (!editingId) start();
  }, [editingId, start]);

  if (ent.data && !ent.data.canPostListing && ent.data.blockReason) {
    const reason = ent.data.blockReason;
    return (
      <Screen header={<ScreenHeader title={t.createListing.title} />} padded>
        <Card style={styles.blocked}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textPlaceholder} />
          <AppText variant="body" color={colors.textSecondary} center>
            {t.createListing.blocked[reason]}
          </AppText>
          {reason === 'profile_incomplete' ? (
            <Button title={t.auth.completeTitle} onPress={() => router.push({ pathname: '/auth/complete-profile', params: { returnTo: '/listing/create' } })} style={styles.stretch} />
          ) : (
            <Button title={t.cabinet.plans} onPress={() => router.push('/cabinet/plans')} style={styles.stretch} />
          )}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen header={<ScreenHeader title={t.createListing.selectCategory} />}>
      <PickerList
        items={(categories ?? []).map((c) => ({ id: c.id, name: c.name, icon: <CategoryIcon icon={c.icon} imageUrl={c.imageUrl} size={36} /> }))}
        searchPlaceholder={t.catalog.searchCategory}
        onSelect={(item) => {
          setCategory(item.id);
          router.push({ pathname: '/listing/create/subcategory', params: { categoryId: item.id } });
        }}
      />
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  blocked: { alignItems: 'center', gap: 16, paddingVertical: 40, marginTop: 16 },
  stretch: { alignSelf: 'stretch' },
  spacer: { height: layout.screenPadding },
});
