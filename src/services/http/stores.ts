import type { Store } from '@/types/domain';
import { ApiError, type ContactApi, type CreateStoreInput, type StoreApi } from '../api';
import { formatWeek, parseWeek } from '@/lib/storeHours';
import { request, unwrapList } from './client';
import { mapSummary, type ApiListing } from './mappers';

interface ApiMedia {
  url?: string;
}

interface ApiStoreRow {
  id: number;
  store_name: string;
  slug: string;
  cover_image?: ApiMedia | string | null;
  logo?: ApiMedia | string | null;
  city?: { id: number; name: string; slug: string } | string | null;
  address?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;
  website?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  info?: string | null;
  business_hours?: string | null;
  published_listings_count?: number;
  total_views_count?: number;
  owner_id?: number;
  is_approved?: boolean;
  status?: string;
}

const media = (v: ApiMedia | string | null | undefined): string | null =>
  typeof v === 'string' ? v : v?.url ?? null;

// Backend iş saatlarını sərbəst mətn kimi saxlayır: "09:00 - 18:00"
function parseHours(value: string | null | undefined) {
  if (!value) return null;
  const m = value.match(/(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/);
  return m ? { open: m[1].replace('.', ':'), close: m[2].replace('.', ':') } : null;
}

const formatHours = (open: string, close: string) => `${open} - ${close}`;

function mapRow(s: ApiStoreRow): Store {
  return {
    id: s.slug || String(s.id),
    ownerId: String(s.owner_id ?? ''),
    name: s.store_name,
    description: s.info ?? '',
    city: typeof s.city === 'string' ? s.city : s.city?.name ?? '',
    address: s.address ?? '',
    phone: s.contact_phone ?? '',
    whatsapp: s.contact_whatsapp ?? '',
    logoUrl: media(s.logo),
    coverUrl: media(s.cover_image),
    website: s.website || null,
    facebook: s.facebook || null,
    instagram: s.instagram || null,
    tiktok: s.tiktok || null,
    youtube: s.youtube || null,
    workingHours: parseHours(s.business_hours),
    schedule: parseWeek(s.business_hours),
    status: s.is_approved === false && s.status !== 'approved' ? 'pending' : 'approved',
    activeListingsCount: s.published_listings_count ?? 0,
    totalViews: s.total_views_count ?? 0,
    categoryId: null,
  };
}

function toPayload(input: Partial<CreateStoreInput>) {
  return {
    ...(input.name != null ? { store_name: input.name } : {}),
    ...(input.description != null ? { info: input.description } : {}),
    ...(input.city != null ? { city: input.city } : {}),
    ...(input.address != null ? { address: input.address } : {}),
    ...(input.phone != null ? { contact_phone: input.phone } : {}),
    ...(input.whatsapp != null ? { contact_whatsapp: input.whatsapp } : {}),
    ...(input.website !== undefined ? { website: input.website ?? '' } : {}),
    ...(input.facebook !== undefined ? { facebook: input.facebook ?? '' } : {}),
    ...(input.instagram !== undefined ? { instagram: input.instagram ?? '' } : {}),
    ...(input.tiktok !== undefined ? { tiktok: input.tiktok ?? '' } : {}),
    ...(input.youtube !== undefined ? { youtube: input.youtube ?? '' } : {}),
    ...(input.schedule
      ? { business_hours: formatWeek(input.schedule) }
      : input.workingHours
        ? { business_hours: formatHours(input.workingHours.open, input.workingHours.close) }
        : {}),
    ...(input.logoUri ? { logo: input.logoUri } : {}),
    ...(input.coverUri ? { cover_image: input.coverUri } : {}),
  };
}

export const httpStores: StoreApi = {
  async list(query) {
    const res = await request<unknown>('auth/customers/stores/', {
      auth: false,
      query: { page_size: 50, search: query || undefined },
    });
    const items = unwrapList<ApiStoreRow>(res).items.map(mapRow);
    const q = query?.trim().toLowerCase();
    return q ? items.filter((s) => s.name.toLowerCase().includes(q)) : items;
  },

  async byId(id) {
    if (id === 'me') {
      const mine = await this.mine();
      if (!mine) throw new ApiError('Mağaza tapılmadı', 'not_found', 404);
      return mine;
    }
    const res = await request<ApiStoreRow>(`auth/customers/stores/${id}/`, { auth: false });
    return mapRow(res);
  },

  async listings(storeId) {
    const slug = storeId === 'me' ? (await this.mine())?.id : storeId;
    if (!slug) return [];
    const res = await request<unknown>(`auth/customers/stores/${slug}/listings/`, {
      auth: false,
      query: { page_size: 50 },
    });
    return unwrapList<ApiListing>(res).items.map(mapSummary);
  },

  async mine() {
    try {
      const res = await request<ApiStoreRow>('auth/customers/profile/store/detail/');
      return res ? mapRow(res) : null;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  },

  async create(input: CreateStoreInput) {
    const res = await request<ApiStoreRow>('auth/customers/profile/store/create/', {
      method: 'POST',
      body: toPayload(input),
    });
    return mapRow(res);
  },

  async update(input) {
    const res = await request<ApiStoreRow>('auth/customers/profile/store/update/', {
      method: 'PATCH',
      body: toPayload(input),
    });
    return mapRow(res);
  },
};

export const httpContact: ContactApi = {
  async send({ name, phone, message }) {
    await request('pages/contact-forms/create/', {
      method: 'POST',
      auth: false,
      // email backend-də məcburidir, formada isə yoxdur — telefon əsaslı placeholder göndərilir
      body: {
        name,
        phone_number: phone,
        email: `${phone.replace(/\D/g, '')}@mobile.aqrobazar.com`,
        message,
      },
    });
  },
};
