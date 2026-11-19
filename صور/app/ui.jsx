/* ============ Shared UI + data for Frost voice-chat app ============ */
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;

const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ---------- Icons (stroke set) ---------- */
const ICON_PATHS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  back: '<path d="M9 5l7 7-7 7"/>',
  chev: '<path d="M15 6l-6 6 6 6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  micoff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M3 3l18 18"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.2 2.4 3.6 5.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
  wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  task: '<rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
  settings: '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M3 12l18-8-7 18-3-7z"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
  dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>',
  mute: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/>',
  power: '<path d="M12 3v8"/><path d="M6.3 7a8 8 0 1 0 11.4 0"/>',
  host: '<circle cx="12" cy="9" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/><path d="M6.5 10V9a5.5 5.5 0 0 1 11 0v1"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  snow: '<path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4.5v1A3.5 3.5 0 0 0 8 10.5M16 6h3.5v1a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8.5 21h7M9.5 17h5v4h-5z"/>',
  image: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
  flag: '<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  store: '<path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 2 1.5 3 3 3s3-1 3-3c0 2 1.5 3 2 3s2-1 2-3c0 2 1.5 3 3 3s3-1 3-3"/><path d="M10 20v-5h4v5"/>',
  medal: '<circle cx="12" cy="14" r="6"/><path d="M8.5 9L6 3h4l2 4 2-4h4l-2.5 6"/><path d="M12 11.5l.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3z"/>',
  diamond: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 9v6M11 9v6h2a3 3 0 0 0 0-6z"/>',
  car: '<path d="M3 16v-3l2-5h14l2 5v3z"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
  frame: '<circle cx="12" cy="12" r="6"/><path d="M12 2l2 3M12 2l-2 3M22 12l-3 2M22 12l-3-2M2 12l3 2M2 12l3-2M12 22l2-3M12 22l-2-3"/>',
  rocket: '<path d="M12 3c4 2 6 6 5 11l-2 3H9l-2-3C6 9 8 5 12 3z"/><circle cx="12" cy="10" r="2"/><path d="M9 17l-2 4M15 17l2 4M12 17v4"/>',
  rose: '<path d="M12 12c-3 0-5-2-5-5 2 0 3 .5 4 1.5C11.5 6 12 4 12 4s.5 2 1 4.5c1-1 2-1.5 4-1.5 0 3-2 5-5 5zM12 12v9M12 17c-2-2-4-2-5-1.5M12 16c2-1.5 3.5-1.5 4.5-1"/>',
  ring: '<circle cx="12" cy="15" r="6"/><path d="M9 4h6l2 3-5 4-5-4z"/>',
  ice: '<path d="M8 10h8l-4 11z"/><path d="M7 10a5 5 0 0 1 10 0"/>',
  castle: '<path d="M4 21V10l2-2 2 2v11M16 21V10l2-2 2 2v11M8 21v-7h8v7M8 14V9a4 4 0 0 1 8 0v5M12 3v2"/>',
  headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
  bars: '<path d="M6 16V8M10 18V6M14 15V9M18 13v-2"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
};
function Ic({ n, s = 20, c = 'currentColor', w = 1.8, fill = 'none', style, className }) {
  return <svg className={className} width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c}
    strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}
    dangerouslySetInnerHTML={{ __html: ICON_PATHS[n] || '' }} />;
}

