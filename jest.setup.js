// Testlər şəbəkəyə çıxmır: real API auth implementasiyası mock ilə əvəz olunur
jest.mock('@/services/http/auth', () => ({
  get httpAuth() {
    return require('@/services/mock').mockApi.auth;
  },
  fetchCities: async () => [],
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (k) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k, v) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k) => void store.delete(k)),
  };
});

jest.mock('@expo-google-fonts/roboto', () => ({
  useFonts: () => [true, null],
  Roboto_400Regular: 'Roboto_400Regular',
  Roboto_500Medium: 'Roboto_500Medium',
  Roboto_700Bold: 'Roboto_700Bold',
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
}));

// Kataloq/elan/favorit domenləri də testlərdə mock üzərindən işləyir
jest.mock('@/services/http/catalog', () => {
  const { mockApi } = require('@/services/mock');
  return {
    httpCatalog: mockApi.catalog,
    cityNames: async () => require('@/lib/rules').AZ_REGIONS.slice(),
    subsubcategoryAttributes: async () => [],
    cityIdByName: async () => 1,
    getCities: async () => [],
  };
});
jest.mock('@/services/http/listings', () => ({
  get httpListings() {
    return require('@/services/mock').mockApi.listings;
  },
}));
jest.mock('@/services/http/favorites', () => ({
  get httpFavorites() {
    return require('@/services/mock').mockApi.favorites;
  },
}));

jest.mock('@/services/http/plan', () => {
  const get = () => require('@/services/mock').mockApi;
  return {
    get httpPlans() {
      return get().plans;
    },
    get httpBalance() {
      return get().balance;
    },
    promotionOffer: async () => ({ kind: 'vip', subtitle: '', options: [], freeLeft: 0, bonus: null }),
    applyPromotion: async () => ({ id: 'x', redirectUrl: null, status: 'completed' }),
  };
});

jest.mock('@/services/http/stores', () => {
  const get = () => require('@/services/mock').mockApi;
  return {
    get httpStores() {
      return get().stores;
    },
    get httpContact() {
      return get().contact;
    },
  };
});

jest.mock('@/services/http/notifications', () => ({
  get httpNotifications() {
    return require('@/services/mock').mockApi.notifications;
  },
}));

// Native push modulu testlərdə yoxdur — push qeydiyyatı icazə verilməmiş kimi səssizcə keçir
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => null),
  getPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  clearLastNotificationResponseAsync: jest.fn(async () => undefined),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('@/services/http/analytics', () => ({
  get httpAnalytics() {
    return require('@/services/mock').mockApi.analytics;
  },
}));
