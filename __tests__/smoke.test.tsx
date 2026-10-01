import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { router } from 'expo-router';
import { act, fireEvent } from '@testing-library/react-native';
import { t } from '@/i18n/az';

// renderRouter yalnız bir dəfə çağırılır (router store singleton-dır); ekranlar arasında router ilə keçilir.
// RNTL v14: render/fireEvent async-dir, hamısı await olunur.
it('app boots and every core route renders', async () => {
  const pending = renderRouter('./src/app', { initialUrl: '/' });
  jest.useRealTimers();
  await pending;

  // Ana səhifə: axtarış, kateqoriya sırası, Premium bloku, tab bar (servis kartları yoxdur — məhsul qərarı)
  await waitFor(() => expect(screen.getAllByText(t.catalog.premium).length).toBeGreaterThan(0));
  expect(screen.getByPlaceholderText(t.catalog.searchProduct)).toBeTruthy();
  expect(screen.queryByText(t.home.services.plans)).toBeNull();
  await waitFor(() => expect(screen.getAllByText('Heyvanlar').length).toBeGreaterThan(0));
  expect(screen.getByText(t.tabs.stores)).toBeTruthy();
  expect(screen.getByText(t.tabs.cabinet)).toBeTruthy();
  expect(screen.getByText(t.tabs.favorites)).toBeTruthy();

  // Axtarış ekranı: tarixçə boşdur, yazanda təkliflər gəlir
  await act(() => router.push('/search'));
  await waitFor(() => expect(screen.getByText(t.search.history)).toBeTruthy());
  await fireEvent.changeText(screen.getByPlaceholderText(t.search.placeholder), 'gübr');
  await waitFor(() => expect(screen.getAllByText(/Gübrələr/i).length).toBeGreaterThan(0));
  await act(() => router.back());

  await act(() => router.push('/catalog'));
  await waitFor(() => expect(screen.getByText('Heyvanlar')).toBeTruthy());
  expect(screen.getByText('K/T Əmlakları')).toBeTruthy();

  await act(() => router.push('/catalog/animals'));
  await waitFor(() => expect(screen.getAllByText('Satılır').length).toBeGreaterThan(0));
  expect(screen.getAllByText(t.catalog.premium).length).toBeGreaterThan(0);

  await act(() => router.push('/listing/l-1'));
  await waitFor(() => expect(screen.getAllByText('Buğa').length).toBeGreaterThan(0));
  expect(screen.getAllByText(t.listing.call).length).toBeGreaterThan(0);
  expect(screen.getAllByText(t.listing.whatsapp).length).toBeGreaterThan(0);

  await act(() => router.push('/stores/s-1'));
  await waitFor(() => expect(screen.getAllByText(t.stores.storeListings).length).toBeGreaterThan(0));
  expect(screen.getAllByText('Grovex').length).toBeGreaterThan(0);

  await act(() => router.push('/info/rules'));
  await waitFor(() => expect(screen.getAllByText('İstifadəçi Razılaşması').length).toBeGreaterThan(0));

  await act(() => router.push('/info/contact'));
  await waitFor(() => expect(screen.getAllByText('info@aqrobazar.com').length).toBeGreaterThan(0));

  await act(() => router.push('/cabinet/plans'));
  await waitFor(() => expect(screen.getAllByText('Platinum').length).toBeGreaterThan(0));

  await act(() => router.navigate('/favorites'));
  await waitFor(() => expect(screen.getAllByText(t.favorites.empty).length).toBeGreaterThan(0));

  await act(() => router.navigate('/cabinet'));
  await waitFor(() => expect(screen.getAllByText(t.auth.loginRequired).length).toBeGreaterThan(0));

  // Auth: telefon → OTP → kabinet
  await act(() => router.push('/auth/phone?returnTo=/cabinet'));
  await waitFor(() => expect(screen.getByDisplayValue('(0')).toBeTruthy());
  await fireEvent.changeText(screen.getByDisplayValue('(0'), '552809869');
  await fireEvent.press(screen.getByText(t.auth.sendCode));
  await waitFor(() => expect(screen.getByText(/SMS kod göndərildi/)).toBeTruthy());

  await fireEvent.changeText(screen.getByDisplayValue(''), '123456');
  // Giriş: verify → sessiya → favorit birləşməsi → keş yenilənməsi → dismissTo; defolt 1s kifayət etmir
  await waitFor(() => expect(screen.getAllByText(t.cabinet.myListings).length).toBeGreaterThan(0), { timeout: 5000 });

  await act(() => router.push('/cabinet/my-listings'));
  await waitFor(() => expect(screen.getAllByText(/cins inək/i).length).toBeGreaterThan(0));

  // Öz elanında təşviq çipləri görünür və satın alma ekranı açılır
  await act(() => router.push('/listing/my-1'));
  await waitFor(() => expect(screen.getAllByText(t.listing.makeVip).length).toBeGreaterThan(0));
  await act(() => router.push('/listing/promote?id=my-1&kind=vip'));
  await waitFor(() => expect(screen.getByText(t.promote.duration)).toBeTruthy());
  expect(screen.getAllByText(/15 gün/).length).toBeGreaterThan(0);

  await act(() => router.push('/notifications'));
  await waitFor(() => expect(screen.getAllByText('VIP elan!').length).toBeGreaterThan(0));
  expect(screen.getByText(t.notifications.today)).toBeTruthy();

  await act(() => router.push('/cabinet/balance'));
  await waitFor(() => expect(screen.getAllByText('Balans artımı').length).toBeGreaterThan(0));

  await act(() => router.push('/listing/create'));
  await waitFor(() => expect(screen.getByText(t.createListing.blocked.profile_incomplete)).toBeTruthy());
  // Bütün tətbiqi gəzən tək axın — zəif maşında (Metro paralel işləyəndə) 5 san-lik standart limit azdır
}, 60_000);
