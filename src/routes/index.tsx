import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { sendPhoneOtp, verifyPhoneOtp, signInWithPassword } from "@/lib/supabase-rest";
import { Smartphone, ArrowRight } from "lucide-react";
import loopVideo from "@/assets/login-falcon-loop.mp4.asset.json";
import poster from "@/assets/login-falcon-poster.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — صدى غرف دردشة صوتية" },
      { name: "description", content: "سجّل دخولك إلى صدى وانضم لغرف الدردشة الصوتية المباشرة مع أصدقائك." },
      { property: "og:title", content: "تسجيل الدخول — صدى" },
      { property: "og:description", content: "انضم لغرف الدردشة الصوتية المباشرة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function GoogleLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function Login() {
  const [step, setStep] = useState<"home" | "phone" | "otp" | "email">("home");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+20");
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const primary = "flex w-full items-center justify-center gap-3 rounded-full bg-ice-pill py-4 text-lg font-bold text-ice-pill-text ice-shadow transition active:scale-[.98] disabled:opacity-50";
  const fullPhone = `${countryCode}${phone}`;
  const field = "rounded-2xl border border-ice-glass-border bg-ice-glass text-ice-text outline-none backdrop-blur-xl placeholder:text-ice-dim focus:border-ice-accent";

  return (
    <main className="relative h-dvh overflow-hidden bg-ice-deep font-arabic text-ice-text">
      <img src={poster.url} alt="" aria-hidden="true" className="absolute inset-0 hidden size-full scale-110 object-cover opacity-60 blur-2xl md:block" />
      <div className="relative mx-auto h-full w-full overflow-hidden md:aspect-[9/16] md:w-auto md:shadow-2xl">
      <video
        className="absolute inset-0 size-full object-cover"
        src={loopVideo.url} poster={poster.url}
        autoPlay muted loop playsInline preload="auto" aria-hidden="true"
      />
      <div className="ice-scrim absolute inset-0" />

      <div className="relative z-10 mx-auto flex h-full max-w-md flex-col px-6 pb-8 pt-14">
        <div className="ice-in text-center">
          <h1 className="ice-title text-5xl font-black tracking-tight">صدى</h1>
          <p className="ice-title mt-2 font-semibold text-ice-text">غرف صوتية بلا حدود</p>
        </div>

        <div key={step} className="ice-in mt-auto space-y-5">
          {step === "home" && (
            <>
              <button onClick={() => setStep("phone")} className={`${primary} border border-ice-pill-border`}>
                <Smartphone className="size-5" /> تسجيل الدخول برقم الهاتف
              </button>
              <button onClick={() => { setAuthError(""); setStep("email"); }} className={`${primary} border border-ice-pill-border`}>
                تسجيل الدخول بالبريد الإلكتروني
              </button>
              <div className="flex items-center gap-4 px-10 text-sm text-ice-dim">
                <span className="h-px flex-1 bg-ice-glass-border" /> أو <span className="h-px flex-1 bg-ice-glass-border" />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setStep("phone")} aria-label="الدخول برقم الهاتف"
                  className="flex size-16 items-center justify-center rounded-full bg-ice-pill text-ice-pill-text ice-shadow transition active:scale-95"
                >
                  <Smartphone className="size-7" />
                </button>
              </div>
            </>
          )}

          {step === "email" && (
            <div className="space-y-4 rounded-3xl border border-ice-glass-border bg-ice-glass p-5 backdrop-blur-2xl">
              <button onClick={() => setStep("home")} className="flex items-center gap-1 text-sm text-ice-dim"><ArrowRight className="size-4" /> رجوع</button>
              <h2 className="text-xl font-bold">الدخول بالبريد الإلكتروني</h2>
              <input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="البريد الإلكتروني" className={`${field} w-full px-4 py-4`} />
              <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="كلمة المرور" className={`${field} w-full px-4 py-4`} />
              {authError && <p role="alert" className="text-sm text-rose-300">{authError}</p>}
              <button disabled={!email.includes("@") || password.length < 6 || busy} onClick={async()=>{setBusy(true);setAuthError("");try{await signInWithPassword(email,password);window.location.assign("/sada.html");}catch(e){setAuthError(e instanceof Error?e.message:"تعذر تسجيل الدخول.");}finally{setBusy(false);}}} className={primary}>{busy?"جارٍ الدخول…":"تسجيل الدخول"}</button>
            </div>
          )}

          {step === "phone" && (
            <div className="space-y-4 rounded-3xl border border-ice-glass-border bg-ice-glass p-5 backdrop-blur-2xl">
              <button onClick={() => setStep("home")} className="flex items-center gap-1 text-sm text-ice-dim">
                <ArrowRight className="size-4" /> رجوع
              </button>
              <h2 className="text-xl font-bold">الدخول برقم الهاتف</h2>
              <div dir="ltr" className="flex gap-2">
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={`${field} px-3`}>
                  <option value="+20" className="bg-ice-deep">🇪🇬 +20</option>
                  <option value="+966" className="bg-ice-deep">🇸🇦 +966</option>
                  <option value="+971" className="bg-ice-deep">🇦🇪 +971</option>
                  <option value="+965" className="bg-ice-deep">🇰🇼 +965</option>
                </select>
                <input
                  inputMode="tel" value={phone} placeholder="10 1234 5678"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className={`${field} min-w-0 flex-1 px-4 py-4 text-lg tracking-wider`}
                />
              </div>
              {authError && <p role="alert" className="text-sm text-rose-300">{authError}</p>}
              <button disabled={phone.length < 8 || busy} onClick={async () => {
                setBusy(true); setAuthError("");
                try { await sendPhoneOtp(fullPhone); setStep("otp"); }
                catch (e) { setAuthError(e instanceof Error ? e.message : "تعذر إرسال رمز التحقق."); }
                finally { setBusy(false); }
              }} className={primary}>
                {busy ? "جارٍ الإرسال…" : "إرسال الكود"}
              </button>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4 rounded-3xl border border-ice-glass-border bg-ice-glass p-5 backdrop-blur-2xl">
              <button onClick={() => setStep("phone")} className="flex items-center gap-1 text-sm text-ice-dim">
                <ArrowRight className="size-4" /> تعديل الرقم
              </button>
              <h2 className="text-xl font-bold">كود التحقق</h2>
              <p className="text-sm text-ice-dim">
                أدخل الكود المرسل إلى <bdi dir="ltr">{fullPhone}</bdi>
              </p>
              <div dir="ltr" className="flex justify-between gap-2">
                {code.map((v, i) => (
                  <input
                    key={i} ref={(el) => { refs.current[i] = el; }} value={v} maxLength={1} inputMode="numeric"
                    aria-label={`الرقم ${i + 1}`}
                    onChange={(e) => {
                      const d = e.target.value.replace(/\D/g, "");
                      const n = [...code]; n[i] = d; setCode(n);
                      if (d && i < 5) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus(); }}
                    className={`${field} size-12 text-center text-xl font-bold`}
                  />
                ))}
              </div>
              {authError && <p role="alert" className="text-sm text-rose-300">{authError}</p>}
              <button disabled={code.join("").length < 6 || busy} onClick={async () => {
                setBusy(true); setAuthError("");
                try { await verifyPhoneOtp(fullPhone, code.join("")); window.location.assign("/sada.html"); }
                catch (e) { setAuthError(e instanceof Error ? e.message : "رمز التحقق غير صحيح."); }
                finally { setBusy(false); }
              }} className={primary}>{busy ? "جارٍ التحقق…" : "تأكيد والدخول"}</button>
              <p className="text-center text-sm text-ice-dim">
                لم يصلك الكود؟ <button onClick={async () => { setBusy(true); setAuthError(""); try { await sendPhoneOtp(fullPhone); } catch (e) { setAuthError(e instanceof Error ? e.message : "تعذر إعادة الإرسال."); } finally { setBusy(false); } }} className="font-bold text-ice-text underline">إعادة الإرسال</button>
              </p>
            </div>
          )}

          <p className="text-center text-xs text-ice-dim">
            بتسجيل الدخول توافق على <a className="font-semibold text-ice-text underline">اتفاقية المستخدم</a> و<a className="font-semibold text-ice-text underline">سياسة الخصوصية</a>
          </p>
        </div>
      </div>
      </div>
    </main>
  );
}
