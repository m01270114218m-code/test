import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Archive, Ban, Check, ChevronLeft, CircleDollarSign, Crown, FileImage, Gift, LayoutDashboard, LogOut, Package, RefreshCw, Search, Settings, ShieldCheck, Users, Wallet, Upload, X } from "lucide-react";
import { callRpc, currentUser, getSession, insertRow, isAdmin, publicAssetUrl, saveSession, selectRows, signInWithPassword, signOut, updateRows, uploadAsset, upsertRow, type SadaSession } from "@/lib/supabase-rest";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Tab = "overview" | "assets" | "gifts" | "vip" | "users" | "reports" | "settings";
const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "assets", label: "مكتبة الأصول", icon: FileImage },
  { id: "gifts", label: "الهدايا", icon: Gift },
  { id: "vip", label: "باقات VIP", icon: Crown },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "reports", label: "البلاغات", icon: ShieldCheck },
  { id: "settings", label: "إعدادات التطبيق", icon: Settings },
];
const categories = ["frame","gift","entrance","vip","avatar","room_background","banner","icon","page_element","sound","other"];
const categoryNames: Record<string,string> = {frame:"إطارات",gift:"هدايا",entrance:"دخوليات",vip:"VIP",avatar:"صور شخصية",room_background:"خلفيات غرف",banner:"بنرات",icon:"أيقونات",page_element:"عناصر صفحات",sound:"مؤثرات صوتية",other:"أخرى"};
const money = (v: unknown) => new Intl.NumberFormat("ar-EG").format(Number(v || 0));

