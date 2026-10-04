import type { Listing, ListingStatus, ListingSummary, Paginated } from '@/types/domain';
import { ApiError, type CreateListingInput, type ListingApi } from '../api';
import { httpAuth } from './auth';
import { mapDailyViews, mapInsights, type ApiDailySeries, type ApiMetrics } from './insights';
import { cityIdByName } from './catalog';
import { applyPromotion, promotionOffer } from './plan';
import { request, unwrapList } from './client';
import { detailUrl, listingPathOf, rememberFromListing, rememberListingPath, type ListingPath } from './listingPaths';
import { mapListing, mapSummary, SERVICE_TYPE_TO_API, type ApiListing } from './mappers';

const PAGE_SIZE = 20;

const SORT_TO_API: Record<string, string> = {
  date: 'date',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
};

const STATUS_TO_API: Record<ListingStatus, string> = {
  active: 'active',
  draft: 'pending',
  expired: 'expired',
  rejected: 'rejected',
};

interface ApiDetailRedirect {
  redirect: true;
  canonical_path: ListingPath & { listing: string };
}

/** Kateqoriya zənciri: yaddaşdan, yoxdursa axtarışdan (axtarış indeksində yalnız aktiv elanlar var). */
async function resolvePath(slug: string, fresh = false): Promise<ListingPath> {
  const known = fresh ? undefined : listingPathOf(slug);
  if (known) return known;
  const res = await request<unknown>('listings/es_filter_search/', {
    auth: false,
    query: { q: slug, page_size: 20 },
  });
  unwrapList<ApiListing>(res).items.forEach(rememberFromListing);
  const found = listingPathOf(slug);
  if (!found) throw new ApiError('Elan tapılmadı', 'not_found', 404);
  return found;
}

/**
 * Elan detalı — rəsmi detal endpoint-i: baxış sayğacı və statistika yalnız burada yazılır (sahib, bot və təkrar
 * baxış serverdə süzülür). Aktiv olmayan elanları da qaytarır (sahibin geri qaytarılmış/bitmiş elanları).
 */
async function detailBySlug(slug: string): Promise<ApiListing> {
  const load = async (path: ListingPath, s: string): Promise<ApiListing> => {
    const res = await request<ApiListing | ApiDetailRedirect>(detailUrl(path, s));
    if ('redirect' in res && res.redirect) {
      // Köhnə slug (başlıq dəyişib) → kanonik ünvan
      const c = res.canonical_path;
      rememberListingPath(c.listing, c);
      return request<ApiListing>(detailUrl(c, c.listing));
    }
    return res as ApiListing;
  };
  const path = await resolvePath(slug);
  try {
    return await load(path, slug);
  } catch (e) {
    // Yaddaşdakı zəncir köhnəlib (elanın kateqoriyası dəyişib) — bir dəfə axtarışdan təzələ
    if (!(e instanceof ApiError) || e.status !== 404) throw e;
    const fresh = await resolvePath(slug, true);
    if (fresh.category === path.category && fresh.subcategory === path.subcategory && fresh.subsubcategory === path.subsubcategory) throw e;
    return load(fresh, slug);
  }
}

