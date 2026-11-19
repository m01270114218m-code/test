(function () {
  const PROJECT = "https://pkqcxcfuelubonlkjgoq.supabase.co";
  const KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade";
  const SESSION_KEY = "sada.supabase.session";
  async function get(path, token) {
    const response = await fetch(PROJECT + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + token } });
    if (!response.ok) throw new Error("Supabase data request failed (" + response.status + ")");
    return response.json();
  }
  async function request(path, init) {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!session || !session.access_token) throw new Error("انتهت جلسة الدخول");
    const response = await fetch(PROJECT + path, { ...init, headers: { apikey: KEY, Authorization: "Bearer " + session.access_token, "Content-Type": "application/json", ...(init && init.headers || {}) } });
    const body = await response.text(); let result = null; try { result = body ? JSON.parse(body) : null; } catch (_) { result = body; }
    if (!response.ok) throw new Error(result && (result.message || result.msg || result.error) || body || "Supabase request failed");
    return result;
  }
  async function load() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!session || !session.access_token) { window.location.replace("/"); return; }
    const token = session.access_token;
    const userId = session.user && session.user.id;
    const results = await Promise.all([
      get("profiles?select=id,username,display_name,avatar_url,level,country,bio,account_status&account_status=eq.active&limit=500", token),
      get("rooms?select=id,owner_id,title,description,cover_url,room_type,status&status=eq.active&limit=200", token),
      get("gifts?select=id,name,image_url,price,currency&is_active=eq.true&order=price.asc", token),
      get("wallets?select=coins,diamonds&user_id=eq." + encodeURIComponent(userId) + "&limit=1", token),
      get("user_vips?select=expires_at,package_id&user_id=eq." + encodeURIComponent(userId) + "&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&limit=1", token)
    ]);
    const profiles = results[0] || [];
    const meRow = profiles.find(p => p.id === userId);
    const mapUser = p => ({ id:p.id, name:p.display_name || p.username || "عضو", hue:210, lv:p.level || 1, vip:0, following:0, fans:0, charm:0, flag:(p.country || "eg").toLowerCase(), g:"m", age:null, bio:p.bio || "", avatar_url:p.avatar_url });
    const me = meRow ? mapUser(meRow) : { id:userId, name:session.user?.phone || "عضو", hue:210, lv:1, vip:0, following:0, fans:0, charm:0, flag:"eg", g:"m", bio:"" };
    const users = profiles.map(mapUser);
    const rooms = (results[1] || []).map(r => ({ id:r.id, name:r.title, flag:"eg", vip:0, count:0, hue:210, badges:0, owner:r.owner_id, glyph:"users", topic:r.description || "دردشة", cover_url:r.cover_url, room_type:r.room_type }));
    const gifts = (results[2] || []).map(g => ({ id:g.id, n:g.name, p:Number(g.price), ic:"gift", c:["#D9E9FF","#397BC8"], image_url:g.image_url, currency:g.currency }));
    const wallet = (results[3] || [])[0] || { coins:0, diamonds:0 };
    const myRoom = { id:null, name:"غرفتي", flag:"eg", vip:0, count:0, hue:215, badges:0, owner:userId, glyph:"snow", topic:"غرفتي", mine:true };
    const data = { me, users, rooms, gifts, wallet, myRoom, vip:results[4] || [] };
    window.SADA_DATA = data;
    window.SADA_API = { rpc: (name, args) => request("/rest/v1/rpc/" + encodeURIComponent(name), { method: "POST", body: JSON.stringify(args) }), refresh: load };
    window.dispatchEvent(new CustomEvent("sada-data-ready", { detail:data }));
  }
  load().catch(error => console.error("[Sada data]", error));
  window.addEventListener("focus", () => load().catch(error => console.warn("[Sada refresh]", error)));
})();