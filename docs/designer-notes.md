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
- **Kabinet frame-ləri (Şəxsi kabinet / Platinum / Diamond):** üçündə də balans kartı oxlu variantdadır ("Balans artır" düyməsi yoxdur), avatarın küncündə tarif ikonu var, sağ yuxarıda tarif nişanı yoxdur. Bölmə 9-dakı açıq sual hələ cavabsızdır, tətbiqdə hələ düyməli variant qalır.

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
- **Mətnin mənbəyi:** mətnlər saytdan götürülüb və tətbiqə daxil edilib (`src/i18n/legalDocs.ts`). Sayt dəyişəndə tətbiqi də yeniləmək lazımdır. Backend-in `static-pages` endpoint-i hələ də yalnız SEO sahələrini qaytarır. Mətn ora köçürülsə, tətbiq onu birbaşa backend-dən oxuya bilər.
- **"Qaydalar" sətri:** Tənzimləmələrdə "İstifadəçi razılaşması", "Qaydalar" və "Məxfilik siyasəti" ayrı sətirlərdir. Tətbiqdə üçü də Qaydalar ekranını açır, uyğun tab seçilmiş olur: "Qaydalar" sətri "Elan yerləşdirmə qaydaları" tabını açır.
- **"Avtobəyan" kartı:** dizaynda gizlədilib, tətbiqdən də çıxarıldı. Tarifin avtomatik yenilənməsi "Aktiv tarifim" ekranındadır.
- **İkonlar:** "Log out" frame-ində Bizimlə əlaqə, Tətbiq haqqında və Qaydalar sətirlərində eyni "Document shield" ikonu var. Bu, "Qaydalar" frame-indəki ikonlarla ziddiyyət təşkil edir. Tətbiqdə "Qaydalar" frame-indəki ikonlar götürülüb.

---

*Bu sənəd dizayn uyğunluğu yoxlaması davam etdikcə yenilənəcək — hər ekran yoxlandıqca yeni bəndlər əlavə olunur.*
