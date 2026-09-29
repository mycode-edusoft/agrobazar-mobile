import type {
  Category,
  DynamicFieldDef,
  Listing,
  ListingStatus,
  ListingSummary,
  ListingType,
  Store,
} from '@/types/domain';

export interface ApiRef {
  id: number;
  name: string;
  slug: string;
}

export interface ApiImage {
  id?: number;
  position?: number;
  original_url?: string;
  url?: string;
}

export interface ApiListing {
  id: number;
  slug: string;
  title: string;
  description?: string;
  contact_name?: string | null;
  service_type: string;
  price: string | null;
  status: string;
  city: ApiRef | null;
  category: ApiRef | null;
  subcategory: ApiRef | null;
  subsubcategory: ApiRef | null;
  images?: ApiImage[];
  cover_image?: string | null;
  video?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  attributes?: { key?: string; slug?: string; name?: string; label?: string; value?: unknown }[];
  short_attributes?: { name?: string; label?: string; value?: unknown }[];
  is_vip?: boolean;
  vip_until?: string | null;
  is_premium?: boolean;
  premium_until?: string | null;
  is_highlighted?: boolean;
  is_favorited?: boolean;
  has_store?: boolean;
  owner_id?: number;
  owner?: { id?: number; full_name?: string | null; store?: { id?: number; name?: string } | null } | null;
  views_count?: number;
  created_at: string;
  updated_at?: string;
  expires_at?: string | null;
  bumped_at?: string | null;
  rejection_reason?: string | null;
}

export const SERVICE_TYPE_TO_API: Record<ListingType, string> = {
  sale: 'sell',
  rent: 'rent',
  wanted: 'wanted',
  offer: 'offer',
};

const API_TO_SERVICE_TYPE: Record<string, ListingType> = {
  sell: 'sale',
  rent: 'rent',
  wanted: 'wanted',
  offer: 'offer',
};

const API_TO_STATUS: Record<string, ListingStatus> = {
  active: 'active',
  draft: 'draft',
  pending: 'draft',
  moderation: 'draft',
  in_review: 'draft',
  expired: 'expired',
  rejected: 'rejected',
};

export const toListingType = (v: string): ListingType => API_TO_SERVICE_TYPE[v] ?? 'sale';
export const toStatus = (v: string): ListingStatus => API_TO_STATUS[v] ?? 'draft';

