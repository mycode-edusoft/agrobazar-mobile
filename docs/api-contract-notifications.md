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
