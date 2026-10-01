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

---

*Bu sənəd dizayn uyğunluğu yoxlaması davam etdikcə yenilənəcək — hər ekran yoxlandıqca yeni bəndlər əlavə olunur.*
