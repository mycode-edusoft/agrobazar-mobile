import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { BottomSheet, ConfirmSheet, ListRow, useToast } from '@/components/ui';
import { t } from '@/i18n/az';
import { api, ApiError } from '@/services';
import { useListingDraft } from '@/store/listingDraft';
import { colors } from '@/theme';
import type { ListingSummary } from '@/types/domain';

/**
 * Sahibin öz elanı üzərində əməliyyatlar (BRD V): redaktə, yenilə (yalnız müddəti bitmiş),
 * irəli çək (yalnız aktiv), sil (geri dönməz). Figma-da yeri olmadığı üçün kartdakı ⋮ menyusundan açılır.
 */
export function useListingActions({ onDeleted }: { onDeleted?: () => void } = {}) {
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const startDraft = useListingDraft((s) => s.start);
  const [target, setTarget] = useState<ListingSummary | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['listings', 'mine'] });

  const close = () => setTarget(null);

  const edit = async (item: { id: string }) => {
    close();
    try {
      const full = await api.listings.byId(item.id);
      startDraft(full.id, {
        categoryId: full.categoryId, subcategoryId: full.subcategoryId, subsubId: full.subsubId, type: full.type,
        price: full.price != null ? String(full.price) : '', negotiable: full.negotiable, city: full.city,
        title: full.title, contactName: full.sellerName, description: full.description, whatsapp: full.whatsapp.replace('+994', ''),
        images: full.images, videoUri: full.videoUrl,
        fields: Object.fromEntries(Object.entries(full.fields).map(([k, v]) => [k, String(v)])), agreed: true,
      });
      router.push('/listing/create/form');
    } catch {
      toast(t.common.error, 'error');
    }
  };

  const renew = async (item: ListingSummary) => {
    close();
    try {
      await api.listings.renew(item.id, 'balance');
      await refresh();
      toast(t.listing.status.active);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await api.listings.remove(confirmDelete.id);
      await refresh();
      setConfirmDelete(null);
      onDeleted?.();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : t.common.error, 'error');
    } finally {
      setBusy(false);
    }
  };

  const icon = (name: keyof typeof Ionicons.glyphMap, color: string = colors.textMuted) => (
    <Ionicons name={name} size={22} color={color} />
  );

  const sheets = (
    <>
      <BottomSheet visible={target != null} onClose={close} title={target?.title ?? ''}>
        {target?.status === 'active' ? (
          <ListRow
            icon={icon('arrow-up', '#F87618')}
            label={t.listing.bump}
            onPress={() => {
              const id = target.id;
              close();
              router.push({ pathname: '/listing/promote', params: { id, kind: 'bump' } });
            }}
          />
        ) : null}
        {target?.status === 'expired' ? (
          <ListRow icon={icon('refresh', colors.primary)} label={t.listing.renew} onPress={() => renew(target)} />
        ) : null}
        {target ? <ListRow icon={icon('create-outline')} label={t.listing.edit} onPress={() => edit(target)} /> : null}
        {target ? (
          <ListRow
            icon={icon('trash-outline', colors.danger)}
            label={t.common.delete}
            color={colors.danger}
            onPress={() => {
              setConfirmDelete(target);
              close();
            }}
            last
          />
        ) : null}
      </BottomSheet>
      <ConfirmSheet
        visible={confirmDelete != null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={remove}
        title={t.listing.deleteTitle}
        heading={t.listing.deleteQuestion}
        message={t.listing.deleteWarning}
        warning
        confirmText={t.listing.deleteConfirmYes}
        danger
        loading={busy}
      />
    </>
  );

  return { open: setTarget, edit, askDelete: setConfirmDelete, sheets };
}
