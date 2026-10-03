# Dizayner üçün qeydlər — Aqrobazar mobil

Mobil tətbiq canlı Figma faylından (**Aqrobazarapp**, `5QDB6jcltAmsNZFatpDqm5`, səhifə "App") qurulur.
Aşağıdakılar kodlaşdırma zamanı faylda tapılan və dizayn tərəfində qərar/düzəliş tələb edən məqamlardır.
Hər bənd üçün Figma bölməsi və mümkün olduqda node ID verilib.

**Prioritet:** 🔴 buraxılışı bloklayır · 🟠 buraxılışdan əvvəl lazımdır · 🟢 zövq/uyğunluq

---

## 🔴 1. Loqo faylı kəsikdir — kəsilməmiş orijinal vektor lazımdır

- **Harada:** komponent `logo_1_aqrobazar` (`2137:11625`), variantlar `green=on, white=off` (`2137:11626`) və `green=off, white=on` (`2137:11641`). Saytda (`aqrobazar-frontend-dashboard/src/assets/icons/mainlogo.svg`, `main-logo-white.svg`) da eyni fayl işlənir.
- **Problem:** vektor yollar 96×44 çərçivənin kənarında bitir — **"O" hərfinin sağ kənarı** və **"BAZAR" hərflərinin altı** düz xətlə qırpılıb. Kiçik ölçüdə (başlıqda, saytda) görünmür, amma tətbiq ikonunda (1024×1024) və Play Store / App Store şəkillərində aydın görünür.
- **Lazımdır:** loqonun **kəsilməmiş orijinal vektoru** (SVG), iki variantda — rəngli və ağ. Kənarlarda ən azı bir neçə piksel boşluq olsun.
- Fayl gələn kimi tətbiq ikonu, Android adaptiv ikonu və açılış ekranı avtomatik yenidən yaradılacaq.

## 🟠 2. "Elan 3 actions" — VIP və Premium ekranlarında səhv siyahı

- **Harada:** bölmə `Elan 3 actions` (`2137:26825`) — "Premium et" və "VIP et" ekranları.
- **Problem:** hər üç ekranda (İrəli çək / Premium et / VIP et) **eyni** siyahı var: *"3 dəfə (8 saatdan bir) / 1,00 AZN…"*. Bu yalnız **İrəli çək** üçün doğrudur.
- **Backend-dəki real paketlər** (`plan/service-packages/`):
  - İrəli çək: 3 / 9 / 15 / 30 dəfə (8 saat aralıqla) — 0.90 · 1.90 · 2.90 · 4.90 AZN
  - VIP: **1 / 5 / 15 / 30 gün** — 1.90 · 5.90 · 12.90 · 19.90 AZN
  - Premium: **1 / 5 / 15 / 30 gün** (VIP daxildir) — 3.90 · 11.90 · 29.90 · 49.90 AZN
- **Lazımdır:** VIP və Premium ekranlarında siyahını gün-bloklarına dəyişin. Tətbiq artıq backend-dən gələn real paketləri göstərir.

## 🟠 3. İngiliscə və placeholder mətnlər

| Harada | Mətn | Nə lazımdır |
|---|---|---|
| Bildirişlər — boş vəziyyət | "No Notifications" / "We'll let you know when there will be something to update you." | Azərbaycanca mətn. Tətbiqdə hazırda: *"Bildiriş yoxdur" / "Yeni bir şey olanda sizə xəbər verəcəyik."* |
| Bildirişlər — sıralama | "Newest First", "Older First", "Read Notification", "Unread Notification" | Azərbaycanca. Tətbiqdə: *Əvvəlcə yeni / Əvvəlcə köhnə / Oxunmuş / Oxunmamış* |
| Bildirişlər — siyahı | "Today's the day. Your culinary adventure is almost there." | Bildiriş növlərinə görə real mətn şablonları (elan təsdiqləndi / rədd edildi / müddəti bitdi / VIP tətbiq olundu / balans artımı…) |
| Ana səhifə — banner | "Get Up to 20% Off", "Fresh vegtables!" (*vegetables* səhv yazılıb) | Bannerlər backend-dən şəkil kimi gəlir — Figma-dakı mətn yalnız nümunədirsə, qeyd edin |
| Kataloq — çip sırası | "Waiting for payment (6)", "Sorting (6)" (`2137:16977`, `2137:16979`) | Görünməyən qalıq çiplərdir — silinsin |

## 🟠 4. Ana səhifə — servis kartları

- **Harada:** `Home` → `Guess` (`2137:13966`), aşağıdakı kart bloku.
- "Xarici ünvanlar", "Təsdiq kodları", "Təhvil məntəqələri", "Kalkulator" funksiyaları biznes tələblərində (BRD) yoxdur və məhsul qərarı ilə tətbiqdən **çıxarılıb**. "Tariflər" kartı da App 2 dizaynına uyğun olaraq çıxarılıb — ana səhifədə servis kartı yoxdur.
- **Lazımdır:** bu kartları dizayndan da çıxarın və ya ayrıca funksiya kimi planlaşdırılırsa, ekranlarını hazırlayın.

## 🟢 5. Uyğunsuzluqlar

- **"Premium elanlar" ikonu:** Ana səhifədə tac 👑, Kataloq ekranında yaşıl işarə ✅. Birini seçin (tətbiqdə hər ikisində tac işlədilir).
- **Kataloq çipləri:** "Heyvanlar" səhifəsində çiplər *Bizon, Buğa, Dana, Düyə, İnək, Öküz* — bunlar kateqoriyanın 3-cü səviyyəsidir (alt-alt kateqoriya). Backend-də ağac *Heyvanlar → İribuynuzlu heyvanlar → Bizon…* kimidir. Tətbiq çiplərdə bütün alt-alt kateqoriyaları göstərir. Niyyət bu idisə təsdiqləyin; 2-ci səviyyə (İribuynuzlu / Xırdabuynuzlu / Atlar) nəzərdə tutulubsa bildirin.
- **Kateqoriya adları:** Figma-da "Dəniz məhsulları", backend-də **"Su Canlıları"**; bir neçə adda da fərq var. Tətbiq backend adlarını göstərir.
- **Elan detalı — "Cins" etiketi** (`Elan details`, `2137:26779`): 3-cü səviyyə (alt-alt kateqoriya) bütün kateqoriyalar üçün "Cins" adlanır. Heyvanlar üçün uyğundur, amma texnika, gübrə, torpaq üçün yox (məs. *Traktorlar → Cins: Belarus*). Tətbiqdə neytral **"Növ"** işlədilir — universal etiket təsdiqlənsin və ya kateqoriyaya görə fərqli etiket verilsin.

