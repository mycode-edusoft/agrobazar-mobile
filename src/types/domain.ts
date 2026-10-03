import type { WeeklyHours } from '@/lib/storeHours';
export type UserType = 'individual' | 'corporate';

export interface User {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  city: string | null;
  avatarUrl: string | null;
  type: UserType;
  balance: number;
  storeId: string | null;
  createdAt: string;
}

export type BlockReason = 'plan_limit' | 'free_limit' | 'profile_incomplete';

export interface Entitlements {
  planName: string;
  freeListingsLeft: number;
  vipDaysLeft: number;
  premiumDaysLeft: number;
  bumpCreditsLeft: number;
  canPostListing: boolean;
  blockReason: BlockReason | null;
  imageLimit: { min: number; max: number };
}

export type StoreStatus = 'pending' | 'approved' | 'hidden';

export interface StoreWorkingHours {
  open: string;
  close: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  logoUrl: string | null;
  coverUrl: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  workingHours: StoreWorkingHours | null;
  /** Həftəlik qrafik (gün-gün); yoxdursa workingHours bütün günlərə aiddir */
  schedule?: WeeklyHours | null;
  status: StoreStatus;
  activeListingsCount: number;
  totalViews: number;
  categoryId: string | null;
}

export type ListingStatus = 'draft' | 'active' | 'expired' | 'rejected';
export type ListingType = 'sale' | 'rent' | 'wanted' | 'offer';

export interface Category {
  id: string;
  name: string;
  /** Vektor ikon adı (mock/fallback) */
  icon: string;
  /** Backend-dən gələn kateqoriya şəkli — dizaynda foto istifadə olunur */
  imageUrl?: string | null;
  subcategories: Subcategory[];
}

export interface Banner {
  id: string;
  image: string;
  title: string | null;
  highlight: string | null;
  categoryId: string | null;
  /** Xarici keçid (backend banner-ləri link ilə gəlir) */
  link?: string | null;
}

export interface Subcategory {
  id: string;
  name: string;
  subsubcategories: SubSubcategory[];
  fields: DynamicFieldDef[];
}

export interface SubSubcategory {
  id: string;
  name: string;
}

export type DynamicFieldType = 'text' | 'number' | 'select';

export interface DynamicFieldDef {
  key: string;
  label: string;
  type: DynamicFieldType;
  required: boolean;
  options?: string[];
  unit?: string;
}

export interface ListingPromotions {
  vipUntil: string | null;
  premiumUntil: string | null;
  bumpedAt: string | null;
}

export interface Listing {
  id: string;
  ownerId: string;
  storeId: string | null;
  categoryId: string;
  subcategoryId: string;
  subsubId: string | null;
  type: ListingType;
  title: string;
  description: string;
  price: number | null;
  negotiable: boolean;
  city: string;
  whatsapp: string;
  phone: string;
  images: string[];
  videoUrl: string | null;
  fields: Record<string, string | number>;
  status: ListingStatus;
  rejectionReason: string | null;
  promotions: ListingPromotions;
  views: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  internationalDelivery: boolean;
  sellerName: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  price: number | null;
  negotiable: boolean;
  type: ListingType;
  city: string;
  image: string | null;
  createdAt: string;
  status: ListingStatus;
  promotions: ListingPromotions;
  internationalDelivery: boolean;
  subsubName: string | null;
}

export type SortOption = 'date' | 'price_desc' | 'price_asc';

export interface ListingFilter {
  query?: string;
  categoryId?: string;
  subcategoryId?: string;
  subsubIds?: string[];
  city?: string;
  priceMin?: number;
  priceMax?: number;
  types?: ListingType[];
  sort?: SortOption;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  hasMore: boolean;
}

export type BillingCycle = 'monthly' | 'yearly';
export type PlanTier = 'green' | 'purple' | 'red';

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  userType: UserType;
  monthlyPrice: number;
  yearlyPrice: number;
  oldMonthlyPrice: number | null;
  listingsPerMonth: number;
  vipDays: number;
  premiumDays: number;
  bumpCredits: number;
  benefits: string[];
  popular: boolean;
}

