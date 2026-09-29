import { useRouter, type Href } from 'expo-router';
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth';

// Giriş tələb edən hərəkət: qonaqdırsa əvvəlcə telefon+kod axınına yönləndirir,
// uğurlu girişdən sonra `returnTo` ünvanına qayıdır (BRD: qonaq elan yerləşdirmə).
export function useAuthGate() {
  const router = useRouter();
  const loggedIn = useAuthStore((s) => s.token != null);

  return useCallback(
    (returnTo: Href, action?: () => void) => {
      if (loggedIn) {
        if (action) action();
        else router.push(returnTo);
        return true;
      }
      router.push({ pathname: '/auth/phone', params: { returnTo: hrefToString(returnTo) } });
      return false;
    },
    [loggedIn, router],
  );
}

export function hrefToString(href: Href): string {
  if (typeof href === 'string') return href;
  const params = href.params ?? {};
  let path = href.pathname as string;
  const query: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    if (path.includes(`[${k}]`)) path = path.replace(`[${k}]`, encodeURIComponent(String(v)));
    else query.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return query.length ? `${path}?${query.join('&')}` : path;
}
