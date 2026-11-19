/* ============ Party tab: ملكي / حفلات / فعالية ============ */

const BANNERS = [
  { id: 'b1', kicker: 'FROST CHAT', title: 'مكافأة الشحن', sub: 'اشحن الآن واحصل على 20% إضافية', hue: 222, gold: true, icon: 'gift', date: '2026-11-16 ~ 2026-12-30' },
  { id: 'b2', kicker: 'تنبيه رسمي', title: 'قوانين الغرف', sub: 'يُمنع استخدام أسماء أو صور مخالفة للآداب العامة', hue: 214, icon: 'shield', date: '2026-11-13 ~ 2026-12-30', steps: ['تحذير شفهي', 'حظر 3 أيام', 'حظر نهائي'] },
  { id: 'b3', kicker: 'إعلان الإدارة', title: 'أسعار الشحن الرسمية', sub: 'تعامل فقط مع الوكلاء المعتمدين', hue: 205, icon: 'coins', date: '2026-11-07 ~ 2026-12-30', prices: [['مصر', '100 ج', '80K'], ['الجزائر', '1000 د', '180K'], ['المغرب', '9 د', '49K']] },
  { id: 'b4', kicker: 'تنبيه مهم', title: 'تحقّق من وكيل الشحن', sub: 'ابحث عن شارة الوكيل وإطار الصورة الرسمي قبل الدفع', hue: 228, icon: 'check', date: '2026-11-04 ~ 2027-12-30' },
  { id: 'b5', kicker: 'احتفال', title: 'ليلة الجليد الكبرى', sub: 'هدايا مضاعفة لكل الغرف يوم الجمعة', hue: 200, gold: true, icon: 'castle', date: '2026-11-20 ~ 2026-11-22' },
];

function Banner({ b, h = 120, radius = 16 }) {
  return (
    <div className="banner" style={{ height: h, borderRadius: radius, '--bh': b.hue }}>
      <div className="banner-glow" />
      <div className="banner-snow" />
      <div className="banner-frame" style={{ borderRadius: radius - 5 }} />
      <div style={{ position: 'absolute', insetInlineStart: 16, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, maxWidth: '64%' }}>
        <span className="banner-kicker">{b.kicker}</span>
        <div className={'banner-title' + (b.gold ? ' gold' : '')}>{b.title}</div>
        <div className="banner-sub">{b.sub}</div>
        {b.steps && h > 110 && <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>{b.steps.map((s, i) => <span key={i} className="banner-step">{s}</span>)}</div>}
      </div>
      <div className="banner-emblem">
        <div className="banner-emblem-in"><Ic n={b.icon === 'coins' ? 'diamond' : b.icon} s={h * .3} c="#fff" w={1.7} /></div>
      </div>
    </div>
  );
}

