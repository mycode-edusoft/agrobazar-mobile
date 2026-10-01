import { Platform } from 'react-native';
import { ApiError } from '../api';

const CONFIGURED_API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'https://aqrobazar.com').replace(/\/+$/, '');

// Web dev önizləməsində sorğular Metro-nun öz origin-inə gedir və metro.config.js proxy-si ilə API-yə ötürülür (CORS)
export const API_BASE_URL =
  Platform.OS === 'web' && __DEV__ && typeof window !== 'undefined' ? window.location.origin : CONFIGURED_API_URL;

type TokenPair = { access: string; refresh: string };

let tokens: TokenPair | null = null;
let onTokens: ((t: TokenPair | null) => void) | null = null;
let refreshing: Promise<string | null> | null = null;

export function setTokens(next: TokenPair | null) {
  tokens = next;
}

/** Yeni token cütü alınanda (refresh) və ya sessiya bitəndə saxlanma üçün çağırılır. */
export function onTokensChanged(cb: (t: TokenPair | null) => void) {
  onTokens = cb;
}

export function getAccessToken() {
  return tokens?.access ?? null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null | (string | number)[]>;
  auth?: boolean;
  formData?: FormData;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${API_BASE_URL}/api/v1/${path.replace(/^\/+/, '')}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v == null || v === '') continue;
    if (Array.isArray(v)) v.forEach((item) => url.searchParams.append(k, String(item)));
    else url.searchParams.append(k, String(v));
  }
  return url.toString();
}

// DRF xətaları müxtəlif formatdadır: {detail}, {field: [msg]}, {non_field_errors: [...]}
function messageFrom(payload: unknown, status: number): { message: string; code: string } {
  if (typeof payload === 'string' && payload) return { message: payload, code: `http_${status}` };
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const detail = obj.detail ?? obj.message ?? obj.error;
    if (typeof detail === 'string') return { message: detail, code: String(obj.code ?? `http_${status}`) };
    for (const value of Object.values(obj)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return { message: value[0], code: String(obj.code ?? `http_${status}`) };
      }
      if (typeof value === 'string') return { message: value, code: `http_${status}` };
    }
  }
  return { message: status === 0 ? 'Şəbəkə xətası' : 'Xəta baş verdi', code: `http_${status}` };
}

async function refreshAccess(): Promise<string | null> {
  if (!tokens?.refresh) return null;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch(buildUrl('auth/customers/token/refresh/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: tokens!.refresh }),
        });
        if (!res.ok) throw new Error('refresh failed');
        const data = (await res.json()) as Partial<TokenPair>;
        if (!data.access) throw new Error('no access');
        const next = { access: data.access, refresh: data.refresh ?? tokens!.refresh };
        tokens = next;
        onTokens?.(next);
        return next.access;
      } catch {
        tokens = null;
        onTokens?.(null);
        return null;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true, formData, signal } = options;

  const send = async (token: string | null) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (!formData && body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    return fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  };

  let res: Response;
  try {
    res = await send(auth ? getAccessToken() : null);
  } catch {
    throw new ApiError('İnternet bağlantısı yoxdur', 'network', 0);
  }

  if (res.status === 401 && auth && tokens?.refresh) {
    const access = await refreshAccess();
    if (access) {
      try {
        res = await send(access);
      } catch {
        throw new ApiError('İnternet bağlantısı yoxdur', 'network', 0);
      }
    }
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const { message, code } = messageFrom(payload, res.status);
    throw new ApiError(message, code, res.status);
  }
  return payload as T;
}

/** DRF səhifələnmiş cavabı (`{count, next, results}`) və ya düz massivi normallaşdırır. */
export function unwrapList<T>(payload: unknown): { items: T[]; count: number; hasNext: boolean } {
  if (Array.isArray(payload)) return { items: payload as T[], count: payload.length, hasNext: false };
  const obj = (payload ?? {}) as { results?: T[]; count?: number; next?: string | null };
  const items = obj.results ?? [];
  return { items, count: obj.count ?? items.length, hasNext: !!obj.next };
}