/* ---------- helpers ---------- */
function hueOf(str) { let h = 7; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
const fmt = (n) => typeof n === 'number' ? n.toLocaleString('en-US') : n;

/* ---------- Avatar with optional frame ---------- */
const FRAMES = {
  gold: 'conic-gradient(from 20deg,#FFF1BF,#C8902C,#FFF6D6,#A9741B,#FFE7A0,#C8902C,#FFF1BF)',
  ice: 'conic-gradient(from 0deg,#FFFFFF,#8CC6FF,#E9F6FF,#3F8AE6,#FFFFFF,#9AD0FF,#FFFFFF)',
  violet: 'conic-gradient(from 0deg,#F6DDFF,#9B4FE0,#FFE6FF,#6E2CC0,#F6DDFF)',
  rose: 'conic-gradient(from 0deg,#FFE0EA,#E0477A,#FFF0F4,#B4245A,#FFE0EA)',
};
function Avatar({ name = '', hue, size = 44, frame, square, radius, onClick, speaking, style, muted }) {
  const h = hue ?? hueOf(name);
  const letter = Array.from(String(name).trim())[0] || '؟';
  const r = square ? (radius ?? size * 0.22) : '50%';
  const core = (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(circle at 30% 22%, hsl(${h} 95% 86%), hsl(${h} 70% 55%) 55%, hsl(${(h + 20) % 360} 70% 30%))`,
      display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--display)', fontWeight: 700,
      fontSize: size * 0.42, textShadow: '0 1px 4px rgba(0,0,0,.25)',
    }}>
      <span style={{ transform: 'translateY(-2%)' }}>{letter}</span>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,rgba(255,255,255,.35),transparent 45%)' }} />
    </div>
  );
  return (
    <div onClick={onClick} style={{ position: 'relative', flexShrink: 0, cursor: onClick ? 'pointer' : undefined, ...style }}>
      {speaking && <><span className="ripple" style={{ borderRadius: r }} /><span className="ripple d2" style={{ borderRadius: r }} /></>}
      {frame ? (
        <div style={{ padding: Math.max(2, size * 0.06), borderRadius: r, background: FRAMES[frame], boxShadow: '0 2px 8px rgba(30,80,160,.25)' }}>{core}</div>
      ) : core}
      {muted && <div style={{ position: 'absolute', bottom: -2, left: -2, width: 18, height: 18, borderRadius: 9, background: '#F04461', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}><Ic n="micoff" s={10} c="#fff" w={2.4} /></div>}
    </div>
  );
}

/* ---------- Flags (simplified stripes) ---------- */
const FLAGS = {
  eg: { n: 'مصر', s: ['#CE1126', '#fff', '#111'], dot: '#C09300' },
  ae: { n: 'الإمارات', s: ['#00732F', '#fff', '#111'], bar: '#FF0000' },
  jo: { n: 'الأردن', s: ['#111', '#fff', '#007A3D'], tri: '#CE1126' },
  sa: { n: 'السعودية', s: ['#006C35'], dot: '#fff' },
  ma: { n: 'المغرب', s: ['#C1272D'], dot: '#006233' },
  iq: { n: 'العراق', s: ['#CE1126', '#fff', '#111'], dot: '#007A3D' },
  sy: { n: 'سوريا', s: ['#007A3D', '#fff', '#111'], dot: '#CE1126' },
  dz: { n: 'الجزائر', v: ['#006233', '#fff'], dot: '#D21034' },
  kw: { n: 'الكويت', s: ['#007A3D', '#fff', '#CE1126'], tri: '#111' },
  lb: { n: 'لبنان', s: ['#ED1C24', '#fff', '#fff', '#ED1C24'], dot: '#00A651' },
};
function Flag({ c = 'eg', w = 22 }) {
  const f = FLAGS[c] || FLAGS.eg; const h = Math.round(w * 0.68);
  const bg = f.v ? `linear-gradient(90deg,${f.v[0]} 50%,${f.v[1]} 50%)`
    : `linear-gradient(180deg,${f.s.map((col, i) => `${col} ${i / f.s.length * 100}% ${(i + 1) / f.s.length * 100}%`).join(',')})`;
  return (
    <span style={{ width: w, height: h, borderRadius: 3, background: bg, position: 'relative', display: 'inline-block', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 .5px rgba(0,0,0,.18)' }}>
      {f.bar && <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '26%', background: f.bar }} />}
      {f.tri && <i style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: f.tri, clipPath: 'polygon(0 0,100% 50%,0 100%)' }} />}
      {f.dot && <i style={{ position: 'absolute', left: '50%', top: '50%', width: h * 0.28, height: h * 0.28, borderRadius: '50%', transform: 'translate(-50%,-50%)', background: f.dot }} />}
    </span>
  );
}

/* ---------- Tags ---------- */
function vipColors(lv) {
  if (lv >= 7) return ['#FFE9A6', '#C88A1E', '#7A4A00'];
  if (lv >= 5) return ['#FFD3EC', '#D2468F', '#6E0F46'];
  if (lv >= 3) return ['#CDEBFF', '#3D86E8', '#0E3C82'];
  return ['#D2FBE9', '#2DB386', '#0B5A40'];
}
function VipTag({ lv = 1, size = 'sm' }) {
  if (!lv) return null;
  const [a, b, t] = vipColors(lv);
  const big = size === 'md';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2, height: big ? 20 : 16, padding: big ? '0 8px 0 6px' : '0 6px 0 4px', borderRadius: 10,
      background: `linear-gradient(135deg,${a},${b})`, color: '#fff', fontFamily: 'var(--latin)', fontStyle: 'italic', fontWeight: 800,
      fontSize: big ? 11 : 9.5, letterSpacing: .3, textShadow: `0 1px 0 ${t}`, boxShadow: `inset 0 0 0 1px rgba(255,255,255,.6), 0 1px 3px ${b}55`, direction: 'ltr'
    }}>
      <Ic n="crown" s={big ? 11 : 9} c="#fff" fill="#fff" w={1} />VIP{lv}
    </span>
  );
}
function LvTag({ lv = 1 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, height: 16, padding: '0 7px 0 3px', borderRadius: 9, background: 'linear-gradient(135deg,#7CC4FF,#3474E0)', color: '#fff', fontWeight: 800, fontSize: 10, fontFamily: 'var(--latin)', direction: 'ltr', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.5)' }}>
      <span style={{ width: 11, height: 11, borderRadius: 6, background: '#fff', display: 'grid', placeItems: 'center' }}><Ic n="diamond" s={8} c="#3474E0" w={2.6} /></span>{lv}
    </span>
  );
}
function GenderTag({ g = 'f', age = 24 }) {
  const f = g === 'f';
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 16, padding: '0 6px', borderRadius: 8, background: f ? '#FF6FA8' : '#4E9BFF', color: '#fff', fontSize: 10, fontWeight: 800, fontFamily: 'var(--latin)', direction: 'ltr' }}>{f ? '♀' : '♂'}{age}</span>;
}
function Coin({ s = 16 }) {
  return <span style={{ width: s, height: s, borderRadius: '50%', display: 'inline-grid', placeItems: 'center', flexShrink: 0, background: 'radial-gradient(circle at 35% 30%,#FFF4C2,#F2B530 55%,#B97A0C)', boxShadow: 'inset 0 0 0 1.5px #FFD86B', color: '#8A5500', fontSize: s * .55, fontWeight: 900, fontFamily: 'var(--latin)' }}>F</span>;
}
function Diamond({ s = 16 }) {
  return <span style={{ width: s, height: s, display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}><Ic n="diamond" s={s} c="#2E8BF0" fill="#BFE4FF" w={1.6} /></span>;
}

/* ---------- Sky backdrop (mountains + palace silhouette + snow) ---------- */
function SkyBackdrop({ h = 230, palace = true, dark }) {
  return (
    <div className="sky" style={{ height: h }}>
      <div className="sky-grad" style={dark ? { background: 'linear-gradient(180deg,#0A2659,#1D58B0 60%,#4E8FD8)' } : null} />
      <div className="snowfield" />
      <svg viewBox="0 0 390 230" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="mtA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#B9D8F6" /></linearGradient>
          <linearGradient id="mtB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EAF5FF" /><stop offset="1" stopColor="#D9EBFC" /></linearGradient>
        </defs>
        <path d="M0 120 L40 82 L70 100 L110 52 L150 96 L180 78 L215 112 L250 70 L290 40 L330 88 L360 66 L390 92 V230 H0Z" fill="url(#mtA)" opacity=".75" />
        {palace && <g fill="#fff" opacity=".7">
          <rect x="170" y="70" width="50" height="70" />
          <ellipse cx="195" cy="70" rx="17" ry="16" /><rect x="194" y="40" width="2" height="16" />
          <rect x="152" y="58" width="8" height="82" /><polygon points="152,58 156,42 160,58" />
          <rect x="230" y="58" width="8" height="82" /><polygon points="230,58 234,42 238,58" />
          <ellipse cx="174" cy="92" rx="8" ry="8" /><ellipse cx="216" cy="92" rx="8" ry="8" />
        </g>}
        <path d="M0 150 L50 118 L95 140 L140 112 L200 146 L250 120 L300 142 L350 116 L390 132 V230 H0Z" fill="url(#mtB)" />
      </svg>
      <div className="sky-fade" />
    </div>
  );
}

/* ---------- Status bar ---------- */
function StatusBar({ dark }) {
  const col = dark ? '#0F2D6E' : '#fff';
  return (
    <div className="statusbar" style={{ color: col }}>
      <span style={{ fontFamily: 'var(--latin)', fontWeight: 700, fontSize: 14, direction: 'ltr' }}>9:41</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center', direction: 'ltr' }}>
        <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="8" width="3" height="4" rx="1" fill={col} /><rect x="4.5" y="5.5" width="3" height="6.5" rx="1" fill={col} /><rect x="9" y="3" width="3" height="9" rx="1" fill={col} /><rect x="13.5" y="0" width="3" height="12" rx="1" fill={col} opacity=".5" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5L.8 4.2a10.2 10.2 0 0 1 14.4 0z" fill={col} /></svg>
        <span style={{ width: 25, height: 12, borderRadius: 4, border: `1.5px solid ${col}`, padding: 1.5, display: 'flex' }}><i style={{ width: '72%', background: '#FFC93C', borderRadius: 2 }} /></span>
      </span>
    </div>
  );
}

/* ---------- Top tabs (ملكي / حفلات / فعالية) ---------- */
function TopTabs({ tabs, active, onChange, left }) {
  return (
    <div className="toptabs">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)} className={'ttab' + (active === t.id ? ' on' : '')}>
            {t.label}
            {active === t.id && <svg className="ttab-caret" width="22" height="9" viewBox="0 0 22 9"><path d="M0 9 L7 2 L10 5 L13 0 L22 9Z" fill="#0F2D6E" /></svg>}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>{left}</div>
    </div>
  );
}

/* ---------- Glossy round icon button ---------- */
function GlossBtn({ icon, onClick, size = 36, tone = 'gold' }) {
  const bg = tone === 'gold' ? 'radial-gradient(circle at 35% 30%,#FFF6D2,#F5C24A 50%,#B57A10)' : 'radial-gradient(circle at 35% 30%,#fff,#9ED2FF 50%,#2F78DC)';
  return <button onClick={onClick} className="press" style={{ width: size, height: size, borderRadius: '50%', background: bg, display: 'grid', placeItems: 'center', boxShadow: '0 3px 8px rgba(20,60,140,.3), inset 0 0 0 2px rgba(255,255,255,.7)' }}><Ic n={icon} s={size * .5} c="#fff" w={2.4} /></button>;
}

/* ---------- Room cover (typographic placeholder art) ---------- */
function Cover({ title = '', hue = 210, size = 110, radius = 14, glyph }) {
  const words = String(title).split(' ');
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, flexShrink: 0, position: 'relative', overflow: 'hidden',
      background: `radial-gradient(120% 90% at 80% 10%, hsl(${hue} 90% 72%), transparent 55%), radial-gradient(90% 80% at 10% 100%, hsl(${(hue + 40) % 360} 80% 45%), transparent 60%), linear-gradient(160deg, hsl(${hue} 65% 28%), hsl(${(hue + 25) % 360} 70% 14%))`,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.25)'
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.55) 1px, transparent 1.4px)', backgroundSize: '13px 13px', opacity: .25 }} />
      <div style={{ position: 'absolute', inset: 6, borderRadius: radius - 4, border: '1px solid rgba(255,230,170,.45)' }} />
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: 8 }}>
        <div>
          {glyph && <Ic n={glyph} s={size * .22} c="#FFE3A3" w={1.6} style={{ margin: '0 auto 2px', display: 'block' }} />}
          <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: size * .17, lineHeight: 1.1, background: 'linear-gradient(180deg,#FFF6D8,#F0BE52 60%,#B8801A)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.5))' }}>{words.slice(0, 2).join(' ')}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-page header ---------- */
function PageHeader({ title, onBack, right, transparent }) {
  return (
    <div className="pagehead" style={transparent ? { background: 'none' } : null}>
      <button className="press iconbtn" onClick={onBack}><Ic n="back" s={22} c="#0F2D6E" w={2.2} /></button>
      <div className="pagehead-title">{title}</div>
      <div style={{ minWidth: 36, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </div>
  );
}

/* ---------- Bottom navigation ---------- */
function NavCastle({ s = 40 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="ncW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#B9D9FB" /></linearGradient>
        <linearGradient id="ncG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE9A0" /><stop offset="1" stopColor="#D99A1E" /></linearGradient>
      </defs>
      <rect x="13" y="22" width="22" height="20" fill="url(#ncW)" />
      <ellipse cx="24" cy="22" rx="8" ry="8" fill="url(#ncG)" /><rect x="23.3" y="9" width="1.4" height="6" fill="#D99A1E" />
      <rect x="7" y="18" width="5" height="24" fill="url(#ncW)" /><polygon points="7,18 9.5,9 12,18" fill="url(#ncG)" />
      <rect x="36" y="18" width="5" height="24" fill="url(#ncW)" /><polygon points="36,18 38.5,9 41,18" fill="url(#ncG)" />
      <path d="M20 42v-7a4 4 0 0 1 8 0v7z" fill="#3D7FD8" />
      <rect x="5" y="41" width="38" height="3" rx="1.5" fill="#8EC1F5" />
    </svg>
  );
}
function NavLetter({ s = 40 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 48 48">
      <defs>
        <linearGradient id="nlG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFF0B8" /><stop offset="1" stopColor="#D08A12" /></linearGradient>
        <linearGradient id="nlW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#CFE6FF" /></linearGradient>
      </defs>
      <path d="M4 14 Q12 10 16 18 L10 22Z" fill="url(#nlG)" /><path d="M44 14 Q36 10 32 18 L38 22Z" fill="url(#nlG)" />
      <path d="M2 20 Q10 17 13 24 L8 27Z" fill="url(#nlG)" opacity=".8" /><path d="M46 20 Q38 17 35 24 L40 27Z" fill="url(#nlG)" opacity=".8" />
      <rect x="11" y="17" width="26" height="19" rx="3" fill="url(#nlW)" stroke="#D9A43A" strokeWidth="1.5" />
      <path d="M11.8 18 L24 28 L36.2 18" fill="none" stroke="#D9A43A" strokeWidth="1.6" />
      <circle cx="24" cy="28" r="3" fill="#2F7CF6" stroke="#FFE08A" strokeWidth="1" />
    </svg>
  );
}
function BottomNav({ tab, onTab, unread }) {
  const { me } = useApp();
  const items = [
    { id: 'party', label: 'حفلة', icon: (big) => <NavCastle s={big ? 46 : 38} /> },
    { id: 'msg', label: 'رسالة', icon: (big) => <NavLetter s={big ? 48 : 40} />, badge: unread },
    { id: 'me', label: 'أنا', icon: (big) => <Avatar name={me.name} hue={me.hue} size={big ? 44 : 34} frame={big ? 'ice' : undefined} /> },
  ];
  return (
    <div className="bnav">
      <div className="bnav-water" />
      <div className="shard s1" /><div className="shard s2" /><div className="shard s3" /><div className="shard s4" />
      {items.map(it => {
        const on = tab === it.id;
        return (
          <button key={it.id} className={'bnav-item' + (on ? ' on' : '')} onClick={() => onTab(it.id)}>
            <div className="bnav-ic">
              {on && <div className="bnav-halo" />}
              <div style={{ position: 'relative' }}>{it.icon(on)}</div>
              {it.badge > 0 && <span className="badge" style={{ position: 'absolute', top: on ? 2 : -2, right: on ? 4 : -6 }}>{it.badge}</span>}
            </div>
            <span className="bnav-label">{it.label}</span>
          </button>
        );
      })}
      <div className="homebar" />
    </div>
  );
}

/* ---------- Chips ---------- */
function Chip({ on, children, onClick }) {
  return <button onClick={onClick} className={'chip press' + (on ? ' on' : '')}>{on && <Ic n="snow" s={13} c="#fff" w={2} />}{children}</button>;
}

/* ---------- Bottom sheet ---------- */
function Sheet({ open, onClose, children, dark, h }) {
  return (
    <div className={'sheet-wrap' + (open ? ' open' : '')} onClick={onClose}>
      <div className={'sheet' + (dark ? ' dark' : '')} style={{ height: h }} onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

/* ---------- Data ---------- */
const ME0 = { id: 1031437, name: 'HAMO', hue: 212, lv: 3, vip: 0, following: 1, fans: 1, charm: 0, flag: 'eg', g: 'm', age: 26, bio: 'مرحباً بكم في غرفتي ❄' };
const USERS = [
  { id: 10107, name: 'حلا', hue: 340, flag: 'eg', lv: 27, vip: 6, g: 'f', age: 26, follows: 65, fans: 237, charm: '26.8M', friends: 61, frame: 'gold', bio: 'لا أشبه أحداً.. أنا نوع فريد للغاية', badges: 4 },
  { id: 1000210, name: 'User10', hue: 200, flag: 'eg', lv: 2, vip: 0, g: 'm', age: 21, follows: 3, fans: 1, charm: '120', friends: 1, bio: 'هذا الشخص كسول جدًا ولم يكتب أي شيء', badges: 0 },
  { id: 2002931, name: 'كايان', hue: 222, flag: 'iq', lv: 41, vip: 8, g: 'm', age: 29, follows: 120, fans: 5400, charm: '88.1M', friends: 320, frame: 'ice', bio: 'ملك الثروة ❄ الغرفة رقم 1', badges: 5 },
  { id: 3017285, name: 'نور', hue: 300, flag: 'eg', lv: 19, vip: 5, g: 'f', age: 23, follows: 80, fans: 1900, charm: '12.4M', friends: 140, frame: 'violet', bio: 'صوتك يونسني', badges: 3 },
  { id: 4410882, name: 'سيف', hue: 30, flag: 'sa', lv: 12, vip: 3, g: 'm', age: 31, follows: 40, fans: 300, charm: '1.2M', friends: 52, bio: 'هدوء واحترام', badges: 2 },
  { id: 5520114, name: 'ليان', hue: 170, flag: 'jo', lv: 15, vip: 4, g: 'f', age: 22, follows: 99, fans: 870, charm: '4.6M', friends: 77, frame: 'rose', bio: 'مذيعة في غرفة ديوان الأردن', badges: 2 },
  { id: 6630091, name: 'مازن', hue: 250, flag: 'ae', lv: 22, vip: 6, g: 'm', age: 34, follows: 33, fans: 1400, charm: '9.9M', friends: 88, frame: 'gold', bio: 'وكيل رسمي معتمد', badges: 4 },
  { id: 7740023, name: 'رهف', hue: 320, flag: 'ma', lv: 9, vip: 2, g: 'f', age: 20, follows: 210, fans: 160, charm: '640K', friends: 40, bio: 'من المغرب بكل حب', badges: 1 },
  { id: 8850776, name: 'عمر', hue: 190, flag: 'dz', lv: 7, vip: 1, g: 'm', age: 27, follows: 12, fans: 44, charm: '90K', friends: 15, bio: 'جزائري وأفتخر', badges: 1 },
  { id: 9960310, name: 'ياسمين', hue: 280, flag: 'lb', lv: 17, vip: 5, g: 'f', age: 25, follows: 70, fans: 990, charm: '7.1M', friends: 66, frame: 'violet', bio: 'أغاني فيروز كل ليلة', badges: 3 },
  { id: 1188204, name: 'خالد', hue: 210, flag: 'kw', lv: 30, vip: 7, g: 'm', age: 38, follows: 55, fans: 2600, charm: '33.0M', friends: 130, frame: 'gold', bio: 'الداعم الأول', badges: 5 },
];
const userById = (id) => USERS.find(u => u.id === id);

const ROOMS = [
  { id: 3017285, name: 'عسل بالشحن ومحلي', flag: 'eg', vip: 7, count: 24, hue: 18, badges: 4, owner: 10107, glyph: 'heart', topic: 'دردشة' },
  { id: 3011902, name: 'وك كل العرب', flag: 'eg', vip: 5, count: 21, hue: 196, badges: 0, owner: 3017285, glyph: 'globe', topic: 'تعارف' },
  { id: 3009921, name: 'باريس', flag: 'sy', vip: 4, count: 22, hue: 42, badges: 2, owner: 9960310, glyph: 'star', topic: 'افتتاح' },
  { id: 3004410, name: 'أمسية دينية', flag: 'eg', vip: 6, count: 24, hue: 262, badges: 1, owner: 6630091, glyph: 'pin', topic: 'قرآن وأناشيد' },
  { id: 3002201, name: 'ديوان الأردن', flag: 'jo', vip: 4, count: 17, hue: 150, badges: 2, owner: 5520114, glyph: 'crown', topic: 'شعر' },
  { id: 3001190, name: 'سهرة الخليج', flag: 'ae', vip: 6, count: 31, hue: 210, badges: 3, owner: 1188204, glyph: 'diamond', topic: 'غناء' },
  { id: 3000881, name: 'ليالي بغداد', flag: 'iq', vip: 8, count: 46, hue: 226, badges: 4, owner: 2002931, glyph: 'castle', topic: 'مقام' },
  { id: 3000552, name: 'انتظرونا الافتتاح', flag: 'ma', vip: 2, count: 9, hue: 330, badges: 0, owner: 7740023, glyph: 'rocket', topic: 'قريباً' },
  { id: 3000123, name: 'شباب الجزائر', flag: 'dz', vip: 1, count: 12, hue: 120, badges: 1, owner: 8850776, glyph: 'users', topic: 'ألعاب' },
];
const roomById = (id) => ROOMS.find(r => r.id === id);
const MY_ROOM = { id: 1031437, name: 'HAMO', flag: 'eg', vip: 0, count: 0, hue: 215, badges: 0, owner: 1031437, glyph: 'snow', topic: 'غرفتي', mine: true };

const GIFTS = [
  { id: 'rose', n: 'وردة', p: 1, ic: 'rose', c: ['#FFD1DF', '#E2366F'] },
  { id: 'heart', n: 'قلب', p: 10, ic: 'heart', c: ['#FFD6E2', '#F0466E'] },
  { id: 'ice', n: 'آيس كريم', p: 29, ic: 'ice', c: ['#E1F2FF', '#4A9BF0'] },
  { id: 'star', n: 'نجمة', p: 66, ic: 'star', c: ['#FFF3C4', '#F0A818'] },
  { id: 'crown', n: 'تاج', p: 199, ic: 'crown', c: ['#FFF0B8', '#D3920F'] },
  { id: 'ring', n: 'خاتم', p: 520, ic: 'ring', c: ['#E8F3FF', '#5B8FE0'] },
  { id: 'car', n: 'سيارة', p: 1999, ic: 'car', c: ['#DDEBFF', '#2C62C9'] },
  { id: 'rocket', n: 'صاروخ', p: 4999, ic: 'rocket', c: ['#FFE0CF', '#E8622B'] },
  { id: 'castle', n: 'قلعة الجليد', p: 9999, ic: 'castle', c: ['#E8F6FF', '#3A8BE8'] },
  { id: 'diamond', n: 'ماسة', p: 300, ic: 'diamond', c: ['#DCF4FF', '#1EA0E6'] },
  { id: 'medal', n: 'وسام', p: 888, ic: 'medal', c: ['#FFF0C2', '#C98C12'] },
  { id: 'trophy', n: 'كأس', p: 3000, ic: 'trophy', c: ['#FFF4CF', '#D59E1B'] },
];
function GiftArt({ g, s = 46 }) {
  return (
    <div style={{ width: s, height: s, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `radial-gradient(circle at 35% 28%, #fff, ${g.c[0]} 40%, ${g.c[1]})`, boxShadow: `0 4px 12px ${g.c[1]}66, inset 0 0 0 2px rgba(255,255,255,.7)` }}>
      <Ic n={g.ic} s={s * .52} c="#fff" w={1.9} style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.25))' }} />
    </div>
  );
}

const CHAT_LINES = ['مساء الخير يا جماعة 🌙', 'نورتوا الغرفة', 'الصوت واضح؟', 'أهلاً وسهلاً', 'تحية لكل الحضور', 'مين يغني الجاية؟', 'الله الله', 'شكراً على الهدية ❤', 'نزلوا المايك شوي', 'منورين يا غاليين', 'هههه', 'تسلم يا ذوق'];

Object.assign(window, {
  AppCtx, useApp, Ic, vipColors, hueOf, fmt, Avatar, Flag, FLAGS, VipTag, LvTag, GenderTag, Coin, Diamond, SkyBackdrop, StatusBar,
  TopTabs, GlossBtn, Cover, PageHeader, BottomNav, Chip, Sheet, NavCastle, NavLetter,
  ME0, USERS, userById, ROOMS, roomById, MY_ROOM, GIFTS, GiftArt, CHAT_LINES,
});
