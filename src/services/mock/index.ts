import type {
  Api,
  CreateListingInput,
  CreateStoreInput,
} from '@/services/api';
import { ApiError } from '@/services/api';
import type {
  AppNotification,
  Entitlements,
  PromotionKind,
  PromotionOption,
  Listing,
  ListingFilter,
  ListingSummary,
  PaymentStatus,
  Store,
  Subscription,
  Transaction,
  User,
} from '@/types/domain';
import { LISTING_DEFAULTS, OTP } from '@/lib/rules';
import {
  banners,
  categories,
  currentSubscription as seedSubscription,
  currentUser as seedUser,
  listings as seedListings,
  notifications as seedNotifications,
  myListings as seedMyListings,
  plans,
  stores as seedStores,
  transactions as seedTransactions,
} from './data';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const ALL_CATEGORIES = 'Bütün kateqoriyalar';

// İrəli çək: Figma-dakı təkrar paketləri. VIP/Premium: BRD IX gün-blokları (1/7/15/30).
const PROMO_OPTIONS: Record<PromotionKind, PromotionOption[]> = {
  bump: [
    { id: 'bump-3', label: '3 dəfə (8 saatdan bir)', price: 1, hot: false },
    { id: 'bump-9', label: '9 dəfə (8 saatdan bir)', price: 2, hot: false },
    { id: 'bump-15', label: '15 dəfə (8 saatdan bir)', price: 3, hot: true },
    { id: 'bump-30', label: '30 dəfə (8 saatdan bir)', price: 5, hot: false },
  ],
  vip: [
    { id: 'vip-1', label: '1 gün', price: 1, hot: false },
    { id: 'vip-7', label: '7 gün', price: 5, hot: false },
    { id: 'vip-15', label: '15 gün', price: 9, hot: true },
    { id: 'vip-30', label: '30 gün', price: 15, hot: false },
  ],
  premium: [
    { id: 'premium-1', label: '1 gün', price: 2, hot: false },
    { id: 'premium-7', label: '7 gün', price: 9, hot: false },
    { id: 'premium-15', label: '15 gün', price: 15, hot: true },
    { id: 'premium-30', label: '30 gün', price: 25, hot: false },
  ],
};

const PROMO_UNITS: Record<PromotionKind, Record<string, number>> = {
  bump: { 'bump-3': 3, 'bump-9': 9, 'bump-15': 15, 'bump-30': 30 },
  vip: { 'vip-1': 1, 'vip-7': 7, 'vip-15': 15, 'vip-30': 30 },
  premium: { 'premium-1': 1, 'premium-7': 7, 'premium-15': 15, 'premium-30': 30 },
};

const PROMO_SUBTITLE: Record<PromotionKind, string> = {
  bump: 'Elan bütün və axtarış nəticələrinin içində birinci yerə qalxacaq',
  vip: 'Elan kateqoriyanın fırlanan VIP blokunda göstəriləcək',
  premium: 'Elan ayrıca Premium bölməsində göstəriləcək və VIP-i də əhatə edir',
};

const PROMO_TITLE: Record<PromotionKind, string> = {
  bump: 'İrəli çəkmə',
  vip: 'VIP elan',
  premium: 'Premium elan',
};
const now = () => new Date().toISOString();

// In-memory vəziyyət — tətbiq yenidən açılanda sıfırlanır.
const state = {
  user: { ...seedUser } as User,
  loggedIn: false,
  otp: new Map<string, { code: string; attempts: number; resends: number; blockedUntil: number }>(),
  listings: [...seedListings],
  myListings: [...seedMyListings],
  stores: [...seedStores],
  myStore: null as Store | null,
  favListings: new Map<string, Set<string>>(),
  favStores: new Map<string, Set<string>>(),
  subscription: seedSubscription as Subscription | null,
  transactions: [...seedTransactions],
  notifications: seedNotifications.map((n) => ({ ...n })),
  payments: new Map<string, { status: PaymentStatus; resolveAt: number; apply: () => void }>(),
};

