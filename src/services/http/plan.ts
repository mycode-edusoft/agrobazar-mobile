import type {
  BillingCycle,
  PaymentIntent,
  PaymentMethod,
  PaymentStatus,
  Plan,
  PromotionKind,
  PromotionOffer,
  PromotionOption,
  Subscription,
  Transaction,
  TransactionDirection,
  TransactionKind,
  TransactionStatus,
  UserType,
} from '@/types/domain';
import { ApiError, type BalanceApi, type PlanApi } from '../api';
import { request, unwrapList } from './client';
import { toNumber } from './mappers';

const RETURN_URL = 'aqrobazar://payment/success';
const CANCEL_URL = 'aqrobazar://payment/cancel';

const payMethod = (m: PaymentMethod) => (m === 'balance' ? 'wallet' : 'card');

interface ApiPaymentPending {
  status?: string;
  payment_status?: string;
  transaction_id?: string;
  wallet_transaction_id?: number;
  payment_url?: string;
  form_action_url?: string;
}

/** 202 → bank səhifəsinə yönləndirmə; 200/201 → dərhal tamamlanıb (balansdan / pulsuz bankdan). */
function toIntent(res: ApiPaymentPending & Record<string, unknown>): PaymentIntent {
  const url = res.payment_url ?? res.form_action_url ?? null;
  const id = res.transaction_id ?? String(res.wallet_transaction_id ?? res.id ?? Date.now());
  const pending = !!url || res.payment_status === 'pending' || res.status === 'pending';
  return { id, redirectUrl: url, status: pending ? 'pending' : 'completed' };
}

// ---------------------------------------------------------------- tariflər
interface ApiTariff {
  id: number;
  code?: string;
  name: string;
  customer_type?: string;
  monthly_price?: string | number | null;
  yearly_price?: string | number | null;
  price_monthly?: string | number | null;
  price_yearly?: string | number | null;
  old_monthly_price?: string | number | null;
  listing_limit_per_month?: number;
  vip_days_bank?: number;
  premium_days_bank?: number;
  bump_credits_bank?: number;
  is_default?: boolean;
  is_popular?: boolean;
  order?: number;
}

const TIERS: Plan['tier'][] = ['green', 'purple', 'red'];

function mapPlan(t: ApiTariff, index: number, userType: UserType): Plan {
  const monthly = toNumber(t.monthly_price ?? t.price_monthly) ?? 0;
  const yearly = toNumber(t.yearly_price ?? t.price_yearly) ?? monthly * 10;
  const listings = t.listing_limit_per_month ?? 0;
  const vip = t.vip_days_bank ?? 0;
  const premium = t.premium_days_bank ?? 0;
  const bumps = t.bump_credits_bank ?? 0;
  return {
    id: String(t.id),
    name: t.name,
    tier: TIERS[Math.min(index, TIERS.length - 1)],
    userType,
    monthlyPrice: monthly,
    yearlyPrice: yearly,
    oldMonthlyPrice: toNumber(t.old_monthly_price),
    listingsPerMonth: listings,
    vipDays: vip,
    premiumDays: premium,
    bumpCredits: bumps,
    popular: t.is_popular ?? index === 1,
    benefits: [
      `Ayda ${listings} pulsuz elan`,
      `${vip} gün VIP`,
      `${premium} gün Premium`,
      `${bumps} irəli çəkmə`,
    ],
  };
}

interface ApiSubscription {
  id: number;
  tariff: number;
  tariff_code?: string;
  tariff_name?: string;
  billing_period?: string;
  status?: string;
  started_at?: string;
  ends_at?: string;
  is_auto_renew?: boolean;
  listing_limit_per_month_snapshot?: number;
  vip_days_bank_snapshot?: number;
  premium_days_bank_snapshot?: number;
  bump_credits_bank_snapshot?: number;
  paid_amount?: string | number | null;
  listings_used?: number;
}

function mapSubscription(s: ApiSubscription): Subscription {
  return {
    id: String(s.id),
    planId: String(s.tariff),
    planName: s.tariff_name ?? s.tariff_code ?? 'Tarif',
    tier: 'green',
    cycle: s.billing_period === 'yearly' ? 'yearly' : 'monthly',
    status: s.status === 'active' ? 'active' : 'expired',
    startedAt: s.started_at ?? new Date().toISOString(),
    endsAt: s.ends_at ?? new Date().toISOString(),
    paidAmount: toNumber(s.paid_amount) ?? 0,
    listingsUsed: s.listings_used ?? 0,
    listingsLimit: s.listing_limit_per_month_snapshot ?? 0,
    autoRenew: s.is_auto_renew ?? false,
  };
}

