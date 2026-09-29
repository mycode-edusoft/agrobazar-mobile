# Agrobazar — Biznes Tələblər Sənədi (BRD)

> Bu sənəd Agrobazar-ın hazırkı veb platformasının (backend + kabinet/dashboard frontend-i) necə işlədiyini biznes dilində təsvir edir — mobil tətbiq eyni qaydalarla işləməlidir. Məqsəd: kodun necə yazıldığını yox, sistemin **NƏ ETDİYİNİ** və **HANSI QAYDALARLA** işlədiyini izah etmək.
>
> Mənbə: `agrobazar_backend` + `aqrobazar-frontend-dashboard` repoları. Tarix: 2026-08-15.
>
> **Qeyd:** Rəqəmlər (qiymət, gün sayı, limit) admin paneldən dəyişə bilər — mobil tətbiq bunları API-dan real vaxtda oxumalıdır, sabit dəyər kimi kodlaşdırmamalıdır.

## Məzmun

1. [Giriş və qeydiyyat](#i-giriş-və-qeydiyyat)
2. [İstifadəçi tipləri: Fərdi və Korporativ](#ii-istifadəçi-tipləri-fərdi-və-korporativ)
3. [Mağaza](#iii-mağaza)
4. [Profil idarəetməsi](#iv-profil-idarəetməsi)
5. [Elan yerləşdirmə](#v-elan-yerləşdirmə)
6. [Lent və axtarış](#vi-lent-və-axtarış)
7. [Seçilmişlər](#vii-seçilmişlər)
8. [Tariflər (Abunəlik paketləri)](#viii-tariflər-abunəlik-paketləri)
9. [Elan təşviqləri: VIP, Premium, İrəli çəkmə](#ix-elan-təşviqləri-vip-premium-irəli-çəkmə)
10. [Admin tərəfindən pulsuz Premium hədiyyəsi](#x-admin-tərəfindən-pulsuz-premium-hədiyyəsi)
11. [Ödəniş və balans](#xi-ödəniş-və-balans)
12. [Qərar tələb edən yerlər](#xii-qərar-tələb-edən-yerlər)

---

## I. Giriş və qeydiyyat

Sistemdə **bir vahid axın** var: telefon nömrəsi + SMS kodu (OTP). Şifrə heç yerdə tələb olunmur. Yeni və köhnə istifadəçi eyni iki addımdan keçir:

1. İstifadəçi telefon nömrəsini yazır, "Kod göndər" düyməsini basır.
2. 6 rəqəmli kodu daxil edir və təsdiqləyir.

Sistem arxa planda görür ki, bu nömrə əvvəldən qeydiyyatdan keçib, yoxsa yenidir — istifadəçidən bunu soruşmur. Nömrə yenidirsə, kod təsdiqləndiyi an avtomatik olaraq **Fərdi** tipli yeni hesab yaradılır (hesab tipi seçimi YOXDUR) və istifadəçi həmin an sistemə daxil edilir.

### Kod qaydaları

| Parametr | Dəyər |
|---|---|
| Kodun uzunluğu | 6 rəqəm |
| Etibarlılıq müddəti | ~5 dəqiqə |
| Yenidən göndərmə fasiləsi | 60 saniyə |
| Maksimum yenidən-göndərmə | 3 dəfə |
| Yanlış kod limiti | 3 cəhd, sonra nömrə ~5 dəqiqəliyə bloklanır |

### Profil tamamlama tələbi

Fərdi hesabda **ad** və **email** yoxdursa (yeni hesab həmişə belədir), istifadəçi elan yerləşdirməzdən əvvəl bir dəfəlik ekranda bunları doldurmalıdır. Korporativ hesablarda bu tələb yoxdur — onların "kimliyi" mağaza məlumatları ilə əvəzlənir.

> **Vacib qayda:** Ad (və doldurulubsa email) bu ekrandan bir dəfə yazılandan sonra **bir daha dəyişdirilə bilmir** — dəyişmək üçün ayrıca, yeni email-ə göndərilən təsdiq kodu ilə işləyən "email dəyişmə" axını lazımdır. Bu, kiminsə başqasının profilini ələ keçirib adını dəyişməsinin qarşısını almaq üçündür.

Giriş etməmiş (qonaq) istifadəçi bəzi hərəkətləri edə bilir — məsələn seçilmişlərə əlavə etmək (bax bölmə VII). Bu məlumat hesaba giriş edən kimi avtomatik köçürülür, itmir.

> **Arxa planda saxlanılan, canlıda istifadə olunmayan imkan:** Profil ekranından istəyə görə şifrə təyin etmək mümkündür (yenə kod təsdiqi ilə), həmçinin klassik email+şifrə qeydiyyat/giriş sistemi kodda mövcuddur — amma hazırkı veb tətbiqdə bunlardan istifadə olunmur. Mobil tətbiq üçün tövsiyə: yalnız telefon+kod axınını əsas götürmək, şifrəni nəzərə almamaq.

---

## II. İstifadəçi tipləri: Fərdi və Korporativ

Cəmi iki tip var. Qeydiyyatda seçim yoxdur — **hər kəs Fərdi başlayır**. Korporativ olmaq yalnız bir yolla mümkündür: mağaza yaradıb admin tərəfindən təsdiqlənməsi (bax bölmə III).

Fərq əsasən tarif imkanlarındadır — Korporativ hesablar üçün adətən xeyli daha böyük paketlər var (daha çox aylıq pulsuz elan, daha çox VIP/Premium gün, daha çox irəli-çəkmə krediti — bax bölmə VIII).

> **Diqqət:** Mağaza yaratmaq üçün əvvəlcədən Korporativ olmaq şərt DEYİL — istənilən Fərdi istifadəçi mağaza yarada bilər. Korporativ status mağazanın təsdiqindən **SONRA**, avtomatik verilir.

---

## III. Mağaza

Bir istifadəçi yalnız **bir** mağaza yarada bilər.

### Yaratmaq üçün lazım olanlar

Məcburi: mağaza adı, şəhər, ünvan, əlaqə telefonu, WhatsApp nömrəsi, təsvir, qaydalarla razılıq. İstəyə bağlı: örtük şəkli və loqo (hər biri maksimum 500 KB), veb-sayt, sosial media linkləri (Facebook və Instagram mağaza səhifəsində göstərilir; TikTok/YouTube saxlanılır, amma hazırda səhifədə göstərilmir), iş saatları.

### Təsdiq axını

Mağaza yaradılan kimi sahibinin öz panelində dərhal görünür və redaktə edilə bilir, AMMA açıq/ictimai siyahıda görünmür — "təsdiq gözləyir" statusundadır. Təsdiq YALNIZ admin tərəfindən verilir, sadə bəli/xeyr formasında.

> **Elanlardan fərqli:** Mağaza rəddi üçün "səbəb" sahəsi yoxdur (elanlarda var — bax bölmə V). Admin təsdiq etmirsə, sistemdən istifadəçiyə səbəb izahı ilə bildiriş getmir.

### Təsdiq anında baş verən avtomatik dəyişikliklər

Mağaza **ilk dəfə** təsdiqləndiyi an, aşağıdakılar dərhal və avtomatik baş verir:

1. İstifadəçi tipi Fərdi-dən Korporativ-ə keçir.
2. İstifadəçi avtomatik Korporativ baza tarifinə keçirilir.
3. Əvvəlki (Fərdi) tarifdən qalan bütün hüquqlar — istifadə olunmamış pulsuz elan sayı, VIP/Premium gün bankı, irəli-çəkmə krediti — **sıfırlanır və itir**. Heç bir hissəsi yeni tarifə keçmir, geri ödəniş edilmir.

> ⚠️ **Geri dönməzlik (qərar tələb edir, bax bölmə XII):** Admin sonradan mağazanın təsdiqini geri götürsə belə (mağaza gizlədilsə belə), istifadəçi Korporativ statusunda və tarifində qalır — bu geri dönmür.

Təsdiqdən sonra mağaza məlumatlarını istənilən vaxt sərbəst redaktə etmək olar — bu, yenidən təsdiq tələb etmir.

### Mağazanın ictimai səhifəsində göstərilənlər

Örtük/loqo, ad, ünvan/xəritə, iş saatları, telefon (zəng et düyməsi), doldurulmuş sosial linklər, təsvir, mağazanın canlı elanları və "X elan paylaşılıb, Y baxış sayı" statistikası. Bu iki rəqəm real vaxtda, yalnız hazırda **Aktiv** olan elanlar üzərindən hesablanır — silinmiş/bitmiş elanlar bu rəqəmlərə daxil deyil.

---

## IV. Profil idarəetməsi

Profil ekranından redaktə oluna bilən: **profil şəkli** (max 500 KB) və **şəhər**. Bunun xaricində:

- Tam ad — bir dəfə "profil tamamlama" ilə təyin olunur, sonra kilidlənir.
- Telefon nömrəsi — heç vaxt dəyişmir, hesabın "açarı" hesab olunur.
- Email — yalnız ayrıca, yeni email-ə göndərilən kod-təsdiqli axınla dəyişir.

### Balans

Hər istifadəçinin balansı (pul kisəsi) var — üstünə pul yükləmək (top-up) mümkündür. Balans tarif alışı, VIP/Premium/irəli-çəkmə ödənişləri və elan haqları üçün istifadə olunur (bax bölmə XI).

### Hüquqlar (nə edə bilərəm?)

Profil məlumatı ilə birlikdə cari "hüquqlar" göstərilməlidir: tarif adı, bu ay qalan pulsuz elan sayı, VIP/Premium gün bankı, irəli-çəkmə krediti, və "hazırda elan yerləşdirə bilərəmmi?" cavabı — əgər yox, konkret səbəb (tarif limiti bitib / pulsuz limit bitib / profil tamamlanmayıb). Mobil tətbiq istifadəçiyə niyə bloklandığını dəqiq göstərməlidir, ümumi xəta mesajı ilə deyil.

---

## V. Elan yerləşdirmə

### Addımlar

1. Kateqoriya → Alt-kateqoriya → Alt-alt-kateqoriya seçimi.
2. Seçilən alt-alt-kateqoriyaya uyğun əlavə sahələr (aşağıda izah olunur).
3. Elan növü: Satılır / İcarəyə verilir / Axtarılır / Təklif olunur.
4. Qiymət — "Təklif olunur" növündə məcburi deyil ("razılaşma yolu ilə" seçimi var).
5. Şəhər, başlıq, təsvir, WhatsApp nömrəsi.
6. Şəkillər (minimum 2, maksimum 8) və istəyə bağlı 1 video (max 5 MB).
7. Qaydalarla razılıq (məcburi checkbox).

Əlaqə telefonu həmişə hesabın öz təsdiqlənmiş nömrəsidir — başqa nömrə yazıla bilməz (saxtakarlığın qarşısını almaq üçün).

> **Qonaq elan yerləşdirməsi:** Giriş etməmiş istifadəçi də elan yerləşdirə bilər — əvvəlcə ona telefon+kod axını göstərilir (bölmə I; yeni hesab yaradılması daxil), sonra eyni forma davam edir. Yəni "qonaq elan yerləşdirmə" ayrıca sadələşdirilmiş forma deyil, sadəcə "əvvəlcə giriş, sonra adi forma"dır.

### Kateqoriyaya görə əlavə sahələr

Hər alt-alt-kateqoriyanın öz əlavə sualları ola bilər. Məsələn:

- **Kənd təsərrüfatı texnikası:** marka, model, il, güc (a.g.), yanacaq növü, iş saatı, əlavə avadanlıq.
- **Heyvandarlıq:** cins/irq, yaş, çəki, cins (erkək/dişi).

Bu sahələrdən bir qismi **məcburidir** (kateqoriyaya görə dəyişir) — məcburi sahə doldurulmadan elan göndərilə bilməz. Kateqoriya dəyişdirilərsə, əvvəlki bütün cavablar silinir və yeni kateqoriyanın öz məcburi sahələri təzədən doldurulmalıdır.

### Elanın həyat dövrü

```
Qaralama → (admin baxışı) → Aktiv   → (müddət bitir) → Müddəti bitib
                          → Rədd edilib
```

Hər yeni elan mütləq admin təsdiqindən keçməlidir — bu addım heç vaxt keçilmir. Rədd zamanı admin **səbəb yazmağa məcburdur** (mağazadan fərqli olaraq). Silinmiş/satılmış elan üçün ayrıca status yoxdur — silinən elan tam silinir, bərpa olunmur.

Təsdiqdən sonra elan defolt **30 gün** aktiv qalır (admin panelindən dəyişdirilə bilən rəqəm). Müddət bitəndə elan avtomatik lentdən çıxır.

### Yeniləmə (Renew)

Yalnız **Müddəti bitib** statusundakı elan yenilənə bilər. Ödəniş (pulsuz limitdən, balansdan və ya kartla) qarşılığında yenidən tam 30 günlük müddət başlayır — köhnə vaxtın üstünə əlavə olunmur, sıfırdan sayılır. Yeniləmə **yenidən admin təsdiqi tələb etmir**, elan birbaşa Aktiv olur.

### Redaktə

Sahib öz elanını istənilən vaxt redaktə edə bilər. Amma:

- Əgər elan artıq **Aktiv** idisə, redaktədən sonra yenidən **Qaralama**-ya düşür və təzədən admin təsdiqi gözləyir — canlı elanı sükutla dəyişmək mümkün deyil, hər redaktə yenidən nəzərdən keçirilir.
- **Rədd edilib** statusundakı elanı redaktə etmək onu təzədən Qaralama sırasına salır.

Elanın linki (URL) sabitdir — başlıq dəyişsə belə, link dəyişmir (paylaşılan linklərin qırılmaması üçün). Kateqoriya dəyişəndə köhnə link avtomatik yeni ünvana yönləndirilir.

### Şəkil/video

2-8 şəkil məcburidir (bu limit hazırda tarifdən asılı olmayaraq hər kəs üçün eynidir), 1 video istəyə bağlıdır (max 5 MB). Şəkillər sürət üçün birbaşa fayl anbarına yüklənir.

### Sahibin əlavə hərəkətləri

**İrəli çək (Bump)**, **Yenilə (Renew)** və **Sil** — silmə tam və geri dönməzdir. İrəli çəkmənin təfərrüatı bölmə IX-dadır.

---

## VI. Lent və axtarış

Adi (sadə) lentdə YALNIZ Aktiv, müddəti bitməmiş **VƏ** hazırda VIP/Premium olmayan elanlar göstərilir. VIP və Premium elanlar adi lentdən bilərəkdən çıxarılıb, öz ayrıca bloklarında göstərilir:

- **VIP bloku** — seçilmiş kateqoriya daxilində "fırlanan" (rotasiya edən) yuxarı blok: müxtəlif səhifə yükləmələrində fərqli VIP elanlar görünür ki, bir neçəsi həmişə eyni yeri tutmasın.
- **Premium bloku** — ayrıca bölmə, "ədalətli" sıralama ilə: həmin gün ən az göstərilmiş Premium elan əvvəlcə göstərilir ki, bütün Premium elanlar bərabər bölüşdürülmüş baxış alsın.

> **İstisna:** Bir mağazanın öz elanları səhifəsində bu ayırma yoxdur — mağazanın bütün aktiv elanları (VIP/Premium olsun-olmasın) birlikdə göstərilir.

**Sıralama:** tarixə görə (yeni əvvəl, defolt), qiymətə görə (artan/azalan).

**Axtarış/filtr:** sərbəst mətn axtarışı (başlıq/təsvir), kateqoriya, şəhər, qiymət aralığı, elan növü, kateqoriyaya xas sahələr üzrə filtr (məs. "yalnız Belarus markası").

---

## VII. Seçilmişlər

Həm giriş etmiş, həm də qonaq istifadəçi elanı seçilmişlərə əlavə edə bilər (qonaq üçün bu, cihazda saxlanılan anonim identifikator ilə işləyir). Yalnız **Aktiv** elan seçilmişlərə əlavə oluna bilər. Eyni elanı iki dəfə əlavə etmək xəta vermir, sadəcə heç nə dəyişmir.

> **Qonaqdan hesaba keçid:** Qonaq kimi seçilmiş elanlar var idisə, istifadəçi hesaba giriş edən kimi bunlar avtomatik onun hesabına köçürülür — itmir. Mobil tətbiqdə də bu davranış təkrarlanmalıdır (və ya sadəcə seçilmişləri girişdən sonrakı funksiya kimi məhdudlaşdırmaq olar).

---

## VIII. Tariflər (Abunəlik paketləri)

Hər tarif ya Fərdi, ya Korporativ istifadəçi üçündür — qarışıq deyil (Fərdi Korporativ paketinə yaza bilməz və əksinə). Hər tarif 4 "hüquq bankı" verir, hər abunəlik dövründə (ay/il) sıfırdan dolur:

1. Aylıq pulsuz elan sayı
2. Pulsuz VIP gün bankı
3. Pulsuz Premium gün bankı
4. Pulsuz irəli-çəkmə (bump) kredit sayı

Bank bitəndən sonra həmin əməliyyat artıq ödənişli olur (balansdan və ya kartla). Hər tip üçün pulsuz baza (Standard) tarif mövcuddur (aylıq 1 pulsuz elan, VIP/Premium/bump yoxdur) — abunə almayan istifadəçi bu minimuma tabedir.

### Nümunə struktur

Aşağıdakı rəqəmlər hazırkı sistemdən nümunədir və admin panelindən dəyişə bilər — mobil tətbiq bunları sabit güman etməməli, hər zaman API-dan gələn aktual dəyərləri göstərməlidir.

| Tarif | Tip | Aylıq | Elan/ay | VIP gün | Premium gün | Bump |
|---|---|---:|---:|---:|---:|---:|
| Standard | Fərdi | 0 AZN | 1 | 0 | 0 | 0 |
| Gold | Fərdi | 9.99 AZN | 20 | 2 | 1 | 4 |
| Platinum | Fərdi | 19.99 AZN | 60 | 5 | 3 | 10 |
| Diamond | Fərdi | 39.99 AZN | 150 | 50 | 40 | 80 |
| Standard | Korporativ | 0 AZN | 1 | 0 | 0 | 0 |
| Gold | Korporativ | 399 AZN | 500 | 50 | 10 | 100 |
| Platinium | Korporativ | 799 AZN | 1000 | 100 | 20 | 200 |
| Diamond | Korporativ | 1299 AZN | 2000 | 200 | 50 | 400 |

### Tarif dəyişdirmə

Yeni tarif alınan kimi köhnə abunəlik **dərhal bitir**, yeni abunəlik həmin andan tam yeni dövrlə (30 gün / 365 gün) başlayır. Köhnə tarifdən qalan istifadə olunmamış hüquqlar itir — proporsional geri qaytarma yoxdur. (Bu, mağaza-təsdiqi ilə Korporativ-ə keçiddəki eyni "qalıq itir" qaydasıdır, bax bölmə III.)

### Avtomatik yenilənmə

İstəyə bağlı seçimdir. Aktivdirsə, abunəlik bitməzdən 3 gün əvvəl sistem balansdan avtomatik pul çəkməyə çalışır. Balans kifayət etmirsə, istifadəçiyə SMS xəbərdarlığı göndərilir; 3 uğursuz cəhddən sonra avtomatik yenilənmə söndürülür və istifadəçi əl ilə yeniləməlidir.

### Endirim kampaniyaları

Bəzən promo-kod və ya ümumi kampaniya ilə tarifə endirim tətbiq oluna bilər. **Qayda:** endirim aktiv olduğu müddətdə illik ödəniş seçimi bağlanır — yalnız aylıq ödəniş mümkündür.

---

## IX. Elan təşviqləri: VIP, Premium, İrəli çəkmə

Bunların hər üçü eyni elana **eyni anda** tətbiq oluna bilər — bir-birini əvəz etmirlər. Yalnız hazırda **Aktiv** statusda olan elana tətbiq edilə bilər.

| Təşviq | Effekt | Müddət |
|---|---|---|
| VIP | Kateqoriyanın fırlanan yuxarı blokunda göstərilir | Gün-bloklarında (1/7/15/30), mövcud müddətin üstünə əlavə olunur |
| Premium | Ayrıca Premium bölməsində, ədalətli sıra ilə göstərilir | Gün-bloklarında, üstünə əlavə olunur |
| İrəli çəkmə | Adi lentin başına müvəqqəti tullanır | ~1 dəqiqə "ən başda", sonra kiçik daimi üstünlük |

> **Premium = Premium + VIP:** Premium alan elan **avtomatik olaraq VIP-i də əldə edir** (eyni müddətə) — Premium alan istifadəçi əslində iki imtiyaz birlikdə alır.

VIP və Premium tətbiqi elanın aktiv qalma müddətini də uzadır. VIP davam etdiyi müddətcə elan mütəmadi olaraq (təxminən hər 24 saatdan bir) "təzə dərc olunmuş kimi" öz mövqeyini təzələyir.

İrəli çəkmə çoxsaylı-paket kimi satıla bilər (məs. "3 dəfə, 8 saat aralıqla") — qalan dəfələr avtomatik, planlaşdırılmış vaxtlarda özü işə düşür. Yalnız hələ müddəti bitməmiş elana tətbiq edilə bilər.

**Ödəniş prioriteti (hər üçü üçün eyni):** əvvəlcə tarifin müvafiq pulsuz bankından istifadə olunur; bank bitibsə, balansdan və ya kartla ödəniş tələb olunur.

---

## X. Admin tərəfindən pulsuz Premium hədiyyəsi

Admin panelindən səlahiyyətli işçi istənilən Aktiv elana **1, 3, 7 və ya 14 gün** tamamilə pulsuz Premium verə bilər — heç bir balans/tarif xərclənmir. Bu, adi ödənişli Premium ilə eyni effekti yaradır (o cümlədən VIP-i də avtomatik əlavə edir, aktiv qalma müddətini uzadır). Hər hədiyyə qeydə alınır — hansı admin, nə vaxt, hansı elana verdiyi izlənilir.

---

## XI. Ödəniş və balans

İki ödəniş üsulu var: **Kart** (bank ödəniş səhifəsinə yönləndirmə) və **Balans** (əvvəlcədən yüklənmiş pul kisəsi). Balans bütün maliyyə əməliyyatlarının ümumi kitabı rolunu oynayır — kartla ödəniş edəndə belə, əməliyyat balans tarixçəsində görünür ki, top-up, tarif, VIP, Premium, bump və elan haqqının tam tarixçəsi bir yerdə olsun.

### Kartla ödəniş axını

1. İstifadəçi ödəniş edir → bank səhifəsinə yönləndirilir → ödənişi tamamlayır → tətbiqə geri qayıdır.
2. Nəticə "tam təsdiqlənmiş" sayılır YALNIZ bank sisteminin özü serverə rəsmi təsdiq göndərəndən sonra — sadəcə istifadəçinin geri qayıtması kifayət deyil.
3. Tətbiq bu təsdiqi gözləyərkən qısa müddət (təxminən 30-40 saniyəyə qədər) "yoxlanılır" vəziyyətini göstərməlidir.

**Balans yükləmə:** istənilən məbləği kartla balansa əlavə etmək mümkündür.

> ⚠️ **Geri qaytarma:** Yalnız admin panelindən, yalnız müəyyən ödəniş provayderləri üçün, yalnız tamamlanmış əməliyyatlara mümkündür. İstifadəçi özü geri qaytarma tələb edə bilmir — mobil tətbiqdə "pulu geri qaytar" düyməsi olmamalıdır, bu dəstək/admin işidir.

---

## XII. Qərar tələb edən yerlər

Aşağıdakılar hazırkı sistemdə ya qeyri-müəyyənlik, ya da tamamlanmamış imkanlardır — mobil tətbiqi qururkən bunlara diqqət lazımdır.

1. **Mağaza rəddi izahsızdır.** Elanlardan fərqli olaraq, mağaza rədd edildikdə sistem səbəb saxlamır və istifadəçiyə bildiriş getmir. İstəsək bunu elanlardakı kimi təkmilləşdirə bilərik.
2. **Mağaza təsdiqi geri götürülsə də Korporativ status qalır.** Bunun "düzgün davranış" olub-olmadığı ayrıca məhsul qərarı tələb edir (bax bölmə III).
3. **Şifrə funksiyası canlıda istifadə olunmur.** Kodda mövcuddur, amma veb tətbiq işlətmir. Mobil tətbiqdə tamamilə nəzərə alınmaya bilər — sadəlik üçün tövsiyə olunur.
4. **Şəkil limiti hələ tarifə bağlı deyil.** Hazırda 2-8 şəkil hər kəs üçün eynidir, halbuki sistemdə "pulsuz üçün 4, ödənişli üçün 8" kimi ayrıca parametr var, sadəcə işə salınmayıb. Mobil tərəf bu limiti sabit güman etməməli, API cavabına uyğunlaşmalıdır.
5. **İrəli-çəkmə endirimi hesablanmır.** Bəzi Korporativ tariflərdə "bump endirimi" faizi təyin olunur, amma qiymət hesablanışında hələ tətbiq olunmur. Qiymət kalkulyasiyasında bunu gözləməmək lazımdır.