const favKey = (anonId: string | null) => (state.loggedIn ? `user:${state.user.id}` : `anon:${anonId ?? 'none'}`);
const favSet = (map: Map<string, Set<string>>, key: string) => {
  if (!map.has(key)) map.set(key, new Set());
  return map.get(key)!;
};

function subsubName(l: Listing): string | null {
  for (const c of categories) {
    for (const s of c.subcategories) {
      const b = s.subsubcategories.find((x) => x.id === l.subsubId);
      if (b) return b.name;
    }
  }
  return null;
}

function summary(l: Listing): ListingSummary {
  return {
    id: l.id,
    title: l.title,
    price: l.price,
    negotiable: l.negotiable,
    type: l.type,
    city: l.city,
    image: l.images[0] ?? null,
    createdAt: l.createdAt,
    status: l.status,
    promotions: l.promotions,
    internationalDelivery: l.internationalDelivery,
    subsubName: subsubName(l),
  };
}

const isPromoted = (l: Listing) => {
  const t = Date.now();
  return (
    (l.promotions.premiumUntil != null && new Date(l.promotions.premiumUntil).getTime() > t) ||
    (l.promotions.vipUntil != null && new Date(l.promotions.vipUntil).getTime() > t)
  );
};
const isActive = (l: Listing) =>
  l.status === 'active' && (l.expiresAt == null || new Date(l.expiresAt).getTime() > Date.now());

function entitlements(): Entitlements {
  const sub = state.subscription;
  const profileIncomplete = !state.user.fullName || !state.user.email;
  const freeLeft = sub ? Math.max(0, sub.listingsLimit - sub.listingsUsed) : 1;
  const blockReason = profileIncomplete && state.user.type === 'individual'
    ? 'profile_incomplete'
    : freeLeft === 0 ? 'free_limit' : null;
  return {
    planName: sub?.planName ?? 'Standard',
    freeListingsLeft: freeLeft,
    vipDaysLeft: sub ? 2 : 0,
    premiumDaysLeft: sub ? 1 : 0,
    bumpCreditsLeft: sub ? 4 : 0,
    canPostListing: blockReason == null,
    blockReason,
    imageLimit: { min: LISTING_DEFAULTS.minImages, max: LISTING_DEFAULTS.maxImages },
  };
}

function findMyListing(id: string) {
  const l = state.myListings.find((x) => x.id === id) ?? state.listings.find((x) => x.id === id);
  if (!l) throw new ApiError('Elan tapılmadı', 'not_found', 404);
  return l;
}

function requireAuth() {
  if (!state.loggedIn) throw new ApiError('Giriş tələb olunur', 'unauthorized', 401);
}

function schedulePayment(amount: number, apply: () => void) {
  const id = `pay-${Date.now()}`;
  state.payments.set(id, { status: 'pending', resolveAt: Date.now() + 4000, apply });
  state.transactions.unshift({
    id: `t-${Date.now()}`, kind: 'topup', title: 'Ödəniş', amount, direction: 'out', status: 'pending', createdAt: now(),
  });
  return { id, redirectUrl: 'https://example-bank.test/pay', status: 'pending' as const };
}