function BannerCarousel({ h = 120 }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % BANNERS.length), 3800); return () => clearInterval(t); }, []);
  return (
    <div style={{ position: 'relative', margin: '0 14px', borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 18px rgba(30,80,170,.22)' }}>
      <div ref={ref} style={{ display: 'flex', transform: `translateX(${i * 100}%)`, transition: 'transform .6s cubic-bezier(.6,.1,.2,1)' }}>
        {BANNERS.map(b => <div key={b.id} style={{ flex: '0 0 100%' }}><Banner b={b} h={h} radius={16} /></div>)}
      </div>
      <div style={{ position: 'absolute', bottom: 7, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
        {BANNERS.map((b, k) => <i key={b.id} onClick={() => setI(k)} style={{ width: k === i ? 14 : 5, height: 5, borderRadius: 3, background: k === i ? '#fff' : 'rgba(255,255,255,.5)', transition: 'width .3s', cursor: 'pointer' }} />)}
      </div>
    </div>
  );
}

/* --- Ranking side cards --- */
function RankCard({ label, icon, tone, user, onClick }) {
  const tones = {
    gold: ['#FFF8E6', '#F3DFA9', '#C99A3B'],
    ice: ['#F2F7FF', '#D3E3FA', '#8DB0E6'],
    violet: ['#F7F0FF', '#E2D2FA', '#B597E6'],
  }[tone];
  return (
    <button className="rank press" onClick={onClick} style={{ background: `linear-gradient(110deg, ${tones[1]}, ${tones[0]} 55%, ${tones[1]})`, boxShadow: `inset 0 0 0 2px ${tones[2]}88, 0 4px 12px rgba(40,80,160,.15)` }}>
      <span className="rank-frost" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#24407E', fontWeight: 700, fontSize: 14 }}>
        <Ic n={icon} s={13} c={tones[2]} fill={tones[2]} w={1} />{label}
      </div>
      <Avatar name={user.name} hue={user.hue} size={50} frame={tone === 'gold' ? 'gold' : tone === 'violet' ? 'violet' : 'ice'} />
    </button>
  );
}

function FeaturedCard({ onClick }) {
  return (
    <button className="featured press" onClick={onClick}>
      <div className="featured-in">
        <div className="featured-shine" />
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center' }}>
          <Ic n="crown" s={30} c="#F7CB5A" fill="#F7CB5A" w={1} style={{ margin: '0 auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.5))' }} />
        </div>
        <div style={{ position: 'absolute', top: 46, left: 0, right: 0, display: 'grid', placeItems: 'center' }}>
          <Avatar name="كايان" hue={222} size={70} frame="gold" />
        </div>
        <div style={{ position: 'absolute', bottom: 44, left: 8, right: 8, textAlign: 'center' }}>
          <div className="featured-title">SUPER ADMIN</div>
          <div className="featured-name">كايان</div>
          <div style={{ color: '#FFE6A6', fontSize: 11, marginTop: 4, fontWeight: 600 }}>نستقبل الوكالات الجديدة</div>
          <div style={{ marginTop: 6, display: 'inline-flex', background: 'rgba(0,0,0,.4)', border: '1px solid #E9B850', borderRadius: 8, padding: '3px 8px', color: '#FFE08A', fontFamily: 'var(--latin)', fontWeight: 800, fontSize: 12, direction: 'ltr' }}>ID 2002931</div>
        </div>
        <div className="featured-rank">1</div>
      </div>
    </button>
  );
}

/* --- Room list card --- */
function RoomCard({ r, onOpen }) {
  const owner = userById(r.owner);
  return (
    <button className="roomcard press" onClick={() => onOpen(r)}>
      <Cover title={r.name} hue={r.hue} size={110} radius={14} glyph={r.glyph} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, paddingTop: 4, height: 110 }}>
        <div className="roomcard-title">{r.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Flag c={r.flag} /><VipTag lv={r.vip} /></div>
        {r.badges > 0 && <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: r.badges }).map((_, k) => <MiniBadge key={k} k={k} />)}</div>}
        <div style={{ marginTop: 'auto', marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#1E3E7E', fontWeight: 700, fontFamily: 'var(--latin)', fontSize: 15, direction: 'ltr' }}>
          {r.count}<span className="eq"><i /><i /><i /></span>
        </div>
      </div>
    </button>
  );
}
function MiniBadge({ k = 0, s = 30 }) {
  const sets = [['#FFD6D6', '#D3343F', 'trophy'], ['#E2ECFF', '#3B6FD6', 'crown'], ['#F3E1FF', '#8D3FD1', 'medal'], ['#FFF1C7', '#C88A12', 'star'], ['#DDF6FF', '#1B8FCF', 'diamond']];
  const [a, b, ic] = sets[k % sets.length];
  return (
    <span style={{ width: s, height: s, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `radial-gradient(circle at 35% 30%, #fff, ${a} 45%, ${b})`, boxShadow: `0 0 0 1.5px #F6D27A, 0 2px 4px ${b}55` }}>
      <Ic n={ic} s={s * .5} c="#fff" w={2} />
    </span>
  );
}

/* --- حفلات --- */
function PartiesView({ onOpenRoom, onOpenRank }) {
  const [region, setRegion] = useState('hot');
  const [expanded, setExpanded] = useState(false);
  const regions = [{ id: 'hot', n: 'شائع' }, { id: 'eg', n: 'مصر' }, { id: 'ae', n: 'الإمارات' }, { id: 'jo', n: 'الأردن' }, { id: 'sa', n: 'السعودية' }, { id: 'iq', n: 'العراق' }, { id: 'ma', n: 'المغرب' }, { id: 'dz', n: 'الجزائر' }, { id: 'sy', n: 'سوريا' }];
  const list = region === 'hot' ? [...ROOMS].sort((a, b) => b.count - a.count) : ROOMS.filter(r => r.flag === region);
  return (
    <div>
      <BannerCarousel h={122} />
      <div style={{ display: 'flex', gap: 10, padding: '14px 14px 4px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <RankCard label="ثروة" icon="crown" tone="gold" user={USERS[2]} onClick={() => onOpenRank('wealth')} />
          <RankCard label="غرفة" icon="castle" tone="ice" user={USERS[10]} onClick={() => onOpenRank('room')} />
          <RankCard label="الكاريزما" icon="heart" tone="violet" user={USERS[3]} onClick={() => onOpenRank('charm')} />
        </div>
        <FeaturedCard onClick={() => onOpenRank('wealth')} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 6px', flexWrap: expanded ? 'wrap' : 'nowrap', overflow: 'hidden' }}>
        {regions.slice(0, expanded ? regions.length : 4).map(r => <Chip key={r.id} on={region === r.id} onClick={() => setRegion(r.id)}>{r.n}</Chip>)}
        <button className="press" onClick={() => setExpanded(!expanded)} style={{ marginInlineStart: 'auto', width: 30, height: 30, borderRadius: 15, background: 'linear-gradient(180deg,#8ECBFF,#3B82E6)', display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.7), 0 2px 6px rgba(40,100,200,.3)', flexShrink: 0 }}>
          <Ic n="down" s={16} c="#fff" w={2.6} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '.2s' }} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '6px 14px 20px' }}>
        {list.length ? list.map(r => <RoomCard key={r.id} r={r} onOpen={onOpenRoom} />)
          : <Empty text="لا توجد غرف في هذه المنطقة حالياً" />}
      </div>
    </div>
  );
}

