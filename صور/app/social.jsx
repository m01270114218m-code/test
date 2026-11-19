/* ============ Messages / Friends / Chat / Profile ============ */

function MsgCategory({ icon, label, n, tone, onClick }) {
  return (
    <button className="press" onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative' }}>
        <div className="orb"><div className="orb-in" style={{ background: tone }}><Ic n={icon} s={30} c="#fff" w={1.8} /></div></div>
        {n > 0 && <span className="badge" style={{ position: 'absolute', top: 0, right: 0 }}>{n}</span>}
      </div>
      <span style={{ fontWeight: 700, color: '#0F2D6E', fontSize: 15 }}>{label}</span>
    </button>
  );
}

function MessagesView({ onOpenCat, onOpenChat }) {
  const { notif, threads } = useApp();
  const list = Object.keys(threads).map(Number).filter(id => threads[id].length);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 18px 20px' }}>
        <MsgCategory icon="speaker" label="إشعار" n={notif.notice} tone="radial-gradient(circle at 35% 30%,#FFF1C8,#F3B53A 55%,#B97A0C)" onClick={() => onOpenCat('notice')} />
        <MsgCategory icon="bell" label="رسمي" n={notif.official} tone="radial-gradient(circle at 35% 30%,#FFF1C8,#EDAA2B 55%,#A86C06)" onClick={() => onOpenCat('official')} />
        <MsgCategory icon="gift" label="مكافأة" n={notif.reward} tone="radial-gradient(circle at 35% 30%,#FFE9B5,#E7A12C 50%,#3C7EE0)" onClick={() => onOpenCat('reward')} />
      </div>
      {list.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 60, gap: 12 }}>
          <div className="mascot-box"><Ic n="chat" s={44} c="#5FA5F2" w={1.4} /></div>
          <span style={{ color: '#8A9BC0', fontSize: 14 }}>لا توجد رسالة</span>
        </div>
      ) : (
        <div style={{ padding: '0 14px' }}>
          {list.map(id => {
            const u = userById(id); const last = threads[id][threads[id].length - 1];
            return (
              <div key={id} className="listrow" onClick={() => onOpenChat(id)}>
                <Avatar name={u.name} hue={u.hue} size={52} frame={u.frame} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 700, color: '#0F2D6E', fontSize: 16 }}>{u.name}</span><span style={{ color: '#9AA9C8', fontSize: 11, fontFamily: 'var(--latin)' }}>{last.t}</span></div>
                  <div style={{ color: '#7B8DB5', fontSize: 13, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{last.gift ? '[هدية] ' + last.gift : last.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FriendsView({ onUser, onChat }) {
  const { friends } = useApp();
  const [q, setQ] = useState('');
  const pool = q.trim() ? USERS.filter(u => u.name.includes(q.trim()) || String(u.id).includes(q.trim())) : friends.map(userById);
  return (
    <div style={{ padding: '0 14px' }}>
      <div className="searchbox">
        <Ic n="search" s={22} c="#8A96AE" w={2.4} />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث عن اسم المستخدم أو المعرف" />
        {q && <button onClick={() => setQ('')}><Ic n="close" s={16} c="#9AA9C8" /></button>}
      </div>
      {q && <div style={{ color: '#7B8DB5', fontSize: 12, padding: '10px 4px 0' }}>نتائج البحث ({pool.length})</div>}
      <div style={{ paddingTop: 6 }}>
        {pool.map(u => (
          <div key={u.id} className="listrow" onClick={() => onUser(u.id)}>
            <Avatar name={u.name} hue={u.hue} size={62} frame={u.frame} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: '#0F2D6E', fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>{u.name}{u.vip > 0 && <VipTag lv={u.vip} />}</div>
              <div style={{ color: '#6E7FA6', fontSize: 14, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.bio}</div>
            </div>
            <button className="pillbtn press" onClick={e => { e.stopPropagation(); onChat(u.id); }}><Ic n="chat" s={20} c="#fff" w={2} /></button>
          </div>
        ))}
        {pool.length === 0 && <Empty text="لم يتم العثور على نتائج" />}
      </div>
    </div>
  );
}

/* --- notification category list --- */
const NOTIFS = {
  notice: [{ t: 'تمت متابعتك', d: 'قام User10 بمتابعتك', time: '09:12' }, { t: 'دعوة غرفة', d: 'كايان يدعوك إلى غرفة ليالي بغداد', time: 'أمس' }],
  official: [{ t: 'تحديث الشروط', d: 'تم تحديث سياسة الاستخدام. يرجى الاطلاع عليها.', time: '08:00' }, { t: 'تنبيه أمني', d: 'لا تشارك رمز التحقق مع أي شخص.', time: 'أمس' }, { t: 'مرحباً بك', d: 'أهلاً بك في فروست، ابدأ بإنشاء غرفتك الأولى.', time: '11/12' }],
  reward: [{ t: 'مكافأة تسجيل الدخول', d: '+50 عملة', coin: 50, time: '09:00' }, { t: 'مهمة يومية', d: '+20 عملة', coin: 20, time: '08:41' }, { t: 'مكافأة المستوى', d: '+100 عملة', coin: 100, time: 'أمس' }, { t: 'هدية ترحيبية', d: '+200 عملة', coin: 200, time: '11/14' }, { t: 'دعوة صديق', d: '+30 عملة', coin: 30, time: '11/13' }],
};
function NotifPage({ cat, onBack }) {
  const { claim, claimed } = useApp();
  const title = { notice: 'إشعار', official: 'رسمي', reward: 'مكافأة' }[cat];
  return (
    <div className="page">
      <PageHeader title={title} onBack={onBack} />
      <div className="page-body" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {NOTIFS[cat].map((n, i) => {
          const key = cat + i; const done = claimed.includes(key);
          return (
            <div key={i} className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#DDEEFF,#B6D7FB)', display: 'grid', placeItems: 'center' }}><Ic n={cat === 'reward' ? 'gift' : cat === 'official' ? 'bell' : 'speaker'} s={22} c="#2F74D8" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><b style={{ color: '#0F2D6E', fontSize: 15 }}>{n.t}</b><span style={{ color: '#9AA9C8', fontSize: 11 }}>{n.time}</span></div>
                <div style={{ color: '#6E7FA6', fontSize: 13, marginTop: 3 }}>{n.d}</div>
              </div>
              {n.coin && <button disabled={done} onClick={() => claim(key, n.coin)} className="press" style={{ padding: '7px 14px', borderRadius: 16, fontWeight: 700, fontSize: 13, color: '#fff', background: done ? '#C3D0E6' : 'linear-gradient(180deg,#FFC84A,#F09A12)' }}>{done ? 'تم' : 'استلام'}</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- 1:1 chat --- */
function ChatPage({ uid, onBack, onUser }) {
  const { threads, sendDM, me } = useApp();
  const u = userById(uid);
  const msgs = threads[uid] || [];
  const [txt, setTxt] = useState('');
  const [giftOpen, setGiftOpen] = useState(false);
  const scRef = useRef(null);
  useEffect(() => { if (scRef.current) scRef.current.scrollTop = scRef.current.scrollHeight; }, [msgs.length]);
  const send = () => { if (!txt.trim()) return; sendDM(uid, { text: txt.trim() }); setTxt(''); };
  return (
    <div className="page">
      <PageHeader title={<span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{u.name}<Flag c={u.flag} w={18} /></span>} onBack={onBack} right={<button className="iconbtn press" onClick={() => onUser(uid)}><Ic n="more" s={22} c="#0F2D6E" /></button>} />
      <div ref={scRef} className="page-body" style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ alignSelf: 'center', fontSize: 11, color: '#9AA9C8', background: '#E3EDFB', padding: '3px 10px', borderRadius: 10 }}>لا تشارك معلوماتك الشخصية أو المالية مع الغرباء</div>
        {msgs.map((m, i) => {
          const mine = m.from === 'me';
          return (
            <div key={i} style={{ display: 'flex', gap: 8, flexDirection: mine ? 'row' : 'row-reverse', alignSelf: mine ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
              <Avatar name={mine ? me.name : u.name} hue={mine ? me.hue : u.hue} size={36} />
              {m.gift ? (
                <div className="bubble gift" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GiftArt g={GIFTS.find(g => g.n === m.gift) || GIFTS[0]} s={36} /><div><b>{m.gift}</b><div style={{ fontSize: 11, opacity: .8 }}>أرسلت هدية</div></div></div>
              ) : <div className={'bubble' + (mine ? ' mine' : '')}>{m.text}</div>}
            </div>
          );
        })}
      </div>
      <div className="composer">
        <button className="iconbtn press" onClick={() => setGiftOpen(true)}><Ic n="gift" s={24} c="#E7A12C" /></button>
        <input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="اكتب رسالة..." />
        <button className="sendbtn press" onClick={send}><Ic n="send" s={18} c="#fff" w={2} style={{ transform: 'scaleX(-1)' }} /></button>
      </div>
      <GiftSheet open={giftOpen} onClose={() => setGiftOpen(false)} targets={[u]} onSend={(g) => { sendDM(uid, { gift: g.n }); setGiftOpen(false); }} />
    </div>
  );
}

/* --- User profile --- */
function ProfilePage({ uid, onBack, onChat, onRoom }) {
  const { following, toggleFollow } = useApp();
  const u = userById(uid);
  const fol = following.includes(uid);
  const room = ROOMS.find(r => r.owner === uid);
  const [tab, setTab] = useState('honor');
  return (
    <div className="page" style={{ background: '#EAF3FF' }}>
      <div className="page-body" style={{ paddingBottom: 90 }}>
        <div style={{ position: 'relative', height: 400, background: `radial-gradient(90% 70% at 70% 30%, hsl(${u.hue} 70% 60%), hsl(${u.hue} 60% 22%))`, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 1px,transparent 1.5px)', backgroundSize: '18px 18px', opacity: .18 }} />
          <div style={{ position: 'absolute', right: -40, top: 40, fontFamily: 'var(--display)', fontWeight: 900, fontSize: 260, color: 'rgba(255,255,255,.08)', lineHeight: 1 }}>{Array.from(u.name)[0]}</div>
          <StatusBar />
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 10px' }}>
            <button className="iconbtn press" onClick={onBack}><Ic n="back" s={24} c="#fff" w={2.2} /></button>
            <button className="iconbtn press"><Ic n="more" s={24} c="#fff" w={2.2} /></button>
          </div>
          {room && <button onClick={() => onRoom(room)} className="press" style={{ position: 'absolute', left: 0, top: 120, display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 6px', borderRadius: '0 22px 22px 0', background: 'linear-gradient(90deg,#4E9BFF,#7BB9FF)', color: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,.2)' }}>
            <Ic n="chev" s={14} c="#fff" w={2.4} style={{ transform: 'scaleX(-1)' }} />
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700 }}>{room.name}</div><div style={{ fontSize: 10, opacity: .9, display: 'flex', alignItems: 'center', gap: 3 }}><span className="eq sm"><i /><i /><i /></span>في الغرفة الآن</div></div>
            <Cover title={room.name} hue={room.hue} size={32} radius={8} />
          </button>}
          <div style={{ position: 'absolute', right: 16, bottom: 26, color: '#fff' }}>
            <Avatar name={u.name} hue={u.hue} size={96} frame={u.frame || 'ice'} />
            <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, marginTop: 8, textShadow: '0 2px 6px rgba(0,0,0,.35)' }}>{u.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, direction: 'rtl' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--latin)', fontWeight: 700, fontSize: 15 }}><Ic n="id" s={16} c="#C8B6FF" />{u.id}<Ic n="copy" s={13} c="#fff" /></span>
              <Flag c={u.flag} w={24} /><GenderTag g={u.g} age={u.age} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}><LvTag lv={u.lv} /><VipTag lv={u.vip} /></div>
            {u.badges > 0 && <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>{Array.from({ length: u.badges }).map((_, k) => <MiniBadge key={k} k={k} s={34} />)}</div>}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '22px 22px 0 0', marginTop: -18, position: 'relative', padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', border: '1px solid #CFE3FA', borderRadius: 14, background: 'linear-gradient(180deg,#F5FAFF,#E8F3FF)', padding: '12px 0' }}>
            {[[u.follows, 'المتابعة'], [u.fans + (fol ? 1 : 0), 'المعجبون'], [u.charm, 'الجاذبية'], [u.friends, 'الأصدقاء']].map(([v, l], i) => (
              <div key={i} style={{ textAlign: 'center', borderInlineStart: i ? '1px solid #D6E5F8' : 'none' }}>
                <div style={{ fontFamily: 'var(--latin)', fontWeight: 800, fontSize: 20, color: '#14326E' }}>{fmt(v)}</div>
                <div style={{ color: '#7B8DB5', fontSize: 12, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <p style={{ color: '#4A5A80', fontSize: 15, margin: '14px 2px' }}>{u.bio}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <LevelPlate kind="wealth" lv={u.lv} />
            <LevelPlate kind="vip" lv={u.vip} />
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 18, borderBottom: '1px solid #EEF3FA' }}>
            {[['honor', 'الشرف'], ['car', 'السيارات'], ['gifts', 'الهدايا']].map(([id, n]) => <button key={id} onClick={() => setTab(id)} style={{ fontWeight: 800, fontSize: 17, color: tab === id ? '#0F2D6E' : '#9AA9C8', paddingBottom: 8, position: 'relative' }}>{n}{tab === id && <i style={{ position: 'absolute', bottom: 0, right: '50%', transform: 'translateX(50%)', width: 16, height: 3, borderRadius: 2, background: '#0F2D6E' }} />}</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 14 }}>
            {(tab === 'gifts' ? GIFTS.slice(0, 8) : tab === 'car' ? GIFTS.filter(g => ['car', 'rocket'].includes(g.id)) : Array.from({ length: u.badges || 1 })).map((g, k) => (
              <div key={k} style={{ borderRadius: 14, background: '#F2F7FF', padding: '12px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {tab === 'honor' ? <MiniBadge k={k} s={44} /> : <GiftArt g={g} s={44} />}
                <span style={{ fontSize: 11, color: '#5E6E92' }}>{tab === 'honor' ? ['بطل', 'ملك', 'وسام', 'نجم', 'ماسي'][k % 5] : g.n}{tab === 'gifts' && <b style={{ fontFamily: 'var(--latin)', marginInlineStart: 3 }}>×{(k * 7 + 3) % 40 + 1}</b>}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="profile-actions">
        <button className="press act-soft" onClick={() => onChat(uid)}><Ic n="chat" s={20} c="#14326E" />رسالة</button>
        <button className={'press act-main' + (fol ? ' on' : '')} onClick={() => toggleFollow(uid)}><Ic n={fol ? 'check' : 'plus'} s={20} c="#fff" w={2.4} />{fol ? 'تمت المتابعة' : 'متابعة'}</button>
      </div>
    </div>
  );
}
function LevelPlate({ kind, lv }) {
  const w = kind === 'wealth';
  return (
    <div style={{ position: 'relative', height: 76, borderRadius: 12, overflow: 'hidden', padding: '10px 12px', color: '#fff', background: w ? 'linear-gradient(120deg,#0E3C9C,#3A86F0 60%,#9ED2FF)' : 'linear-gradient(120deg,#5E0C35,#B8326E 60%,#F59AC4)', boxShadow: `inset 0 0 0 2px ${w ? '#9CCBFF' : '#F6B8D4'}` }}>
      <div style={{ position: 'absolute', insetInlineEnd: -6, top: 8 }}>{w ? <Ic n="diamond" s={58} c="rgba(255,255,255,.9)" w={1.2} /> : <Ic n="crown" s={56} c="rgba(255,255,255,.9)" w={1.2} />}</div>
      <div style={{ fontFamily: 'var(--latin)', fontSize: 13, opacity: .9 }}>{w ? 'Wealth' : 'VIP Level'}</div>
      <div style={{ fontFamily: 'var(--latin)', fontStyle: 'italic', fontWeight: 900, fontSize: 24, textShadow: '0 2px 0 rgba(0,0,0,.2)' }}>LV.{lv}</div>
    </div>
  );
}

Object.assign(window, { MessagesView, FriendsView, NotifPage, ChatPage, ProfilePage, LevelPlate });
