# تشغيل المشروع على جهازك

المجلد ده فيه كود المشروع كامل (بدون `node_modules` ومن غير ملفات نظام Git).

## 1. تثبيت الحزم

المشروع بيستخدم [Bun](https://bun.sh). لو مش عندك Bun، استخدم npm.

```sh
bun install     # أو: npm install
```

## 2. التشغيل

```sh
bun run dev     # أو: npm run dev
```

المشروع هيشتغل على `http://localhost:8080`.

## 3. أوامر تانية

```sh
bun run build    # بناء نسخة الإنتاج
bun run test     # تشغيل الاختبارات
bun run lint     # فحص الكود
```

## 4. فيديو خلفية صفحة الدخول

الكود الحالي بيحمّل الفيديو والصورة الثابتة من استضافة Lovable (من ملفات
`src/assets/*.asset.json`). لو شغّلته على جهازك ومش شايف الخلفية، استخدم
النسخة المحلية المرفقة في `public/media/` عن طريق تعديل سطرين في
`src/routes/index.tsx`:

احذف السطرين دول:

```tsx
import loopVideo from "@/assets/login-falcon-loop.mp4.asset.json";
import poster from "@/assets/login-falcon-poster.jpg.asset.json";
```

وحطّ مكانهم:

```tsx
const loopVideo = { url: "/media/login-falcon-loop.mp4" };
const poster = { url: "/media/login-falcon-poster.jpg" };
```

باقي الكود مش بيتغير.

## 5. ملاحظات

- أزرار Google و Apple و"إنشاء حساب جديد" وشاشة كود التحقق لسه شكلية،
  ومفيش تسجيل دخول فعلي مربوط بخدمة.
- الاسم "صدى" مؤقت وتقدر تغيّره من `src/routes/index.tsx`.
- المتطلبات: Node.js 20+ أو Bun.
