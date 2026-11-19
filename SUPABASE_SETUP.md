# Sada production setup and current integration boundaries

## Repository and entry points
- Web source branch: `test-the`
- Web login: `/`
- Web app entry after login: `/sada.html`
- Admin dashboard: `/admin` (requires a signed-in user with `admin_roles`)
- Native Android project: `android-native/` (Kotlin + Jetpack Compose; no WebView)
- Native debug APK workflow: `.github/workflows/android-native.yml`

## Supabase project
Project URL: `https://pkqcxcfuelubonlkjgoq.supabase.co`

The existing Supabase project now contains:
- Admin roles and audit log.
- Visual asset registry `app_assets` and public Storage bucket `sada-app-assets`.
- Admin access policies for assets, rooms, gifts, VIP packages, users, reports, wallets and inventory.
- New-user trigger creates a profile and zero-balance wallet.
- Secure RPCs for admin wallet adjustment, user status, gift sending, VIP purchase, asset purchase and asset equipping.
- Realtime publication entries for rooms, gifts, VIP packages and visual assets.
- A single existing Auth user has been granted `super_admin` so the existing account can access `/admin`.

No demo catalog was inserted. The current project had no room, gift, VIP-package or visual-asset rows when checked. Add the real catalog through the admin dashboard.

## Login prerequisites
- Email/password login uses Supabase Auth.
- Phone OTP requires Phone provider to be enabled in Supabase Auth and an SMS provider configured (for example Twilio). The native Egypt phone input normalizes to +20 E.164.
- The current web and native login forms do not bypass Supabase Auth.

## Visual asset library
- Upload through Admin > مكتبة الأصول.
- Supported uploads include common image formats, GIF/APNG, MP4/WebM/QuickTime, common audio formats, JSON/Lottie, and GLB/GLTF. Storage limit is 100 MB per file.
- Set a positive price and currency to make an asset purchasable; price 0 means not for sale.
- Purchases are checked against wallet balances server-side and recorded in wallet transactions and user inventory.
- Equipped frame metadata is read by the avatar component. Entrance, room background, room gift-box, chat bubble, and profile card assets use the documented keys in `ADMIN_ASSET_KEYS.md`.
- Files stored in formats without a component renderer are retained and previewed in the admin library, but they will not automatically render in every native UI surface.

## Agora / live voice
The Supabase Edge Function `agora-token` is deployed and now verifies room membership and publisher/subscriber role before issuing a token.
For live RTC, configure Supabase Edge Function secrets:
- `AGORA_APP_ID`
- `AGORA_APP_CERTIFICATE`

The current native APK is a native authentication and data foundation. It does not yet join Agora channels, capture microphone audio, or implement the complete seat audio controls. The Agora Android SDK and token-client wiring must be completed and tested before claiming live voice is available.

## Production security follow-up
Supabase Security Advisor currently reports leaked-password protection is disabled. Enable it in Supabase Auth password security settings before production release. The admin-only SECURITY DEFINER RPCs check the caller's admin role; the security advisor still flags these callable functions for review.
