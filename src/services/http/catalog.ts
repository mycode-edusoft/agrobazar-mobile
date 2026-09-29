import type { Banner, DynamicFieldDef } from '@/types/domain';
import type { CatalogApi, SearchSuggestion } from '../api';
import { request, unwrapList } from './client';
import { mapCategory, type ApiCategory } from './mappers';

interface ApiCity {
  id: number;
  name: string;
  slug: string;
}

let citiesCache: ApiCity[] | null = null;

export async function getCities(): Promise<ApiCity[]> {
  if (citiesCache) return citiesCache;
  const res = await request<ApiCity[] | { results: ApiCity[] }>('core/locations/cities/', { auth: false });
  citiesCache = unwrapList<ApiCity>(res).items;
  return citiesCache;
}

/** Elan yaratmada backend şəhərin id-sini gözləyir, UI-da isə ad saxlanılır. */
export async function cityIdByName(name: string): Promise<number | null> {
  const cities = await getCities();
  const found = cities.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  return found?.id ?? null;
}

export async function cityNames(): Promise<string[]> {
  return (await getCities()).map((c) => c.name);
}

interface ApiBanner {
  id: number;
  image?: { url?: string } | string | null;
  alt_text?: string | null;
  link?: string | null;
  background_color?: string | null;
}

const bannerImage = (b: ApiBanner): string =>
  (typeof b.image === 'string' ? b.image : b.image?.url) ?? '';

interface ApiAttribute {
  id?: number;
  slug?: string;
  key?: string;
  name?: string;
  label?: string;
  type?: string;
  data_type?: string;
  is_required?: boolean;
  required?: boolean;
  unit?: string | null;
  options?: (string | { value?: string; name?: string; label?: string })[] | null;
  values?: (string | { value?: string; name?: string; label?: string })[] | null;
}

const optionLabel = (o: string | { value?: string; name?: string; label?: string }): string =>
  typeof o === 'string' ? o : o.label ?? o.name ?? o.value ?? '';

function mapAttribute(a: ApiAttribute): DynamicFieldDef {
  const raw = (a.type ?? a.data_type ?? 'text').toLowerCase();
  const options = (a.options ?? a.values ?? []).map(optionLabel).filter(Boolean);
  const type: DynamicFieldDef['type'] =
    options.length > 0 || raw.includes('select') || raw.includes('choice')
      ? 'select'
      : raw.includes('number') || raw.includes('int') || raw.includes('decimal')
        ? 'number'
        : 'text';
  return {
    key: a.slug ?? a.key ?? String(a.id ?? a.name ?? ''),
    label: a.label ?? a.name ?? '',
    type,
    required: a.is_required ?? a.required ?? false,
    ...(options.length > 0 ? { options } : {}),
    ...(a.unit ? { unit: a.unit } : {}),
  };
}

/** Alt-alt kateqoriyanın dinamik atributları (elan formasında istifadə olunur). */
export async function subsubcategoryAttributes(slug: string): Promise<DynamicFieldDef[]> {
  const res = await request<unknown>(`listings/subsubcategories/${slug}/attributes/`, { auth: false });
  const items = unwrapList<ApiAttribute>(res).items;
  const list = items.length > 0 ? items : ((res as { attributes?: ApiAttribute[] })?.attributes ?? []);
  return list.map(mapAttribute).filter((f) => f.key && f.label);
}

interface ApiSuggestion {
  text: string;
  breadcrumb?: {
    category?: { slug?: string; name?: string };
    subcategory?: { slug?: string; name?: string };
    subsubcategory?: { slug?: string; name?: string };
  };
}

export const httpCatalog: CatalogApi = {
  async categories() {
    const res = await request<ApiCategory[] | { results: ApiCategory[] }>('listings/categories/', { auth: false });
    return unwrapList<ApiCategory>(res).items.map(mapCategory);
  },

  // Backend tək banner qaytarır: { banner: {...} } — massivə normallaşdırılır
  async banners(): Promise<Banner[]> {
    const [center, side] = await Promise.all([
      request<{ banner?: ApiBanner | null }>('core/banners/home-center/public/', { auth: false }).catch(() => null),
      request<{ banner?: ApiBanner | null }>('core/banners/side/public/', { auth: false }).catch(() => null),
    ]);
    return [center?.banner, side?.banner]
      .filter((b): b is ApiBanner => !!b && !!bannerImage(b))
      .map((b) => ({
        id: String(b.id),
        image: bannerImage(b),
        title: b.alt_text || null,
        highlight: null,
        categoryId: null,
        link: b.link || null,
      }));
  },

  async suggestions(query): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];
    const res = await request<{ suggestions?: ApiSuggestion[] }>('listings/es-suggest/', {
      auth: false,
      query: { q: query.trim(), limit: 8 },
    });
    return (res.suggestions ?? []).map((s) => {
      const b = s.breadcrumb ?? {};
      return {
        query: s.text,
        categoryId: b.category?.slug ?? null,
        categoryName: b.subsubcategory?.name ?? b.subcategory?.name ?? b.category?.name ?? 'Bütün kateqoriyalar',
      };
    });
  },
};
