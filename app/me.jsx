/* ============ Me tab + sub pages ============ */

function MeQuick({ icon, label, colors, onClick }) {
  return (
    <button className="press" onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 58, height: 58, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 4, borderRadius: 16, transform: 'rotate(45deg)', background: `linear-gradient(135deg,${colors[0]},${colors[1]})`, boxShadow: `0 4px 10px ${colors[1]}66, inset 0 0 0 2px rgba(255,255,255,.75)` }} />
        <div style={{ position: 'absolute', inset: 10, borderRadius: 12, transform: 'rotate(45deg)', border: '1.5px solid rgba(255,230,160,.9)' }} />
        <Ic n={icon} s={26} c="#fff" w={1.9} style={{ position: 'relative', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.25))' }} />
      </div>
      <span style={{ fontWeight: 600, color: '#0F2D6E', fontSize: 15 }}>{label}</span>
    </button>
  );
}

function MeRow({ icon, label, right, onClick }) {
  return (
    <button className="merow" onClick={onClick}>
      <span className="merow-ic"><Ic n={icon} s={18} c="#fff" w={2} /></span>
      <span style={{ flex: 1, textAlign: 'right', fontSize: 16, fontWeight: 500, color: '#0F2D6E' }}>{label}</span>
      {right}
      <Ic n="chev" s={18} c="#14326E" w={2.4} />
    </button>
  );
}

function MeView({ go }) {
  const { me, coins, diamonds, toast } = useApp();
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', padding: '28px 18px 0', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-start' }}>
        <Avatar name={me.name} hue={me.hue} size={96} onClick={() => go({ p: 'edit' })} style={{ boxShadow: '0 0 0 3px #fff, 0 6px 16px rgba(20,60,140,.3)', borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="me-name">{me.name}</div>
          <button onClick={() => toast('تم نسخ المعرف')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: '#14326E', fontFamily: 'var(--latin)', fontSize: 17, fontWeight: 500 }}><Ic n="copy" s={17} c="#14326E" />{me.id}</button>
        </div>
        <button className="iconbtn press" onClick={() => go({ p: 'edit' })} style={{ background: 'rgba(255,255,255,.6)' }}><Ic n="edit" s={18} c="#14326E" /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', margin: '22px 0 16px' }}>
        {[[me.following, 'المتابعة', 'following'], [me.fans, 'المعجبون', 'fans'], [me.charm, 'قيمة الجاذبية', 'charm']].map(([v, l, k], i) => (
          <button key={k} onClick={() => go({ p: 'follow', k })} style={{ textAlign: 'center', borderInlineStart: i ? '1px solid #BFD3EE' : 'none' }}>
            <div style={{ fontFamily: 'var(--latin)', fontWeight: 600, fontSize: 22, color: '#14326E' }}>{v}</div>
            <div style={{ color: '#7B8DB5', fontSize: 13, marginTop: 4 }}>{l}</div>
          </button>
        ))}
      </div>
      <div style={{ padding: '0 14px' }}>
        <button className="vipcard press" onClick={() => go({ p: 'vip' })}>
          <div className="vipcard-shine" />
          <div className="vipcard-corner tl" /><div className="vipcard-corner tr" /><div className="vipcard-corner bl" /><div className="vipcard-corner br" />
          <div style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)' }}>
            <div className="vip-medal"><Ic n="crown" s={34} c="#fff" w={1.5} /><span>VIP 1</span></div>
          </div>
          <div style={{ position: 'absolute', right: 22, top: 28, textAlign: 'right' }}>
            <div className="vip-word">VIP</div>
            <div style={{ color: '#CFE4FF', fontSize: 13, marginTop: 4 }}>افتح VIP للاستمتاع بالامتيازات المميزة</div>
          </div>
        </button>
        <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '18px 6px 14px', marginTop: 14 }}>
          <MeQuick icon="store" label="المتجر" colors={['#9AD0FF', '#2F6FD6']} onClick={() => go({ p: 'store' })} />
          <MeQuick icon="medal" label="الشارة" colors={['#B8DCFF', '#3E7FE0']} onClick={() => go({ p: 'badges' })} />
          <MeQuick icon="star" label="المستوى" colors={['#A8D4FF', '#1F5FC6']} onClick={() => go({ p: 'level' })} />
          <MeQuick icon="id" label="مميز ID" colors={['#FFE29A', '#3E7FE0']} onClick={() => go({ p: 'store', tab: 'id' })} />
        </div>
        <div className="glass-card" style={{ marginTop: 14, padding: '6px 0' }}>
          <MeRow icon="wallet" label="محفظة" onClick={() => go({ p: 'wallet' })} right={<span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--latin)', color: '#14326E', direction: 'ltr', marginInlineEnd: 4 }}><Coin s={18} />{fmt(coins)}<Diamond s={16} />{fmt(diamonds)}</span>} />
          <MeRow icon="host" label="مركز المضيفة" onClick={() => go({ p: 'host' })} />
          <MeRow icon="task" label="مهمة" onClick={() => go({ p: 'tasks' })} />
          <MeRow icon="gift" label="سجلات المكافآت والدعائم" onClick={() => go({ p: 'records' })} />
          <MeRow icon="chat" label="الاقتراحات" onClick={() => go({ p: 'feedback' })} />
          <MeRow icon="settings" label="الإعدادات" onClick={() => go({ p: 'settings' })} />
        </div>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

