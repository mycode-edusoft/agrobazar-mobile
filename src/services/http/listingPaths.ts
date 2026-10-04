/**
 * Elan detalı endpoint-i tam kateqoriya zənciri tələb edir:
 *   listings/categories/<cat>/subcategories/<sub>/subsubcategories/<subsub>/listings/<slug>/
 * UI marşrutu (`/listing/[id]`) isə yalnız slug daşıyır. Zəncir elanın göründüyü hər cavabdan (axtarış,
 * elanlarım, seçilmişlər, bildiriş, push) yadda saxlanılır; tanınmayan slug üçün axtarışla tapılır.
 */
export interface ListingPath {
  category: string;
  subcategory: string;
  subsubcategory: string;
}

interface WithCategories {
  slug?: string;
  category?: { slug?: string } | null;
  subcategory?: { slug?: string } | null;
  subsubcategory?: { slug?: string } | null;
}

const paths = new Map<string, ListingPath>();

export function rememberListingPath(slug: string | null | undefined, path: Partial<ListingPath> | null | undefined) {
  if (!slug || !path?.category || !path.subcategory || !path.subsubcategory) return;
  paths.set(slug, { category: path.category, subcategory: path.subcategory, subsubcategory: path.subsubcategory });
}

export function rememberFromListing(l: WithCategories) {
  rememberListingPath(l.slug, {
    category: l.category?.slug,
    subcategory: l.subcategory?.slug,
    subsubcategory: l.subsubcategory?.slug,
  });
}

export const listingPathOf = (slug: string): ListingPath | undefined => paths.get(slug);

export const detailUrl = (p: ListingPath, slug: string) =>
  `listings/categories/${p.category}/subcategories/${p.subcategory}/subsubcategories/${p.subsubcategory}/listings/${encodeURIComponent(slug)}/`;