- **Ana səhifə — kateqoriya plitələri** (App 2 → Home "Guess"): ilk 7 plitə 54×54, radius 8, ad 10px; sonuncu ikisi ("Meyvələr Tərəvəzlər", "K/T Məhsullar Ədviyatlar") **70×70, radius 18, ad 12px TT Hoves**; "Bitkilər Toxumlar" adı isə **8px Inter**. Kateqoriyalar backend-dən dinamik gəlir, ona görə tətbiqdə hamısı eyni ölçüdədir (54×54, 10px). Vahid ölçü təsdiqlənsin.
- **Şrift qarışıqlığı:** kartlarda Inter (qiymət, ad, tarix), "Satılır" etiketində SF Pro, bəzi kateqoriya adlarında TT Hoves, qalan yerlərdə Roboto işlənir. Tətbiqdə hər yerdə **Roboto** işlədilir (ölçü, çəki, rəng dizayndakı kimidir). Dizayn sistemində bir şrift ailəsi seçilsin.
- **Kartdakı Premium düyməsi:** `inset` kölgə (daxili qırmızı işıltı) mobil platformalarda standart dəstəklənmir — tətbiqdə yalnız qradiyent (#FF866B → #F66848) var.

- **Kataloq (App 2) — Premium işarələri ana səhifədən fərqlidir:** Kataloq nəticə ekranında başlıq *"Premium elanlar ✅"* (yaşıl təsdiq), kartdakı nişan **çəhrayı kvadrat + ağ almaz**; ana səhifədə isə *"Premium elanlar 👑"* və **narıncı qradiyent + tac**. Eyni məfhum üçün bir işarə seçilsin — tətbiqdə hər yerdə tac işlədilir.
  *Qərar (2026-10-01):* hələlik hər yerdə tac saxlanılır — dizayner birini seçənə qədər.
- **Kart kölgəsi uyğunsuzluğu:** ana səhifədəki elan kartlarında kölgə var (`0 0 14 rgba(0,0,0,.08)`), Kataloq nəticə ekranındakı eyni kartlarda **kölgə yoxdur**, Premium düyməsi də qradiyentsiz (`#FF5964`). Qəsdən fərqdirsə təsdiqlənsin, deyilsə bir variant seçilsin. Tətbiqdə hər yerdə kölgəli kart işlənir.
- **Kataloq nəticə ekranında tab bar** göstərilib, amma bu ekran kataloq axınının içindədir (geri düyməsi var). Tətbiqdə hazırda tab bar yoxdur — təsdiqlənsin.

## 🟠 6. Şəxsi kabinet

- **Öz elanları üzərində əməliyyatlar üçün yer yoxdur** (`Şəxsi kabinet` → `Elanlarım`, `2137:14290`). BRD-yə görə sahib elanını **redaktə edə, yeniləyə (müddəti bitibsə) və silə** bilməlidir; dizaynda kartlarda heç bir əməliyyat yoxdur. Tətbiqdə müvəqqəti həll: kartın sağ yuxarı küncündə **⋮** düyməsi → alt panel (İrəli çək / Yenilə / Redaktə et / Sil). Uyğun həll dizayn edilsin.
- **4-cü status tabı kəsilib:** "Aktiv · Müddəti bitmiş · Yoxlanışda olan · **Dərc…**" — tam adı və mənası? Backend statusları: aktiv, müddəti bitmiş, yoxlanışda, **rədd edilib**. Tətbiqdə 4-cü tab "Rədd edilib" kimi göstərilir.
- **Profili düzəliş et** (`2137:14406`):
  - **Şəhər sahəsi yoxdur**, amma BRD profil ekranında şəhərin dəyişdirilməsinə icazə verir. Tətbiqdə telefonun altına "Şəhər" seçicisi əlavə olunub — dizayna salınsın.
  - Ad, email və telefon sahələri redaktə edilə bilən kimi görünür, amma BRD-yə görə **ad bir dəfə yazıldıqdan sonra kilidlənir, telefon heç vaxt dəyişmir, email isə ayrıca kod təsdiqli axınla dəyişir**. Kilidli vəziyyətin və "email dəyiş" girişinin görünüşü dizayn edilsin.
- **Yazılış:** "Aktif tarifim" (türkcə) — tətbiqin qalan yerlərində azərbaycanca "Aktiv" işlənir. "Aktiv tarifim" olmalıdır? Hazırda dizayndakı kimi saxlanılıb.

## 🟠 7. Log in (Kabinetə giriş)

- **İngiliscə mətnlər:** alt başlıq *"Here you can add or replace your phone number"* (həm də məna uyğun deyil — bu giriş ekranıdır, nömrə dəyişmə yox) və doldurulmuş sahənin etiketi *"Phone"*. Tətbiqdə: *"Telefon nömrənizi daxil edin, SMS ilə təsdiq kodu göndərəcəyik"* və *"Telefon"*.
- **Ölkə kodu səhvi:** OTP ekranında *"+995 55 2809869 nömrəsinə SMS kod göndərildi"* — +995 Gürcüstanın kodudur, Azərbaycan **+994**-dür.
- **OTP xanalarının sayı:** dizaynda **4** xana, BRD-də və backend-də kod **6 rəqəmlidir**. Tətbiqdə 6 xana göstərilir — dizayn 6-ya yenilənsin.
- **"istifadəçi razılaşması" linki** hələlik "Qaydalar" səhifəsinə aparır — ayrıca İstifadəçi razılaşması səhifəsi/mətni nəzərdə tutulursa, lazımdır.

## 🟠 8. Backend ilə ziddiyyət

- **Bizimlə əlaqə forması:** backend `email` sahəsini **məcburi** tələb edir, formada isə email sahəsi yoxdur. Ya formaya email əlavə olunsun, ya da backend-də məcburilik götürülsün (bu, backend komandası ilə birlikdə həll edilməlidir).

## 🟠 9. Şəxsi kabinet

- **İki fərqli variant:** bir frame-də tarif nişanı avatarın üstündə (20px dairə), "Aktif tarifim" ikonu gradientli dairə, dəyər rəngi `#B1DF39`. Digərində nişan profil blokunun sağ üst küncündə "Standard" pill-i kimi verilib, ikon dolu yaşıl nişan, rəng `#32B46A`. Tətbiqdə **ikinci variant** tətbiq edilib — hansının son olduğu təsdiqlənsin.
- **Tarif rəngləri:** ayrıca "Aktif tarifim — Standard" kartı narıncı (`#FFA000`) verilib, halbuki tarif sistemində yaşıl/bənövşəyi/qırmızı var. Narıncı hansı tarifə və ya hansı vəziyyətə aiddir?
- **Status çipləri:** dördüncü çip "Dərc…" kəsik görünür (tam adı bilinmir). Backend statusları: Aktiv / Müddəti bitmiş / Yoxlanışda olan / **Rədd edilib**. Tətbiqdə "Rədd edilib" göstərilir.
- **Üçüncü variant:** "Şəxsi kabinet" bölməsindəki komponent frame-də (❖) Balans kartında "Balans artır" düyməsi yoxdur, yerində ox var, tarif nişanı yenə avatarın üstündədir. Beləliklə, kabinetin ən azı 3 fərqli versiyası var — biri "əsas" kimi təsdiqlənsin.
- **Profili düzəliş et:**
  - dizaynda telefon sahəsində xəta vəziyyəti var (qırmızı haşiyə), yəni nömrə redaktə olunan kimi göstərilib. BRD-yə görə telefon bu ekranda dəyişdirilmir, tətbiqdə sahə bağlıdır;
  - dördüncü sahə dizaynda gizlədilib (`display: none`), tətbiqdə orada "Şəhər" seçimi var;
  - versiya dizaynda "4.401", tətbiqdə real versiya göstərilir.
- **Hesabı sil:** dizayn mətnində qalıq balansın qaytarılmaması (BRD qaydası) qeyd olunmur. Bu məlumat istifadəçiyə göstərilməlidirmi?
- **Elanlarım (Müddəti bitmiş):**
  - seçilməmiş "Aktiv" çipi digərlərindən fərqlidir (haşiyə `#D2D6DB`, mətn `#7A7A7A`; digərləri `#D9DCE0` / `#595959`);
  - kartlarda idarə (⋯) düyməsi yoxdur, elanı yeniləmək/silmək necə edilir?
  - tab bar dizaynda görünür, tətbiqdə bu ekran tab bar-sız açılır.
- **"Filter" adlı kabinet frame-i** (initsiallar "IZ", "#696472" ID, yaşıl "Tarifim" zolağı, "Heyvanlar" seçimi) digər frame-lərdən fərqli quruluşdadır. Bunun ayrıca ekran (məs. biznes hesabı) yoxsa köhnə eskiz olduğu dəqiqləşdirilsin.

## 🟠 10. Mağaza (Business account / Mağazaya keçid)

- **Xəritə:** mağaza səhifəsinin yuxarısında xəritə var, amma backend mağaza üçün koordinat saxlamır. Tətbiqdə həmin yerdə mağazanın cover şəkli göstərilir.
- **"Ünvanı xəritədə seçmək":** xəritə seçicisi hələ yoxdur, ona görə tətbiqdə bu link göstərilmir.
- **Cover şəkli:** formada yalnız loqo var, cover sahəsi yoxdur. Halbuki qaydalarda "Logo və cover şəkilləri" deyilir. Tətbiqdə cover sahəsi saxlanılıb.
- **Loqo mətni:** "JPEG,PNG,WEBP to upload faktura here (max. 50 MB)" ingiliscədir, "faktura" sözü yanlışdır, limit də tətbiqdəki ilə uyğun gəlmir (tətbiqdə 500 KB). Tətbiqdə: "JPEG, PNG, WEBP yükləmək üçün toxunun (maks. 500 KB)".
- **Razılıq mətni:** dizaynda rəngi `#D9D9D9`-dur, çox solğun görünür və oxunmur. Tətbiqdə `#8C8C8C` istifadə olunub, "Tələb və Şərtlər" yaşıl link kimi göstərilir.
- **Bağlı vəziyyət:** dizaynda yalnız yaşıl "Açıqdır" var. Mağaza bağlı olanda nə göstərilməlidir? Tətbiqdə qırmızı "Bağlıdır" göstərilir.
- **Hərf səhvi:** "Açııqdır" yazılıb, "Açıqdır" olmalıdır.
- **Başlıq:** "Mağazalar details" frame-ində başlıq "Mağazaya keçid", aşağı sürüşdürüləndə isə mağazanın adıdır. Tətbiqdə kabinetdən gələndə "Mağazaya keçid", digər hallarda mağazanın adı göstərilir.

## 🟠 11. Elan yerləşdir (Business account / Elan yerləşdir)

- **Növ ekranı:** "Kataloq step 18" Yeni elan axınında da istifadə olunur, düymədə "Elanı göstər" yazılıb. Elan yaradarkən bu düymə "Davam et" olmalıdır, tətbiqdə belədir. Burada "Hamısı" çipi də yoxdur, çünki elan bir konkret növə bağlanmalıdır.
- **Video:** formada video yükləmə sahəsi yoxdur — tətbiqdən də çıxarıldı (məhsul qərarı).
- **Şəkil limiti:** formada şəkil sayı (min/maks) haqqında heç bir izah yoxdur. Tətbiqdə şəkillərin altında "Minimum 2, maksimum 8 şəkil" göstərilir.
- **Razılıq mətni:** yenə `#D9D9D9` rəngindədir və oxunmur, tətbiqdə `#8C8C8C`.
- **"Məhsul kateqoriyası" oxu:** solğun rəngdədir (`rgba(191,191,191,.7)`), sanki deaktivdir. Tətbiqdə toxunulur və növü dəyişməyə imkan verir. Deaktiv olmalıdırsa, dəqiqləşdirilsin.

## 🟠 12. Elan detalı və statistika (Business account / Elan details)

**Detal (sahib görünüşü)**
- **"Düzəliş et" frame-ləri (2 ədəd)** mağaza formasının surətidir: "Mağazanı yarat və satışını artır!", "Mağaza adı", "Mağaza loqosu". Elanın redaktəsi üçün bu forma uyğun deyil. Tətbiqdə ✎ düyməsi "Yeni elan" formasını elanın məlumatları ilə doldurulmuş açır. Elan redaktəsinin ayrıca dizaynı olacaqsa, göndərilsin.
- **Ürək (seçilmişlər) düyməsi:** sahibin öz elanında dizaynda yalnız "paylaş" var. Tətbiqdə də sahibə ürək göstərilmir, digər istifadəçilər üçün qalır.
- **Şəkil sayğacı:** detalda "1/8" göstərilir. Tətbiqdə nöqtələr əvəzinə bu sayğac qoyuldu.
- **Ana səhifə kartları ("Guess" frame-i):** bütün kartlarda ürək əvəzinə statistika ikonu var. Başqasının elanının statistikası görünə bilməz, bu ikon yalnız sahibin öz elanlarında məntiqlidir. Hansı kartlarda göstərilməli olduğu dəqiqləşdirilsin. Tətbiqdə hələ dəyişməyib.

**Elan statistikası (6 tab)**
- **Tab sırası:** frame 7–9-da "Dərc" tabı və boş "Waiting for payment / Sorting" çipləri var, frame 10–12-də isə "Kateqoriya Performansı" bir neçə dəfə təkrarlanır. Tətbiqdə yekun sıra belədir: Trafik · Əlaqə klikləri · Kateqoriya performansı · Qalereya · Paket performansı · Maraq statistikası.
- **Qrafik:** Y oxunda `$50K…$30K` (dollar), X oxunda "Nov 23" kimi placeholder dəyərlər var. Tətbiqdə Y oxunda baxış sayı, X oxunda tarix (24 saatda saat) göstərilir.
- **Xam backend dəyərləri:** "50_plus", "1015.8461538461538", "992.6722222222222" kimi dəyərlər tətbiqdə formatlanır: "50-dən sonra", "1015,8", "992,7". Onluq ayırıcı hər yerdə vergüldür ("0.8%" yox, "0,8%").
- **Rənglər:** dizaynda mənfi dəyər qırmızıdır (`#FF5964`), CTR mavidir (`#276EF1`). Tətbiqdə müsbət dəyişiklik (məs. "+12 baxış · 35,5%") və kateqoriya ortalamasından yuxarı nisbət yaşıl göstərilir. Dizaynda müsbət hal yoxdur, təsdiqlənsin.
- **Tarifə daxil olmayan göstəricilər:** dizaynda bu hal yoxdur. Tətbiqdə həmin sətir və boş qalan tab gizlənir. Heç bir göstərici yoxdursa, "Statistika tarifinizə daxil deyil" bloku və "Tariflərə bax" düyməsi çıxır. Bu vəziyyətin dizaynı lazımdır.
- **İzahlar:** backend hər göstərici üçün bir cümləlik izah qaytarır. Tətbiqdə sətrə toxunanda alt paneldə açılır. Dizaynda bunun üçün yer (məs. ⓘ ikonu) nəzərdə tutulsun.

## 🟠 13. Tariflər (Aylıq / İllik, tarif səhifəsi, Aktiv tarifim)

- **Placeholder mətnlər:** frame-lərdə real mətn yerinə "Contact Name", "Label", "Services OFF", "Express Delivery Title" qalıb. Tətbiqdə bunlar işlədilir: başlıq "Sizə uyğun tarifi seçin", düymə "Tarifi al", əməliyyat sətirləri "Limiti artır" və "Avtomatik yenilənmə". Fayda siyahısı tarifin öz göstəricilərindən qurulur (elan sayı, VIP/Premium günləri, irəli çəkmə sayı). Real mətnlər göndərilsin.
- **Fərdi / Korporativ seçimi:** dizaynda yoxdur. Daxil olmuş istifadəçi yalnız öz hesab tipinin tariflərini görür, qonaq üçün isə Fərdi/Korporativ seçici saxlanılıb. Bu yanaşma təsdiqlənsin.
- **Yaşıl tarifin rəngi:** ad və fon `#B1DF39`-dur. Ağ fonda bu rəng solğun oxunur (kontrast aşağıdır). Kabinetdəki "Aktiv tarif" kartında isə əvvəlki frame-lərdən gələn `#32B46A` var. Bir rəng seçilsin.
- **Tarif ikonu:** "Upgrade Container" gradienti + 15% qara qat. Gradient tək qalanda ağ ikon sarı tonda itir, ona görə qara qat gradientin üstünə qoyulub.
- **İllik qiymətdə üstündən xətt çəkilmiş məbləğ:** tətbiqdə 12 aylıq ödənişin cəmi götürülür, yəni illik endirimi göstərir. Backend ayrıca "köhnə qiymət" verərsə, o istifadə olunacaq.
- **Aktiv tarif yenidən seçiləndə:** siyahıda aktiv tarifin adının yanında "Aktiv" yazılır və toxunanda "Aktiv tarifim" açılır, ödəniş səhifəsi yox. Dizaynda bu vəziyyət yoxdur.
- **Başqa hesab tipinin tarifi:** ödəniş düyməsi deaktivdir, altında izah mətni var. Dizaynda yoxdur.
- **Kabinet frame-ləri (Şəxsi kabinet / Platinum / Diamond):** üçündə də balans kartı oxlu variantdadır ("Balans artır" düyməsi yoxdur), avatarın küncündə tarif ikonu var, sağ yuxarıda tarif nişanı yoxdur. Tətbiq bu variantla uyğunlaşdırılıb (bax bölmə 16).

## 🟠 14. Balans (Balans, Balansı artırmaq)

- **Ödəniş səhifəsi (ABB / 3D Secure):** bu səhifə bankındır, tətbiqdə qurulmur. "Bank kartı ilə ödə" bankın səhifəsini açır, istifadəçi qayıdanda ödənişin statusu yoxlanılır.
- **Başlıqda hərf səhvi:** "Balansı artımaq" yazılıb, "Balansı artırmaq" olmalıdır. Tətbiqdə düzgün yazılıb.
- **Razılıq mətni:** mətndə "«Ödə» düyməsini sıxmaqla..." deyilir, amma düymədə "Bank kartı ilə ödə" yazılıb. Tətbiqdə mətn düymənin adına uyğunlaşdırılıb. "Təstiq" sözü də düzəldilib: "təsdiq".
- **Tarix formatı:** tarixçədə ingiliscə "Jun 15, 2026 • 11:40 AM" var. Tətbiqdə "15 iyun 2026 • 11:40" göstərilir.
- **Məbləğ:** "0.00AZN" boşluqsuz yazılıb. Tətbiqin qalan hissəsində olduğu kimi "0.00 AZN" göstərilir.
- **Hazır məbləğlər (5/10/20/50):** dizaynda yoxdur, tətbiqdən çıxarıldı.
- **Tarixçə ikonları:** dizaynda bir neçə müxtəlif placeholder ikon var (qiymətli daş, pul kisəsi, boş dairə). Tətbiqdə hamısı kart ikonudur: uğursuz əməliyyatda qırmızı, qalanlarında yaşıl. Əməliyyat növünə görə ayrıca ikonlar lazımdırsa, göndərilsin. Valyuta da qarışıqdır: "21.74$" və "21.74 AZN".
- **"Paid" yazısı:** son sətirlərdə ingiliscə "Paid" var. Tətbiqdə "Məxaric", "Mədaxil", "Xəta" və "Gözləmədə" işlədilir.

## 🟠 15. Tənzimləmələr, Qaydalar, Hesabdan çıxış

- **Qaydalar tabları və mətnlər:** sənədlər aqrobazar.com/qaydalar-dakı kimidir. Orada 8 sənəd var, eyni sıra və adlarla: İstifadəçi razılaşması, Elan yerləşdirmə qaydaları, Ödənişli xidmətlər, Ödəniş və geri ödəniş siyasəti, Məxfilik və cookie siyasəti, Qadağan məhsullar və xidmətlər siyasəti, Biznes hesab qaydaları, Mübahisə və saxtakarlıqla mübarizə siyasəti. Figma-nın "List Tab" qeydindəki 7 sənəddən fərqi: "Biznes hesab qaydaları" əlavə olunub, sonuncu sənədin adı saytdakı kimidir. Figma-nı sayta uyğunlaşdırmaq lazımdır.
- **Mətnin mənbəyi:** mətnlər statikdir və web reposundakı `src/components/legal/*.tsx` komponentlərindən götürülüb (tətbiqdə `src/i18n/legalDocs.ts`). Web-də mətn dəyişəndə tətbiqdəki mətni də yeniləmək lazımdır.
- **"Qaydalar" sətri:** Tənzimləmələrdə "İstifadəçi razılaşması", "Qaydalar" və "Məxfilik siyasəti" ayrı sətirlərdir. Tətbiqdə üçü də Qaydalar ekranını açır, uyğun tab seçilmiş olur: "Qaydalar" sətri "Elan yerləşdirmə qaydaları" tabını açır.
- **"Avtobəyan" kartı:** dizaynda gizlədilib, tətbiqdən də çıxarıldı. Tarifin avtomatik yenilənməsi "Aktiv tarifim" ekranındadır.
- **İkonlar:** "Log out" frame-ində Bizimlə əlaqə, Tətbiq haqqında və Qaydalar sətirlərində eyni "Document shield" ikonu var. Bu, "Qaydalar" frame-indəki ikonlarla ziddiyyət təşkil edir. Tətbiqdə "Qaydalar" frame-indəki ikonlar götürülüb.

---


## 🟠 16. Haqqımızda (Şəxsi kabinet → Tənzimləmələr → Haqqımızda)

- **Axın:** üç frame bir yolu göstərir. Şəxsi kabinetdə sağ yuxarıdakı ⚙️ Tənzimləmələri açır, oradakı "Tətbiq haqqında" sətri isə Haqqımızda ekranını.
- **Kabinet son variantı:** bu frame əsas götürülüb.
  - Balans kartı oxludur, "Balans artır" düyməsi yoxdur. Balansı artırmaq Balans ekranındakı düymə ilədir.
  - Tarif nişanı (20px) avatarın sağ alt küncündədir. Profil blokunun sağ yuxarısındakı tarif nişanı götürülüb.
  - Aktiv tarif kartında boz kvadratın içində tarif ikonu var, tarif adı tarifin rəngindədir (#B1DF39).
  - Bölmə 9-dakı "hansı variant əsasdır" sualı bununla bağlanır.
- **Ad uyğunsuzluğu:** Tənzimləmələrdəki sətir "Tətbiq haqqında" adlanır, açılan ekranın başlığı isə "Haqqımızda"dır. Adlardan biri seçilməlidir. Tətbiqdə hələlik Figma-dakı kimi saxlanılıb.
- **Haqqımızda:** başlıqlar nömrəlidir (1–3), mətn Figma-dakı kimi paraqraflara bölünüb.

## 🟠 17. Yeni elan (Kateqoriya → alt kateqoriya → forma)

- **Axın:** Kateqoriya siyahısı → alt kateqoriya ("Yeni elan" başlıqlı siyahı) → forma. Əvvəllər alt kateqoriyadan sonra ayrıca növ ekranı açılırdı. İndi Figma-dakı kimi birbaşa formaya keçilir, növ isə formadakı "Məhsul kateqoriyası" sahəsindən seçilir.
- **Formadakı kateqoriya sahələri:**
  - "Kateqoriya" sahəsində alt kateqoriya göstərilir (məs. İribuynuzlu heyvanlar), "Məhsul kateqoriyası"nda isə növ (məs. Buğa).
  - Kateqoriya seçilməyibsə, "Məhsul kateqoriyası" boz və deaktiv görünür (boş forma frame-indəki kimi).
- **Sahələrin sırası:** Kateqoriya, Məhsul kateqoriyası, növə görə əlavə sahələr (Cins və s.), Qiymət AZN, Bölgə, Xidmət, Elan başlığı, Məzmun, WhatsApp nömrəsi, şəkillər, razılıq.
- **Çıxarılan sahələr:**
  - "Əlaqə adı" sahəsi Figma formasında yoxdur, çıxarıldı. Backend-ə profil adı göndərilir.
  - "Razılaşma yolu ilə" checkbox-u da yoxdur, çıxarıldı. "Təklif olunur" seçiləndə qiymət məcburi deyil; qiymət yazılmasa, elan "razılaşma yolu ilə" kimi göndərilir.
- **Boş şəkil sahəsi:** tam enli kəsik xətli qutu, altında mavi yazı.
  - Figma-dakı mətn ingiliscədir və başqa ekrandan kopyalanıb: "JPEG,PNG,WEBP to upload faktura here (max. 50 MB)".
  - Tətbiqdə əvəzinə "Minimum 2, maksimum 8 şəkil (JPEG, PNG, WEBP)" yazılır; say limiti tarifdən gəlir.
  - Düzgün mətni təsdiqləyin.
- **Razılıq mətninin rəngi:** Figma-da #D9D9D9-dur, ağ fonda çox zəif oxunur. Hüquqi razılıq mətni olduğu üçün tətbiqdə #8C8C8C saxlanılıb.
- **Sıfırla:** formanı kateqoriya daxil tamamilə təmizləyir (boş forma frame-indəki "Kateqoriya seç" vəziyyəti).
- **"Filter" adlı frame:** Yeni elan bölməsindəki Bölgə paneli Filter ekranının üstündə çəkilib. Panel eyni komponentdir, formada da Bölgə sahəsindən açılır.

## 🟠 18. Elan detalı (alıcı görünüşü) və İrəli çək / Premium / VIP

- **Başqasının elanında irəli çəkmə düymələri:** "Details" frame-lərində ürək qırmızıdır, yəni elan başqasınındır. Amma "İrəli çək / Premium et / VIP et" düymələri yenə görünür. Backend bu xidmətləri yalnız elanın sahibinə satır (`listing_promotion_purchase`: `owner=profile`). Ona görə tətbiqdə düymələr yalnız sahibinə göstərilir. Başqasının elanını irəli çəkmək nəzərdə tutulursa, bu backend dəyişikliyi tələb edir.
- **Kateqoriya sətirlərində qarışıqlıq:**
  - Frame-də "Top kateqoriya: İribuynuzlu heyvanlar", "Kateqoriya: Heyvanlar" yazılıb, yəni səviyyələr tərsinədir. Tətbiqdə məntiqi sıra saxlanılıb: Top kateqoriya = Heyvanlar, Kateqoriya = İribuynuzlu heyvanlar.
  - Başlığın altındakı "Buğa / İnək" yazısı tətbiqdə elanın başlığıdır.
- **Ödəniş ekranları (Elanı irəli çək / Premium et / VIP et):**
  - Figma-ya uyğunlaşdırıldı: ağ izah zolağı; boz fonda bonus kartı (Əvvəl / İndi), qırmızı "Bonus" lenti və ödənişin bitmə tarixi; müddət və ödəniş üsulu kartları.
  - "Ödə" düyməsi və razılıq mətni ekranın altına bərkidilmir, məzmunun içində qalır. Razılıq mətnindəki "İstifadəçi razılaşmasını" və "Qaydaları" sözləri link oldu.
- **Lentin mətni:** CSS-də "-10 %", ekran şəklində "Bonus" yazılıb. Tətbiqdə "Bonus" göstərilir. Endirim faizi nəzərdə tutulursa, backend-dən gəlməlidir.
- **Pulsuz haqq:** tarifdə pulsuz irəli çəkmə / VIP / Premium haqqı qalıbsa, tətbiq "Ödəniş üsulu" kartı əvəzinə "bu əməliyyat pulsuzdur" kartını göstərir. Figma-da bu vəziyyət yoxdur, dizaynı lazımdır.

## 🟠 19. Mağaza yarat (3 addım, xəritə, "Müraciətiniz qəbul edildi")

**Tətbiqdə Figma-ya uyğunlaşdırılanlar:**
- Addım 1: "Məzmun" sahəsinə "Üstünlükləri və vacib məqamları qeyd edin", "Məhsul kateqoriyası" sahəsinə "Kateqoriya seç" placeholder-i qoyuldu. Loqo seçilməyibsə tam enli 130px dropzone (fotoaparat ikonu) göstərilir, seçiləndən sonra 130×130 şəkil və "×" düyməsi.
- Addım 1: "Cover şəkil" sahəsi çıxarıldı, çünki Figma-da yoxdur (bax: backend bəndləri).
- Addım 3: link sahələrinin placeholder-i "Link" oldu, alt düymə "+ Mağaza yarat" oldu (redaktədə "Yadda saxla").
- Uğur pəncərəsi: başlıq, xətt, boz izah mətni və tək yaşıl düymə. Yaşıl "✓" ikonu çıxarıldı.

**Dizaynerdən cavab / düzəliş lazımdır:**
- **"Contact Name" başlığı:** addımların başlığında (1/3 dairəsinin yanında) "Contact Name" yazılıb, bu şablondan qalıb. Tətbiqdə "Mağaza məlumatlarını tamamla" göstərilir. Hər addımın öz başlığı olacaqsa (məs. "Əsas məlumatlar / Ünvan və iş saatları / Əlaqə"), mətni verin.
- **Qaydalar akkordeonu ("Mağazanı yarat və satışını artır!"):** "Düzəliş et" frame-lərində var, "Mağaza yarat" frame-lərində yoxdur. Tətbiqdə hər iki halda göstərilir, çünki qaydalar ən çox yaradılış zamanı lazımdır. Təsdiq edin.
- **Uğur pəncərəsinin düyməsi və mətni:** CSS-də düymənin mətni yoxdur (eni ≈59px). Tətbiqdə "Anladım" yazılıb, bağlananda mağaza səhifəsinə keçir. İzah mətni də Figma-dan gəlmir, tətbiqdə "Mağazanız admin tərəfindən yoxlanıldıqdan sonra aktivləşəcək." yazılıb. Hər ikisini təsdiq edin.
- **Yükləmə mətni:** Figma-da "JPEG,PNG,WEBP to upload faktura here (max. 50 MB)" yazılıb, yəni ingiliscə, "faktura" sözü səhvdir və limit 50 MB-dır. Tətbiqdə real limitlə "JPEG, PNG, WEBP yükləmək üçün toxunun (maks. 500 KB)" yazılıb.
- **Mətn səhvləri:**
  - "Ünvanı axil edin" yazılıb, düzgünü "Ünvanı daxil edin"dir (tətbiqdə düzəldilib).
  - "Mağaza ünvanınıı təsdiqləyin" yazılıb, düzgünü "Mağaza ünvanını təsdiqləyin"dir.
  - Xəritədə axtarış siyahısında ingiliscə "Can't find your address? / Use a map to do this instead" qalıb.
- **Uyğunsuz etiketlər:**
  - "Whatsapp nömrə" (frame 5–8) ilə "Whatsapp nömrəsi" (frame 9–12) fərqlidir; tətbiqdə "Whatsapp nömrəsi" yazılır.
  - "Telefon nömrə" yazılıb, "Telefon nömrəsi" olmalıdır.
  - "İş günləri və saatları" ilə "İş günləri və iş saatları" fərqlidir; tətbiqdə ikincisi yazılır.
- **"İş saatları" (tək aralıq) frame-i:** bir frame-də yalnız iki "00 : 00" sahəsi var, digərində gün-gün qrafik (açar + iki saat) var. Tətbiqdə gün-gün variant işlənib. Tək aralıq ayrıca lazım deyilsə, frame silinsin.
- **Gün sətirlərinin 4 fərqli düzümü:** addım 2-nin tam frame-ində (390×1076) hər gün başqa cür çəkilib:
  1. B.e. / Ç.a.: 14px iki sətirli ad, açar və iki saat bir sətirdə;
  2. Çərşənbə: 16px ad, açar və saatlar bir sətirdə;
  3. Cümə axşamı: açar adın solunda, saatlar aşağıda;
  4. Cümə / Şənbə: ad solda, açar sağda, saatlar aşağıda.

  Tətbiqdə hamısı 4-cü variantla (Cümə) göstərilir: uzun adlar ("Çərşənbə axşamı") sığır, saat sahələri isə rahat toxunulacaq enə (155px) malik olur. Son variant hansıdır, təsdiq edin; frame-də yalnız biri saxlanılsın.
- **Saat sahələrinin oxu:** Figma-da aşağı baxır (⌄), açılan seçicidir. Tətbiqdə də belə edildi; Bölgə sahəsində ox sağa baxır.
- **"Ünvanı xəritədə seçmək" linki:** tam frame-də yaşıl Location ikonu ilə ünvan sahəsinin altında görünür. Xəritə hazır olana qədər tətbiqdə gizlidir (bax: aşağıdakı xəritə bəndi).
- **Bağlı günün saatları:** açarı söndürülmüş gündə saat sahələri boz göstərilir, saat seçiləndə gün avtomatik aktiv olur. Figma-da bu vəziyyət göstərilməyib.

**Xəritə ilə ünvan seçimi (frame 4–6) — hələ tətbiqdə yoxdur:**
- "Ünvanı xəritədə seçmək" linki, xəritə, axtarış və "Təsdiqləmək və ünvanı əlavə et" pəncərəsi gizli saxlanılıb. Bunun üçün:
  1. Native xəritə modulu (react-native-maps) və yeni APK build lazımdır, OTA ilə gəlmir.
  2. Google Maps / Places API açarı (axtarış və ünvanın avtomatik doldurulması üçün) lazımdır. Açar kimin hesabında olacaq?
  3. Backend-də koordinat sahələri lazımdır (aşağıda).
- "Ünvanlarım" siyahısı (frame 6) istifadəçinin saxlanmış ünvanlarını göstərir. Belə bir model backend-də yoxdur. Bu hissə lazımdırsa, ayrıca endpoint tələb olunur.

**Backend (`customers/models/store.py`) — tələb olunan dəyişikliklər:**
- **Koordinatlar yoxdur:** Store modelində `latitude` / `longitude` sahəsi yoxdur. Xəritədə seçilən nöqtə saxlanıla bilməz, mağaza səhifəsində xəritə də göstərilə bilməz. Təklif: `latitude`, `longitude` (DecimalField 9,6, nullable).
- **Məhsul kateqoriyası saxlanılmır:** modeldə kateqoriya sahəsi yoxdur. Formada seçilir, amma API-yə göndərilmir. Təklif: `category` FK (və ya bir neçə kateqoriya üçün M2M). Mağazaları kateqoriyaya görə filtrləmək üçün də lazımdır.
- **İş qrafiki sərbəst mətndir:** `business_hours` 255 simvolluq CharField-dir. Tətbiq gün-gün qrafiki "Bazar ertəsi 09:00 - 18:00; …; Bazar bağlı" mətni kimi yazır və geri parse edir. Bu işləyir, amma kövrəkdir: web paneldə əl ilə yazılmış fərqli format oxunmaya bilər. Təklif: `business_hours` JSONField, məsələn `[{day:0, open:"09:00", close:"18:00", closed:false}, …]`, və ya ayrıca `StoreWorkingDay` cədvəli.
- **Cover şəkil:** modeldə `cover_image` var, Figma formasında yoxdur. Tətbiq yeni mağazada cover göndərmir, redaktədə mövcud cover-a toxunmur. Mağaza səhifəsində cover göstərilirsə, onu yükləmək üçün haradasa sahə lazımdır. Ya formaya qaytarılsın, ya da backend-də istifadədən çıxarılsın.
- **Loqo limiti:** frontend-də 500 KB, Figma-da 50 MB yazılıb. Backend-də ölçü/format validasiyası olub-olmadığı təsdiqlənməlidir; real limit bir yerdə müəyyən olunsun.
- **Təsdiq axını:** `is_approved` / `approved_at` var, amma imtina səbəbi sahəsi yoxdur. Admin müraciəti rədd edərsə, istifadəçiyə səbəb göstərmək üçün `rejection_reason` və status (gözləmədə / təsdiqləndi / rədd edildi) lazımdır. Bildirişlərin endpoint-i də hələ yoxdur (bax: `docs/api-contract-notifications.md`).

## 🟠 20. Mağazalar (siyahı, mağaza səhifəsi, iş qrafiki, xəritə)

**Tətbiqdə Figma-ya uyğunlaşdırılanlar:**
- Siyahı: ağ qutuda (100px, kölgə) mərkəzdə 124×61 loqo, altında fonsuz, sola düzlənmiş ad (12/24) və "N elan paylaşılıb - 👁 N". Kartlar arası 16.
- Mağaza səhifəsi: cover yoxdursa, "Mağazalar" frame-indəki kimi ağ panel birbaşa başlıqdan sonra (yuxarıdan 32) başlayır. Əvvəl yaşıl yer tutucu göstərilirdi.
- "İş qrafiki" sətrinə toxunanda aşağıdan pəncərə açılır: Bold 16 başlıq, "×", hər gün "Bazar ertəsi: 09:00 - 19:00" (Medium 14).
- Ünvan sətrində yalnız ünvan göstərilir ("Koroğlu"), şəhər təkrarlanmır.
- Mağazanın tək elanı varsa, kart iki sütunlu şəbəkədə yarım enlə göstərilir; əvvəl bütün eni tuturdu. Düzəliş bütün elan şəbəkələrinə aiddir.

**Dizaynerdən cavab / düzəliş lazımdır:**
- **Xəritə (frame "Mağazalar details", tam ekran xəritə):** səhifənin yuxarısında xəritə, tam ekranda isə yaşıl pin və loqolu mağaza çipi çəkilib. Tətbiqdə xəritə yoxdur, çünki mağazanın koordinatları saxlanılmır (bax: bölmə 19, backend). Hələlik cover şəkli varsa xəritənin yerində o göstərilir, yoxdursa xəritəsiz variant. Cover Figma-nın heç bir yerində yoxdur: ya xəritə gələndə tamamilə çıxarılsın, ya da dizaynda yeri göstərilsin.
- **"Açııqdır" yazı səhvi:** düzgünü "Açıqdır"dır (tətbiqdə düzgün yazılır). Mağaza bağlı olanda "Bağlıdır" (qırmızı) göstərilir; bu vəziyyət Figma-da yoxdur.
- **İş qrafiki pəncərəsi:**
  - Bağlı gün necə yazılmalıdır? Tətbiqdə "Şənbə: Bağlı" yazılır.
  - Tətbiqdə bu gün yaşıl rənglə seçilir. Figma-da bu yoxdur, təsdiq edin.
- **Başlığın sağ küncü:** Figma-da boşdur. Tətbiqdə başqasının mağazasında ürək (seçdiklərimə əlavə), öz mağazanda redaktə ikonu var. Seçdiklərimdə "Mağazalar" tabı olduğu üçün ürək lazımdır, onun yeri dizaynda göstərilsin.
- **"Daha çox":** uzun təsvir 4 sətirdən sonra kəsilir və "Daha çox" ilə açılır. Figma-da mətn qısadır, bu vəziyyət çəkilməyib.
- **Mağazanın elanlarında yaşıl düymə:** "Mağazalar" frame-ində elan kartlarının sol alt küncündə VIP/Premium tacı əvəzinə yaşıl mağaza ikonu var. Bu nə bildirir (mağaza elanı nişanı)? Hər mağaza elanında göstərilməlidirmi, yoxsa VIP/Premium ilə necə birləşir? Hələlik tətbiqdə adi elan nişanları qalır.
- **Siyahıda loqo:** Figma-da loqo 124×61 (enli) çəkilib. Mağazaların əksəriyyəti kvadrat loqo yükləyir (formada 1:1 kəsilir). Kvadrat loqo qutuda kiçik görünür; loqonun nisbəti bir yerdə müəyyən olunsun.

## 🟠 21. Bizimlə əlaqə (Tənzimləmələr → Bizimlə əlaqə → forma → bildiriş)

**Tətbiqdə Figma-ya uyğunlaşdırılanlar:**
- Başlıq mətni əlavə olundu: "Sualın, təklifin və ya əməkdaşlıq istəyin varsa bizimlə əlaqə saxla" (Medium 18/25, mərkəzdə).
- Əlaqə kartında sətirlər arasında xətt var; etiketlər 12/22 #8C8C8C, dəyərlər Medium 14/22. Ünvan ikonu dolu yaşıl pin oldu.
- Sosial kartların sırası Figma-dakı kimidir: Facebook, TikTok, Instagram.
- Alt düymə "Yazın" əvəzinə "Bizimlə əlaqə" yazır.
- Forma: "Ad, Soyad", **Email** (yeni), "Mobil nömrə", "Mesajınızı daxil edin" (209px), "Ləğv et" və "Göndər". Doldurulmuş sahədə etiket sahənin içində, yuxarıda kiçik göstərilir.
- Göndərişdən sonra Figma-dakı "Alert" kimi yuxarıda ağ bildiriş çıxır: yaşıl ✓ və "Mesajınız uğurla qəbul edildi".
- Tənzimləmələr ekranı frame-ə artıq uyğun idi, dəyişiklik edilmədi.

**Backend:**
- Əlaqə forması endpoint-i (`pages/contact-forms/create/`) email-i məcburi istəyir. Əvvəl formada email olmadığı üçün tətbiq telefondan düzəldilmiş saxta ünvan (`…@mobile.aqrobazar.com`) göndərirdi. İndi istifadəçinin daxil etdiyi real email göndərilir; giriş edilibsə, profildəki email avtomatik doldurulur.

**Dizaynerdən cavab / düzəliş lazımdır:**
- **Xəritə:** Figma-da əlaqə kartının altında ofisin xəritəsi (358×201) çəkilib. Tətbiqdə hələ yoxdur: statik xəritə şəkli üçün Google Static Maps açarı, ya da dizaynerin hazırladığı statik şəkil lazımdır. Ən sadə həll: dizayner xəritə şəklini export etsin, toxunanda telefonun xəritə tətbiqində ünvan açılsın.
- **"Mobile nömrə" / "Mobil nömrə":** Figma-da "Mobile nömrə" yazılıb (ingilis-Azərbaycan qarışığı). Tətbiqdə "Mobil nömrə" yazılır.
- **Etiketlərin uyğunsuzluğu:** boş formada "Ad, Soyad", dolu formada "Ad Soyad" (vergülsüz) yazılıb. Tətbiqdə "Ad, Soyad" saxlanılıb.
- **+994 prefiksi:** Figma-da telefon sahəsində prefiks yoxdur, dəyər "+994552809869" kimi bütöv yazılıb. Tətbiqdə "+994" sabit prefiks kimi göstərilir, istifadəçi yalnız 9 rəqəm yazır; bu, səhv daxiletməni azaldır.
- **"Contact Name":** başlıq mətni layının adı yenə şablondan qalıb ("Contact Name"); mətnin özü düzgündür. Bu, yalnız Figma-da səliqə üçün qeyddir.

## 🟠 22. Bildirişlər (siyahı, sıralama, sürüşdürüb silmə, boş vəziyyət, detal)

**Tətbiqdə Figma-ya uyğunlaşdırılanlar:**
- Kart: radius 14, kölgə, 12×16. Solda 48px dairəvi #F5F5F5 qutuda yaşıl kontur ikon. Başlıq Bold 14/20 qara, mətn 14/20 #7C7C7C (2 sətir), saat SemiBold 12 #3D3D3D.
- Oxunmamış bildiriş: ikonun sağ altında 10px #22C55E nöqtə (əvvəl ağ haşiyəli yaşıl idi).
- Bölmə başlığı ("Bugün", tarix): SemiBold 14/24 #595959 və #ECEDF2 xətt.
- Sürüşdürüb silmə: #E1260D qırmızı, 28px ağ zibil qutusu.
- Sıralama pəncərəsi: #F5F5F5 çiplər (radius 8), seçilmiş çip yaşıl fonda ağ mətnlə, altda "Tətbiq et".
- Boş vəziyyət: 58px boz söhbət ikonu, Bold 16 başlıq, 16/22 #797979 izah.
- Başlıqsız (yalnız mətnli) bildiriş kartı da dəstəklənir.
- Elana bağlı bildirişə toxunanda elan detalı açılır. Bağlı deyilsə, başlıqlı aşağıdan pəncərə və "Aydındır" düyməsi göstərilir.

**Backend:** bildiriş endpoint-ləri hələ yoxdur, ekran mock data ilə işləyir. Tam müqavilə və bu frame-lərdən çıxan əlavələr `docs/api-contract-notifications.md`-dədir:
- başlıqsız bildiriş;
- read/unread süzgəci;
- UTC tarixlər;
- silinmiş elan üçün `listing_id: null`;
- push token qeydiyyatı və push ayarının serverdə saxlanması.

**Dizaynerdən cavab / düzəliş lazımdır:**
- **İngiliscə mətnlər:** "Newest First", "Older First", "Read Notification", "Unread Notification", "No Notifications", "We'll let you know when there will be something to update you." Tətbiqdə müvafiq olaraq "Əvvəlcə yeni", "Əvvəlcə köhnə", "Oxunmuş", "Oxunmamış", "Bildiriş yoxdur", "Yeni bir şey olanda sizə xəbər verəcəyik." yazılır. Təsdiq edin və ya öz variantınızı verin.
- **Nümunə mətn:** kartlarda "Today's the day. Your culinary adventure is almost there." şablon mətni qalıb. Real bildiriş mətnləri (elan təsdiqləndi / rədd edildi / VIP başladı / müddət bitir / balans artımı və s.) üçün dizaynda nümunə yoxdur, tətbiqdəki mətnlər `api-contract`-dakı hadisə siyahısına görə yazılıb.
- **İkonlar:** Figma-da bütün bildirişlərdə eyni zəng ikonu var. Tətbiqdə növə görə fərqli ikonlar işlədilir: VIP üçün zəng, Premium üçün almaz, elan üçün sənəd, ödəniş üçün kart, sistem üçün "i". Hər növ üçün ikon dizaynı verilsə, onlar qoyular.
- **Silmənin təsdiqi:** Figma-da sürüşdürüb silmədən sonra təsdiq pəncərəsi yoxdur. Tətbiqdə bildiriş dərhal silinir, geri qaytarma ("Geri al") yoxdur. Lazımdırsa, dizaynı verilsin.
- **Sıralama ikonu:** başlıqda "Sırala" mətni gizlidir, yalnız ⇅ ikonu görünür. Tətbiqdə də belədir.

*Bu sənəd dizayn uyğunluğu yoxlaması davam etdikcə yenilənəcək — hər ekran yoxlandıqca yeni bəndlər əlavə olunur.*
