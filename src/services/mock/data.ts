import type {
  AppNotification,
  Banner,
  Category,
  DynamicFieldDef,
  Listing,
  Plan,
  Store,
  Subscription,
  Transaction,
  User,
} from '@/types/domain';

const img = (seed: string, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const cattleBreeds = ['Bizon', 'Buğa', 'Camış', 'Dana', 'Düyə', 'İnək', 'Öküz', 'Yak', 'Zebu', 'Digər'];
const smallCattleBreeds = ['Qoyun', 'Keçi', 'Quzu', 'Çəpiş', 'Qoç', 'Digər'];
const horseBreeds = ['Qarabağ atı', 'Ərəb atı', 'Eşşək', 'Qatır', 'Digər'];

const animalFields: DynamicFieldDef[] = [
  { key: 'age', label: 'Yaş', type: 'text', required: true },
  { key: 'weight', label: 'Çəki', type: 'number', required: false, unit: 'kq' },
  { key: 'sex', label: 'Cins (erkək/dişi)', type: 'select', required: true, options: ['Erkək', 'Dişi'] },
];

const machineryFields: DynamicFieldDef[] = [
  { key: 'brand', label: 'Marka', type: 'text', required: true },
  { key: 'model', label: 'Model', type: 'text', required: true },
  { key: 'year', label: 'İl', type: 'number', required: true },
  { key: 'power', label: 'Güc', type: 'number', required: false, unit: 'a.g.' },
  { key: 'fuel', label: 'Yanacaq növü', type: 'select', required: false, options: ['Dizel', 'Benzin', 'Elektrik'] },
  { key: 'hours', label: 'İş saatı', type: 'number', required: false, unit: 'saat' },
];

const subsubcategories = (names: string[], prefix: string) =>
  names.map((name, i) => ({ id: `${prefix}-${i + 1}`, name }));

export const categories: Category[] = [
  {
    id: 'animals', name: 'Heyvanlar', icon: 'cow',
    subcategories: [
      { id: 'cattle', name: 'İribuynuzlu heyvanlar', subsubcategories: subsubcategories(cattleBreeds, 'cattle'), fields: animalFields },
      { id: 'small-cattle', name: 'Xırdabuynuzlu heyvanlar', subsubcategories: subsubcategories(smallCattleBreeds, 'sc'), fields: animalFields },
      { id: 'horses', name: 'Atlar və təkdırnaqlılar', subsubcategories: subsubcategories(horseBreeds, 'horse'), fields: animalFields },
      { id: 'animals-other', name: 'Digər', subsubcategories: [], fields: [] },
    ],
  },
  { id: 'birds', name: 'Quşlar, Həşəratlar', icon: 'bird', subcategories: [
    { id: 'poultry', name: 'Ev quşları', subsubcategories: subsubcategories(['Toyuq', 'Cücə', 'Hinduşka', 'Ördək', 'Qaz', 'Digər'], 'poultry'), fields: animalFields },
    { id: 'bees', name: 'Arıçılıq', subsubcategories: [], fields: [] },
  ] },
  { id: 'seafood', name: 'Dəniz məhsulları', icon: 'fish', subcategories: [
    { id: 'fish', name: 'Balıq', subsubcategories: [], fields: [] },
  ] },
  { id: 'pets', name: 'Ev heyvanları', icon: 'paw', subcategories: [
    { id: 'dogs', name: 'İtlər', subsubcategories: [], fields: animalFields },
    { id: 'cats', name: 'Pişiklər', subsubcategories: [], fields: animalFields },
  ] },
  { id: 'plants', name: 'Bitkilər, Toxumlar', icon: 'sprout', subcategories: [
    { id: 'seeds', name: 'Toxumlar', subsubcategories: [], fields: [] },
    { id: 'saplings', name: 'Tinglər', subsubcategories: [], fields: [] },
  ] },
  { id: 'produce', name: 'Meyvələr, Tərəvəzlər', icon: 'food-apple', subcategories: [
    { id: 'fruits', name: 'Meyvələr', subsubcategories: [], fields: [] },
    { id: 'vegetables', name: 'Tərəvəzlər', subsubcategories: [], fields: [] },
  ] },
  { id: 'agri-products', name: 'K/T Məhsullar, Ədviyyatlar', icon: 'barley', subcategories: [
    { id: 'dairy', name: 'Süd məhsulları', subsubcategories: [], fields: [] },
    { id: 'spices', name: 'Ədviyyatlar', subsubcategories: [], fields: [] },
  ] },
  { id: 'feed', name: 'Dərmanlar, Gübrələr, Yemlər', icon: 'flask', subcategories: [
    { id: 'fertilizer', name: 'Gübrələr', subsubcategories: [], fields: [] },
    { id: 'animal-feed', name: 'Yemlər', subsubcategories: [], fields: [] },
  ] },
  { id: 'irrigation', name: 'Suvarma sistemləri', icon: 'water', subcategories: [
    { id: 'drip', name: 'Damcı suvarma', subsubcategories: [], fields: [] },
  ] },
  { id: 'tools', name: 'Alətlər, Avadanlıqlar, Qablaşdırmalar', icon: 'tools', subcategories: [
    { id: 'hand-tools', name: 'Əl alətləri', subsubcategories: [], fields: [] },
  ] },
  { id: 'machinery', name: 'Texnikalar, Qoşqular, Ehtiyat hissələri', icon: 'tractor', subcategories: [
    { id: 'tractors', name: 'Traktorlar', subsubcategories: [], fields: machineryFields },
    { id: 'combines', name: 'Kombaynlar', subsubcategories: [], fields: machineryFields },
    { id: 'parts', name: 'Ehtiyat hissələri', subsubcategories: [], fields: [] },
  ] },
  { id: 'services', name: 'K/T Xidmətləri', icon: 'account-wrench', subcategories: [
    { id: 'vet', name: 'Baytar xidməti', subsubcategories: [], fields: [] },
  ] },
  { id: 'real-estate', name: 'K/T Əmlakları', icon: 'home-group', subcategories: [
    { id: 'land', name: 'Torpaq sahəsi', subsubcategories: [], fields: [] },
  ] },
];

export const banners: Banner[] = [
  { id: 'b-1', image: img('banner-tractor', 800, 400), title: 'Get Up to', highlight: '20% Off', categoryId: 'machinery' },
  { id: 'b-2', image: img('banner-vegetables', 800, 400), title: 'Fresh vegtables!', highlight: '20% Off', categoryId: 'produce' },
  { id: 'b-3', image: img('banner-dairy', 800, 400), title: null, highlight: null, categoryId: 'agri-products' },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

export const currentUser: User = {
  id: 'u-1',
  phone: '+994552809869',
  fullName: null,
  email: null,
  city: 'Bakı',
  avatarUrl: null,
  type: 'individual',
  balance: 0,
  storeId: null,
  createdAt: daysAgo(3),
};

export const stores: Store[] = [
  {
    id: 's-1', ownerId: 'u-9', name: 'Grovex', status: 'approved',
    description: 'Azərbaycanın istixana konsaltinq şirkəti. Pomidor istixanaları üçün beynəlxalq səviyyədə aqronomiya dəstəyi. Hollandiya, Belçika, Yaponiya ekspertizası — yerli şəraitə adaptasiya edilmiş tətbiqlə.',
    city: 'Bakı', address: 'Koroğlu', phone: '+994103120606', whatsapp: '+994103120606',
    logoUrl: img('grovex-logo', 200, 200), coverUrl: img('grovex-cover', 800, 400),
    website: 'https://grovex.az', facebook: 'https://facebook.com/grovex', instagram: null, tiktok: null, youtube: null,
    workingHours: { open: '09:00', close: '18:00' }, activeListingsCount: 3, totalViews: 412, categoryId: 'plants',
  },
  {
    id: 's-2', ownerId: 'u-10', name: 'Xəzər Trade MMC', status: 'approved',
    description: 'Damazlıq Simmental və Holstein inəklərin idxalı və satışı. Dövlət subsidiyası ilə.',
    city: 'Goranboy', address: 'Goranboy şəhəri, Nizami küç. 12', phone: '+994502223344', whatsapp: '+994502223344',
    logoUrl: img('xazar-logo', 200, 200), coverUrl: img('xazar-cover', 800, 400),
    website: null, facebook: null, instagram: 'https://instagram.com/xazartrade', tiktok: null, youtube: null,
    workingHours: { open: '08:00', close: '20:00' }, activeListingsCount: 4, totalViews: 1280, categoryId: 'animals',
  },
  {
    id: 's-3', ownerId: 'u-11', name: 'Naturestore', status: 'approved',
    description: 'Təbii və qatqısız məhsullar.', city: 'Gəncə', address: 'Gəncə, Atatürk pr. 45',
    phone: '+994555556677', whatsapp: '+994555556677', logoUrl: img('nature-logo', 200, 200), coverUrl: null,
    website: null, facebook: null, instagram: null, tiktok: null, youtube: null,
    workingHours: null, activeListingsCount: 1, totalViews: 96, categoryId: 'agri-products',
  },
  {
    id: 's-4', ownerId: 'u-12', name: 'AqroTexnika', status: 'approved',
    description: 'Kənd təsərrüfatı texnikası, traktor və kombaynların satışı, ehtiyat hissələri.', city: 'Şəmkir',
    address: 'Şəmkir, Sənaye zonası', phone: '+994708889900', whatsapp: '+994708889900',
    logoUrl: img('agrotex-logo', 200, 200), coverUrl: img('agrotex-cover', 800, 400),
    website: 'https://aqrotexnika.az', facebook: null, instagram: null, tiktok: null, youtube: null,
    workingHours: { open: '09:00', close: '19:00' }, activeListingsCount: 2, totalViews: 730, categoryId: 'machinery',
  },
];

const noPromo = { vipUntil: null, premiumUntil: null, bumpedAt: null };

const mk = (
  id: string,
  partial: Partial<Listing> & Pick<Listing, 'title' | 'categoryId' | 'subcategoryId' | 'city' | 'sellerName'>,
): Listing => ({
  id,
  ownerId: 'u-9',
  storeId: null,
  subsubId: null,
  type: 'sale',
  description: 'Damazlıq Simmental və Holstein İnəklər – Subsidiya ilə! Kənd təsərrüfatınızı böyütmək və gəlirinizi artırmaq istəyirsiniz? İndi Simmental və Holstein cins damazlıq inəkləri dövlət dəstəyi ilə daha sərfəli əldə edə bilərsiniz!',
  price: 9500,
  negotiable: false,
  whatsapp: '+994502223344',
  phone: '+994502223344',
  images: [img(`${id}-1`), img(`${id}-2`), img(`${id}-3`)],
  videoUrl: null,
  fields: {},
  status: 'active',
  rejectionReason: null,
  promotions: noPromo,
  views: 148,
  createdAt: daysAgo(6),
  updatedAt: daysAgo(6),
  expiresAt: daysAhead(24),
  internationalDelivery: false,
  ...partial,
});

export const listings: Listing[] = [
  mk('l-1', { title: 'Buğa', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-2', city: 'Bakı', sellerName: 'Xəzər Trade MMC', storeId: 's-2', promotions: { ...noPromo, premiumUntil: daysAhead(5), vipUntil: daysAhead(5) }, fields: { age: '2 il', weight: 480, sex: 'Erkək' } }),
  mk('l-2', { title: 'İnək', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-6', city: 'Goranboy', sellerName: 'Xəzər Trade MMC', storeId: 's-2', price: 9500, views: 148, promotions: { ...noPromo, vipUntil: daysAhead(3) }, fields: { age: '3 il', weight: 520, sex: 'Dişi' } }),
  mk('l-3', { title: 'Kombayn "NİVA SK-5ME-1"', categoryId: 'machinery', subcategoryId: 'combines', city: 'Goranboy', sellerName: 'AqroTexnika', storeId: 's-4', price: 48000, internationalDelivery: true, promotions: { ...noPromo, premiumUntil: daysAhead(10), vipUntil: daysAhead(10) }, fields: { brand: 'Rostselmaş', model: 'NİVA SK-5ME-1', year: 2019, power: 155, fuel: 'Dizel', hours: 2300 } }),
  mk('l-4', { title: 'Traktor Belarus 82.1', categoryId: 'machinery', subcategoryId: 'tractors', city: 'Şəmkir', sellerName: 'AqroTexnika', storeId: 's-4', price: 32500, fields: { brand: 'Belarus', model: '82.1', year: 2021, power: 81, fuel: 'Dizel', hours: 900 } }),
  mk('l-5', { title: 'Dana', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-4', city: 'Bərdə', sellerName: 'Ramil', price: 1800, type: 'sale', fields: { age: '8 ay', sex: 'Erkək' } }),
  mk('l-6', { title: 'Camış', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-3', city: 'Lənkəran', sellerName: 'Elşən', price: 4200, fields: { age: '4 il', sex: 'Dişi' } }),
  mk('l-7', { title: 'Qarabağ atı', categoryId: 'animals', subcategoryId: 'horses', subsubId: 'horse-1', city: 'Ağdam', sellerName: 'Vüqar', price: null, type: 'offer', negotiable: true, fields: { age: '5 il', sex: 'Erkək' } }),
  mk('l-8', { title: 'Süd məhsulları (kəsmik, pendir, yumurta)', categoryId: 'agri-products', subcategoryId: 'dairy', city: 'Gəncə', sellerName: 'Naturestore', storeId: 's-3', price: 12, promotions: { ...noPromo, premiumUntil: daysAhead(2), vipUntil: daysAhead(2) } }),
  mk('l-9', { title: 'Pomidor tingi (istixana)', categoryId: 'plants', subcategoryId: 'saplings', city: 'Bakı', sellerName: 'Grovex', storeId: 's-1', price: 0.8 }),
  mk('l-10', { title: 'Damcı suvarma sistemi 1 ha', categoryId: 'irrigation', subcategoryId: 'drip', city: 'Bakı', sellerName: 'Grovex', storeId: 's-1', price: 2400, type: 'rent' }),
  mk('l-11', { title: 'Qoyun sürüsü (40 baş)', categoryId: 'animals', subcategoryId: 'small-cattle', subsubId: 'sc-1', city: 'Qax', sellerName: 'Sabir', price: 14000 }),
  mk('l-12', { title: 'Traktor axtarılır (Belarus 80-82)', categoryId: 'machinery', subcategoryId: 'tractors', city: 'Zaqatala', sellerName: 'Nurlan', type: 'wanted', price: null, negotiable: true }),
  mk('l-13', { title: 'Torpaq sahəsi 5 ha', categoryId: 'real-estate', subcategoryId: 'land', city: 'Salyan', sellerName: 'Grovex', storeId: 's-1', price: 60000 }),
  mk('l-14', { title: 'Yerli toyuq yumurtası', categoryId: 'birds', subcategoryId: 'poultry', subsubId: 'poultry-1', city: 'İsmayıllı', sellerName: 'Sevinc', price: 0.35 }),
];

// Cari istifadəçinin öz elanları (müxtəlif statuslar)
export const myListings: Listing[] = [
  mk('my-1', { ownerId: 'u-1', title: 'Cins inək', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-6', city: 'Goranboy', sellerName: 'Mən', status: 'active', createdAt: daysAgo(8), expiresAt: daysAhead(22) }),
  mk('my-2', { ownerId: 'u-1', title: 'Düyə', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-5', city: 'Goranboy', sellerName: 'Mən', status: 'draft', price: 3900, createdAt: daysAgo(1), expiresAt: null }),
  mk('my-3', { ownerId: 'u-1', title: 'Öküz', categoryId: 'animals', subcategoryId: 'cattle', subsubId: 'cattle-7', city: 'Goranboy', sellerName: 'Mən', status: 'expired', price: 5100, createdAt: daysAgo(45), expiresAt: daysAgo(15) }),
  mk('my-4', { ownerId: 'u-1', title: 'Traktor', categoryId: 'machinery', subcategoryId: 'tractors', city: 'Goranboy', sellerName: 'Mən', status: 'rejected', rejectionReason: 'Şəkillər aydın deyil, minimum 2 real şəkil əlavə edin.', price: 21000, createdAt: daysAgo(4), expiresAt: null }),
];

const planBase = (
  id: string, name: string, tier: Plan['tier'], userType: Plan['userType'],
  monthlyPrice: number, listingsPerMonth: number, vipDays: number, premiumDays: number, bumpCredits: number,
  popular = false,
): Plan => ({
  id, name, tier, userType, monthlyPrice, yearlyPrice: Math.round(monthlyPrice * 10 * 100) / 100,
  oldMonthlyPrice: popular ? Math.round(monthlyPrice * 1.25 * 100) / 100 : null,
  listingsPerMonth, vipDays, premiumDays, bumpCredits, popular,
  benefits: [
    `Ayda ${listingsPerMonth} pulsuz elan`,
    `${vipDays} gün VIP`,
    `${premiumDays} gün Premium`,
    `${bumpCredits} irəli çəkmə`,
  ],
});

export const plans: Plan[] = [
  planBase('p-ind-gold', 'Gold', 'green', 'individual', 9.99, 20, 2, 1, 4),
  planBase('p-ind-platinum', 'Platinum', 'purple', 'individual', 19.99, 60, 5, 3, 10, true),
  planBase('p-ind-diamond', 'Diamond', 'red', 'individual', 39.99, 150, 50, 40, 80),
  planBase('p-corp-gold', 'Gold', 'green', 'corporate', 399, 500, 50, 10, 100),
  planBase('p-corp-platinum', 'Platinum', 'purple', 'corporate', 799, 1000, 100, 20, 200, true),
  planBase('p-corp-diamond', 'Diamond', 'red', 'corporate', 1299, 2000, 200, 50, 400),
];

export const currentSubscription: Subscription | null = {
  id: 'sub-1',
  planId: 'p-ind-gold',
  planName: 'Gold',
  tier: 'green',
  cycle: 'monthly',
  status: 'active',
  startedAt: daysAgo(3),
  endsAt: daysAhead(27),
  paidAmount: 9.99,
  listingsUsed: 2,
  listingsLimit: 20,
  autoRenew: true,
};

const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

export const notifications: AppNotification[] = [
  { id: 'n-1', kind: 'vip', title: 'VIP elan!', body: 'Elanınız VIP blokuna əlavə olundu və 7 gün ərzində kateqoriyanın yuxarısında görünəcək.', createdAt: hoursAgo(0), read: false, listingId: 'l-1' },
  { id: 'n-2', kind: 'premium', title: 'Premium elan!', body: 'Premium müddətiniz başladı — elanınız ayrıca Premium bölməsində göstərilir.', createdAt: hoursAgo(0.5), read: false, listingId: 'l-2' },
  { id: 'n-3', kind: 'listing', title: 'Elanınız təsdiqləndi', body: 'Elanınız admin yoxlamasından keçdi və 30 gün aktiv olacaq.', createdAt: hoursAgo(26), read: true, listingId: 'my-1' },
  { id: 'n-4', kind: 'listing', title: 'Elanınız rədd edildi', body: 'Şəkillər aydın deyil, minimum 2 real şəkil əlavə edin.', createdAt: hoursAgo(30), read: true, listingId: 'my-4' },
  { id: 'n-5', kind: 'payment', title: 'Balans artımı', body: 'Balansınıza 21.74 AZN əlavə olundu.', createdAt: hoursAgo(52), read: true, listingId: null },
  { id: 'n-6', kind: 'system', title: 'Tarifiniz bitmək üzrədir', body: 'Gold tarifinizin bitməsinə 3 gün qalıb. Avtomatik yenilənmə aktivdir.', createdAt: hoursAgo(74), read: true, listingId: null },
];

export const transactions: Transaction[] = [
  { id: 't-1', kind: 'topup', title: 'Balans artımı', amount: 21.74, direction: 'in', status: 'completed', createdAt: daysAgo(1) },
  { id: 't-2', kind: 'plan', title: 'Gold tarif', amount: 9.99, direction: 'out', status: 'completed', createdAt: daysAgo(3) },
  { id: 't-3', kind: 'vip', title: 'VIP elan', amount: 4.5, direction: 'out', status: 'completed', createdAt: daysAgo(3) },
  { id: 't-4', kind: 'topup', title: 'Balans artımı', amount: 21.74, direction: 'in', status: 'failed', createdAt: daysAgo(5) },
  { id: 't-5', kind: 'listing_fee', title: 'Elan velosiped', amount: 1.0, direction: 'out', status: 'completed', createdAt: daysAgo(5) },
];
