import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { api } from '@/services';

/**
 * Expo push (müqavilə: docs/api-contract-notifications.md → «Push»).
 *
 * - Token girişdən sonra və hər açılışda qeydiyyatdan keçir (backend idempotentdir, telefon başqa hesaba
 *   keçibsə token cari hesaba köçür).
 * - Çıxışda token sessiya bağlanmazdan ƏVVƏL silinir — sonra 401 olar və köhnə hesab push almağa davam edər.
 * - Push heç vaxt əsas axını sındırmır: icazə verilməyibsə, FCM qurulmayıbsa (Android) və ya Expo Go-dursa
 *   sadəcə səssizcə söndürülür — bildirişlər tətbiqdə yenə görünür.
 */

const supported = Platform.OS === 'android' || Platform.OS === 'ios';
let registeredToken: string | null = null;

export interface PushData {
  notification_id?: number | string;
  listing_slug?: string | null;
}

export function configurePush() {
  if (!supported) return;
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
  if (!supported) return;
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

export async function unregisterPush(): Promise<void> {
  const token = registeredToken;
  registeredToken = null;
  if (token) await api.notifications.unregisterDevice(token).catch(() => undefined);
}

/** Push-a toxunuş: hər çağırışda yalnız yeni (hələ emal olunmamış) cavabı qaytarır. */
export function onPushOpened(handler: (data: PushData) => void): () => void {
  if (!supported) return () => undefined;
  let lastId: string | null = null;
  const handle = (response: Notifications.NotificationResponse | null) => {
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
  if (!supported) return () => undefined;
  const sub = Notifications.addNotificationReceivedListener(handler);
  return () => sub.remove();
}
