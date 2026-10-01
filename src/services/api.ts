import type {
  AppNotification,
  AuthSession,
  Banner,
  BillingCycle,
  Category,
  Entitlements,
  FavoriteStore,
  Listing,
  ListingFilter,
  NotificationSort,
  ListingStatus,
  ListingSummary,
  ListingType,
  OtpRequestResult,
  Paginated,
  PaymentIntent,
  PaymentMethod,
  PaymentStatus,
  Plan,
  PromotionKind,
  PromotionOffer,
  Store,
  Subscription,
  Transaction,
  User,
  UserType,
} from '@/types/domain';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status = 400,
  ) {
    super(message);
  }
}

export interface AuthApi {
  requestOtp(phone: string): Promise<OtpRequestResult>;
  verifyOtp(phone: string, code: string): Promise<AuthSession>;
  me(): Promise<User>;
  completeProfile(input: { fullName: string; email: string }): Promise<User>;
  updateProfile(input: { city?: string; avatarUri?: string }): Promise<User>;
  deleteAccount(): Promise<void>;
  logout(): Promise<void>;
  entitlements(): Promise<Entitlements>;
}

export interface SearchSuggestion {
  query: string;
  categoryId: string | null;
  categoryName: string;
}

export interface CatalogApi {
  categories(): Promise<Category[]>;
  banners(): Promise<Banner[]>;
  suggestions(query: string): Promise<SearchSuggestion[]>;
}

export interface CreateListingInput {
  categoryId: string;
  subcategoryId: string;
  subsubId: string | null;
  type: ListingType;
  price: number | null;
  negotiable: boolean;
  city: string;
  title: string;
  description: string;
  whatsapp: string;
  images: string[];
  videoUri: string | null;
  fields: Record<string, string | number>;
}

export interface ListingApi {
  search(filter: ListingFilter, page: number): Promise<Paginated<ListingSummary>>;
  /** Süzgəcsiz — ana səhifə (backend ədalətli sıralama); süzgəclə — kateqoriya/alt kateqoriya/növ üzrə */
  premium(filter?: ListingFilter): Promise<ListingSummary[]>;
  vip(categoryId?: string): Promise<ListingSummary[]>;
  byId(id: string): Promise<Listing>;
  mine(status: ListingStatus): Promise<ListingSummary[]>;
  create(input: CreateListingInput): Promise<Listing>;
  update(id: string, input: Partial<CreateListingInput>): Promise<Listing>;
  remove(id: string): Promise<void>;
  renew(id: string, method: PaymentMethod): Promise<Listing>;
  bump(id: string): Promise<Listing>;
  promotionOffer(id: string, kind: PromotionKind): Promise<PromotionOffer>;
  promote(input: {
    listingId: string;
    kind: PromotionKind;
    optionId: string;
    method: PaymentMethod;
  }): Promise<PaymentIntent>;
}

export interface CreateStoreInput {
  name: string;
  description: string;
  categoryId: string | null;
  logoUri: string | null;
  coverUri: string | null;
  city: string;
  address: string;
  workingHours: { open: string; close: string } | null;
  phone: string;
  whatsapp: string;
  website: string | null;
  youtube: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
}

export interface StoreApi {
  list(query?: string): Promise<Store[]>;
  byId(id: string): Promise<Store>;
  listings(storeId: string): Promise<ListingSummary[]>;
  mine(): Promise<Store | null>;
  create(input: CreateStoreInput): Promise<Store>;
  update(input: Partial<CreateStoreInput>): Promise<Store>;
}

export interface FavoriteApi {
  listings(anonId: string | null): Promise<ListingSummary[]>;
  stores(anonId: string | null): Promise<FavoriteStore[]>;
  ids(anonId: string | null): Promise<{ listings: string[]; stores: string[] }>;
  addListing(id: string, anonId: string | null): Promise<void>;
  removeListing(id: string, anonId: string | null): Promise<void>;
  addStore(id: string, anonId: string | null): Promise<void>;
  removeStore(id: string, anonId: string | null): Promise<void>;
  removeListings(ids: string[], anonId: string | null): Promise<void>;
  mergeGuest(anonId: string): Promise<void>;
}

export interface BalanceApi {
  transactions(): Promise<Transaction[]>;
  topUp(amount: number): Promise<PaymentIntent>;
  paymentStatus(intentId: string): Promise<PaymentStatus>;
}

export interface PlanApi {
  plans(userType: UserType): Promise<Plan[]>;
  current(): Promise<Subscription | null>;
  purchase(planId: string, cycle: BillingCycle, method: PaymentMethod): Promise<PaymentIntent>;
  setAutoRenew(enabled: boolean): Promise<Subscription>;
}

export interface NotificationApi {
  list(sort: NotificationSort): Promise<AppNotification[]>;
  unreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface ContactApi {
  send(input: { name: string; phone: string; message: string }): Promise<void>;
}

export interface Api {
  auth: AuthApi;
  notifications: NotificationApi;
  catalog: CatalogApi;
  listings: ListingApi;
  stores: StoreApi;
  favorites: FavoriteApi;
  balance: BalanceApi;
  plans: PlanApi;
  contact: ContactApi;
}
