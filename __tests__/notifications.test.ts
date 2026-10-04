// jest.setup.js adapteri mock ilə əvəz edir — mapper-i həqiqi moduldan götürürük
const { mapNotification } = jest.requireActual<typeof import('@/services/http/notifications')>('@/services/http/notifications');

describe('mapNotification', () => {
  const base = {
    id: 7, kind: 'vip' as const, title: 'VIP elan!', body: 'b', created_at: '2026-10-04T09:11:00Z',
    is_read: false, listing_id: 456, listing_slug: 'inek-456',
  };

  it('elan marşrutu üçün slug istifadə edir', () => {
    expect(mapNotification(base)).toEqual({
      id: '7', kind: 'vip', title: 'VIP elan!', body: 'b', createdAt: '2026-10-04T09:11:00Z', read: false, listingId: 'inek-456',
    });
  });

  it('silinmiş elan → listingId null; naməlum növ → system', () => {
    const n = mapNotification({ ...base, listing_id: null, listing_slug: null, kind: 'new_kind' as never });
    expect(n.listingId).toBeNull();
    expect(n.kind).toBe('system');
  });
});