export const httpListings: ListingApi = {
  async search(filter, page): Promise<Paginated<ListingSummary>> {
    // Backend `city` = City id (slug da qəbul olunur); filter ekranı şəhərin adını saxlayır
    const cityId = filter.city ? await cityIdByName(filter.city) : null;
    const res = await request<unknown>('listings/es_filter_search/', {
      auth: false,
      query: {
        page,
        page_size: PAGE_SIZE,
        q: filter.query,
        category: filter.categoryId,
        subcategory: filter.subcategoryId,
        subsubcategory: filter.subsubIds?.[0],
        price_min: filter.priceMin,
        price_max: filter.priceMax,
        city: cityId ?? undefined,
        service_type: filter.types?.length === 1 ? SERVICE_TYPE_TO_API[filter.types[0]] : undefined,
        sort: SORT_TO_API[filter.sort ?? 'date'],
        is_vip: false,
        is_premium: false,
      },
    });
    const { items, count, hasNext } = unwrapList<ApiListing>(res);
    return { items: items.map(mapSummary), total: count, page, hasMore: hasNext };
  },

  async premiumPage(page) {
    const res = await request<unknown>('listings/listings/premium/', { auth: false, query: { page, page_size: 8 } });
    const { items, count, hasNext } = unwrapList<ApiListing>(res);
    return { items: items.map(mapSummary), total: count, page, hasMore: hasNext };
  },

  async premium(filter) {
    // `listings/premium/` kateqoriya filtrini qəbul etmir (backend boşluğu) — süzgəc varsa
    // premium elanlar ES axtarışından `is_premium=true` ilə götürülür
    if (filter?.categoryId || filter?.query) {
      const res = await request<unknown>('listings/es_filter_search/', {
        auth: false,
        query: {
          page_size: 10,
          q: filter.query,
          category: filter.categoryId,
          subcategory: filter.subcategoryId,
          subsubcategory: filter.subsubIds?.[0],
          is_premium: true,
        },
      });
      return unwrapList<ApiListing>(res).items.map(mapSummary);
    }
    const res = await request<unknown>('listings/listings/premium/', { auth: false, query: { page_size: 10 } });
    return unwrapList<ApiListing>(res).items.map(mapSummary);
  },

  async vip(categoryId) {
    const res = await request<unknown>('listings/es-vip-rotating/', {
      auth: false,
      query: { page_size: 10, category: categoryId },
    });
    return unwrapList<ApiListing>(res).items.map(mapSummary);
  },

  async byId(id): Promise<Listing> {
    return mapListing(await detailBySlug(id));
  },

  async insights(id) {
    const listing = await detailBySlug(id);
    const insights = mapInsights(await request<ApiMetrics>(`plan/listings/${listing.id}/metrics/`));
    // Qrafik: seriya yalnız tarifin açdığı dövr üçün istənilir. Endpoint hələ deploy olunmayıbsa (404)
    // və ya xəta olarsa qrafik boş vəziyyətdə qalır — əsas metriklər ondan asılı deyil.
    const daily = (days: 7 | 30) =>
      request<ApiDailySeries>(`plan/listings/${listing.id}/metrics/daily/`, { query: { days } })
        .then(mapDailyViews)
        .catch(() => null);
    const [week, month] = await Promise.all([
      insights.viewsLast7d !== undefined ? daily(7) : Promise.resolve(null),
      insights.viewsLast30d !== undefined ? daily(30) : Promise.resolve(null),
    ]);
    const series = { ...(week ? { '7d': week } : {}), ...(month ? { '30d': month } : {}) };
    return { ...insights, series: Object.keys(series).length ? series : null };
  },

  async mine(status) {
    const res = await request<unknown>('listings/listings/my/', {
      query: { status: STATUS_TO_API[status], page_size: 50 },
    });
    return unwrapList<ApiListing>(res).items.map(mapSummary);
  },

  async create(input: CreateListingInput): Promise<Listing> {
    const cityId = await cityIdByName(input.city);
    if (cityId == null) throw new ApiError('Şəhər tapılmadı', 'invalid_city', 400);
    if (!input.subsubId) throw new ApiError('Alt kateqoriya seçilməyib', 'invalid_subsubcategory', 400);

    const payload = {
      title: input.title,
      ...(input.contactName ? { contact_name: input.contactName } : {}),
      description: input.description,
      service_type: SERVICE_TYPE_TO_API[input.type],
      price: input.price != null ? String(input.price) : undefined,
      city: cityId,
      subsubcategory_slug: input.subsubId,
      whatsapp: input.whatsapp,
      user_signed: true,
      images: input.images.map((url, i) => ({ original_url: url, position: i + 1 })),
      attributes: Object.entries(input.fields).map(([key, value]) => ({ key, value })),
    };

    const res = await request<ApiListing & { payment_pending?: boolean; payment_url?: string }>(
      'listings/listings/create/',
      { method: 'POST', body: payload },
    );
    if (res.payment_pending) {
      throw new ApiError('Elan haqqı ödənilməlidir — ödəniş axını hələ bağlanmayıb', 'payment_required', 402);
    }
    return mapListing(res);
  },

  async update(id, input) {
    const listing = await detailBySlug(id);
    const cityId = input.city ? await cityIdByName(input.city) : undefined;
    const res = await request<ApiListing>(`listings/listings/${listing.id}/update/`, {
      method: 'PATCH',
      body: {
        ...(input.title != null ? { title: input.title } : {}),
        ...(input.contactName !== undefined ? { contact_name: input.contactName || null } : {}),
        ...(input.description != null ? { description: input.description } : {}),
        ...(input.type != null ? { service_type: SERVICE_TYPE_TO_API[input.type] } : {}),
        ...(input.price !== undefined ? { price: input.price != null ? String(input.price) : null } : {}),
        ...(cityId != null ? { city: cityId } : {}),
        ...(input.subsubId ? { subsubcategory_slug: input.subsubId } : {}),
        ...(input.whatsapp != null ? { whatsapp: input.whatsapp } : {}),
        ...(input.images ? { images: input.images.map((url, i) => ({ original_url: url, position: i + 1 })) } : {}),
        ...(input.fields ? { attributes: Object.entries(input.fields).map(([key, value]) => ({ key, value })) } : {}),
      },
    });
    return mapListing(res);
  },

  async remove(id) {
    const listing = await detailBySlug(id);
    await request(`listings/listings/${listing.id}/delete/`, { method: 'DELETE' });
  },

  async renew(id, method) {
    const listing = await detailBySlug(id);
    const res = await request<ApiListing & { payment_pending?: boolean }>(
      `listings/listings/${listing.id}/renew/`,
      { method: 'POST', body: { payment_method: method === 'balance' ? 'wallet' : 'card' } },
    );
    if (res.payment_pending) throw new ApiError('Ödəniş tələb olunur', 'payment_required', 402);
    return mapListing(res);
  },

  async bump(id) {
    const listing = await detailBySlug(id);
    await request(`plan/listings/${listing.id}/apply-bump/`, { method: 'POST', body: {} });
    return mapListing(await detailBySlug(id));
  },

  async promotionOffer(id, kind) {
    const listing = await detailBySlug(id);
    const ent = await entitlementsSafe();
    const freeLeft =
      kind === 'vip' ? ent.vipDaysLeft : kind === 'premium' ? ent.premiumDaysLeft : ent.bumpCreditsLeft;
    return promotionOffer(listing.id, kind, freeLeft);
  },

  async promote({ listingId, kind, optionId, method }) {
    const listing = await detailBySlug(listingId);
    return applyPromotion(listing.id, kind, optionId, method);
  },
};

async function entitlementsSafe() {
  try {
    return await httpAuth.entitlements();
  } catch {
    return { vipDaysLeft: 0, premiumDaysLeft: 0, bumpCreditsLeft: 0 };
  }
}
