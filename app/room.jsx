/* ============ Voice room ============ */

function GiftSheet({ open, onClose, targets, onSend }) {
  const { coins } = useApp();
  const [sel, setSel] = useState(GIFTS[0]?.id ?? null);
  useEffect(() => { if (!sel && GIFTS.length) setSel(GIFTS[0].id); }, [sel, GIFTS.length]);
  const [qty, setQty] = useState(1);
  const [to, setTo] = useState(0);
  const [tab, setTab] = useState('hot');
  const g = GIFTS.find(x => x.id === sel);
  const list = tab === 'hot' ? GIFTS : tab === 'lux' ? GIFTS.filter(x => x.p >= 500) : GIFTS.filter(x => x.p < 100);
  return (
    <Sheet open={open} onClose={onClose} dark>
      {targets && targets.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 4px', overflowX: 'auto' }} className="noscroll">
          <span style={{ color: '#9EC3FF', fontSize: 12, flexShrink: 0 }}>إرسال إلى</span>
          {targets.map((u, i) => (
            <button key={u.id} onClick={() => setTo(i)} style={{ position: 'relative', flexShrink: 0, borderRadius: '50%', boxShadow: to === i ? '0 0 0 2px #FFD45A' : 'none' }}>
              <Avatar name={u.name} hue={u.hue} size={34} />
              {to === i && <span style={{ position: 'absolute', bottom: -2, left: -2, width: 14, height: 14, borderRadius: 7, background: '#FFD45A', display: 'grid', placeItems: 'center' }}><Ic n="check" s={9} c="#5A3600" w={3} /></span>}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 18, padding: '10px 16px 6px' }}>
        {[['hot', 'شائع'], ['lux', 'فاخر'], ['cheap', 'مميز']].map(([id, n]) => <button key={id} onClick={() => setTab(id)} style={{ color: tab === id ? '#fff' : '#7E9BCB', fontWeight: 700, fontSize: 15, borderBottom: tab === id ? '2px solid #FFD45A' : '2px solid transparent', paddingBottom: 4 }}>{n}</button>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, padding: '6px 10px', maxHeight: 230, overflowY: 'auto' }}>
        {list.length === 0 && <div style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center', color: '#9EC3FF' }}>لا توجد هدايا متاحة حالياً. أضف الهدايا من لوحة الإدارة.</div>}
        {list.map(x => (
          <button key={x.id} onClick={() => setSel(x.id)} style={{ borderRadius: 12, padding: '10px 2px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: sel === x.id ? 'rgba(120,180,255,.18)' : 'transparent', boxShadow: sel === x.id ? 'inset 0 0 0 1.5px #78B4FF' : 'none' }}>
            <GiftArt g={x} s={44} />
            <span style={{ color: '#fff', fontSize: 12 }}>{x.n}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#FFD45A', fontSize: 11, fontFamily: 'var(--latin)' }}><Coin s={11} />{fmt(x.p)}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px 22px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff', fontFamily: 'var(--latin)', fontWeight: 700 }}><Coin s={18} />{fmt(coins)}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: '1px solid #4F7FC8' }}>
          <select value={qty} onChange={e => setQty(+e.target.value)} style={{ background: 'transparent', color: '#fff', border: 'none', padding: '0 10px', fontFamily: 'var(--latin)', fontWeight: 700, outline: 'none' }}>
            {[1, 10, 66, 99, 520].map(n => <option key={n} value={n} style={{ color: '#000' }}>×{n}</option>)}
          </select>
          <button disabled={!g} onClick={() => g && onSend(g, qty, targets ? targets[to] : null)} className="press" style={{ padding: '9px 22px', fontWeight: 800, color: '#5A3600', background: 'linear-gradient(180deg,#FFE9A0,#F0B23A)', opacity: g ? 1 : .45 }}>إرسال</button>
        </div>
      </div>
    </Sheet>
  );
}

function Seat({ i, occ, speaking, locked, onClick }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      {occ ? (
        <Avatar name={occ.name} hue={occ.hue} size={54} frame={occ.frame} speaking={speaking} muted={occ.muted} />
      ) : (
        <div className="seat-empty">{locked ? <Ic n="lock" s={20} c="#B9D6FF" /> : <Ic n="mic" s={20} c="#B9D6FF" />}</div>
      )}
      <span style={{ fontSize: 11, color: occ ? '#fff' : '#9EC3FF', maxWidth: 70, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{occ ? occ.name : (i + 1)}</span>
      {occ && <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#FFD9A0', fontFamily: 'var(--latin)', marginTop: -3 }}><Ic n="heart" s={8} c="#FF7FA0" fill="#FF7FA0" w={1} />{fmt(occ.score || 0)}</span>}
    </button>
  );
}

function RoomPage({ room, onClose, onMinimize, onUser }) {
  const { me, coins, setCoins, followedRooms, toggleFollowRoom, toast, pushLog, setDiamonds, diamonds } = useApp();
  const owner = (room.mine ? { ...me } : userById(room.owner)) || { id: room.owner, name: room.name, hue: 210, lv: 1, vip: 0 };
  const isMine = !!room.mine;
  const [seats, setSeats] = useState(() => room.seats || Array(8).fill(null));
  const [roomMembers, setRoomMembers] = useState(room.members || []);
  const [hostScore] = useState(0);
  const [mySeat, setMySeat] = useState(() => {
    const index = (room.seats || []).findIndex(x => x && x !== 'locked' && x.id === me.id);
    return index >= 0 ? index : (isMine ? 'host' : null);
  });
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [speaking, setSpeaking] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [txt, setTxt] = useState('');
  const [giftOpen, setGiftOpen] = useState(false);
  const [seatMenu, setSeatMenu] = useState(null);
  const [usersOpen, setUsersOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fx, setFx] = useState(null);
  const chatRef = useRef(null);
  const followed = followedRooms.includes(room.id);
  const online = roomMembers.length;

  const loadRoomState = async () => {
    if (!window.SADA_API?.select || !room.id) return;
    const roomFilter = "room_id=eq." + encodeURIComponent(room.id);
    const [seatRows, memberRows, messageRows] = await Promise.all([
      window.SADA_API.select("room_seats?select=room_id,seat_number,user_id,seat_status&" + roomFilter),
      window.SADA_API.select("room_members?select=user_id,role&" + roomFilter),
      window.SADA_API.select("chat_messages?select=id,sender_id,body,message_type,created_at&" + roomFilter + "&deleted_at=is.null&order=created_at.asc&limit=100")
    ]);
    const nextSeats = Array(8).fill(null);
    seatRows.forEach(row => {
      const index = Number(row.seat_number);
      if (index >= 0 && index < 8) nextSeats[index] = row.seat_status === "locked" ? "locked" : (userById(row.user_id) || null);
    });
    setSeats(nextSeats);
    setRoomMembers(memberRows.map(row => userById(row.user_id)).filter(Boolean));
    setMsgs(messageRows.map(row => ({ id: row.id, u: userById(row.sender_id) || { id: row.sender_id, name: "عضو" }, text: row.body || "", mine: row.sender_id === me.id })));
    const mine = nextSeats.findIndex(x => x && x !== "locked" && x.id === me.id);
    if (mine >= 0) setMySeat(mine);
  };
  useEffect(() => {
    let active = true;
    const joinAndLoad = async () => {
      if (!room.id || !window.SADA_API?.select) return;
      try {
        const existing = await window.SADA_API.select("room_members?select=user_id&room_id=eq." + encodeURIComponent(room.id) + "&user_id=eq." + encodeURIComponent(me.id));
        if (!existing.length) await window.SADA_API.insert("room_members", { room_id: room.id, user_id: me.id, role: "member" });
        if (active) await loadRoomState();
      } catch (error) { if (active) toast(error instanceof Error ? error.message : "تعذر الانضمام للغرفة"); }
    };
    void joinAndLoad();
    const timer = setInterval(() => { if (active) void loadRoomState().catch(() => {}); }, 4000);
    return () => { active = false; clearInterval(timer); };
  }, [room.id, me.id]);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs.length]);

  const sendMsg = async () => {
    const body = txt.trim();
    if (!body || !room.id) return;
    try {
      await window.SADA_API.insert("chat_messages", { room_id: room.id, sender_id: me.id, message_type: "text", body });
      setTxt("");
      await loadRoomState();
    } catch (error) { toast(error instanceof Error ? error.message : "تعذر إرسال الرسالة"); }
  };
  const takeSeat = async (i) => {
    if (seats[i] === "locked") return toast("هذا المقعد مقفل");
    if (seats[i]) return onUser(seats[i].id);
    if (mySeat === "host") return toast("أنت المضيف");
    try {
      if (typeof mySeat === "number") await window.SADA_API.remove("room_seats", "room_id=eq." + encodeURIComponent(room.id) + "&seat_number=eq." + mySeat + "&user_id=eq." + encodeURIComponent(me.id));
      await window.SADA_API.insert("room_seats", { room_id: room.id, seat_number: i, user_id: me.id, seat_status: "occupied" });
      setMySeat(i); setSeatMenu(null); await loadRoomState();
    } catch (error) { toast(error instanceof Error ? error.message : "المقعد غير متاح"); }
  };
  const leaveSeat = async () => {
    if (typeof mySeat !== "number") return;
    try {
      await window.SADA_API.remove("room_seats", "room_id=eq." + encodeURIComponent(room.id) + "&seat_number=eq." + mySeat + "&user_id=eq." + encodeURIComponent(me.id));
      setMySeat(null); await loadRoomState();
    } catch (error) { toast(error instanceof Error ? error.message : "تعذر مغادرة المقعد"); }
  };
  const sendGift = async (g, qty, target) => {
    const tgt = target || owner;
    if (!g || !tgt?.id || !room?.id) { toast('تعذر تحديد الهدية أو المستلم أو الغرفة'); return; }
    if (!window.SADA_API?.rpc) { toast('خدمة الهدايا غير متاحة حالياً'); return; }
    try {
      await window.SADA_API.rpc('send_gift', { p_gift_id: g.id, p_receiver_id: tgt.id, p_room_id: room.id, p_quantity: qty });
      await window.SADA_API.refresh();
      const cost = g.p * qty;
      pushLog(`هدية ${g.n} ×${qty}`, -cost);
      setMsgs(m => [...m, { gift: g, qty, to: tgt, u: me }]);
      setFx({ g, qty, key: Date.now() }); setGiftOpen(false);
      setTimeout(() => setFx(null), 2200);
    } catch (error) {
      toast(error instanceof Error ? error.message : 'فشل إرسال الهدية');
    }
  };
  const roomBackground = window.SADA_ASSETS?.url('room.background.default');
  const seatedUsers = [owner, ...seats.filter(s => s && s !== 'locked' && !s.isMe)];
  const audience = [owner, ...roomMembers.filter(u => u.id !== owner.id)];

  return (
    <div className="room" style={{ '--rh': room.hue }}>
      <div className="room-bg" style={roomBackground ? { backgroundImage: `url("${roomBackground}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
      <div className="room-snow" />
      <StatusBar />
      {/* header */}
      <div className="room-head">
        <div className="room-pill">
          <Cover title={room.name} hue={room.hue} size={38} radius={10} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</div>
            <div style={{ color: '#B9D6FF', fontSize: 10, fontFamily: 'var(--latin)', direction: 'ltr', textAlign: 'right' }}>ID:{room.id}</div>
          </div>
          {!isMine && <button className="press" onClick={() => { toggleFollowRoom(room.id); toast(followed ? 'تم إلغاء المتابعة' : 'تمت متابعة الغرفة'); }} style={{ width: 28, height: 28, borderRadius: 14, display: 'grid', placeItems: 'center', background: followed ? 'rgba(255,255,255,.2)' : 'linear-gradient(180deg,#FFD45A,#F09A12)' }}><Ic n={followed ? 'check' : 'plus'} s={15} c="#fff" w={2.8} /></button>}
        </div>
        <div style={{ flex: 1 }} />
        <button className="press" onClick={() => setUsersOpen(true)} style={{ display: 'flex', alignItems: 'center' }}>
          {audience.slice(0, 3).map((u, i) => <Avatar key={u.id} name={u.name} hue={u.hue} size={26} style={{ marginInlineStart: i ? -8 : 0, boxShadow: '0 0 0 1.5px #1C4D9C', borderRadius: '50%' }} />)}
          <span style={{ marginInlineStart: 4, color: '#fff', fontSize: 12, fontFamily: 'var(--latin)', background: 'rgba(0,0,0,.25)', padding: '3px 8px', borderRadius: 10 }}>{online}</span>
        </button>
        <button className="iconbtn press" onClick={() => setMoreOpen(true)}><Ic n="power" s={20} c="#fff" w={2.2} /></button>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '2px 14px 0', position: 'relative' }}>
        <span className="room-chip"><Ic n="trophy" s={11} c="#FFD45A" />{fmt(hostScore + seats.reduce((a, s) => a + (s && s !== 'locked' ? s.score || 0 : 0), 0))}</span>
        <span className="room-chip"><Ic n="bars" s={11} c="#9EF0C8" />{room.topic}</span>
        <Flag c={room.flag} w={20} />
      </div>
      {/* host */}
      <div style={{ display: 'grid', placeItems: 'center', marginTop: 10, position: 'relative' }}>
        <button onClick={() => !isMine && onUser(owner.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={owner.name} hue={owner.hue} size={70} frame={owner.frame || 'gold'} speaking={speaking.host || (isMine && speaking.me && micOn)} muted={isMine && !micOn} />
            <span style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', padding: '1px 7px', borderRadius: 8, background: 'linear-gradient(180deg,#FFD45A,#F09A12)', color: '#5A3600', fontSize: 9, fontWeight: 800, whiteSpace: 'nowrap' }}>المضيف</span>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginTop: 4 }}>{owner.name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#FFD9A0', fontFamily: 'var(--latin)' }}><Ic n="heart" s={9} c="#FF7FA0" fill="#FF7FA0" w={1} />{fmt(hostScore)}</span>
        </button>
      </div>
      {/* seats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', rowGap: 12, padding: '14px 10px 6px', position: 'relative' }}>
        {seats.map((s, i) => <Seat key={i} i={i} occ={s && s !== 'locked' ? (s.isMe ? { ...s, muted: !micOn } : s) : null} locked={s === 'locked'} speaking={s && s !== 'locked' && (s.isMe ? speaking.me && micOn : speaking[i])} onClick={() => (s ? (s.isMe ? setSeatMenu(i) : takeSeat(i)) : setSeatMenu(i))} />)}
      </div>
      {/* chat */}
      <div ref={chatRef} className="room-chat noscroll">
        {msgs.map((m, i) => m.sys ? (
          <div key={i} className={'rmsg sys' + (m.join ? ' join' : '')}>{m.text}</div>
        ) : m.gift ? (
          <div key={i} className="rmsg gift"><b>{m.u.name}</b> أرسل <GiftArt g={m.gift} s={20} /> {m.gift.n} ×{m.qty} إلى <b>{m.to.name}</b></div>
        ) : (
          <div key={i} className="rmsg" onClick={() => !m.mine && onUser(m.u.id)}>
            <span style={{ display: 'inline-flex', gap: 3, verticalAlign: 'middle', marginInlineEnd: 4 }}><LvTag lv={m.u.lv} />{m.u.vip > 0 && <VipTag lv={m.u.vip} />}</span>
            <b style={{ color: m.mine ? '#FFE08A' : '#9FD0FF' }}>{m.u.name}:</b> {m.text}
          </div>
        ))}
      </div>
      {/* gift fx */}
      {fx && <div key={fx.key} className="giftfx"><GiftArt g={fx.g} s={130} /><div className="giftfx-x">×{fx.qty}</div></div>}
      {/* bottom bar */}
      <div className="room-bar">
        <div className="room-input">
          <input value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} placeholder="قل شيئاً..." />
          {txt && <button onClick={sendMsg}><Ic n="send" s={18} c="#9FD0FF" style={{ transform: 'scaleX(-1)' }} /></button>}
        </div>
        {mySeat !== null && <button className="rbtn press" onClick={() => setMicOn(!micOn)}><Ic n={micOn ? 'mic' : 'micoff'} s={20} c={micOn ? '#fff' : '#FF8BA0'} /></button>}
        <button className="rbtn press" onClick={() => setSpeakerOn(!speakerOn)}><Ic n={speakerOn ? 'speaker' : 'mute'} s={20} c="#fff" /></button>
        <button className="rbtn press" onClick={() => setMoreOpen(true)}><Ic n="dots" s={20} c="#fff" /></button>
        <button className="rbtn gift press" onClick={() => setGiftOpen(true)}><Ic n="gift" s={22} c="#fff" w={2} /></button>
      </div>

      <GiftSheet open={giftOpen} onClose={() => setGiftOpen(false)} targets={seatedUsers} onSend={sendGift} />
      <Sheet open={seatMenu !== null} onClose={() => setSeatMenu(null)}>
        <div style={{ padding: '18px 16px 26px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ textAlign: 'center', fontWeight: 800, color: '#14326E', marginBottom: 8 }}>المقعد {seatMenu !== null ? seatMenu + 1 : ''}</div>
          {seatMenu !== null && mySeat === seatMenu ? <>
            <button className="sheetrow" onClick={() => { setMicOn(!micOn); setSeatMenu(null); }}>{micOn ? 'كتم المايك' : 'فتح المايك'}</button>
            <button className="sheetrow danger" onClick={() => { leaveSeat(); setSeatMenu(null); }}>النزول من المقعد</button>
          </> : <>
            <button className="sheetrow" onClick={() => takeSeat(seatMenu)}>الصعود إلى المقعد</button>
            {isMine && <button className="sheetrow" onClick={() => { const s = seats.slice(); s[seatMenu] = 'locked'; setSeats(s); setSeatMenu(null); }}>قفل المقعد</button>}
            {isMine && <button className="sheetrow" onClick={() => { setSeatMenu(null); toast('تم إرسال الدعوة'); }}>دعوة صديق</button>}
          </>}
          <button className="sheetrow muted" onClick={() => setSeatMenu(null)}>إلغاء</button>
        </div>
      </Sheet>
      <Sheet open={usersOpen} onClose={() => setUsersOpen(false)} h={460}>
        <div style={{ padding: '16px 14px 0', fontWeight: 800, color: '#14326E', textAlign: 'center' }}>المتواجدون ({online})</div>
        <div style={{ padding: '6px 14px 20px', overflowY: 'auto', height: 400 }}>
          {[owner, ...audience.filter(u => u.id !== owner.id)].map((u, i) => (
            <div key={u.id} className="listrow" onClick={() => { setUsersOpen(false); if (u.id !== me.id) onUser(u.id); }}>
              <Avatar name={u.name} hue={u.hue} size={44} frame={u.frame} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: '#0F2D6E', display: 'flex', gap: 6, alignItems: 'center' }}>{u.name}{i === 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 6, background: '#FFE9A0', color: '#7A4A00' }}>المضيف</span>}</div><div style={{ display: 'flex', gap: 4, marginTop: 4 }}><LvTag lv={u.lv || 1} /><VipTag lv={u.vip} /></div></div>
              <Flag c={u.flag} />
            </div>
          ))}
        </div>
      </Sheet>
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, padding: '22px 16px 10px' }}>
          {[['share', 'مشاركة', () => toast('تم نسخ رابط الغرفة')], ['flag', 'إبلاغ', () => toast('تم إرسال البلاغ')], ['image', 'خلفية الغرفة', () => toast('قريباً')], ['settings', 'إعدادات', () => toast('إعدادات الغرفة')]].map(([ic, n, f]) => (
            <button key={n} onClick={() => { f(); setMoreOpen(false); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}><span style={{ width: 50, height: 50, borderRadius: 16, background: '#E8F2FF', display: 'grid', placeItems: 'center' }}><Ic n={ic} s={22} c="#2F74E0" /></span><span style={{ fontSize: 12, color: '#14326E' }}>{n}</span></button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: '10px 16px 26px' }}>
          <button className="bigbtn press" style={{ margin: 0, flex: 1, background: '#E8F2FF', color: '#2F74E0', boxShadow: 'none' }} onClick={() => { setMoreOpen(false); onMinimize(); }}>تصغير</button>
          <button className="bigbtn press" style={{ margin: 0, flex: 1, background: 'linear-gradient(180deg,#FF8BA0,#E2466B)' }} onClick={() => { setMoreOpen(false); onClose(); }}>خروج</button>
        </div>
      </Sheet>
    </div>
  );
}

/* floating mini room bubble */
function MiniRoom({ room, onOpen, onClose }) {
  return (
    <div className="miniroom" onClick={onOpen}>
      <div className="miniroom-spin"><Cover title={room.name} hue={room.hue} size={56} radius={28} /></div>
      <span className="eq sm" style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)' }}><i /><i /><i /></span>
      <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, background: '#4E9BFF', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}><Ic n="close" s={10} c="#fff" w={3} /></button>
    </div>
  );
}

Object.assign(window, { RoomPage, GiftSheet, MiniRoom });