/* ---------- Wallet ---------- */
const PACKS = [[700, 0.99], [3600, 4.99], [7500, 9.99], [23000, 29.99], [78000, 99.99], [160000, 199.99]];
function WalletPage({ onBack }) {
  const { coins, diamonds, addCoins, toast, setDiamonds } = useApp();
  const [sel, setSel] = useState(1);
  const [tab, setTab] = useState('coins');
  const [method, setMethod] = useState('card');
  return (
    <div className="page">
      <PageHeader title="محفظة" onBack={onBack} right={<button className="iconbtn press" style={{ width: 'auto', fontSize: 13, color: '#3B82E6', fontWeight: 700 }}>السجل</button>} />
      <div className="page-body" style={{ padding: 14 }}>
        <div className="wallet-hero">
          <div style={{ display: 'flex', gap: 10 }}>
            {[['coins', 'العملات', coins, <Coin s={22} />], ['dia', 'الماس', diamonds, <Diamond s={22} />]].map(([id, n, v, ic]) => (
              <button key={id} onClick={() => setTab(id)} className={'wallet-tab' + (tab === id ? ' on' : '')}>
                <span style={{ fontSize: 13, opacity: .9 }}>{n}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--latin)', fontWeight: 800, fontSize: 24, direction: 'ltr' }}>{ic}{fmt(v)}</span>
              </button>
            ))}
          </div>
        </div>
        {tab === 'coins' ? <>
          <div className="sec-title">شحن العملات</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {PACKS.map(([c, p], i) => (
              <button key={i} onClick={() => setSel(i)} className={'pack press' + (sel === i ? ' on' : '')}>
                {i === 3 && <span className="pack-hot">+10%</span>}
                <Coin s={30} />
                <b style={{ fontFamily: 'var(--latin)', fontSize: 16, color: '#14326E' }}>{fmt(c)}</b>
                <span style={{ fontFamily: 'var(--latin)', fontSize: 13, color: '#7B8DB5' }}>US${p}</span>
              </button>
            ))}
          </div>
          <div className="sec-title">طريقة الدفع</div>
          <div className="card" style={{ padding: 4 }}>
            {[['card', 'بطاقة بنكية', 'wallet'], ['agent', 'وكيل شحن رسمي', 'shield'], ['store', 'متجر التطبيقات', 'store']].map(([id, n, ic]) => (
              <button key={id} onClick={() => setMethod(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 12px' }}>
                <Ic n={ic} s={20} c="#3B82E6" /><span style={{ flex: 1, textAlign: 'right', color: '#14326E', fontWeight: 600 }}>{n}</span>
                <span style={{ width: 20, height: 20, borderRadius: 10, border: method === id ? '6px solid #3B82E6' : '2px solid #C3D0E6' }} />
              </button>
            ))}
          </div>
          <button className="bigbtn press" onClick={() => { addCoins(PACKS[sel][0]); toast(`تم شحن ${fmt(PACKS[sel][0])} عملة`); }}>ادفع US${PACKS[sel][1]}</button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#9AA9C8' }}>تعامل فقط مع الوكلاء المعتمدين الذين يحملون شارة الوكيل الرسمية</p>
        </> : <>
          <div className="card" style={{ padding: 16, marginTop: 14 }}>
            <div style={{ color: '#14326E', fontWeight: 700 }}>تحويل الماس إلى عملات</div>
            <div style={{ color: '#7B8DB5', fontSize: 13, marginTop: 6, lineHeight: 1.8 }}>الماس يأتي من الهدايا التي تستلمها. يمكنك تحويل كل 10 ماسات إلى 7 عملات.</div>
            <button className="bigbtn press" disabled={diamonds < 10} style={{ opacity: diamonds < 10 ? .5 : 1 }} onClick={() => { const n = Math.floor(diamonds / 10); setDiamonds(diamonds - n * 10); addCoins(n * 7); toast('تم التحويل'); }}>تحويل الكل</button>
          </div>
        </>}
      </div>
    </div>
  );
}

/* ---------- VIP ---------- */
function VipPage({ onBack }) {
  const { me, toast } = useApp();
  const packages = window.SADA_DATA?.vipPackages || [];
  const [selectedId, setSelectedId] = useState(packages[0]?.id || '');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (!selectedId && packages.length) setSelectedId(packages[0].id); }, [selectedId, packages.length]);
  const selected = packages.find(p => p.id === selectedId);
  const perks = selected?.benefits && typeof selected.benefits === 'object' ? Object.entries(selected.benefits) : [];
  const purchase = async () => {
    if (!selected) return toast('لا توجد باقة VIP متاحة حالياً');
    setBusy(true);
    try {
      await window.SADA_API.rpc('purchase_vip', { p_package_id: selected.id });
      await window.SADA_API.refresh();
      toast('تم تفعيل باقة VIP بنجاح');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'تعذر تفعيل VIP');
    } finally { setBusy(false); }
  };
  const vipAsset = window.SADA_ASSETS?.url('vip.badge');
  return (
    <div className="page" style={{ background: 'linear-gradient(180deg,#081B45,#123A86 50%,#0B275E)' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', color: '#fff' }}>
        <button className="iconbtn press" onClick={onBack}><Ic n="back" s={22} c="#fff" w={2.2} /></button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18 }}>VIP</div><div style={{ width: 36 }} />
      </div>
      <div className="page-body" style={{ padding: '12px 14px 20px' }}>
        {packages.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: '#CFE2FF' }}>لا توجد باقات VIP منشورة حالياً. أضف الباقات من لوحة الإدارة.</div> : <>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }} className="noscroll">
            {packages.map(p => <button key={p.id} onClick={() => setSelectedId(p.id)} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 16, fontWeight: 800, color: selectedId === p.id ? '#0B275E' : '#9EC3FF', background: selectedId === p.id ? 'linear-gradient(180deg,#fff,#BFDFFF)' : 'rgba(255,255,255,.08)' }}>{p.name}</button>)}
          </div>
          {selected && <div style={{ marginTop: 12, borderRadius: 20, padding: 20, background: 'rgba(255,255,255,.08)', textAlign: 'center' }}>
            {vipAsset ? <img src={vipAsset} alt="VIP" style={{ width: 112, height: 112, objectFit: 'contain', margin: '0 auto' }} /> : <Ic n="crown" s={64} c="#FFD45A" />}
            <div style={{ color: '#fff', fontWeight: 900, fontSize: 25, marginTop: 8 }}>{selected.name}</div>
            <div style={{ color: '#CFE2FF', marginTop: 6 }}>{selected.duration_days} يوم</div>
            <div style={{ color: '#FFD45A', fontWeight: 900, fontSize: 24, marginTop: 10 }}>{fmt(selected.price)} {selected.currency === 'diamonds' ? 'ألماس' : 'عملة'}</div>
          </div>}
          <div style={{ color: '#CFE2FF', fontWeight: 700, margin: '18px 4px 10px' }}>امتيازات الباقة</div>
          {perks.length ? <div style={{ display: 'grid', gap: 8 }}>{perks.map(([key,value]) => <div key={key} style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,.08)', color: '#fff' }}>{String(value)}</div>)}</div> : <div style={{ color: '#9EC3FF', fontSize: 13 }}>سيتم عرض الامتيازات التي يحددها المدير هنا.</div>}
        </>}
      </div>
      <div style={{ padding: '12px 14px 26px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,.25)' }}>
        <div style={{ flex: 1, color: '#fff' }}><div style={{ fontSize: 12, color: '#9EC3FF' }}>رصيدك الحالي: {fmt(selected?.currency === 'diamonds' ? 0 : 0)}</div><div style={{ fontSize: 11, color: '#9EC3FF' }}>الشراء يخصم من محفظتك بأمان عبر قاعدة البيانات</div></div>
        <button disabled={!selected || busy} className="press" onClick={purchase} style={{ padding: '12px 30px', borderRadius: 24, fontWeight: 800, color: '#5A3600', background: 'linear-gradient(180deg,#FFE9A0,#F0B23A)', opacity: !selected || busy ? .5 : 1 }}>{busy ? 'جارٍ التفعيل…' : 'تفعيل VIP'}</button>
      </div>
    </div>
  );
}