export type SubscriptionStatus = 'active' | 'expired';

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  tier: PlanTier;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  startedAt: string;
  endsAt: string;
  paidAmount: number;
  listingsUsed: number;
  listingsLimit: number;
  autoRenew: boolean;
}

export type TransactionKind =
  | 'topup'
  | 'plan'
  | 'vip'
  | 'premium'
  | 'bump'
  | 'listing_fee'
  | 'renew';
export type TransactionDirection = 'in' | 'out';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  title: string;
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
  createdAt: string;
}

export type PaymentMethod = 'card' | 'balance';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface PaymentIntent {
  id: string;
  redirectUrl: string | null;
  status: PaymentStatus;
}

export interface OtpRequestResult {
  resendAfterSeconds: number;
  resendsLeft: number;
  codeLength: number;
}

export interface AuthSession {
  token: string;
  /** JWT refresh token (real API); mock-da yoxdur */
  refreshToken?: string;
  user: User;
  isNewUser: boolean;
}

export type PromotionKind = 'vip' | 'premium' | 'bump';

export interface PromotionOption {
  id: string;
  label: string;
  price: number;
  hot: boolean;
}

export interface PromotionOffer {
  kind: PromotionKind;
  subtitle: string;
  options: PromotionOption[];
  /** Tarifdən gələn pulsuz bank (gün / kredit sayı) */
  freeLeft: number;
  bonus: { before: string; now: string; paidUntil: string } | null;
}

export type NotificationKind = 'vip' | 'premium' | 'listing' | 'payment' | 'system';
export type NotificationSort = 'newest' | 'oldest' | 'read' | 'unread';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  listingId: string | null;
}

export interface FavoriteStore {
  id: string;
  name: string;
  logoUrl: string | null;
  activeListingsCount: number;
}

// --- Elan statistikası (backend: GET plan/listings/<id>/metrics/) ---------------
// Sahə `undefined` — metrik sahibin tarifinə daxil deyil; `null` — tarifdədir, amma hələ məlumat yoxdur.

export type InsightPeriod = '24h' | '7d' | '30d';

export interface PromotionImpact {
  /** Promosiyadan əvvəl/sonra baxış fərqi */
  diff: Record<InsightPeriod, number>;
  /** Fərqin faizi; əvvəl 0 baxış olubsa null */
  pct: Record<InsightPeriod, number | null>;
}

export type CategoryRankBand = 'top_10' | 'top_20' | 'top_50' | '50_plus';

export interface ListingInsights {
  tariffCode: string | null;
  /** Metrik kodu → bir cümləlik izah (backend `metric_descriptions`) */
  descriptions: Record<string, string>;
  // traffic
  viewsLast24h?: number;
  viewsLast7d?: number;
  viewsLast30d?: number;
  bestWeekday?: number | null; // 0 = Bazar ertəsi
  bestHour?: number | null;
  peakInterval?: { start: number; end: number } | null;
  // engagement
  ctr?: number | null; // 0..1
  // gallery
  topViewedImage?: number | null;
  avgLastImagePosition?: number | null;
  lastImageReachRate?: number | null; // 0..1
  galleryToDetailRatio?: number | null;
  // contacts
  contactsLast24h?: number;
  contactsLast7d?: number;
  favoritesLast7d?: number;
  // benchmarks
  categoryRankBand?: CategoryRankBand | null;
  categoryAvgViews?: number | null;
  categoryViewsRatio?: number | null;
  priceBucketAvgViews?: number | null;
  // promotion_impact
  premiumImpact?: PromotionImpact | null;
  vipImpact?: PromotionImpact | null;
  bumpImpact?: PromotionImpact | null;
  /** Qrafik üçün dövr üzrə baxış seriyası — backend hələ vermir (null) */
  series: Partial<Record<InsightPeriod, { label: string; value: number }[]>> | null;
}
