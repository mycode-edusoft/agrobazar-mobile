import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, cityNames, subsubcategoryAttributes } from '@/services';
import { AZ_REGIONS } from '@/lib/rules';
import { useAuthStore } from '@/store/auth';
import type { ListingFilter, ListingStatus, NotificationSort, UserType } from '@/types/domain';

export const qk = {
  categories: ['categories'] as const,
  banners: ['banners'] as const,
  cities: ['cities'] as const,
  attributes: (slug: string) => ['attributes', slug] as const,
  entitlements: ['entitlements'] as const,
  me: ['me'] as const,
  search: (f: ListingFilter, page: number) => ['listings', 'search', f, page] as const,
  premium: (filter?: object) => ['listings', 'premium', filter ?? 'all'] as const,
  vip: (categoryId?: string) => ['listings', 'vip', categoryId ?? 'all'] as const,
  listing: (id: string) => ['listing', id] as const,
  myListings: (status: ListingStatus) => ['listings', 'mine', status] as const,
  stores: (q: string) => ['stores', q] as const,
  store: (id: string) => ['store', id] as const,
  storeListings: (id: string) => ['store', id, 'listings'] as const,
  myStore: ['store', 'mine'] as const,
  favListings: ['favorites', 'listings'] as const,
  favStores: ['favorites', 'stores'] as const,
  notifications: (sort: NotificationSort) => ['notifications', sort] as const,
  unreadCount: ['notifications', 'unread'] as const,
  transactions: ['transactions'] as const,
  plans: (type: UserType) => ['plans', type] as const,
  subscription: ['subscription'] as const,
};

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => api.catalog.categories(), staleTime: 10 * 60_000 });
}

/** Şəhərlər backend-dən gəlir — elan yaratmada şəhər id-si tələb olunur. */
export function useCities() {
  return useQuery({
    queryKey: qk.cities,
    queryFn: async () => {
      const names = await cityNames();
      return names.length > 0 ? names : [...AZ_REGIONS];
    },
    staleTime: 60 * 60_000,
  });
}

/** Seçilmiş alt-alt kateqoriyanın dinamik atributları. */
export function useSubsubAttributes(slug: string | null | undefined) {
  return useQuery({
    queryKey: qk.attributes(slug ?? ''),
    queryFn: () => subsubcategoryAttributes(slug!),
    enabled: !!slug,
    staleTime: 10 * 60_000,
  });
}

export function useBanners() {
  return useQuery({ queryKey: qk.banners, queryFn: () => api.catalog.banners(), staleTime: 5 * 60_000 });
}

export function useCategory(categoryId?: string) {
  const q = useCategories();
  return { ...q, category: q.data?.find((c) => c.id === categoryId) ?? null };
}

export function useUnreadNotifications() {
  const loggedIn = useAuthStore((s) => s.token != null);
  return useQuery({
    queryKey: qk.unreadCount,
    queryFn: () => api.notifications.unreadCount(),
    enabled: loggedIn,
    staleTime: 30_000,
  });
}

export function useEntitlements() {
  const loggedIn = useAuthStore((s) => s.token != null);
  return useQuery({ queryKey: qk.entitlements, queryFn: () => api.auth.entitlements(), enabled: loggedIn });
}

export function useInvalidateAfterAuth() {
  const qc = useQueryClient();
  return () =>
    Promise.all([
      qc.invalidateQueries({ queryKey: ['favorites'] }),
      qc.invalidateQueries({ queryKey: qk.entitlements }),
      qc.invalidateQueries({ queryKey: qk.subscription }),
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] }),
      qc.invalidateQueries({ queryKey: qk.myStore }),
    ]);
}
