import { create } from 'zustand';
import { secureStorage } from '@/lib/secureStorage';
import { api, onTokensChanged, setTokens } from '@/services';
import type { AuthSession, User } from '@/types/domain';

const TOKEN_KEY = 'aqrobazar.token';
const REFRESH_KEY = 'aqrobazar.refreshToken';

interface AuthState {
  hydrated: boolean;
  token: string | null;
  user: User | null;
  hydrate(): Promise<void>;
  setSession(session: AuthSession): Promise<void>;
  setUser(user: User): void;
  signOut(): Promise<void>;
}

async function persistTokens(access: string | null, refresh: string | null) {
  if (access) await secureStorage.set(TOKEN_KEY, access);
  else await secureStorage.remove(TOKEN_KEY).catch(() => undefined);
  if (refresh) await secureStorage.set(REFRESH_KEY, refresh);
  else await secureStorage.remove(REFRESH_KEY).catch(() => undefined);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  token: null,
  user: null,

  async hydrate() {
    // Token yenilənəndə (401 → refresh) yeni cütü saxla; refresh uğursuzdursa sessiyanı bağla
    onTokensChanged((pair) => {
      if (pair) {
        persistTokens(pair.access, pair.refresh).catch(() => undefined);
        set({ token: pair.access });
      } else {
        persistTokens(null, null).catch(() => undefined);
        set({ token: null, user: null });
      }
    });

    try {
      const [access, refresh] = await Promise.all([
        secureStorage.get(TOKEN_KEY),
        secureStorage.get(REFRESH_KEY),
      ]);
      if (access && refresh) {
        setTokens({ access, refresh });
        const user = await api.auth.me();
        set({ token: access, user });
      }
    } catch {
      setTokens(null);
      await persistTokens(null, null);
      set({ token: null, user: null });
    } finally {
      set({ hydrated: true });
    }
  },

  async setSession({ token, user, refreshToken }) {
    await persistTokens(token, refreshToken ?? null);
    set({ token, user });
  },

  setUser(user) {
    set({ user });
  },

  async signOut() {
    if (get().token) await api.auth.logout().catch(() => undefined);
    setTokens(null);
    await persistTokens(null, null);
    set({ token: null, user: null });
  },
}));

export const useIsLoggedIn = () => useAuthStore((s) => s.token != null);
export const useCurrentUser = () => useAuthStore((s) => s.user);
