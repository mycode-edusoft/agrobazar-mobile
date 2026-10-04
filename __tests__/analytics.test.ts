import { api, ApiError } from '@/services';
import { trackListingEvent } from '@/lib/analytics';
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

describe('listingShareUrl', () => {
  it('saytın elan səhifəsinə aparır', () => {
    expect(listingShareUrl({ id: 'inek-456', categoryId: 'heyvanlar', subcategoryId: 'iribuynuzlu', subsubId: 'inek' }))
      .toBe('https://aqrobazar.com/heyvanlar/iribuynuzlu/inek/inek-456');
  });
  it('zəncir yoxdursa tətbiq sxeminə düşür', () => {
    expect(listingShareUrl({ id: 'l-1', categoryId: 'a', subcategoryId: '', subsubId: null })).toBe('aqrobazar://listing/l-1');
  });
});