function AdminPage() {
  const [session,setSession] = useState<SadaSession|null>(null);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [tab,setTab] = useState<Tab>("overview");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [rows,setRows] = useState<any[]>([]);
  const [stats,setStats] = useState({users:0,rooms:0,gifts:0,assets:0,reports:0});
  const [search,setSearch] = useState("");
  const [assetFile,setAssetFile] = useState<File|null>(null);
  const [assetForm,setAssetForm] = useState({asset_key:"",title:"",category:"frame",sort_order:"0"});
  const [giftForm,setGiftForm] = useState({name:"",image_url:"",price:"10",currency:"coins"});
  const [vipForm,setVipForm] = useState({name:"",duration_days:"30",price:"100",currency:"diamonds"});
  const [settingKey,setSettingKey] = useState("global");
  const [settingValue,setSettingValue] = useState('{"app_name":"صدى","maintenance_mode":false}');
  const [isAllowed,setIsAllowed] = useState(false);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : String(e));
  const refreshOverview = useCallback(async () => {
    const [users,rooms,gifts,assets,reports] = await Promise.all([
      selectRows("profiles","select=id&limit=1000"), selectRows("rooms","select=id&limit=1000"),
      selectRows("gifts","select=id&limit=1000"), selectRows("app_assets","select=id&limit=1000"),
      selectRows("user_reports","select=id&limit=1000"),
    ]);
    setStats({users:users.length,rooms:rooms.length,gifts:gifts.length,assets:assets.length,reports:reports.length});
  },[]);
  const loadTab = useCallback(async (target: Tab) => {
    setLoading(true); setError("");
    try {
      if (target === "assets") setRows(await selectRows("app_assets","select=*&order=category.asc,sort_order.asc,created_at.desc&limit=500"));
      if (target === "gifts") setRows(await selectRows("gifts","select=*&order=name.asc&limit=500"));
      if (target === "vip") setRows(await selectRows("vip_packages","select=*&order=price.asc&limit=200"));
      if (target === "users") setRows(await selectRows("profiles","select=id,username,display_name,avatar_url,level,account_status,created_at&order=created_at.desc&limit=500"));
      if (target === "reports") setRows(await selectRows("user_reports","select=*&order=created_at.desc&limit=500"));
      if (target === "settings") {
        const settings = await selectRows("app_settings","select=*&order=setting_key.asc");
        setRows(settings);
      }
      if (target === "overview") await refreshOverview();
    } catch (e) { fail(e); }
    finally { setLoading(false); }
  },[refreshOverview]);
  useEffect(() => {
    let alive = true;
    const init = async () => {
      const existing = getSession();
      if (!existing) return;
      try {
        await currentUser(existing);
        const allowed = await isAdmin(existing);
        if (alive && allowed) { setSession(existing); setIsAllowed(true); }
        else if (alive) { saveSession(null); setError("هذا الحساب ليس لديه صلاحية إدارة صدى."); }
      } catch { saveSession(null); }
    };
    void init();
    return () => { alive = false; };
  },[]);
  useEffect(() => { if (session && isAllowed) void loadTab(tab); },[session,isAllowed,tab,loadTab]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const s = await signInWithPassword(email,password);
      await currentUser(s);
      if (!(await isAdmin(s))) { saveSession(null); throw new Error("تم تسجيل الدخول، لكن هذا الحساب غير مضاف كمدير في قاعدة البيانات."); }
      setSession(s); setIsAllowed(true); setPassword("");
    } catch (e) { fail(e); }
    finally { setLoading(false); }
  };
  const logout = async () => { try { await signOut(); } catch {} setSession(null); setIsAllowed(false); setRows([]); };
  const filteredRows = useMemo(() => rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())),[rows,search]);

  const saveAsset = async (e: React.FormEvent) => {
    e.preventDefault(); if (!assetFile) return fail(new Error("اختر ملف الأصل أولاً."));
    setLoading(true); setError(""); setNotice("");
    try {
      const path = `${assetForm.category}/${Date.now()}-${assetFile.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
      await uploadAsset(assetFile,path);
      await upsertRow("app_assets",{asset_key:assetForm.asset_key,title:assetForm.title,category:assetForm.category,storage_path:path,mime_type:assetFile.type,sort_order:Number(assetForm.sort_order)||0,is_active:true,created_by:session?.user.id},"asset_key");
      await insertRow("admin_audit_logs",{actor_id:session?.user.id,action:"asset.upsert",entity_type:"app_asset",entity_id:assetForm.asset_key,details:{path,category:assetForm.category}});
      setAssetForm({asset_key:"",title:"",category:"frame",sort_order:"0"}); setAssetFile(null);
      setNotice("تم رفع الأصل وحفظه في مكتبة الأصول."); await loadTab("assets");
    } catch(e) { fail(e); } finally { setLoading(false); }
  };
  const saveGift = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await insertRow("gifts",{name:giftForm.name,image_url:giftForm.image_url,price:Number(giftForm.price),currency:giftForm.currency,is_active:true}); setGiftForm({name:"",image_url:"",price:"10",currency:"coins"}); setNotice("تمت إضافة الهدية."); await loadTab("gifts"); }
    catch(e) { fail(e); } finally { setLoading(false); }
  };
  const saveVip = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await insertRow("vip_packages",{name:vipForm.name,duration_days:Number(vipForm.duration_days),price:Number(vipForm.price),currency:vipForm.currency,benefits:{},is_active:true}); setVipForm({name:"",duration_days:"30",price:"100",currency:"diamonds"}); setNotice("تمت إضافة باقة VIP."); await loadTab("vip"); }
    catch(e) { fail(e); } finally { setLoading(false); }
  };
  const toggleActive = async (table:string,id:string,active:boolean) => {
    setLoading(true); setError("");
    try { await updateRows(table,`id=eq.${id}`,{is_active:!active}); await loadTab(tab); }
    catch(e) { fail(e); } finally { setLoading(false); }
  };
  const changeStatus = async (id:string,status:string) => {
    const reason = window.prompt("سبب الإجراء (للتوثيق):","إجراء من لوحة الإدارة") || "إجراء من لوحة الإدارة";
    setLoading(true);
    try { await callRpc("admin_set_user_status",{p_user_id:id,p_status:status,p_reason:reason}); await loadTab("users"); setNotice("تم تحديث حالة الحساب."); }
    catch(e) { fail(e); } finally { setLoading(false); }
  };
  const adjustWallet = async (id:string) => {
    const currency = window.prompt("نوع الرصيد: coins أو diamonds","coins"); if (currency !== "coins" && currency !== "diamonds") return;
    const amount = Number(window.prompt("قيمة التعديل: استخدم رقمًا سالبًا للخصم","100")); if (!Number.isSafeInteger(amount) || amount === 0) return;
    const reason = window.prompt("سبب التعديل (إلزامي)","تعويض دعم فني"); if (!reason) return;
    setLoading(true);
    try { await callRpc("admin_adjust_wallet",{p_user_id:id,p_currency:currency,p_amount:amount,p_reason:reason}); setNotice("تم تعديل الرصيد وتسجيل الحركة في سجل المعاملات."); }
    catch(e) { fail(e); } finally { setLoading(false); }
  };
  const saveSetting = async (e:React.FormEvent) => {
    e.preventDefault();
    try { const parsed=JSON.parse(settingValue); await upsertRow("app_settings",{setting_key:settingKey,value:parsed,is_public:true,updated_by:session?.user.id},"setting_key"); setNotice("تم حفظ إعداد التطبيق."); await loadTab("settings"); }
    catch(e) { fail(e); }
  };
  const updateReport = async (id:string,status:string) => {
    try { await updateRows("user_reports",`id=eq.${id}`,{status}); await loadTab("reports"); setNotice("تم تحديث البلاغ."); } catch(e) { fail(e); }
  };

  if (!session || !isAllowed) return (
    <main dir="rtl" className="min-h-screen bg-[#08111f] px-4 py-12 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3"><div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300"><ShieldCheck /></div><div><h1 className="text-2xl font-black">لوحة إدارة صدى</h1><p className="text-sm text-slate-400">دخول محمي بصلاحيات المدير</p></div></div>
        <form onSubmit={login} className="space-y-4">
          <label className="block text-sm text-slate-300">البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400" /></label>
          <label className="block text-sm text-slate-300">كلمة المرور<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-cyan-400" /></label>
          {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-cyan-300 py-3 font-bold text-slate-950 disabled:opacity-50">{loading?"جارٍ التحقق…":"دخول لوحة الإدارة"}</button>
        </form>
        <p className="mt-5 text-xs leading-6 text-slate-500">يجب أولاً إضافة حسابك إلى جدول admin_roles من قاعدة البيانات. لا توجد كلمة مرور مدير افتراضية داخل التطبيق.</p>
      </div>
    </main>
  );

  return (
    <main dir="rtl" className="min-h-screen bg-[#07111f] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07111f]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-cyan-300/15 p-2 text-cyan-300"><ShieldCheck /></div><div><b className="block text-lg">صدى | مركز التحكم</b><span className="text-xs text-slate-400">إدارة التطبيق والأصول والمستخدمين</span></div></div>
          <div className="flex items-center gap-2"><span className="hidden text-xs text-slate-400 sm:inline">{session.user.email}</span><button onClick={()=>void loadTab(tab)} className="rounded-lg border border-white/10 p-2" title="تحديث"><RefreshCw size={17}/></button><button onClick={()=>void logout()} className="rounded-lg border border-white/10 p-2" title="خروج"><LogOut size={17}/></button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 lg:grid-cols-[230px_1fr] lg:px-8">
        <aside className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          {tabs.map(item=><button key={item.id} onClick={()=>{setTab(item.id);setSearch("");}} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition lg:w-full ${tab===item.id?"bg-cyan-300 text-slate-950":"text-slate-300 hover:bg-white/5"}`}><item.icon size={18}/>{item.label}</button>)}
        </aside>
        <section className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-black">{tabs.find(t=>t.id===tab)?.label}</h1><p className="mt-1 text-sm text-slate-400">تحكم مباشر في بيانات وخدمات صدى عبر Supabase.</p></div>{tab!=="overview" && <div className="relative"><Search className="absolute right-3 top-3 text-slate-500" size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث…" className="w-56 rounded-xl border border-white/10 bg-white/5 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-cyan-400"/></div>}</div>
          {error && <div className="mb-4 flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-200">{error}<button onClick={()=>setError("")}><X size={16}/></button></div>}
          {notice && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">{notice}</div>}
          {loading && <div className="mb-3 flex items-center gap-2 text-sm text-cyan-300"><Activity size={16}/> جارٍ تنفيذ العملية…</div>}
          {tab==="overview" && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{Object.entries({المستخدمون:stats.users,الغرف:stats.rooms,الهدايا:stats.gifts,الأصول:stats.assets,البلاغات:stats.reports}).map(([k,v])=><div key={k} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><span className="text-sm text-slate-400">{k}</span><b className="mt-3 block text-3xl">{money(v)}</b></div>)}<div className="col-span-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300">مكتبة الأصول هي نقطة التحكم المرئية: ارفع ملفًا، حدّد نوعه ومفتاحه الفريد، ثم اربطه بالعنصر المقابل في واجهة التطبيق. التغييرات تصبح متاحة عبر سجل app_assets وStorage.</div></div>}
          {tab==="assets" && <div className="space-y-5">
            <form onSubmit={saveAsset} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2 xl:grid-cols-5">
              <input required placeholder="مفتاح الأصل مثال: room.frame.gold" value={assetForm.asset_key} onChange={e=>setAssetForm({...assetForm,asset_key:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/>
              <input required placeholder="اسم الأصل" value={assetForm.title} onChange={e=>setAssetForm({...assetForm,title:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/>
              <select value={assetForm.category} onChange={e=>setAssetForm({...assetForm,category:e.target.value})} className="rounded-xl border border-white/10 bg-[#101c2b] px-3 py-3 text-sm">{categories.map(c=><option key={c} value={c}>{categoryNames[c]}</option>)}</select>
              <input type="number" placeholder="الترتيب" value={assetForm.sort_order} onChange={e=>setAssetForm({...assetForm,sort_order:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm"/>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-cyan-400/40 bg-cyan-300/5 px-3 py-3 text-sm text-cyan-200"><Upload size={17}/>{assetFile?assetFile.name:"اختر ملف الأصل"}<input type="file" accept="image/*,video/mp4,audio/*" className="hidden" onChange={e=>setAssetFile(e.target.files?.[0]??null)}/></label>
              <button disabled={loading} className="rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950 md:col-span-2 xl:col-span-5">رفع الأصل وحفظه</button>
            </form>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{filteredRows.map(a=><article key={a.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"><div className="flex h-36 items-center justify-center bg-black/20">{a.mime_type?.startsWith("image/")?<img src={publicAssetUrl(a.storage_path)} alt={a.title} className="h-full max-w-full object-contain"/>:<div className="text-slate-500"><Archive size={38}/></div>}</div><div className="space-y-2 p-4"><div className="flex items-center justify-between gap-2"><b>{a.title}</b><span className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">{categoryNames[a.category]||a.category}</span></div><code className="block break-all text-xs text-slate-400">{a.asset_key}</code><div className="flex items-center justify-between"><span className={a.is_active?"text-xs text-emerald-300":"text-xs text-slate-500"}>{a.is_active?"نشط":"موقوف"}</span><button onClick={()=>void toggleActive("app_assets",a.id,a.is_active)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs">{a.is_active?"إيقاف":"تفعيل"}</button></div></div></article>)}</div>
          </div>}
          {tab==="gifts" && <div className="space-y-4"><form onSubmit={saveGift} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-4"><input required placeholder="اسم الهدية" value={giftForm.name} onChange={e=>setGiftForm({...giftForm,name:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><input required placeholder="رابط الصورة" value={giftForm.image_url} onChange={e=>setGiftForm({...giftForm,image_url:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><input type="number" min="0" value={giftForm.price} onChange={e=>setGiftForm({...giftForm,price:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><select value={giftForm.currency} onChange={e=>setGiftForm({...giftForm,currency:e.target.value})} className="rounded-xl bg-[#101c2b] px-3 py-3"><option value="coins">عملات</option><option value="diamonds">ألماس</option></select><button className="rounded-xl bg-cyan-300 py-3 font-bold text-slate-950 md:col-span-4">إضافة هدية</button></form><div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full text-right text-sm"><thead className="bg-white/5 text-slate-400"><tr><th className="p-3">الهدية</th><th>السعر</th><th>العملة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{filteredRows.map(g=><tr key={g.id} className="border-t border-white/10"><td className="p-3">{g.name}</td><td>{money(g.price)}</td><td>{g.currency}</td><td>{g.is_active?"نشطة":"موقوفة"}</td><td><button onClick={()=>void toggleActive("gifts",g.id,g.is_active)} className="rounded-lg border border-white/10 px-3 py-1.5">{g.is_active?"إيقاف":"تفعيل"}</button></td></tr>)}</tbody></table></div></div>}
          {tab==="vip" && <div className="space-y-4"><form onSubmit={saveVip} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-4"><input required placeholder="اسم الباقة" value={vipForm.name} onChange={e=>setVipForm({...vipForm,name:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><input type="number" min="1" value={vipForm.duration_days} onChange={e=>setVipForm({...vipForm,duration_days:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><input type="number" min="0" value={vipForm.price} onChange={e=>setVipForm({...vipForm,price:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><select value={vipForm.currency} onChange={e=>setVipForm({...vipForm,currency:e.target.value})} className="rounded-xl bg-[#101c2b] px-3 py-3"><option value="diamonds">ألماس</option><option value="coins">عملات</option></select><button className="rounded-xl bg-cyan-300 py-3 font-bold text-slate-950 md:col-span-4">إضافة باقة VIP</button></form><div className="grid gap-3 md:grid-cols-2">{filteredRows.map(v=><div key={v.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex justify-between"><b>{v.name}</b><button onClick={()=>void toggleActive("vip_packages",v.id,v.is_active)} className="rounded-lg border border-white/10 px-3 py-1 text-xs">{v.is_active?"إيقاف":"تفعيل"}</button></div><p className="mt-2 text-sm text-slate-400">{v.duration_days} يوم · {money(v.price)} {v.currency}</p></div>)}</div></div>}
          {tab==="users" && <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[750px] text-right text-sm"><thead className="bg-white/5 text-slate-400"><tr><th className="p-3">المستخدم</th><th>المعرف</th><th>المستوى</th><th>الحالة</th><th>إدارة</th></tr></thead><tbody>{filteredRows.map(u=><tr key={u.id} className="border-t border-white/10"><td className="p-3"><b>{u.display_name||u.username||"مستخدم"}</b><small className="block text-slate-500">{u.username}</small></td><td><code className="text-xs">{u.id.slice(0,8)}…</code></td><td>{u.level||0}</td><td>{u.account_status||"active"}</td><td className="flex flex-wrap gap-2 py-3"><button onClick={()=>void adjustWallet(u.id)} className="rounded-lg border border-white/10 px-2 py-1"><Wallet size={15}/></button><button onClick={()=>void changeStatus(u.id,u.account_status==="banned"?"active":"banned")} className="rounded-lg border border-white/10 px-2 py-1" title="حظر أو إلغاء الحظر">{u.account_status==="banned"?<Check size={15}/>:<Ban size={15}/>}</button></td></tr>)}</tbody></table></div>}
          {tab==="reports" && <div className="space-y-3">{filteredRows.map(r=><article key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="flex flex-wrap justify-between gap-2"><b>{r.category} · {r.status}</b><span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleString("ar-EG")}</span></div><p className="mt-2 text-sm text-slate-300">{r.details||"بدون تفاصيل"}</p><div className="mt-3 flex gap-2"><button onClick={()=>void updateReport(r.id,"resolved")} className="rounded-lg bg-emerald-400/15 px-3 py-2 text-xs text-emerald-200">إغلاق البلاغ</button><button onClick={()=>void updateReport(r.id,"reviewing")} className="rounded-lg border border-white/10 px-3 py-2 text-xs">قيد المراجعة</button></div></article>)}</div>}
          {tab==="settings" && <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><h3 className="mb-3 font-bold">إضافة أو تعديل إعداد مرئي</h3><form onSubmit={saveSetting} className="space-y-3"><input value={settingKey} onChange={e=>setSettingKey(e.target.value)} placeholder="مفتاح الإعداد" className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-3"/><textarea rows={10} value={settingValue} onChange={e=>setSettingValue(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 font-mono text-xs" /><button className="w-full rounded-xl bg-cyan-300 py-3 font-bold text-slate-950">حفظ الإعداد JSON</button></form></div><div className="space-y-2">{filteredRows.map(s=><button key={s.setting_key} onClick={()=>{setSettingKey(s.setting_key);setSettingValue(JSON.stringify(s.value,null,2));}} className="block w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-right"><b>{s.setting_key}</b><code className="mt-1 block truncate text-xs text-slate-400">{JSON.stringify(s.value)}</code></button>)}</div></div>}
        </section>
      </div>
      <footer className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">صدى · إدارة محمية بواسطة Supabase RLS · جميع العمليات الإدارية قابلة للتدقيق</footer>
    </main>
  );
}
