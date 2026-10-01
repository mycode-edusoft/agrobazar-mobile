import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Roboto_300Light, Roboto_400Regular, Roboto_500Medium, Roboto_600SemiBold, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BrandSplash } from '@/components/navigation/BrandSplash';
import { ToastProvider } from '@/components/ui';
import { useAuthStore } from '@/store/auth';
import { useFavoritesStore } from '@/store/favorites';
import { useGuestStore } from '@/store/guest';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

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
  const onSplashHidden = useCallback(() => setSplashGone(true), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            {ready ? (
              <>
                <StatusBar style="dark" />
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
