(function () {
  const PROJECT = "https://pkqcxcfuelubonlkjgoq.supabase.co";
  const KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade";
  const SESSION_KEY = "sada.supabase.session";

  async function activeSession() {
    let session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!session || !session.access_token) throw new Error("انتهت جلسة الدخول");
    if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 45 && session.refresh_token) {
      const response = await fetch(PROJECT + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token })
      });
      const refreshed = await response.json();
      if (!response.ok) {
        localStorage.removeItem(SESSION_KEY);
        throw new Error("انتهت جلسة الدخول، سجّل الدخول مرة أخرى");
      }
      session = { ...refreshed, expires_at: Math.floor(Date.now() / 1000) + Number(refreshed.expires_in || 3600) };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  }

  async function get(path, token) {
    const response = await fetch(PROJECT + "/rest/v1/" + path, {
      headers: { apikey: KEY, Authorization: "Bearer " + token }
    });
    if (!response.ok) throw new Error("Supabase data request failed (" + response.status + ")");
    return response.json();
  }

  async function request(path, init) {
    const session = await activeSession();
    const response = await fetch(PROJECT + path, {
      ...init,
      headers: {
        apikey: KEY,
        Authorization: "Bearer " + session.access_token,
        "Content-Type": "application/json",
        ...(init && init.headers || {})
      }
    });
    const body = await response.text();
    let result = null;
    try { result = body ? JSON.parse(body) : null; } catch (_) { result = body; }
    if (!response.ok) throw new Error(result && (result.message || result.msg || result.error) || body || "Supabase request failed");
    return result;
  }

  async function load() {
    const session = await activeSession();
    const userId = session.user && session.user.id;
    if (!userId) throw new Error("تعذر قراءة هوية المستخدم");
    const token = session.access_token;
    const results = await Promise.all([
      get("profiles?select=id,username,display_name,avatar_url,level,country,bio,account_status,metadata&account_status=eq.active&limit=500", token),
      get("rooms?select=id,owner_id,title,description,cover_url,room_type,status&status=eq.active&limit=200", token),
      get("gifts?select=id,name,image_url,price,currency&is_active=eq.true&order=price.asc", token),
      get("wallets?select=coins,diamonds&user_id=eq." + encodeURIComponent(userId) + "&limit=1", token),
      get("user_vips?select=expires_at,package_id&user_id=eq." + encodeURIComponent(userId) + "&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&limit=1", token),
      get("room_seats?select=room_id,seat_number,user_id,seat_status&limit=2000", token),
      get("room_members?select=room_id,user_id,role&limit=2000", token)
    ]);
    const profiles = results[0] || [];
    const meRow = profiles.find(p => p.id === userId);
    const mapUser = p => ({
      id: p.id,
      name: p.display_name || p.username || "عضو",
      hue: 210,
      lv: p.level || 1,
      vip: 0,
      following: 0,
      fans: 0,
      charm: 0,
      flag: (p.country || "eg").toLowerCase(),
      g: "m",
      age: null,
      bio: p.bio || "",
      avatar_url: p.avatar_url,
      frame: p.metadata && (p.metadata.equipped_frame || p.metadata.frame)
    });
    const me = meRow ? mapUser(meRow) : {
      id: userId, name: session.user.phone || "عضو", hue: 210, lv: 1, vip: 0,
      following: 0, fans: 0, charm: 0, flag: "eg", g: "m", bio: ""
    };
    if ((results[4] || []).length) me.vip = 1;
    const users = profiles.map(mapUser);
    const seatRows = results[5] || [];
    const memberRows = results[6] || [];
    const rooms = (results[1] || []).map(r => {
      const seats = Array(8).fill(null);
      seatRows.filter(x => x.room_id === r.id).forEach(x => {
        const index = Number(x.seat_number);
        if (index >= 0 && index < seats.length) seats[index] = x.seat_status === "locked" ? "locked" : (users.find(u => u.id === x.user_id) || null);
      });
      const members = memberRows.filter(x => x.room_id === r.id).map(x => users.find(u => u.id === x.user_id)).filter(Boolean);
      return {
        id: r.id, name: r.title, flag: "eg", vip: 0, count: members.length, hue: 210,
        badges: 0, owner: r.owner_id, glyph: "users", topic: r.description || "دردشة",
        cover_url: r.cover_url, room_type: r.room_type, mine: r.owner_id === userId, seats, members
      };
    });
    const gifts = (results[2] || []).map(g => ({
      id: g.id, n: g.name, p: Number(g.price), ic: "gift",
      c: ["#D9E9FF", "#397BC8"], image_url: g.image_url, currency: g.currency
    }));
    const wallet = (results[3] || [])[0] || { coins: 0, diamonds: 0 };
    const myRoom = {
      id: null, name: "غرفتي", flag: "eg", vip: 0, count: 0, hue: 215,
      badges: 0, owner: userId, glyph: "snow", topic: "غرفتي", mine: true
    };
    const data = { me, users, rooms, gifts, wallet, myRoom, vip: results[4] || [] };
    window.SADA_DATA = data;
    window.SADA_API = {
      rpc: (name, args) => request("/rest/v1/rpc/" + encodeURIComponent(name), { method: "POST", body: JSON.stringify(args) }),
      select: path => request("/rest/v1/" + path, { method: "GET" }),
      insert: (table, values) => request("/rest/v1/" + table, { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(values) }),
      remove: (table, filter) => request("/rest/v1/" + table + "?" + filter, { method: "DELETE" }),
      refresh: load
    };
    window.dispatchEvent(new CustomEvent("sada-data-ready", { detail: data }));
  }

  load().catch(error => console.error("[Sada data]", error));
  window.addEventListener("focus", () => load().catch(error => console.warn("[Sada refresh]", error)));
  window.setInterval(() => load().catch(error => console.warn("[Sada refresh]", error)), 30000);
})();