# Bildirişlər üçün gözlənilən API müqaviləsi (mobil)

Mobil tətbiqdə "Bildirişlər" ekranı hazırdır (Figma: `Bildirişlər` bölməsi), lakin backend-də
uyğun endpoint yoxdur — hazırda mock data ilə işləyir. Aşağıdakı müqavilə əlavə olunandan sonra
`src/services/http/notifications.ts` yazılıb mock əvəz olunacaq.

Baza: `/api/v1/` · Auth: `Bearer <access>` (CustomerJWTAuthentication)

## GET `notifications/`
Cari istifadəçinin bildirişləri, tarixə görə azalan.

Query:
| ad | tip | izah |
|---|---|---|
| `sort` | `newest` \| `oldest` \| `read` \| `unread` | defolt `newest`; `read`/`unread` həm süzgəc, həm sıralama |
| `page`, `page_size` | int | DRF səhifələnməsi |

Cavab (`results[]`):
```json
{
  "id": 123,
  "kind": "vip",
  "title": "VIP elan!",
  "body": "Elanınız VIP blokuna əlavə olundu…",
  "created_at": "2026-09-28T09:11:00Z",
  "is_read": false,
  "listing_id": 456,
  "listing_slug": "buga-xyz"
}
```
`kind`: `vip` | `premium` | `listing` | `payment` | `system`
`listing_id`/`listing_slug` — `null` ola bilər (elana bağlı olmayan bildiriş).

## GET `notifications/unread-count/`
```json
{ "count": 3 }
```
Tab/header badge-i üçün; tez-tez çağırılır, ucuz olmalıdır.

## POST `notifications/{id}/read/`
Bir bildirişi oxunmuş edir → `204`.

## POST `notifications/read-all/`
Hamısını oxunmuş edir → `204`.

## DELETE `notifications/{id}/`
Bildirişi silir (sürüşdürüb-silmə jesti) → `204`.

## Hansı hadisələr bildiriş yaratmalıdır (BRD-yə görə)
- Elan admin tərəfindən **təsdiqləndi** / **rədd edildi** (rədd səbəbi `body`-də)
- Elanın **müddəti bitdi** (yeniləmə təklifi ilə)
- **VIP / Premium / İrəli çəkmə** tətbiq olundu və bitmək üzrədir
- **Balans artımı**, tarif alışı, avtomatik yenilənmə uğursuzluğu (BRD VIII: 3 uğursuz cəhddən sonra söndürülür)
- **Mağaza təsdiqi** (BRD III — hazırda səbəb saxlanmır, bildiriş də getmir; əlavə edilməsi tövsiyə olunur)

## Figma frame-lərindən çıxan əlavə tələblər (2026-10-03)
- **`title` boş ola bilər.** Figma-da yalnız mətndən ibarət (başlıqsız, 72px) bildiriş kartı var. `title: ""` və ya `null` gəlsə, tətbiq yalnız `body`-ni göstərir.
- **`sort=read` / `sort=unread` süzgəcdir.** Figma-da "Read / Unread Notification" çipləri "Newest / Older First" ilə yanaşı durur. Server bu dəyərlərdə yalnız uyğun bildirişləri qaytarmalı və onları yenidən köhnəyə doğru düzməlidir.
- **Günlərə görə qruplaşdırma** ("Bugün", "27.08.2026") tətbiqdə `created_at`-dan, istifadəçinin yerli saatı ilə (Asia/Baku) aparılır. Server `created_at`-ı UTC ISO formatında göndərsin.
- **Elana bağlı bildiriş:** toxunanda elan detalı açılır (Figma "Details" frame-i). Bunun üçün `listing_id` lazımdır. Elan silinibsə, server `listing_id: null` qaytarsın, yoxsa istifadəçi 404 ekranına düşər.
- **Elana bağlı olmayan bildiriş** (məs. sistem mesajı) toxunanda "VIP elan" kimi başlıqlı aşağıdan açılan pəncərədə tam mətnlə göstərilir. Ona görə `body`-nin uzunluğu kartdakı 2 sətirlə məhdudlaşdırılmamalıdır.
- **Push bildirişlər:** Tənzimləmələrdə "Push bildirişlər / Yeni mesajlar barədə bildirimlər almaq istəyirəm" açarı var, amma backend tərəfi yoxdur. Lazımdır:
  - `POST notifications/devices/` `{ token, platform: "android"|"ios" }`: Expo push token-in qeydiyyatı (login-dən sonra), `DELETE` isə logout zamanı;
  - `PATCH notifications/settings/` `{ push_enabled: bool }`: açarın vəziyyəti serverdə saxlanılsın (hazırda yalnız tətbiqin daxilindədir və yenidən açanda sıfırlanır);
  - bildiriş yaradılanda Expo Push API (`https://exp.host/--/api/v2/push/send`) ilə göndəriş; `data.listing_id` olsa, tətbiq toxunuşda elanı açacaq.