export const mockApi: Api = {
  auth: {
    async requestOtp(phone) {
      await delay();
      const rec = state.otp.get(phone) ?? { code: '123456', attempts: 0, resends: -1, blockedUntil: 0 };
      if (rec.blockedUntil > Date.now()) throw new ApiError('Nömrə müvəqqəti bloklanıb', 'blocked', 429);
      rec.resends += 1;
      if (rec.resends > OTP.maxResends) throw new ApiError('Yenidən göndərmə limiti bitib', 'resend_limit', 429);
      rec.attempts = 0;
      state.otp.set(phone, rec);
      return { resendAfterSeconds: OTP.resendCooldownSeconds, resendsLeft: OTP.maxResends - rec.resends, codeLength: OTP.length };
    },
    async verifyOtp(phone, code) {
      await delay();
      const rec = state.otp.get(phone);
      if (!rec) throw new ApiError('Əvvəlcə kod tələb edin', 'no_otp', 400);
      if (rec.blockedUntil > Date.now()) throw new ApiError('Nömrə müvəqqəti bloklanıb', 'blocked', 429);
      if (code !== rec.code) {
        rec.attempts += 1;
        if (rec.attempts >= OTP.maxWrongAttempts) {
          rec.blockedUntil = Date.now() + OTP.blockMinutes * 60_000;
          throw new ApiError('Çox sayda yanlış cəhd', 'blocked', 429);
        }
        throw new ApiError('Kod yanlışdır', 'wrong_code', 400);
      }
      const isNewUser = state.user.phone !== phone;
      if (isNewUser) {
        state.user = { ...seedUser, id: `u-${Date.now()}`, phone, fullName: null, email: null, createdAt: now() };
      }
      state.loggedIn = true;
      state.otp.delete(phone);
      return { token: `mock-token-${state.user.id}`, user: state.user, isNewUser };
    },
    async me() {
      await delay(150);
      requireAuth();
      return state.user;
    },
    async completeProfile({ fullName, email }) {
      await delay();
      requireAuth();
      if (state.user.fullName) throw new ApiError('Ad artıq təyin olunub', 'name_locked', 400);
      state.user = { ...state.user, fullName, email };
      return state.user;
    },
    async updateProfile({ city, avatarUri }) {
      await delay();
      requireAuth();
      state.user = { ...state.user, city: city ?? state.user.city, avatarUrl: avatarUri ?? state.user.avatarUrl };
      return state.user;
    },
    async deleteAccount() {
      await delay();
      requireAuth();
      state.loggedIn = false;
      state.user = { ...seedUser };
    },
    async logout() {
      await delay(100);
      state.loggedIn = false;
    },
    async entitlements() {
      await delay(150);
      requireAuth();
      return entitlements();
    },
  },

  catalog: {
    async categories() {
      await delay(200);
      return categories;
    },
    async banners() {
      await delay(200);
      return banners;
    },
    async suggestions(query) {
      await delay(150);
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const out: { query: string; categoryId: string | null; categoryName: string }[] = [];
      const push = (text: string, categoryId: string | null, categoryName: string) => {
        if (out.length >= 8) return;
        if (!text.toLowerCase().includes(q)) return;
        if (out.some((s) => s.query.toLowerCase() === text.toLowerCase())) return;
        out.push({ query: text, categoryId, categoryName });
      };
      for (const c of categories) {
        push(c.name, c.id, ALL_CATEGORIES);
        for (const sub of c.subcategories) {
          push(sub.name, c.id, c.name);
          for (const b of sub.subsubcategories) push(b.name, c.id, sub.name);
        }
      }
      for (const l of state.listings) {
        if (!isActive(l)) continue;
        const cat = categories.find((c) => c.id === l.categoryId);
        push(l.title, l.categoryId, cat?.name ?? ALL_CATEGORIES);
      }
      return out;
    },
  },

  listings: {
    async search(filter: ListingFilter, page) {
      await delay();
      const pageSize = 10;
      let items = state.listings.filter(isActive).filter((l) => !isPromoted(l));
      items = applyFilter(items, filter);
      const start = (page - 1) * pageSize;
      const slice = items.slice(start, start + pageSize).map(summary);
      return { items: slice, total: items.length, page, hasMore: start + pageSize < items.length };
    },
    async premium(categoryId) {
      await delay(200);
      const t = Date.now();
      return state.listings
        .filter(isActive)
        .filter((l) => l.promotions.premiumUntil && new Date(l.promotions.premiumUntil).getTime() > t)
        .filter((l) => !categoryId || l.categoryId === categoryId)
        .map(summary);
    },
    async vip(categoryId) {
      await delay(200);
      const t = Date.now();
      const vip = state.listings
        .filter(isActive)
        .filter((l) => l.promotions.vipUntil && new Date(l.promotions.vipUntil).getTime() > t)
        .filter((l) => !categoryId || l.categoryId === categoryId);
      return vip.sort(() => Math.random() - 0.5).map(summary);
    },
    async byId(id) {
      await delay(200);
      const l = [...state.listings, ...state.myListings].find((x) => x.id === id);
      if (!l) throw new ApiError('Elan tapılmadı', 'not_found', 404);
      l.views += 1;
      return l;
    },
    async mine(status) {
      await delay(200);
      requireAuth();
      return state.myListings.filter((l) => l.status === status).map(summary);
    },
    async create(input: CreateListingInput) {
      await delay(600);
      requireAuth();
      const ent = entitlements();
      if (!ent.canPostListing) throw new ApiError('Elan yerləşdirmək mümkün deyil', ent.blockReason ?? 'blocked', 403);
      const l: Listing = {
        id: `my-${Date.now()}`,
        ownerId: state.user.id,
        storeId: state.myStore?.id ?? null,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        subsubId: input.subsubId,
        type: input.type,
        title: input.title,
        description: input.description,
        price: input.price,
        negotiable: input.negotiable,
        city: input.city,
        whatsapp: input.whatsapp,
        phone: state.user.phone,
        images: input.images,
        videoUrl: input.videoUri,
        fields: input.fields,
        status: 'draft',
        rejectionReason: null,
        promotions: { vipUntil: null, premiumUntil: null, bumpedAt: null },
        views: 0,
        createdAt: now(),
        updatedAt: now(),
        expiresAt: null,
        internationalDelivery: false,
        sellerName: state.user.fullName ?? state.myStore?.name ?? 'Mən',
      };
      state.myListings.unshift(l);
      if (state.subscription) state.subscription.listingsUsed += 1;
      return l;
    },
    async update(id, input) {
      await delay(500);
      requireAuth();
      const l = state.myListings.find((x) => x.id === id);
      if (!l) throw new ApiError('Elan tapılmadı', 'not_found', 404);
      Object.assign(l, input, { status: 'draft', updatedAt: now(), rejectionReason: null });
      return l;
    },
    async remove(id) {
      await delay();
      requireAuth();
      state.myListings = state.myListings.filter((x) => x.id !== id);
    },
    async renew(id) {
      await delay(500);
      requireAuth();
      const l = state.myListings.find((x) => x.id === id);
      if (!l || l.status !== 'expired') throw new ApiError('Yalnız müddəti bitmiş elan yenilənə bilər', 'invalid_state', 400);
      l.status = 'active';
      l.expiresAt = new Date(Date.now() + LISTING_DEFAULTS.activeDays * 86_400_000).toISOString();
      return l;
    },
    async bump(id) {
      await delay();
      requireAuth();
      const l = state.myListings.find((x) => x.id === id);
      if (!l || !isActive(l)) throw new ApiError('Yalnız aktiv elan irəli çəkilə bilər', 'invalid_state', 400);
      l.promotions = { ...l.promotions, bumpedAt: now() };
      return l;
    },

    async promotionOffer(id, kind) {
      await delay(200);
      requireAuth();
      const l = findMyListing(id);
      const ent = entitlements();
      const freeLeft = kind === 'vip' ? ent.vipDaysLeft : kind === 'premium' ? ent.premiumDaysLeft : ent.bumpCreditsLeft;
      const until = kind === 'vip' ? l.promotions.vipUntil : kind === 'premium' ? l.promotions.premiumUntil : null;
      return {
        kind,
        subtitle: PROMO_SUBTITLE[kind],
        options: PROMO_OPTIONS[kind],
        freeLeft,
        bonus: until
          ? { before: 'Əvvəl 1 dəfə irəli çək', now: 'Hər gün irəli çək', paidUntil: until }
          : null,
      };
    },

    async promote({ listingId, kind, optionId, method }) {
      await delay();
      requireAuth();
      const l = findMyListing(listingId);
      if (!isActive(l)) throw new ApiError('Yalnız aktiv elana tətbiq edilə bilər', 'invalid_state', 400);
      const option = PROMO_OPTIONS[kind].find((o) => o.id === optionId);
      if (!option) throw new ApiError('Seçim tapılmadı', 'not_found', 404);

      const apply = () => {
        const units = PROMO_UNITS[kind][optionId] ?? 1;
        if (kind === 'bump') {
          l.promotions = { ...l.promotions, bumpedAt: now() };
        } else {
          const base = Math.max(Date.now(), new Date((kind === 'vip' ? l.promotions.vipUntil : l.promotions.premiumUntil) ?? 0).getTime());
          const until = new Date(base + units * 86_400_000).toISOString();
          // BRD IX: Premium alan elan avtomatik VIP-i də alır
          l.promotions =
            kind === 'premium'
              ? { ...l.promotions, premiumUntil: until, vipUntil: until }
              : { ...l.promotions, vipUntil: until };
          if (l.expiresAt && new Date(l.expiresAt).getTime() < new Date(until).getTime()) l.expiresAt = until;
        }
        state.transactions.unshift({
          id: `t-${Date.now()}`, kind, title: PROMO_TITLE[kind], amount: option.price,
          direction: 'out', status: 'completed', createdAt: now(),
        });
        state.notifications.unshift({
          id: `n-${Date.now()}`, kind: kind === 'bump' ? 'listing' : kind,
          title: PROMO_TITLE[kind], body: `"${l.title}" elanına ${option.label} tətbiq olundu.`,
          createdAt: now(), read: false, listingId: l.id,
        });
      };

      // BRD IX: əvvəlcə tarifin pulsuz bankı, sonra balans/kart
      const ent = entitlements();
      const freeLeft = kind === 'vip' ? ent.vipDaysLeft : kind === 'premium' ? ent.premiumDaysLeft : ent.bumpCreditsLeft;
      if (freeLeft > 0) {
        apply();
        return { id: `pay-${Date.now()}`, redirectUrl: null, status: 'completed' as const };
      }
      if (method === 'balance') {
        if (state.user.balance < option.price) throw new ApiError('Balans kifayət etmir', 'insufficient_balance', 402);
        state.user = { ...state.user, balance: Math.round((state.user.balance - option.price) * 100) / 100 };
        apply();
        return { id: `pay-${Date.now()}`, redirectUrl: null, status: 'completed' as const };
      }
      return schedulePayment(option.price, apply);
    },
  },

  stores: {
    async list(query) {
      await delay();
      const q = query?.trim().toLowerCase();
      return state.stores.filter((s) => s.status === 'approved' && (!q || s.name.toLowerCase().includes(q)));
    },
    async byId(id) {
      await delay(200);
      const s = state.stores.find((x) => x.id === id) ?? (state.myStore?.id === id ? state.myStore : null);
      if (!s) throw new ApiError('Mağaza tapılmadı', 'not_found', 404);
      return s;
    },
    async listings(storeId) {
      await delay(200);
      return state.listings.filter((l) => l.storeId === storeId && isActive(l)).map(summary);
    },
    async mine() {
      await delay(150);
      requireAuth();
      return state.myStore;
    },
    async create(input: CreateStoreInput) {
      await delay(700);
      requireAuth();
      if (state.myStore) throw new ApiError('Sizin artıq mağazanız var', 'already_exists', 400);
      state.myStore = {
        id: `s-${Date.now()}`,
        ownerId: state.user.id,
        name: input.name,
        description: input.description,
        city: input.city,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp,
        logoUrl: input.logoUri,
        coverUrl: input.coverUri,
        website: input.website,
        facebook: input.facebook,
        instagram: input.instagram,
        tiktok: input.tiktok,
        youtube: input.youtube,
        workingHours: input.workingHours,
        status: 'pending',
        activeListingsCount: 0,
        totalViews: 0,
        categoryId: input.categoryId,
      };
      state.user = { ...state.user, storeId: state.myStore.id };
      return state.myStore;
    },
    async update(input) {
      await delay(500);
      requireAuth();
      if (!state.myStore) throw new ApiError('Mağaza yoxdur', 'not_found', 404);
      Object.assign(state.myStore, input);
      return state.myStore;
    },
  },

  favorites: {
    async listings(anonId) {
      await delay(200);
      const ids = favSet(state.favListings, favKey(anonId));
      return state.listings.filter((l) => ids.has(l.id) && isActive(l)).map(summary);
    },
    async stores(anonId) {
      await delay(200);
      const ids = favSet(state.favStores, favKey(anonId));
      return state.stores
        .filter((s) => ids.has(s.id))
        .map((s) => ({ id: s.id, name: s.name, logoUrl: s.logoUrl, activeListingsCount: s.activeListingsCount }));
    },
    async ids(anonId) {
      await delay(50);
      const key = favKey(anonId);
      return { listings: [...favSet(state.favListings, key)], stores: [...favSet(state.favStores, key)] };
    },
    async addListing(id, anonId) {
      await delay(80);
      const l = state.listings.find((x) => x.id === id);
      if (!l || !isActive(l)) throw new ApiError('Yalnız aktiv elan seçilə bilər', 'invalid_state', 400);
      favSet(state.favListings, favKey(anonId)).add(id);
    },
    async removeListing(id, anonId) {
      await delay(80);
      favSet(state.favListings, favKey(anonId)).delete(id);
    },
    async addStore(id, anonId) {
      await delay(80);
      favSet(state.favStores, favKey(anonId)).add(id);
    },
    async removeStore(id, anonId) {
      await delay(80);
      favSet(state.favStores, favKey(anonId)).delete(id);
    },
    async removeListings(ids, anonId) {
      await delay(150);
      const set = favSet(state.favListings, favKey(anonId));
      ids.forEach((id) => set.delete(id));
    },
    async mergeGuest(anonId) {
      await delay(100);
      requireAuth();
      const userKey = `user:${state.user.id}`;
      const anonKey = `anon:${anonId}`;
      favSet(state.favListings, anonKey).forEach((id) => favSet(state.favListings, userKey).add(id));
      favSet(state.favStores, anonKey).forEach((id) => favSet(state.favStores, userKey).add(id));
      state.favListings.delete(anonKey);
      state.favStores.delete(anonKey);
    },
  },

  balance: {
    async transactions() {
      await delay(250);
      requireAuth();
      return [...state.transactions] as Transaction[];
    },
    async topUp(amount) {
      await delay();
      requireAuth();
      if (!(amount > 0)) throw new ApiError('Məbləğ düzgün deyil', 'invalid_amount', 400);
      return schedulePayment(amount, () => {
        state.user = { ...state.user, balance: Math.round((state.user.balance + amount) * 100) / 100 };
        state.transactions.unshift({
          id: `t-${Date.now()}`, kind: 'topup', title: 'Balans artımı', amount, direction: 'in', status: 'completed', createdAt: now(),
        });
      });
    },
    async paymentStatus(intentId) {
      await delay(300);
      const p = state.payments.get(intentId);
      if (!p) throw new ApiError('Ödəniş tapılmadı', 'not_found', 404);
      if (p.status === 'pending' && Date.now() >= p.resolveAt) {
        p.status = 'completed';
        const pending = state.transactions.find((t) => t.status === 'pending');
        if (pending) state.transactions = state.transactions.filter((t) => t !== pending);
        p.apply();
      }
      return p.status;
    },
  },

  plans: {
    async plans(userType) {
      await delay(200);
      return plans.filter((p) => p.userType === userType);
    },
    async current() {
      await delay(150);
      requireAuth();
      return state.subscription;
    },
    async purchase(planId, cycle, method) {
      await delay();
      requireAuth();
      const plan = plans.find((p) => p.id === planId);
      if (!plan) throw new ApiError('Tarif tapılmadı', 'not_found', 404);
      if (plan.userType !== state.user.type) throw new ApiError('Bu tarif sizin hesab tipinizə uyğun deyil', 'wrong_user_type', 400);
      const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
      const activate = () => {
        const days = cycle === 'monthly' ? 30 : 365;
        state.subscription = {
          id: `sub-${Date.now()}`, planId: plan.id, planName: plan.name, tier: plan.tier, cycle, status: 'active',
          startedAt: now(), endsAt: new Date(Date.now() + days * 86_400_000).toISOString(),
          paidAmount: price, listingsUsed: 0, listingsLimit: plan.listingsPerMonth, autoRenew: state.subscription?.autoRenew ?? false,
        };
        state.transactions.unshift({
          id: `t-${Date.now()}`, kind: 'plan', title: `${plan.name} tarif`, amount: price, direction: 'out', status: 'completed', createdAt: now(),
        });
      };
      if (method === 'balance') {
        if (state.user.balance < price) throw new ApiError('Balans kifayət etmir', 'insufficient_balance', 402);
        state.user = { ...state.user, balance: Math.round((state.user.balance - price) * 100) / 100 };
        activate();
        return { id: `pay-${Date.now()}`, redirectUrl: null, status: 'completed' as const };
      }
      return schedulePayment(price, activate);
    },
    async setAutoRenew(enabled) {
      await delay(150);
      requireAuth();
      if (!state.subscription) throw new ApiError('Aktiv tarif yoxdur', 'not_found', 404);
      state.subscription = { ...state.subscription, autoRenew: enabled };
      return state.subscription;
    },
  },

  notifications: {
    async list(sort) {
      await delay(250);
      requireAuth();
      const items = [...state.notifications];
      const byDate = (a: AppNotification, b: AppNotification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return items.sort((a, b) => byDate(b, a));
      if (sort === 'read') return items.filter((n) => n.read).sort(byDate);
      if (sort === 'unread') return items.filter((n) => !n.read).sort(byDate);
      return items.sort(byDate);
    },
    async unreadCount() {
      await delay(80);
      if (!state.loggedIn) return 0;
      return state.notifications.filter((n) => !n.read).length;
    },
    async markRead(id) {
      await delay(80);
      requireAuth();
      const n = state.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
    async markAllRead() {
      await delay(120);
      requireAuth();
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    async remove(id) {
      await delay(120);
      requireAuth();
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },
  },

  contact: {
    async send() {
      await delay(500);
    },
  },
};

function applyFilter(items: Listing[], f: ListingFilter): Listing[] {
  let out = items;
  if (f.query) {
    const q = f.query.toLowerCase();
    out = out.filter((l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
  }
  if (f.categoryId) out = out.filter((l) => l.categoryId === f.categoryId);
  if (f.subcategoryId) out = out.filter((l) => l.subcategoryId === f.subcategoryId);
  if (f.subsubIds?.length) out = out.filter((l) => l.subsubId != null && f.subsubIds!.includes(l.subsubId));
  if (f.city) out = out.filter((l) => l.city === f.city);
  if (f.priceMin != null) out = out.filter((l) => l.price != null && l.price >= f.priceMin!);
  if (f.priceMax != null) out = out.filter((l) => l.price != null && l.price <= f.priceMax!);
  if (f.types?.length) out = out.filter((l) => f.types!.includes(l.type));
  const sort = f.sort ?? 'date';
  out = [...out].sort((a, b) => {
    if (sort === 'price_asc') return (a.price ?? Infinity) - (b.price ?? Infinity);
    if (sort === 'price_desc') return (b.price ?? -1) - (a.price ?? -1);
    const bumpA = a.promotions.bumpedAt ? new Date(a.promotions.bumpedAt).getTime() : 0;
    const bumpB = b.promotions.bumpedAt ? new Date(b.promotions.bumpedAt).getTime() : 0;
    return Math.max(bumpB, new Date(b.createdAt).getTime()) - Math.max(bumpA, new Date(a.createdAt).getTime());
  });
  return out;
}
