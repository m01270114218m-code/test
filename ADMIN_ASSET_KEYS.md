# Sada admin and visual asset keys

Admin dashboard: `/admin` (requires an authenticated account with a row in `public.admin_roles`).

## Upload workflow
1. Sign in to the admin dashboard.
2. Open **مكتبة الأصول**.
3. Choose a category and upload an image, GIF, audio file, or MP4 (maximum 50 MB).
4. Enter a unique asset key. The file is stored in the `sada-app-assets` bucket and its registry row is stored in `public.app_assets`.
5. The app reads active asset rows from Supabase. Replacing an asset with the same key changes the visual used by supported components.

## Supported keys currently consumed by the Frost UI
- `frame.gold`, `frame.ice`, `frame.violet`, `frame.rose`: avatar frame artwork.
- `gift.rose`, `gift.heart`, `gift.ice`, `gift.star`, `gift.crown`, `gift.ring`, `gift.car`, `gift.rocket`, `gift.castle`, `gift.diamond`, `gift.medal`, `gift.trophy`: gift artwork.
- `vip.badge` or `vip.badge.1` through `vip.badge.8`: VIP badges.
- `room.cover.default`: default room card/room cover.
- `room.background.default`: voice room background.
- `page.background.default`: main page background.

The asset registry also exposes `window.SADA_ASSETS.url(key, fallback)`, `get(key)`, `all()`, `refresh()`, and `apply(root)`. To make any additional visual element editable, its component must call this resolver with a stable key or use a `data-sada-asset` attribute.

## Important boundaries
The asset library is the source of visual files; it does not by itself implement new animation logic or change layout geometry. Entrance effects and additional per-page elements need their component to consume an asset key. Catalog records (gift price, VIP duration/benefits) remain database records, separate from image files. Real-time voice transport requires the configured Agora credentials and app-side RTC integration.
