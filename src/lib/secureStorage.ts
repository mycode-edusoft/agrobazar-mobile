import * as SecureStore from 'expo-secure-store';

/** Token saxlanması — native-də şifrələnmiş Keychain/Keystore. Web variantı: secureStorage.web.ts */
export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
