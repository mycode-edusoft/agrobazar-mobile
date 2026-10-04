import type { Listing } from '@/types/domain';

const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://aqrobazar.com').replace(/\/+$/, '');

/**
 * Paylaşım linki — saytın elan səhifəsi (`/{category}/{subcategory}/{subsubcategory}/{listing}`): tətbiqi
 * olmayan da açır, mesajlaşma tətbiqləri önizləmə (şəkil, başlıq) göstərir. Kateqoriya zənciri yoxdursa
 * (yalnız mock məlumat) tətbiq sxeminə düşür.
 */
export function listingShareUrl(l: Pick<Listing, 'id' | 'categoryId' | 'subcategoryId' | 'subsubId'>): string {
  if (l.categoryId && l.subcategoryId && l.subsubId) {
    return `${WEB_URL}/${l.categoryId}/${l.subcategoryId}/${l.subsubId}/${encodeURIComponent(l.id)}`;
  }
  return `aqrobazar://listing/${encodeURIComponent(l.id)}`;
}
