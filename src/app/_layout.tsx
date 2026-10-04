import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandSplash } from '@/components/navigation/BrandSplash';
import { configurePush, onPushOpened, onPushReceived, registerForPush } from '@/lib/push';
import { api } from '@/services';
import { ToastProvider } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useGuestStore } from '@/store/guest';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configurePush();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold });
  const [booted, setBooted] = useState(false);
  const [splashGone, setSplashGone] = useState(false);

  useEffect(() => {
    // Native splash (düz rəng) dərhal gizlənir — onun yerini eyni mövqedə gradientli BrandSplash tutur
    SplashScreen.hideAsync().catch(() => undefined);
    (async () => {
      await useGuestStore.getState().hydrate();
      await useAuthStore.getState().hydrate();
      await useFavoritesStore.getState().load().catch(() => undefined);
      setBooted(true);
    })();
  }, []);

  const ready = fontsLoaded && booted;
  const token = useAuthStore((s) => s.token);

  // Girişdən sonra və hər açılışda (backend idempotentdir)
  useEffect(() => {
    if (booted && token) registerForPush();
  }, [booted, token != null]); // eslint-disable-line react-hooks/exhaustive-deps
  const onSplashHidden = useCallback(() => setSplashGone(true), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {ready ? (
              <>
                <StatusBar style="dark" />
                <PushBridge />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="menu" options={{ presentation: 'fullScreenModal', animation: 'slide_from_left' }} />
                  <Stack.Screen name="catalog/filter" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
                </Stack>
              </>
            ) : null}
            {splashGone ? null : <BrandSplash done={ready} onHidden={onSplashHidden} />}
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/** Push-a toxunuş → oxunmuş + elan detalı (yoxdursa Bildirişlər); tətbiq açıqkən gələn push → badge yenilənir. */
function PushBridge() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });
    const offOpened = onPushOpened((data) => {
      if (data.notification_id != null) {
        api.notifications.markRead(String(data.notification_id)).catch(() => undefined).finally(refresh);
      }
      if (data.listing_slug) router.push({ pathname: '/listing/[id]', params: { id: data.listing_slug } });
      else router.push('/notifications');
    });
    const offReceived = onPushReceived(refresh);
    return () => {
      offOpened();
      offReceived();
    };
  }, [router]);
  return null;
}
