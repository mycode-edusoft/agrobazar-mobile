/**
 * Regression: SDK 53+ Expo Go-da (Android) `expo-notifications` yüklənən anda xəta atır. push.ts modulu
 * Expo Go-da HEÇ yükləməməlidir, öz build-imizdə isə adi qaydada işləməlidir.
 */
type PushModule = typeof import('@/lib/push');

function loadPush(inExpoGo: boolean) {
  const loadedNative = { count: 0 };
  let push!: PushModule;
  jest.isolateModules(() => {
    jest.doMock('expo', () => ({ ...jest.requireActual('expo'), isRunningInExpoGo: () => inExpoGo }));
    jest.doMock('expo-notifications', () => {
      loadedNative.count += 1;
      if (inExpoGo) throw new Error('expo-notifications: … removed from Expo Go');
      return {
        setNotificationHandler: jest.fn(),
        setNotificationChannelAsync: jest.fn(async () => null),
        getPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
        requestPermissionsAsync: jest.fn(async () => ({ status: 'denied' })),
        getLastNotificationResponseAsync: jest.fn(async () => null),
        clearLastNotificationResponseAsync: jest.fn(async () => undefined),
        addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
        addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
        AndroidImportance: { HIGH: 4 },
      };
    });
    push = require('@/lib/push');
  });
  return { push, loadedNative };
}

describe('push — Expo Go', () => {
  it('Expo Go-da native modul heç yüklənmir və heç nə sınmır', async () => {
    const { push, loadedNative } = loadPush(true);
    expect(() => push.configurePush()).not.toThrow();
    await expect(push.registerForPush()).resolves.toBeUndefined();
    const offOpened = push.onPushOpened(() => undefined);
    const offReceived = push.onPushReceived(() => undefined);
    offOpened();
    offReceived();
    expect(loadedNative.count).toBe(0);
  });

  it('öz build-imizdə modul yalnız ilk istifadədə yüklənir', async () => {
    const { push, loadedNative } = loadPush(false);
    expect(loadedNative.count).toBe(0); // import zamanı yox
    push.configurePush();
    await push.registerForPush();
    expect(loadedNative.count).toBe(1);
  });
});
