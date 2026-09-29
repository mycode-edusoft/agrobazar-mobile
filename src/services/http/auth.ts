import { OTP } from '@/lib/rules';
import type { Entitlements, User, UserType } from '@/types/domain';
import { ApiError, type AuthApi } from '../api';
import { request, setTokens } from './client';

interface ApiCity {
  id: number;
  name: string;
  slug: string;
}

interface ApiProfile {
  id: number;
  full_name: string | null;
  email: string | null;
  phone_number: string;
  customer_type: string;
  profile_completed: boolean;
  has_store: boolean;
  profile: { avatar: string | null; city: ApiCity | null } | null;
  entitlements: Record<string, unknown> | null;
  listing_onboarding: { state: string; missing_fields: string[] } | null;
}

interface OtpStartResponse {
  detail: string;
  can_resend: boolean;
  resend_available_in: number;
  expires_in_seconds: number;
}

interface OtpVerifyResponse {
  phone_number: string;
  customer_type: string;
  is_new_user: boolean;
  needs_profile_completion: boolean;
  missing_profile_fields: string[];
  access: string;
  refresh: string;
}

const toUserType = (value: string): UserType =>
  value?.toLowerCase() === 'corporate' || value?.toLowerCase() === 'korporativ' ? 'corporate' : 'individual';

const num = (value: unknown, fallback = 0): number => {
  const n = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  return Number.isFinite(n) ? n : fallback;
};

let cachedBalance = 0;

export function mapUser(p: ApiProfile, balance = cachedBalance): User {
  return {
    id: String(p.id),
    phone: p.phone_number,
    fullName: p.full_name || null,
    email: p.email || null,
    city: p.profile?.city?.name ?? null,
    avatarUrl: p.profile?.avatar ?? null,
    type: toUserType(p.customer_type),
    balance,
    // Backend mağaza id-si vermir, yalnız `has_store` — mağaza detalı ayrıca endpoint-dədir
    storeId: p.has_store ? 'me' : null,
    createdAt: new Date().toISOString(),
  };
}

function mapEntitlements(p: ApiProfile): Entitlements {
  const e = (p.entitlements ?? {}) as Record<string, unknown>;
  const missing = p.listing_onboarding?.missing_fields ?? [];
  const profileIncomplete = !p.profile_completed || missing.length > 0;
  const freeLeft = num(e.free_listings_left ?? e.listings_left ?? e.remaining_free_listings);
  const canPost = (e.can_create_listing as boolean | undefined) ?? (!profileIncomplete && freeLeft > 0);
  return {
    planName: String(e.plan_name ?? e.tariff_name ?? 'Standard'),
    freeListingsLeft: freeLeft,
    vipDaysLeft: num(e.vip_days_left ?? e.free_vip_days),
    premiumDaysLeft: num(e.premium_days_left ?? e.free_premium_days),
    bumpCreditsLeft: num(e.bump_credits_left ?? e.free_bump_count),
    canPostListing: canPost,
    blockReason: canPost ? null : profileIncomplete ? 'profile_incomplete' : 'free_limit',
    imageLimit: {
      min: num(e.min_images, 2),
      max: num(e.max_images, 8),
    },
  };
}

async function fetchBalance(): Promise<number> {
  try {
    const res = await request<{ balance: string }>('plan/wallets/my/balance/');
    cachedBalance = num(res.balance);
  } catch {
    // cüzdan endpoint-i əlçatmazdırsa profil yüklənməsini bloklamırıq
  }
  return cachedBalance;
}

export const httpAuth: AuthApi = {
  async requestOtp(phone) {
    const res = await request<OtpStartResponse>('auth/customers/listing-guest/otp/start/', {
      method: 'POST',
      body: { phone_number: phone },
      auth: false,
    });
    return {
      resendAfterSeconds: res.resend_available_in ?? OTP.resendCooldownSeconds,
      resendsLeft: OTP.maxResends,
      codeLength: OTP.length,
    };
  },

  async verifyOtp(phone, code) {
    const res = await request<OtpVerifyResponse>('auth/customers/listing-guest/otp/verify/', {
      method: 'POST',
      body: { phone_number: phone, code },
      auth: false,
    });
    setTokens({ access: res.access, refresh: res.refresh });
    const profile = await request<ApiProfile>('auth/customers/profile/detail/');
    const balance = await fetchBalance();
    return { token: res.access, refreshToken: res.refresh, user: mapUser(profile, balance), isNewUser: res.is_new_user };
  },

  async me() {
    const [profile, balance] = await Promise.all([
      request<ApiProfile>('auth/customers/profile/detail/'),
      fetchBalance(),
    ]);
    return mapUser(profile, balance);
  },

  async completeProfile({ fullName, email }) {
    const profile = await request<ApiProfile>('auth/customers/profile/listing-onboarding/', {
      method: 'PATCH',
      body: { full_name: fullName, email },
    });
    return mapUser(profile);
  },

  async updateProfile({ city, avatarUri }) {
    const form = new FormData();
    if (city) form.append('city', city);
    if (avatarUri) {
      const name = avatarUri.split('/').pop() || 'avatar.jpg';
      const ext = name.split('.').pop()?.toLowerCase();
      form.append('avatar', {
        uri: avatarUri,
        name,
        type: ext === 'png' ? 'image/png' : 'image/jpeg',
      } as unknown as Blob);
    }
    const profile = await request<ApiProfile>('auth/customers/profile/update/', {
      method: 'PATCH',
      formData: form,
    });
    return mapUser(profile);
  },

  async deleteAccount() {
    throw new ApiError('Hesabın silinməsi hazırda dəstəklənmir', 'not_supported', 501);
  },

  async logout() {
    await request('auth/customers/logout/', { method: 'POST', body: {} }).catch(() => undefined);
    setTokens(null);
  },

  async entitlements() {
    const profile = await request<ApiProfile>('auth/customers/profile/detail/');
    return mapEntitlements(profile);
  },
};

export async function fetchCities(): Promise<string[]> {
  const res = await request<ApiCity[] | { results: ApiCity[] }>('core/locations/cities/', { auth: false });
  const items = Array.isArray(res) ? res : res.results ?? [];
  return items.map((c) => c.name);
}
