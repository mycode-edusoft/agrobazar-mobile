import type { Api } from './api';
import { httpAuth } from './http/auth';
import { httpCatalog } from './http/catalog';
import { API_BASE_URL } from './http/client';
import { httpFavorites } from './http/favorites';
import { httpListings } from './http/listings';
import { httpBalance, httpPlans } from './http/plan';
import { httpContact, httpStores } from './http/stores';
import { mockApi } from './mock';

export const API_URL = API_BASE_URL;

/**
 * Mərhələli miqrasiya — bağlanmış domenlər real API-dən gəlir:
 *   auth · catalog · listings (təşviqlər daxil) · favorites · plans · balance · stores · contact
 * Yalnız notifications mock-dadır — backend endpoint yoxdur
 * (müqavilə: docs/api-contract-notifications.md).
 */
export const api: Api = {
  ...mockApi,
  auth: httpAuth,
  catalog: httpCatalog,
  favorites: httpFavorites,
  listings: httpListings,
  plans: httpPlans,
  balance: httpBalance,
  stores: httpStores,
  contact: httpContact,
};

export { ApiError } from './api';
export { setTokens, onTokensChanged, getAccessToken } from './http/client';
export { cityNames, subsubcategoryAttributes } from './http/catalog';
export type * from './api';
