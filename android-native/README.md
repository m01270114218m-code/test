# صدى — Android Native

This is a native Kotlin + Jetpack Compose Android application. It does not embed the web application in a WebView.

- Authentication: Supabase phone OTP and email/password.
- Initial data: Supabase profiles, rooms, gifts, and wallet.
- Native UI: Jetpack Compose.

The project currently provides the native foundation and authenticated data screens. Live RTC audio, seat signaling, in-room chat, gift purchase flows, and the complete management console still require their native feature implementation and configured service credentials. Do not describe this APK as feature-complete until those tests pass.

Build locally with Gradle 8.9+ and JDK 17:
gradle :app:assembleDebug
