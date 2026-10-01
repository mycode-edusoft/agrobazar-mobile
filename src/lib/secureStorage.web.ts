/**
 * Web-də expo-secure-store yoxdur. Web yalnız dizayn/dev önizləməsi üçündür (məhsul deyil),
 * ona görə localStorage kifayətdir — prod web tətbiqi bu kodu istifadə etmir.
 */
export const secureStorage = {
  get: async (key: string) => globalThis.localStorage?.getItem(key) ?? null,
  set: async (key: string, value: string) => globalThis.localStorage?.setItem(key, value),
  remove: async (key: string) => globalThis.localStorage?.removeItem(key),
};