/* --- ملكي --- */
function MineView({ onOpenRoom }) {
  const { me, followedRooms, recentRooms } = useApp();
  const [sub, setSub] = useState('recent');
  const myRoom = { ...MY_ROOM, name: me.name };
  const lists = {
    recent: recentRooms.map(roomById).filter(Boolean),
    follow: followedRooms.map(roomById).filter(Boolean),
    member: ROOMS.slice(4, 5),
  };
  const list = lists[sub];
  return (
    <div style={{ padding: '4px 14px 20px' }}>
      <MyRoomCard r={myRoom} me={me} onOpen={onOpenRoom} />
      <div style={{ display: 'flex', gap: 8, padding: '16px 0 12px' }}>
        <Chip on={sub === 'recent'} onClick={() => setSub('recent')}>مؤخرا</Chip>
        <Chip on={sub === 'follow'} onClick={() => setSub('follow')}>المتابعة</Chip>
        <Chip on={sub === 'member'} onClick={() => setSub('member')}>غرفة الأعضاء</Chip>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length ? list.map(r => r.mine ? <MyRoomCard key="mine" r={myRoom} me={me} onOpen={onOpenRoom} /> : <RoomCard key={r.id} r={r} onOpen={onOpenRoom} />)
          : <Empty text={sub === 'follow' ? 'لم تتابع أي غرفة بعد' : 'لا توجد غرف'} />}
      </div>
    </div>
  );
}
function MyRoomCard({ r, me, onOpen }) {
  return (
    <button className="roomcard press" onClick={() => onOpen(r)}>
      <Avatar name={me.name} hue={me.hue} size={110} square radius={14} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, paddingTop: 6, height: 110 }}>
        <div className="roomcard-title latin">{me.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Flag c={me.flag} /><span style={{ color: '#7B8DB5', fontFamily: 'var(--latin)', fontSize: 13, direction: 'ltr' }}>ID:{me.id}</span></div>
        <div style={{ marginTop: 'auto', marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#1E3E7E', fontWeight: 700, fontFamily: 'var(--latin)', fontSize: 15, direction: 'ltr' }}>0<span className="eq idle"><i /><i /><i /></span></div>
      </div>
    </button>
  );
}

/* --- فعالية --- */
function EventsView({ onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 14px 20px' }}>
      {BANNERS.map(b => (
        <button key={b.id} className="eventcard press" onClick={() => onOpen(b)}>
          <Banner b={b} h={124} radius={0} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', color: '#5E6E92', fontSize: 13 }}>
            <span style={{ fontFamily: 'var(--latin)', direction: 'ltr' }}>{b.date.replace('~', ' 23:00 ~ ')} 23:00</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#8292B5' }}>رأية<Ic n="chev" s={14} /></span>
          </div>
        </button>
      ))}
    </div>
  );
}

function EventDetail({ b, onBack }) {
  return (
    <div className="page">
      <PageHeader title="تفاصيل الفعالية" onBack={onBack} />
      <div className="page-body" style={{ padding: 14 }}>
        <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 6px 18px rgba(30,80,170,.2)' }}><Banner b={b} h={170} radius={16} /></div>
        <div className="card" style={{ marginTop: 14, padding: 16 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#0F2D6E' }}>{b.title}</div>
          <div style={{ color: '#7B8DB5', fontSize: 12, fontFamily: 'var(--latin)', marginTop: 4, direction: 'ltr', textAlign: 'right' }}>{b.date}</div>
          <p style={{ color: '#3B4E78', lineHeight: 1.9, fontSize: 14, margin: '12px 0 0' }}>{b.sub}. يرجى الالتزام بالتعليمات الرسمية الصادرة عن إدارة التطبيق، وفي حال وجود أي استفسار يمكنكم التواصل مع خدمة العملاء من صفحة الإعدادات.</p>
          {b.steps && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 14 }}>
            {b.steps.map((s, i) => <div key={i} style={{ background: '#EEF5FF', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}><div style={{ color: '#3B82E6', fontWeight: 800, fontSize: 12 }}>المخالفة {['الأولى', 'الثانية', 'الثالثة'][i]}</div><div style={{ color: '#0F2D6E', fontWeight: 700, fontSize: 13, marginTop: 4 }}>{s}</div></div>)}
          </div>}
          {b.prices && <div style={{ marginTop: 14, borderRadius: 12, overflow: 'hidden', border: '1px solid #DCE9FB' }}>
            {b.prices.map((p, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: i % 2 ? '#F6FAFF' : '#fff', fontSize: 14, color: '#22386A' }}><span>{p[0]}</span><span style={{ fontFamily: 'var(--latin)' }}>{p[1]}</span><span style={{ display: 'flex', gap: 4, alignItems: 'center', fontFamily: 'var(--latin)' }}><Coin s={14} />{p[2]}</span></div>)}
          </div>}
        </div>
      </div>
    </div>
  );
}

/* --- Rankings page --- */
function RankingPage({ kind = 'wealth', onBack, onUser }) {
  const [k, setK] = useState(kind);
  const [period, setPeriod] = useState('day');
  const sorted = useMemo(() => {
    const arr = [...USERS];
    const seed = { wealth: 1, room: 2, charm: 3 }[k] + { day: 0, week: 5, month: 9 }[period];
    return arr.sort((a, b) => ((b.lv * 37 + seed * b.hue) % 997) - ((a.lv * 37 + seed * a.hue) % 997));
  }, [k, period]);
  const top = sorted.slice(0, 3); const rest = sorted.slice(3);
  const label = { wealth: 'ثروة', room: 'غرفة', charm: 'الكاريزما' };
  return (
    <div className="page" style={{ background: 'linear-gradient(180deg,#0E2F73,#2A6BD0 38%,#EAF3FF 38.1%)' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px' }}>
        <button className="press iconbtn" onClick={onBack}><Ic n="back" s={22} c="#fff" w={2.2} /></button>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {Object.keys(label).map(id => <button key={id} onClick={() => setK(id)} style={{ padding: '6px 14px', borderRadius: 16, fontWeight: 700, fontSize: 14, color: k === id ? '#0E2F73' : '#CFE2FF', background: k === id ? 'linear-gradient(180deg,#fff,#CFE6FF)' : 'transparent' }}>{label[id]}</button>)}
        </div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 6 }}>
        {[['day', 'يومي'], ['week', 'أسبوعي'], ['month', 'شهري']].map(([id, n]) => <button key={id} onClick={() => setPeriod(id)} style={{ color: period === id ? '#FFE08A' : '#A9C6F5', fontWeight: 700, fontSize: 13, borderBottom: period === id ? '2px solid #FFE08A' : '2px solid transparent', paddingBottom: 3 }}>{n}</button>)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, padding: '18px 14px 0', height: 210 }}>
        {[top[1], top[0], top[2]].map((u, idx) => {
          const place = [2, 1, 3][idx]; const hgt = { 1: 104, 2: 78, 3: 64 }[place];
          return (
            <div key={u.id} onClick={() => onUser(u.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
              {place === 1 && <Ic n="crown" s={26} c="#FFD45A" fill="#FFD45A" w={1} style={{ marginBottom: -4 }} />}
              <Avatar name={u.name} hue={u.hue} size={place === 1 ? 70 : 56} frame={place === 1 ? 'gold' : place === 2 ? 'ice' : 'rose'} />
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginTop: 6 }}>{u.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FFE08A', fontSize: 11, fontFamily: 'var(--latin)', fontWeight: 700 }}><Coin s={12} />{u.charm}</div>
              <div style={{ width: '100%', height: hgt, marginTop: 6, borderRadius: '12px 12px 0 0', background: 'linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.15))', border: '1px solid rgba(255,255,255,.6)', borderBottom: 'none', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--latin)', fontWeight: 900, fontSize: 30, textShadow: '0 2px 6px rgba(0,40,120,.4)' }}>{place}</div>
            </div>
          );
        })}
      </div>
      <div className="page-body" style={{ background: '#EAF3FF', borderRadius: '20px 20px 0 0', padding: '10px 14px 20px' }}>
        {rest.map((u, i) => (
          <div key={u.id} className="listrow" onClick={() => onUser(u.id)}>
            <span style={{ width: 22, textAlign: 'center', color: '#7B8DB5', fontFamily: 'var(--latin)', fontWeight: 800 }}>{i + 4}</span>
            <Avatar name={u.name} hue={u.hue} size={44} frame={u.frame} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#0F2D6E', display: 'flex', alignItems: 'center', gap: 6 }}>{u.name}<Flag c={u.flag} w={18} /></div>
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}><LvTag lv={u.lv} /><VipTag lv={u.vip} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#C8860F', fontFamily: 'var(--latin)', fontWeight: 800 }}><Coin s={14} />{u.charm}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ text, big }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: big ? '80px 0' : '40px 0', color: '#8A9BC0', fontSize: 14 }}>
      <div className="empty-art"><Ic n="snow" s={40} c="#7DB6F5" w={1.4} /></div>
      {text}
    </div>
  );
}

Object.assign(window, { PartiesView, MineView, EventsView, EventDetail, RankingPage, Banner, BANNERS, RoomCard, MiniBadge, Empty });
