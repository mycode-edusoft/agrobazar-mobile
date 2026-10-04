import type { Api } from './api';
import { httpAnalytics } from './http/analytics';
import { httpAuth } from './http/auth';
import { httpCatalog } from './http/catalog';
import { API_BASE_URL } from './http/client';
import { httpFavorites } from './http/favorites';
import { httpListings } from './http/listings';
import { httpNotifications } from './http/notifications';
import { httpBalance, httpPlans } from './http/plan';
import { httpContact, httpStores } from './http/stores';
import { mockApi } from './mock';

export const API_URL = API_BASE_URL;

/**
 * Bütün domenlər real API-dən gəlir (müqavilə: docs/api-contract-notifications.md — bildirişlər/push,
 * seçilmiş mağazalar). mockApi yalnız testlər və offline önizləmə üçün qalır.
 */
export const api: Api = {
  ...mockApi,
  auth: httpAuth,
  notifications: httpNotifications,
  catalog: httpCatalog,
  favorites: httpFavorites,
  listings: httpListings,
  plans: httpPlans,
  balance: httpBalance,
  stores: httpStores,
  contact: httpContact,
  analytics: httpAnalytics,
};

export { ApiError } from './api';
export { setTokens, onTokensChanged, getAccessToken } from './http/client';
export { cityNames, subsubcategoryAttributes } from './http/catalog';
export { rememberListingPath } from './http/listingPaths';
export type * from './api';