export const httpPlans: PlanApi = {
  async plans(userType) {
    const res = await request<ApiTariff[] | { results: ApiTariff[] }>('plan/tariff-plans/', {
      auth: false,
      query: { customer_type: userType === 'corporate' ? 'corporate' : 'individual' },
    });
    const items = unwrapList<ApiTariff>(res)
      .items.filter((t) => !t.is_default)
      .sort((a, b) => (a.order ?? a.id) - (b.order ?? b.id));
    return items.map((t, i) => mapPlan(t, i, userType));
  },

  async current() {
    try {
      const res = await request<ApiSubscription>('plan/customer-subscriptions/active/');
      return res ? mapSubscription(res) : null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async purchase(planId, cycle: BillingCycle, method) {
    const res = await request<ApiPaymentPending & Record<string, unknown>>(
      'plan/customer-subscriptions/purchase/',
      {
        method: 'POST',
        body: {
          tariff_id: Number(planId),
          period: cycle,
          payment_method: payMethod(method),
          return_url: RETURN_URL,
          cancel_url: CANCEL_URL,
        },
      },
    );
    return toIntent(res);
  },

  async setAutoRenew(enabled) {
    const res = await request<ApiSubscription>('plan/customer-subscriptions/active/', {
      method: 'PATCH',
      body: { is_auto_renew: enabled },
    });
    return mapSubscription(res);
  },
};

// ---------------------------------------------------------------- balans
interface ApiWalletTx {
  id: number;
  amount: string | number;
  direction?: string;
  status?: string;
  purpose?: string;
  title?: string | null;
  description?: string | null;
  created_at: string;
}

const TX_KIND: Record<string, TransactionKind> = {
  topup: 'topup',
  top_up: 'topup',
  deposit: 'topup',
  subscription: 'plan',
  tariff: 'plan',
  vip: 'vip',
  premium: 'premium',
  bump: 'bump',
  listing_fee: 'listing_fee',
  renew: 'renew',
};

const TX_STATUS: Record<string, TransactionStatus> = {
  completed: 'completed',
  success: 'completed',
  succeeded: 'completed',
  pending: 'pending',
  failed: 'failed',
  error: 'failed',
  canceled: 'failed',
};

function mapTx(t: ApiWalletTx): Transaction {
  const purpose = (t.purpose ?? '').toLowerCase();
  const direction: TransactionDirection =
    (t.direction ?? '').toLowerCase().startsWith('in') || purpose.includes('top') ? 'in' : 'out';
  return {
    id: String(t.id),
    kind: TX_KIND[purpose] ?? 'topup',
    title: t.title ?? t.description ?? 'Əməliyyat',
    amount: Math.abs(toNumber(t.amount) ?? 0),
    direction,
    status: TX_STATUS[(t.status ?? '').toLowerCase()] ?? 'completed',
    createdAt: t.created_at,
  };
}

export const httpBalance: BalanceApi = {
  async transactions() {
    const res = await request<unknown>('plan/wallet-transactions/', { query: { page_size: 50 } });
    return unwrapList<ApiWalletTx>(res).items.map(mapTx);
  },

  async topUp(amount) {
    const res = await request<ApiPaymentPending & Record<string, unknown>>('plan/wallets/my/topup/', {
      method: 'POST',
      body: { amount: amount.toFixed(2), return_url: RETURN_URL, cancel_url: CANCEL_URL },
    });
    return toIntent(res);
  },

  async paymentStatus(intentId): Promise<PaymentStatus> {
    const res = await request<{ status?: string; payment_status?: string }>(
      'plan/me/payment-checkout-result/',
      { query: { order: intentId } },
    );
    const raw = (res.payment_status ?? res.status ?? 'pending').toLowerCase();
    if (['completed', 'success', 'succeeded', 'paid'].includes(raw)) return 'completed';
    if (['failed', 'error', 'canceled', 'cancelled', 'declined'].includes(raw)) return 'failed';
    return 'pending';
  },
};

// ---------------------------------------------------------------- təşviqlər
interface ApiPackage {
  id: number;
  type: string;
  code: string;
  name: string;
  base_price_azn: string;
  duration_days: number;
  bump_count: number;
  includes_vip: boolean;
  is_active: boolean;
  is_public: boolean;
  order: number;
}

let packagesCache: ApiPackage[] | null = null;

async function loadPackages(): Promise<ApiPackage[]> {
  if (packagesCache) return packagesCache;
  const res = await request<ApiPackage[] | { results: ApiPackage[] }>('plan/service-packages/', { auth: false });
  packagesCache = unwrapList<ApiPackage>(res).items.filter((p) => p.is_active && p.is_public);
  return packagesCache;
}

const PROMO_SUBTITLE: Record<PromotionKind, string> = {
  bump: 'Elan bütün və axtarış nəticələrinin içində birinci yerə qalxacaq',
  vip: 'Elan kateqoriyanın fırlanan VIP blokunda göstəriləcək',
  premium: 'Elan ayrıca Premium bölməsində göstəriləcək və VIP-i də əhatə edir',
};

const APPLY_PATH: Record<PromotionKind, string> = {
  vip: 'apply-vip',
  premium: 'apply-premium',
  bump: 'apply-bump',
};

export async function promotionOffer(
  listingId: number,
  kind: PromotionKind,
  freeLeft: number,
): Promise<PromotionOffer> {
  const packages = (await loadPackages()).filter((p) => p.type === kind).sort((a, b) => a.order - b.order);
  const options: PromotionOption[] = packages.map((p, i) => ({
    id: String(p.id),
    label: p.name,
    price: toNumber(p.base_price_azn) ?? 0,
    hot: i === 2,
  }));
  return { kind, subtitle: PROMO_SUBTITLE[kind], options, freeLeft, bonus: null };
}

export async function applyPromotion(
  listingPk: number,
  kind: PromotionKind,
  packageId: string,
  method: PaymentMethod,
): Promise<PaymentIntent> {
  const res = await request<ApiPaymentPending & Record<string, unknown>>(
    `plan/listings/${listingPk}/${APPLY_PATH[kind]}/`,
    {
      method: 'POST',
      body: {
        package_id: Number(packageId),
        payment_method: payMethod(method),
        return_url: RETURN_URL,
        cancel_url: CANCEL_URL,
      },
    },
  );
  return toIntent(res);
}
