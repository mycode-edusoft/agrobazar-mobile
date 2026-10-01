import type { Listing, ListingStatus, ListingSummary, Paginated } from '@/types/domain';
import { ApiError, type CreateListingInput, type ListingApi } from '../api';
import { httpAuth } from './auth';
import { cityIdByName } from './catalog';
import { applyPromotion, promotionOffer } from './plan';
import { request, unwrapList } from './client';
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

async function detailBySlug(slug: string): Promise<ApiListing> {
  // Elan detalı üçün birbaşa endpoint yoxdur — slug üzrə axtarışdan tapılır
  const res = await request<unknown>('listings/es_filter_search/', {
    auth: false,
    query: { q: slug, page_size: 20 },
  });
  const items = unwrapList<ApiListing>(res).items;
  const found = items.find((l) => l.slug === slug || String(l.id) === slug);
  if (!found) throw new ApiError('Elan tapılmadı', 'not_found', 404);
  return found;
}

export const httpListings: ListingApi = {
  async search(filter, page): Promise<Paginated<ListingSummary>> {
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
        service_type: filter.types?.length === 1 ? SERVICE_TYPE_TO_API[filter.types[0]] : undefined,
        sort: SORT_TO_API[filter.sort ?? 'date'],
        is_vip: false,
        is_premium: false,
      },
    });
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
