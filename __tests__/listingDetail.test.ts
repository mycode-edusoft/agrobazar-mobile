import { detailUrl, listingPathOf, rememberListingPath } from '@/services/http/listingPaths';
import { mapListing, mapSummary, type ApiListing } from '@/services/http/mappers';

const base: ApiListing = {
  id: 456, slug: 'inek-456', title: 'İnək', service_type: 'sell', price: '100.00', status: 'active',
  city: { id: 1, name: 'Bakı', slug: 'baki' },
  category: { id: 1, name: 'Heyvanlar', slug: 'heyvanlar' },
  subcategory: { id: 2, name: 'İribuynuzlu', slug: 'iribuynuzlu' },
  subsubcategory: { id: 3, name: 'İnək', slug: 'inek' },
  created_at: '2026-10-04T09:00:00Z',
};

describe('listing paths', () => {
  it('siyahı cavabından detal ünvanını yadda saxlayır', () => {
    mapSummary(base);
    const path = listingPathOf('inek-456')!;
    expect(detailUrl(path, 'inek-456')).toBe(
      'listings/categories/heyvanlar/subcategories/iribuynuzlu/subsubcategories/inek/listings/inek-456/',
    );
  });

  it('natamam zənciri qəbul etmir (bildirişdə silinmiş elan)', () => {
    rememberListingPath('x-1', { category: 'a', subcategory: 'b' });
    rememberListingPath(null, { category: 'a', subcategory: 'b', subsubcategory: 'c' });
    expect(listingPathOf('x-1')).toBeUndefined();
  });
});

describe('mapListing — detal endpoint-i', () => {
  const detail: ApiListing = {
    ...base,
    video: { url: 'https://cdn/v.mp4' },
    owner: { id: 9, full_name: 'Əli', store: { slug: 'ferma', store_name: 'Ferma' } },
    attributes: [
      { key: 'breed', label: 'Cins', raw_value: 'holstein', display_value: 'Holşteyn', unit: null },
      { key: 'weight', label: 'Çəki', raw_value: 450, display_value: 450, unit: 'kq' },
      { key: 'docs', label: 'Sənədlər', raw_value: ['pasport', 'peyvend'], display_value: ['Pasport', 'Peyvənd'], unit: null },
      { key: 'pregnant', label: 'Boğaz', raw_value: true, display_value: true, unit: null },
    ],
  };

  it('video obyektini, mağaza slug-ını və hazır xüsusiyyətləri oxuyur', () => {
    const l = mapListing(detail);
    expect(l.videoUrl).toBe('https://cdn/v.mp4');
    expect(l.storeId).toBe('ferma');
    expect(l.sellerName).toBe('Ferma');
    expect(l.specs).toEqual([
      { label: 'Cins', value: 'Holşteyn' },
      { label: 'Çəki', value: '450 kq' },
      { label: 'Sənədlər', value: 'Pasport, Peyvənd' },
      { label: 'Boğaz', value: 'Bəli' },
    ]);
    // Redaktə forması xam dəyərlərlə doldurulur
    expect(l.fields).toEqual({ breed: 'holstein', weight: 450, docs: 'pasport,peyvend', pregnant: 'true' });
  });

  it('axtarış sənədi formasında da işləyir (video sətir, mağaza yoxdur)', () => {
    const l = mapListing({ ...base, video: 'https://cdn/a.mp4', contact_name: 'Vəli' });
    expect(l.videoUrl).toBe('https://cdn/a.mp4');
    expect(l.storeId).toBeNull();
    expect(l.sellerName).toBe('Vəli');
    expect(l.specs).toEqual([]);
  });
});
