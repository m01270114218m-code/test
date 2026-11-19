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
- `room.gift_box`: custom gift-box button inside the room.
- `entrance.default`: room-entry artwork; GIFs animate and MP4/WebM files play on entry.
- `chat.bubble.default`: chat message bubble artwork.
- `profile.card.background`: profile header/card background.
- `page.background.default`: main page background.

The asset registry also exposes `window.SADA_ASSETS.url(key, fallback)`, `get(key)`, `all()`, `refresh()`, and `apply(root)`. To make any additional visual element editable, its component must call this resolver with a stable key or use a `data-sada-asset` attribute.

## Important boundaries
The asset library is the source of visual files. The store uses `metadata.price` and `metadata.currency`; assets priced at zero are not sold. The purchase and equip operations are validated and recorded by Supabase RPCs. The uploader accepts supported image, animated image, video, audio, Lottie JSON, and 3D model formats up to 100 MB. Some file formats are stored and previewed in the admin panel but still need a dedicated native renderer before they can be shown in every app component. Real-time voice transport still requires configured Agora credentials and native RTC integration.
