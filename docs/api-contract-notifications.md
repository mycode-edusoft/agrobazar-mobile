# Bildirişlər, push və seçilmiş mağazalar — API müqaviləsi

**Vəziyyət (4 okt 2026):** backend prod-a deploy olunub. Mobil qoşulub: `src/services/http/notifications.ts`
(siyahı, oxunmuş, silmə, cihaz, push açarı), `httpFavorites.stores/addStore/removeStore`, push — `src/lib/push.ts`
(`expo-notifications`; native build tələb edir, app versiyası 1.1.0).

Baza: `/api/v1/` · Auth: `Bearer <access>` (CustomerJWTAuthentication)

## Bildirişlər — `notifications/` (hamısı `IsCustomerUser`)

### GET `notifications/?sort=newest&page=1&page_size=20`
`sort`: `newest` (defolt) | `oldest` | `read` | `unread` — `read`/`unread` süzgəcdir, sıra yenidən köhnəyə.
Cavab DRF səhifələnməsi (`count`, `next`, `previous`, `results[]`):
```json
{
  "id": 123,
  "kind": "vip",
  "title": "VIP elan!",
  "body": "«Damazlıq inək» elanınız VIP blokuna əlavə olundu (10.10.2026 tarixinədək).",
  "created_at": "2026-10-04T09:11:00Z",
  "is_read": false,
  "listing_id": 456,
  "listing_slug": "damazliq-inek-456",
  "listing_path": { "category": "heyvanlar", "subcategory": "iribuynuzlu", "subsubcategory": "inek", "listing": "damazliq-inek-456" }
}
```
- `kind`: `vip` | `premium` | `listing` | `payment` | `system`
- `title` boş ola bilər — klient yalnız `body` göstərir (Figma-da başlıqsız kart var).
- `created_at` UTC; günlərə qruplaşdırma klientdə `Asia/Baku` ilə.
- Elan silinibsə `listing_*` sahələri `null` (toxunanda detal yox, pəncərə açılır).
- `listing_path` — elan detalı endpoint-i (`listings/categories/…/listings/<slug>/`) tam zəncir tələb edir.

### GET `notifications/unread-count/` → `{ "count": 3 }`
### POST `notifications/{id}/read/` → `204` (idempotent; başqasının → `404`)
### POST `notifications/read-all/` → `204`
### DELETE `notifications/{id}/` → `204` (sürüşdürüb silmə)

## Push
### POST `notifications/devices/`  `{ "token": "ExponentPushToken[...]", "platform": "android" | "ios" }`
Girişdən sonra və **hər açılışda** çağırılmalıdır (idempotent: `201` yeni, `200` mövcud). Token başqa hesabda
qeydiyyatdadırsa cari hesaba köçürülür (telefon başqa istifadəçiyə keçəndə köhnə hesab push almır).
### DELETE `notifications/devices/`  `{ "token": "..." }` → `204` — **çıxışda**, token silinməzdən əvvəl.
### GET/PATCH `notifications/settings/` → `{ "push_enabled": true }`
Tənzimləmələrdəki «Push bildirişlər» açarı. `false` — bildirişlər tətbiqdə yaranır, push getmir.

### Push payload (`expo-notifications` → `notification.request.content.data`)
```json
{ "notification_id": 123, "kind": "listing", "listing_id": 456, "listing_slug": "…", "listing_path": { … } }
```
`listing_*` yalnız elana bağlı bildirişdə. Android kanalı: `"default"` (tətbiq `setNotificationChannelAsync("default")`
ilə yaratmalıdır). Push-a toxunanda: `notifications/{id}/read/` + `listing_path` varsa elan detalı.

### Web (brauzer) push — yalnız sayt üçün, mobil istifadə etmir
Bildiriş mərkəzi saytda eyni endpoint-lərlə işləyir (`customer_access` cookie). Brauzer push üçün əlavə:
- `GET notifications/web-push/public-key/` → `{ "public_key": "<VAPID>" }` (açıq; `503` → push söndürülüb)
- `POST notifications/web-push/subscriptions/` — `PushSubscription.toJSON()` olduğu kimi (`{endpoint, keys:{p256dh,auth}}`) → `201`/`200`
- `DELETE notifications/web-push/subscriptions/` `{ "endpoint": "..." }` → `204` (çıxışdan əvvəl)
- Payload: `{title, body, url, tag, notification_id, kind, listing_*}`; `url` = sayt marşrutu `/{category}/{subcategory}/{subsubcategory}/{listing}`.
`push_enabled` hər iki kanal üçün ortaqdır. Ətraflı: backend `docs/web_push_integration.md`.

## Bildiriş yaradan hadisələr (backend `notifications/events.py`)
| Hadisə | kind | title |
|---|---|---|
| Elan təsdiqləndi / geri qaytarıldı (səbəb `body`-də) | `listing` | Elanınız təsdiqləndi / Elanınız geri qaytarıldı |
| VIP / Premium tətbiq olundu (ödəniş, tarif hüququ, admin, kampaniya) | `vip` / `premium` | VIP elan! / Premium elan! |
| İrəli çəkmə alındı | `listing` | Elanınız irəli çəkildi |
| Elanın müddəti bitdi | `listing` | Elanınızın müddəti bitdi |
| Balans artırıldı (yalnız saf top-up) | `payment` | Balans artırıldı |
| Tarif avto-yeniləndi / uğursuz cəhd (1–3) | `payment` | Tarifiniz yeniləndi / Tarif avto-yeniləmə uğursuz oldu |
| Mağaza təsdiqləndi | `system` | Mağazanız təsdiqləndi |

Hələ yoxdur: «VIP/Premium bitmək üzrədir» (dövri tapşırıq lazımdır), «tarifiniz bitdi» (backend `expire_subscriptions_task`
beat-də deyil — bugs.md A12).

## Seçilmiş mağazalar — `auth/customers/store-favorites/`
Giriş edilibsə profil, edilməyibsə qonaq (`X-Visitor-Id` başlığı / `ab_vid` cookie — elan seçilmişləri ilə eyni).
- GET `store-favorites/` — səhifələnmiş; element public mağaza siyahısı formatı + `is_favorited: true`.
- POST `store-favorites/create/` `{ "store_slug": "grovex" }` (və ya `store_id`) → `201` / `200` (idempotent); təsdiqlənməmiş → `404`.
- DELETE `store-favorites/{id|slug}/delete/` → `200 {deleted}`.
- DELETE `store-favorites/delete-all/`.
- Public `auth/customers/stores/` və `stores/{slug}/` cavablarında `is_favorited` sahəsi.
