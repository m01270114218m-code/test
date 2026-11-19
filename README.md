# صدى شات — Sada

مشروع تطبيق صدى للدردشة والغرف الصوتية.

## مكونات المشروع
- `app/`: ملفات واجهة التطبيق المشتركة.
- `public/`: ملفات الواجهة التي يقدمها مشروع الويب.
- `android-native/`: مشروع Android الذي ينتج APK.
- `supabase/`: مخططات وترحيلات ووظائف Supabase.
- `.github/workflows/android-native.yml`: بناء APK تلقائياً عند تحديث ملفات Android.

## تشغيل واجهة الويب
يتطلب Node.js وBun:
```bash
bun install
bun run dev
```

## بناء APK
يتطلب JDK 17 وAndroid SDK وGradle 8.9:
```bash
cd android-native
gradle :app:assembleDebug
```
ملف APK الناتج:
`android-native/app/build/outputs/apk/debug/app-debug.apk`

## ملاحظات الحالة
تطبيق Android الحالي يضم واجهة تسجيل دخول أصلية، ثم يعرض واجهة صدى المعبأة محلياً داخل WebView بلا شريط متصفح أو عنوان. بعض موارد الواجهة تُحمّل من الإنترنت؛ لذلك لا يعد التطبيق حالياً نسخة تعمل بالكامل دون اتصال. كما أن وظائف الصوت المباشر ولوحة الإدارة داخل APK تحتاج استكمال الربط والاختبار قبل وصف الإصدار بأنه إنتاجي.
