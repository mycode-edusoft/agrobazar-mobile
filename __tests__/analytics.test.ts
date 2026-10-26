import { api, ApiError } from '@/services';
import { flushAnalytics, trackCardImpression, trackCardOpen, trackListingEvent } from '@/lib/analytics';
import type { ListingEvent } from '@/services';
import { listingShareUrl } from '@/lib/links';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('trackListingEvent', () => {
  let send: jest.SpyInstance;
  beforeEach(() => {
    send = jest.spyOn(api.analytics, 'sendListingEvents').mockResolvedValue(undefined);
  });
  afterEach(() => send.mockRestore());

  it('aktiv elanın klikini dərhal göndərir', async () => {
    trackListingEvent({ pk: 456, status: 'active' }, 'phone_click');
    await flush();
    expect(send).toHaveBeenCalledTimes(1);
    const [events, session] = send.mock.calls[0];
    expect(events).toEqual([expect.objectContaining({ listingPk: 456, type: 'phone_click' })]);
    expect(session).toMatch(/^m-/);
  });

  it('aktiv olmayan və ya pk-sız elan üçün heç nə göndərmir', async () => {
    trackListingEvent({ pk: 1, status: 'expired' }, 'phone_click');
    trackListingEvent({ status: 'active' }, 'whatsapp_click');
    await flush();
    expect(send).not.toHaveBeenCalled();
  });

  it('şəbəkə xətasında saxlayır və növbəti klikdə birlikdə göndərir; 4xx-də atır', async () => {
    send.mockRejectedValueOnce(new ApiError('offline', 'network', 0));
    trackListingEvent({ pk: 7, status: 'active' }, 'phone_click');
    await flush();
    trackListingEvent({ pk: 7, status: 'active' }, 'whatsapp_click');
    await flush();
    expect(send.mock.calls[1][0].map((e: { type: string }) => e.type)).toEqual(['phone_click', 'whatsapp_click']);

    send.mockClear();
    send.mockRejectedValueOnce(new ApiError('bad', 'invalid', 400));
    trackListingEvent({ pk: 8, status: 'active' }, 'phone_click');
    await flush();
    trackListingEvent({ pk: 9, status: 'active' }, 'phone_click');
    await flush();
    expect(send.mock.calls[1][0]).toEqual([expect.objectContaining({ listingPk: 9 })]);
  });
});

describe('kart hadisələri (CTR)', () => {
  let send: jest.SpyInstance;
  beforeEach(() => {
    send = jest.spyOn(api.analytics, 'sendListingEvents').mockResolvedValue(undefined);
  });
  afterEach(async () => {
    await flushAnalytics();
    send.mockRestore();
  });

  const ctx = { source: 'category' as const, block: 'standart', index: 3 };

  it('göstərilmələri dərhal yox, paketlə göndərir', async () => {
    trackCardImpression({ pk: 1, status: 'active' }, ctx);
    trackCardOpen({ pk: 1, status: 'active' }, ctx);
    await flush();
    expect(send).not.toHaveBeenCalled();
    await flushAnalytics();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0].map((e: ListingEvent) => e.type)).toEqual(['card_impression', 'detail_open_from_list']);
  });

  it('20 hadisə yığılanda özü göndərir', async () => {
    for (let i = 1; i <= 20; i++) trackCardImpression({ pk: i, status: 'active' }, { ...ctx, index: i });
    await flush();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toHaveLength(20);
  });

  it('4xx-də paketi bölür: aktiv olmayan elan təcrid olunub atılır, qalanları çatır', async () => {
    send.mockImplementation(async (events: ListingEvent[]) => {
      if (events.some((e) => e.listingPk === 3)) throw new ApiError('non-public', 'invalid', 400);
    });
    for (const pk of [1, 2, 3, 4]) trackCardImpression({ pk, status: 'active' }, ctx);
    await flushAnalytics();
    const delivered = send.mock.calls
      .filter(([events]) => !events.some((e: ListingEvent) => e.listingPk === 3))
      .flatMap(([events]) => events.map((e: ListingEvent) => e.listingPk));
    expect(delivered.sort()).toEqual([1, 2, 4]);
    send.mockClear();
    await flushAnalytics();
    expect(send).not.toHaveBeenCalled(); // növbədə heç nə qalmayıb
  });
});

describe('httpAnalytics formatı', () => {
  const { httpAnalytics } = jest.requireActual<typeof import('@/services/http/analytics')>('@/services/http/analytics');
  const client = jest.requireActual<typeof import('@/services/http/client')>('@/services/http/client');

  it('web ilə eyni: card_impression event_type-sız, card_context ilə', async () => {
    const req = jest.spyOn(client, 'request').mockResolvedValue(undefined);
    await httpAnalytics.sendListingEvents(
      [
        { listingPk: 5, type: 'card_impression', occurredAt: 't', source: 'favorites', card: { index: 0, block: 'favorites' } },
        { listingPk: 5, type: 'phone_click', occurredAt: 't' },
      ],
      's1',
    );
    const body = (req.mock.calls[0][1] as { body: { events: Record<string, unknown>[] } }).body.events;
    expect(body[0]).toEqual(expect.objectContaining({
      listing_id: 5, source_page: 'favorites', card_context: { device: 'mobile', index: 0, block: 'favorites' },
    }));
    expect(body[0]).not.toHaveProperty('event_type');
    expect(body[1]).toEqual(expect.objectContaining({ event_type: 'phone_click', session_key: 's1' }));
    expect(body[1]).not.toHaveProperty('card_context');
    req.mockRestore();
  });
});

describe('listingShareUrl', () => {
  it('saytın elan səhifəsinə aparır', () => {
    expect(listingShareUrl({ id: 'inek-456', categoryId: 'heyvanlar', subcategoryId: 'iribuynuzlu', subsubId: 'inek' }))
      .toBe('https://aqrobazar.com/heyvanlar/iribuynuzlu/inek/inek-456');
  });
  it('zəncir yoxdursa tətbiq sxeminə düşür', () => {
    expect(listingShareUrl({ id: 'l-1', categoryId: 'a', subcategoryId: '', subsubId: null })).toBe('aqrobazar://listing/l-1');
  });
});