export const toNumber = (v: unknown): number | null => {
  if (v == null || v === '') return null;
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

const imageUrls = (l: ApiListing): string[] => {
  const list = (l.images ?? []).map((i) => i.original_url ?? i.url ?? '').filter(Boolean);
  if (list.length > 0) return list;
  return l.cover_image ? [l.cover_image] : [];
};

export function mapSummary(l: ApiListing): ListingSummary {
  return {
    id: l.slug || String(l.id),
    title: l.title,
    price: toNumber(l.price),
    negotiable: toNumber(l.price) == null,
    type: toListingType(l.service_type),
    city: l.city?.name ?? '',
    image: l.cover_image ?? imageUrls(l)[0] ?? null,
    createdAt: l.created_at,
    status: toStatus(l.status),
    promotions: {
      vipUntil: l.is_vip ? l.vip_until ?? farFuture() : null,
      premiumUntil: l.is_premium ? l.premium_until ?? farFuture() : null,
      bumpedAt: l.bumped_at ?? null,
    },
    internationalDelivery: false,
    subsubName: l.subsubcategory?.name ?? null,
  };
}

export function mapListing(l: ApiListing): Listing {
  const attrs: Record<string, string | number> = {};
  for (const a of l.attributes ?? l.short_attributes ?? []) {
    const key = (a as { key?: string; slug?: string; name?: string }).key
      ?? (a as { slug?: string }).slug
      ?? (a as { name?: string }).name;
    if (!key) continue;
    const value = (a as { value?: unknown }).value;
    if (value == null) continue;
    attrs[key] = typeof value === 'number' ? value : String(value);
  }
  return {
    id: l.slug || String(l.id),
    ownerId: String(l.owner_id ?? l.owner?.id ?? ''),
    storeId: l.owner?.store?.id != null ? String(l.owner.store.id) : null,
    categoryId: l.category?.slug ?? '',
    subcategoryId: l.subcategory?.slug ?? '',
    subsubId: l.subsubcategory?.slug ?? null,
    type: toListingType(l.service_type),
    title: l.title,
    description: l.description ?? '',
    price: toNumber(l.price),
    negotiable: toNumber(l.price) == null,
    city: l.city?.name ?? '',
    whatsapp: l.whatsapp ?? '',
    phone: l.phone ?? '',
    images: imageUrls(l),
    videoUrl: l.video ?? null,
    fields: attrs,
    status: toStatus(l.status),
    rejectionReason: l.rejection_reason ?? null,
    promotions: {
      vipUntil: l.is_vip ? l.vip_until ?? farFuture() : null,
      premiumUntil: l.is_premium ? l.premium_until ?? farFuture() : null,
      bumpedAt: l.bumped_at ?? null,
    },
    views: l.views_count ?? 0,
    createdAt: l.created_at,
    updatedAt: l.updated_at ?? l.created_at,
    expiresAt: l.expires_at ?? null,
    internationalDelivery: false,
    sellerName: l.owner?.store?.name ?? l.contact_name ?? l.owner?.full_name ?? '',
  };
}

function farFuture() {
  return new Date(Date.now() + 30 * 86_400_000).toISOString();
}

export interface ApiCategory extends ApiRef {
  image?: { url?: string } | null;
  subcategories?: ApiSubcategory[];
}

export interface ApiSubcategory extends ApiRef {
  subsubcategories?: ApiRef[];
}

export function mapCategory(c: ApiCategory): Category {
  return {
    id: c.slug,
    name: c.name,
    icon: 'shape-outline',
    imageUrl: c.image?.url ?? null,
    subcategories: (c.subcategories ?? []).map((s) => ({
      id: s.slug,
      name: s.name,
      subsubcategories: (s.subsubcategories ?? []).map((ss) => ({ id: ss.slug, name: ss.name })),
      // Dinamik sahələr alt-alt kateqoriyaya bağlıdır, ayrıca endpoint-dən yüklənir
      fields: [] as DynamicFieldDef[],
    })),
  };
}

export interface ApiStore {
  id: number;
  slug?: string;
  name: string;
  description?: string | null;
  city?: ApiRef | string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  logo?: { url?: string } | string | null;
  cover?: { url?: string } | string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  work_start?: string | null;
  work_end?: string | null;
  is_approved?: boolean;
  status?: string;
  listings_count?: number;
  views_count?: number;
  owner_id?: number;
}

const media = (v: { url?: string } | string | null | undefined): string | null =>
  typeof v === 'string' ? v : v?.url ?? null;

export function mapStore(s: ApiStore): Store {
  const city = typeof s.city === 'string' ? s.city : s.city?.name ?? '';
  return {
    id: s.slug ?? String(s.id),
    ownerId: String(s.owner_id ?? ''),
    name: s.name,
    description: s.description ?? '',
    city,
    address: s.address ?? '',
    phone: s.phone ?? '',
    whatsapp: s.whatsapp ?? '',
    logoUrl: media(s.logo),
    coverUrl: media(s.cover),
    website: s.website ?? null,
    facebook: s.facebook ?? null,
    instagram: s.instagram ?? null,
    tiktok: s.tiktok ?? null,
    youtube: s.youtube ?? null,
    workingHours: s.work_start && s.work_end ? { open: s.work_start, close: s.work_end } : null,
    status: s.is_approved || s.status === 'approved' ? 'approved' : 'pending',
    activeListingsCount: s.listings_count ?? 0,
    totalViews: s.views_count ?? 0,
    categoryId: null,
  };
}