/* ---------- Store ---------- */
const STORE = {
  frame: [['إطار الجليد', 'ice', 2000], ['إطار ذهبي', 'gold', 5000], ['إطار ملكي', 'violet', 8000], ['إطار الورد', 'rose', 3000]],
  car: [['زلاجة الجليد', 'car', 6000], ['صاروخ', 'rocket', 12000], ['قلعة متحركة', 'castle', 20000], ['تاج طائر', 'crown', 9000]],
  bubble: [['فقاعة ثلجية', 'chat', 1500], ['فقاعة ذهبية', 'star', 2500], ['فقاعة الماس', 'diamond', 4000]],
  id: [['888888', 'id', 50000], ['1010101', 'id', 30000], ['777000', 'id', 40000], ['2026', 'id', 90000]],
};
function StorePage({ onBack, initial = 'frame' }) {
  const { coins, setCoins, owned, setOwned, toast, me } = useApp();
  const [tab, setTab] = useState(initial);
  const tabs = [['frame', 'الإطارات'], ['car', 'السيارات'], ['bubble', 'الفقاعات'], ['id', 'مميز ID']];
  const buy = (key, price) => { if (owned.includes(key)) return toast('تملكه بالفعل'); if (coins < price) return toast('رصيد غير كافٍ'); setCoins(coins - price); setOwned([...owned, key]); toast('تم الشراء بنجاح'); };
  return (
    <div className="page">
      <PageHeader title="المتجر" onBack={onBack} right={<span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--latin)', fontWeight: 700, color: '#14326E', fontSize: 13 }}><Coin s={16} />{fmt(coins)}</span>} />
      <div style={{ display: 'flex', gap: 8, padding: '6px 14px 10px', overflowX: 'auto' }} className="noscroll">
        {tabs.map(([id, n]) => <Chip key={id} on={tab === id} onClick={() => setTab(id)}>{n}</Chip>)}
      </div>
      <div className="page-body" style={{ padding: '0 14px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
        {STORE[tab].map(([n, k, p]) => {
          const key = tab + n; const own = owned.includes(key);
          return (
            <div key={key} className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 96, width: '100%', borderRadius: 12, background: 'linear-gradient(160deg,#EAF4FF,#CFE3FB)', display: 'grid', placeItems: 'center' }}>
                {tab === 'frame' ? <Avatar name={me.name} hue={me.hue} size={64} frame={k} /> : tab === 'id' ? <span className="pretty-id">{n}</span> : <GiftArt g={{ ic: k, c: ['#E3F1FF', '#2F6FD6'] }} s={60} />}
              </div>
              <b style={{ color: '#14326E', fontSize: 14 }}>{tab === 'id' ? 'ID ' + n : n}</b>
              <button onClick={() => buy(key, p)} className="press" style={{ width: '100%', padding: '7px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, color: own ? '#3B82E6' : '#fff', background: own ? '#E3EFFF' : 'linear-gradient(180deg,#6AB4FF,#2F74E0)', fontFamily: 'var(--latin)' }}>{own ? 'مملوك' : <><Coin s={14} />{fmt(p)}</>}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Level ---------- */
function LevelPage({ onBack }) {
  const { me } = useApp();
  const levels = [['wealth', 'مستوى الثروة', me.lv, 62, 'أرسل هدايا لرفع مستوى الثروة'], ['charm', 'مستوى الجاذبية', 1, 8, 'استلم هدايا لرفع مستوى الجاذبية']];
  return (
    <div className="page">
      <PageHeader title="المستوى" onBack={onBack} />
      <div className="page-body" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {levels.map(([k, n, lv, pct, tip]) => (
          <div key={k} className="card" style={{ padding: 16 }}>
            <LevelPlate kind={k === 'wealth' ? 'wealth' : 'vip'} lv={lv} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, color: '#14326E', fontWeight: 700 }}><span>{n}</span><span style={{ fontFamily: 'var(--latin)' }}>{pct}%</span></div>
            <div style={{ height: 8, borderRadius: 4, background: '#E3EDFB', marginTop: 8, overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', borderRadius: 4, background: 'linear-gradient(90deg,#7CC4FF,#2F74E0)' }} /></div>
            <div style={{ color: '#7B8DB5', fontSize: 12, marginTop: 8 }}>{tip}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Badges ---------- */
function BadgesPage({ onBack }) {
  const names = ['بطل الأسبوع', 'ملك الغرفة', 'وسام الدعم', 'نجم الليل', 'ماسي', 'الوافد الجديد', 'محبوب الجماهير', 'صاحب الصوت'];
  return (
    <div className="page">
      <PageHeader title="الشارة" onBack={onBack} />
      <div className="page-body" style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, alignContent: 'start' }}>
        {names.map((n, i) => (
          <div key={i} className="card" style={{ padding: '16px 6px', textAlign: 'center', opacity: i === 5 ? 1 : .55 }}>
            <div style={{ display: 'grid', placeItems: 'center', filter: i === 5 ? 'none' : 'grayscale(.8)' }}><MiniBadge k={i} s={54} /></div>
            <div style={{ fontSize: 12, color: '#14326E', fontWeight: 700, marginTop: 8 }}>{n}</div>
            <div style={{ fontSize: 10, color: '#9AA9C8', marginTop: 2 }}>{i === 5 ? 'تم الحصول' : 'غير مفعّل'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Tasks ---------- */
const TASKS = [['تسجيل الدخول اليومي', 50, 'check'], ['ابقَ في غرفة 10 دقائق', 30, 'mic'], ['أرسل هدية واحدة', 20, 'gift'], ['تابع 3 أشخاص', 20, 'users'], ['أرسل 5 رسائل في غرفة', 15, 'chat'], ['شارك غرفة مع صديق', 25, 'share']];
function TasksPage({ onBack }) {
  const { claimed, claim } = useApp();
  return (
    <div className="page">
      <PageHeader title="مهمة" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        <div className="card" style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ color: '#14326E', fontWeight: 800 }}>تسجيل الحضور</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 12 }}>
            {[1, 2, 3, 4, 5, 6, 7].map(d => <div key={d} style={{ borderRadius: 10, padding: '8px 0', textAlign: 'center', background: d <= 3 ? 'linear-gradient(180deg,#7CC4FF,#2F74E0)' : '#EEF5FF', color: d <= 3 ? '#fff' : '#7B8DB5' }}><Coin s={16} /><div style={{ fontSize: 10, marginTop: 4 }}>يوم {d}</div></div>)}
          </div>
        </div>
        {TASKS.map(([n, c, ic], i) => {
          const key = 'task' + i; const done = claimed.includes(key);
          return (
            <div key={i} className="listrow" style={{ background: '#fff', borderRadius: 14, padding: 12, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E3EFFF', display: 'grid', placeItems: 'center' }}><Ic n={ic} s={20} c="#2F74E0" /></div>
              <div style={{ flex: 1 }}><div style={{ color: '#14326E', fontWeight: 700, fontSize: 14 }}>{n}</div><div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C8860F', fontSize: 12, fontFamily: 'var(--latin)', marginTop: 3 }}><Coin s={12} />+{c}</div></div>
              <button disabled={done} onClick={() => claim(key, c)} className="press" style={{ padding: '7px 16px', borderRadius: 16, fontWeight: 700, fontSize: 13, color: '#fff', background: done ? '#C3D0E6' : 'linear-gradient(180deg,#FFC84A,#F09A12)' }}>{done ? 'تم' : 'استلام'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Host center ---------- */
function HostPage({ onBack }) {
  const { toast } = useApp();
  return (
    <div className="page">
      <PageHeader title="مركز المضيفة" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        <div className="wallet-hero" style={{ color: '#fff' }}>
          <div style={{ fontSize: 13, opacity: .9 }}>دخل هذا الشهر</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--latin)', fontWeight: 900, fontSize: 32, direction: 'ltr', justifyContent: 'flex-end' }}><Diamond s={26} />0</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginTop: 12, textAlign: 'center' }}>
            {[['0 د', 'ساعات البث'], ['0', 'أيام صالحة'], ['0', 'الهدايا']].map(([v, l], i) => <div key={i}><div style={{ fontFamily: 'var(--latin)', fontWeight: 800, fontSize: 18 }}>{v}</div><div style={{ fontSize: 11, opacity: .85 }}>{l}</div></div>)}
          </div>
        </div>
        <div className="sec-title">الانضمام إلى وكالة</div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ color: '#6E7FA6', fontSize: 13, lineHeight: 1.9 }}>انضم إلى وكالة رسمية لتحصل على راتب شهري ومكافآت حسب ساعات البث والهدايا المستلمة.</div>
          <div className="searchbox" style={{ marginTop: 12, background: '#F2F7FF' }}><Ic n="search" s={18} c="#8A96AE" /><input placeholder="أدخل معرف الوكالة" /></div>
          <button className="bigbtn press" onClick={() => toast('تم إرسال الطلب إلى الوكالة')}>إرسال طلب</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Records ---------- */
function RecordsPage({ onBack }) {
  const { log } = useApp();
  return (
    <div className="page">
      <PageHeader title="سجلات المكافآت والدعائم" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        {log.length === 0 ? <Empty text="لا توجد سجلات" big /> : log.slice().reverse().map((l, i) => (
          <div key={i} className="listrow" style={{ background: '#fff', borderRadius: 14, padding: 12, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: l.v > 0 ? '#E6F8EF' : '#FFF0F2', display: 'grid', placeItems: 'center' }}><Ic n={l.v > 0 ? 'plus' : 'gift'} s={18} c={l.v > 0 ? '#22A06B' : '#E2466B'} /></div>
            <div style={{ flex: 1 }}><div style={{ color: '#14326E', fontWeight: 700, fontSize: 14 }}>{l.t}</div><div style={{ color: '#9AA9C8', fontSize: 11, marginTop: 2 }}>{l.time}</div></div>
            <b style={{ fontFamily: 'var(--latin)', color: l.v > 0 ? '#22A06B' : '#E2466B', direction: 'ltr' }}>{l.v > 0 ? '+' : ''}{fmt(l.v)}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Feedback ---------- */
function FeedbackPage({ onBack }) {
  const { toast } = useApp();
  const [type, setType] = useState('اقتراح');
  const [t, setT] = useState('');
  return (
    <div className="page">
      <PageHeader title="الاقتراحات" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{['اقتراح', 'مشكلة تقنية', 'شكوى', 'شحن'].map(x => <Chip key={x} on={type === x} onClick={() => setType(x)}>{x}</Chip>)}</div>
        <textarea value={t} onChange={e => setT(e.target.value)} placeholder="اكتب ملاحظتك هنا..." className="card" style={{ width: '100%', height: 160, marginTop: 14, padding: 14, border: 'none', resize: 'none', fontFamily: 'inherit', fontSize: 15, color: '#14326E', outline: 'none' }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 80, height: 80, borderRadius: 12, border: '1.5px dashed #9EC3F0', display: 'grid', placeItems: 'center' }}><Ic n="camera" s={24} c="#9EC3F0" /></div>)}</div>
        <button className="bigbtn press" disabled={!t.trim()} style={{ opacity: t.trim() ? 1 : .5 }} onClick={() => { setT(''); toast('شكراً لك، تم الإرسال'); }}>إرسال</button>
      </div>
    </div>
  );
}

/* ---------- Settings ---------- */
function SettingsPage({ onBack, go }) {
  const { toast } = useApp();
  const [sw, setSw] = useState({ notif: true, sound: true, invisible: false, dm: true });
  const Row = ({ label, k, onClick, val }) => (
    <button className="setrow" onClick={k ? () => setSw({ ...sw, [k]: !sw[k] }) : onClick}>
      <span style={{ flex: 1, textAlign: 'right' }}>{label}</span>
      {val && <span style={{ color: '#9AA9C8', fontSize: 13 }}>{val}</span>}
      {k ? <span className={'switch' + (sw[k] ? ' on' : '')}><i /></span> : <Ic n="chev" s={16} c="#9AA9C8" w={2.2} />}
    </button>
  );
  return (
    <div className="page">
      <PageHeader title="الإعدادات" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        <div className="card setgroup"><Row label="تعديل الملف الشخصي" onClick={() => go({ p: 'edit' })} /><Row label="أمان الحساب" onClick={() => toast('ربط الهاتف مفعّل')} /><Row label="قائمة الحظر" val="0" onClick={() => { }} /></div>
        <div className="card setgroup"><Row label="الإشعارات" k="notif" /><Row label="أصوات الغرف" k="sound" /><Row label="السماح بالرسائل من الجميع" k="dm" /><Row label="الدخول الخفي (VIP)" k="invisible" /></div>
        <div className="card setgroup"><Row label="اللغة" val="العربية" onClick={() => { }} /><Row label="مسح ذاكرة التخزين" val="38.2MB" onClick={() => toast('تم المسح')} /><Row label="خدمة العملاء" onClick={() => { }} /><Row label="حول التطبيق" val="v3.6.0" onClick={() => { }} /></div>
        <button className="bigbtn press" style={{ background: '#fff', color: '#E2466B', boxShadow: 'none' }} onClick={() => toast('تم تسجيل الخروج (تجريبي)')}>تسجيل الخروج</button>
      </div>
    </div>
  );
}

/* ---------- Edit profile ---------- */
function EditPage({ onBack }) {
  const { me, setMe, toast } = useApp();
  const [f, setF] = useState(me);
  return (
    <div className="page">
      <PageHeader title="تعديل الملف الشخصي" onBack={onBack} right={<button className="press" style={{ color: '#3B82E6', fontWeight: 800 }} onClick={() => { setMe(f); toast('تم الحفظ'); onBack(); }}>حفظ</button>} />
      <div className="page-body" style={{ padding: 14 }}>
        <div style={{ display: 'grid', placeItems: 'center', padding: '10px 0 20px' }}>
          <div style={{ position: 'relative' }}><Avatar name={f.name} hue={f.hue} size={96} /><span style={{ position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderRadius: 15, background: '#3B82E6', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}><Ic n="camera" s={15} c="#fff" /></span></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>{[212, 340, 30, 160, 270].map(h => <button key={h} onClick={() => setF({ ...f, hue: h })} style={{ width: 26, height: 26, borderRadius: 13, background: `hsl(${h} 70% 55%)`, boxShadow: f.hue === h ? '0 0 0 2px #fff, 0 0 0 4px #3B82E6' : 'none' }} />)}</div>
        </div>
        <div className="card setgroup">
          <label className="setrow"><span>الاسم</span><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="setinput" /></label>
          <label className="setrow"><span>النبذة</span><input value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} className="setinput" /></label>
          <label className="setrow"><span>الجنس</span><span style={{ display: 'flex', gap: 6, marginInlineStart: 'auto' }}>{[['m', 'ذكر'], ['f', 'أنثى']].map(([g, n]) => <Chip key={g} on={f.g === g} onClick={() => setF({ ...f, g })}>{n}</Chip>)}</span></label>
          <label className="setrow"><span>الدولة</span><select value={f.flag} onChange={e => setF({ ...f, flag: e.target.value })} className="setinput">{Object.entries(FLAGS).map(([k, v]) => <option key={k} value={k}>{v.n}</option>)}</select></label>
        </div>
      </div>
    </div>
  );
}

/* ---------- Followers list ---------- */
function FollowPage({ k, onBack, onUser }) {
  const { following } = useApp();
  const title = { following: 'المتابعة', fans: 'المعجبون', charm: 'قيمة الجاذبية' }[k];
  const list = k === 'following' ? following.map(userById) : k === 'fans' ? [USERS[1]] : [];
  return (
    <div className="page">
      <PageHeader title={title} onBack={onBack} />
      <div className="page-body" style={{ padding: '6px 14px' }}>
        {list.length ? list.map(u => <div key={u.id} className="listrow" onClick={() => onUser(u.id)}><Avatar name={u.name} hue={u.hue} size={52} frame={u.frame} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: '#0F2D6E' }}>{u.name}</div><div style={{ display: 'flex', gap: 4, marginTop: 4 }}><LvTag lv={u.lv} /><VipTag lv={u.vip} /></div></div></div>)
          : <Empty text="لا توجد بيانات" big />}
      </div>
    </div>
  );
}

Object.assign(window, { MeView, WalletPage, VipPage, StorePage, LevelPage, BadgesPage, TasksPage, HostPage, RecordsPage, FeedbackPage, SettingsPage, EditPage, FollowPage });
