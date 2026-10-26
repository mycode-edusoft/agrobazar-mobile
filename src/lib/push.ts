import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import type * as NotificationsModule from 'expo-notifications';
import { api } from '@/services';

/**
 * Expo push (müqavilə: docs/api-contract-notifications.md → «Push»).
 *
 * - Token girişdən sonra və hər açılışda qeydiyyatdan keçir (backend idempotentdir, telefon başqa hesaba
 *   keçibsə token cari hesaba köçür).
 * - Çıxışda token sessiya bağlanmazdan ƏVVƏL silinir — sonra 401 olar və köhnə hesab push almağa davam edər.
 * - Push heç vaxt əsas axını sındırmır: icazə verilməyibsə, FCM qurulmayıbsa (Android) və ya Expo Go-dursa
 *   sadəcə səssizcə söndürülür — bildirişlər tətbiqdə yenə görünür.
 * - Modul faylın başında import EDİLMİR: SDK 53+ Expo Go-da (Android) `expo-notifications` yüklənən anda xəta
 *   atır və bu, tətbiqin açılışını sındırırdı. Yalnız lazım olanda və yalnız öz build-imizdə yüklənir.
 */

type Notifications = typeof NotificationsModule;

let loaded: Notifications | null | undefined;

/** Push modulu; Expo Go-da, web-də və ya yüklənə bilməyəndə `null`. */
function notifications(): Notifications | null {
  if (loaded !== undefined) return loaded;
  loaded = null;
  if ((Platform.OS !== 'android' && Platform.OS !== 'ios') || isRunningInExpoGo()) return loaded;
  try {
    loaded = require('expo-notifications') as Notifications;
  } catch (e) {
    if (__DEV__) console.warn('[push] expo-notifications yüklənmədi', e);
  }
  return loaded;
}

let registeredToken: string | null = null;

export interface PushData {
  notification_id?: number | string;
  listing_slug?: string | null;
  listing_path?: { category: string; subcategory: string; subsubcategory: string } | null;
}

export function configurePush() {
  const Notifications = notifications();
  if (!Notifications) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function registerForPush(): Promise<void> {
  const Notifications = notifications();
  if (!Notifications) return;
  try {
    if (Platform.OS === 'android') {
      // Backend push-ları "default" kanalına göndərir
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Bildirişlər',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.notifications.registerDevice(token, Platform.OS as 'android' | 'ios');
    registeredToken = token;
  } catch (e) {
    if (__DEV__) console.warn('[push] qeydiyyat alınmadı', e);
  }
}

/** Server cihazı artıq silibsə (hesab silindi) — yalnız yerli vəziyyəti sıfırla. */
export function forgetPushToken() {
  registeredToken = null;
}

export async function unregisterPush(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (token) await api.notifications.unregisterDevice(token).catch(() => undefined);
}

/** Push-a toxunuş: hər çağırışda yalnız yeni (hələ emal olunmamış) cavabı qaytarır. */
export function onPushOpened(handler: (data: PushData) => void): () => void {
  const Notifications = notifications();
  if (!Notifications) return () => undefined;
  let lastId: string | null = null;
  const handle = (response: NotificationsModule.NotificationResponse | null) => {
    if (!response || response.notification.request.identifier === lastId) return;
    lastId = response.notification.request.identifier;
    handler((response.notification.request.content.data ?? {}) as PushData);
    Notifications.clearLastNotificationResponseAsync().catch(() => undefined);
  };
  // Soyuq start: tətbiq push-a toxunmaqla açılıb
  Notifications.getLastNotificationResponseAsync().then(handle).catch(() => undefined);
  const sub = Notifications.addNotificationResponseReceivedListener(handle);
  return () => sub.remove();
}

/** Tətbiq açıqkən push gəldi — badge/siyahı yenilənsin. */
export function onPushReceived(handler: () => void): () => void {
  const Notifications = notifications();
  if (!Notifications) return () => undefined;
  const sub = Notifications.addNotificationReceivedListener(handler);
  return () => sub.remove();
}
