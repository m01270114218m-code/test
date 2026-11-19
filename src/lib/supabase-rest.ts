const SUPABASE_URL = "https://pkqcxcfuelubonlkjgoq.supabase.co";
const SUPABASE_KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade";
const SESSION_KEY = "sada.supabase.session";

export type SadaSession = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; token_type?: string; user: { id: string; email?: string; phone?: string } };
export function getSession(): SadaSession | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) as SadaSession : null; } catch { return null; }
}
export function saveSession(session: SadaSession | null) {
  if (typeof window === "undefined") return;
  if (session) { const normalized = { ...session, expires_at: session.expires_at ?? (session.expires_in ? Math.floor(Date.now()/1000) + session.expires_in : undefined) }; localStorage.setItem(SESSION_KEY, JSON.stringify(normalized)); } else localStorage.removeItem(SESSION_KEY);
}
async function refreshSession(session: SadaSession) {
  if (!session.refresh_token) throw new Error("انتهت جلسة الدخول. سجّل الدخول مرة أخرى.");
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
  const data = await response.json();
  if (!response.ok) { saveSession(null); throw new Error(data?.msg || data?.message || "انتهت جلسة الدخول."); }
  saveSession(data as SadaSession); return getSession() as SadaSession;
}
async function request(path: string, init: RequestInit = {}, session?: SadaSession | null) {
  let active = session ?? getSession();
  if (active?.expires_at && active.expires_at <= Math.floor(Date.now()/1000) + 45) active = await refreshSession(active);
  const token = active?.access_token ?? SUPABASE_KEY;
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const raw = await response.text();
  let data: any = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || raw || `HTTP ${response.status}`);
  return { data, response };
}
export async function signInWithPassword(email: string, password: string) {
  const { data } = await request("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }, null);
  saveSession(data as SadaSession);
  return data as SadaSession;
}
export async function sendPhoneOtp(phone: string) {
  await request("/auth/v1/otp", { method: "POST", body: JSON.stringify({ phone, create_user: true }) }, null);
}
export async function verifyPhoneOtp(phone: string, token: string) {
  const { data } = await request("/auth/v1/verify", { method: "POST", body: JSON.stringify({ phone, token, type: "sms" }) }, null);
  saveSession(data as SadaSession);
  return data as SadaSession;
}
export async function signOut() {
  try { await request("/auth/v1/logout", { method: "POST" }); } finally { saveSession(null); }
}
export async function currentUser(session?: SadaSession | null) {
  const { data } = await request("/auth/v1/user", {}, session);
  return data;
}
export async function isAdmin(session?: SadaSession | null) {
  const { data } = await request("/rest/v1/rpc/is_app_admin", { method: "POST", body: "{}" }, session);
  return data === true;
}
export async function selectRows<T = any>(table: string, query = "select=*") {
  const { data } = await request(`/rest/v1/${table}?${query}`);
  return data as T[];
}
export async function insertRow(table: string, values: unknown, prefer = "return=representation") {
  const { data } = await request(`/rest/v1/${table}`, { method: "POST", headers: { Prefer: prefer }, body: JSON.stringify(values) });
  return data;
}
export async function upsertRow(table: string, values: unknown, onConflict: string) {
  const { data } = await request(`/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(values) });
  return data;
}
export async function deleteRows(table: string, query: string) {
  const { data } = await request(`/rest/v1/${table}?${query}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  return data;
}
export async function updateRows(table: string, query: string, values: unknown) {
  const { data } = await request(`/rest/v1/${table}?${query}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(values) });
  return data;
}
export async function callRpc<T = any>(name: string, args: Record<string, unknown>) {
  const { data } = await request(`/rest/v1/rpc/${name}`, { method: "POST", body: JSON.stringify(args) });
  return data as T;
}
export async function uploadAsset(file: File, path: string) {
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  const token = getSession()?.access_token ?? SUPABASE_KEY;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sada-app-assets/${safePath}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
    body: file,
  });
  const raw = await response.text();
  if (!response.ok) throw new Error(raw || `Upload failed: ${response.status}`);
  return `${SUPABASE_URL}/storage/v1/object/public/sada-app-assets/${safePath}`;
}
export function publicAssetUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/sada-app-assets/${path.split("/").map(encodeURIComponent).join("/")}`;
}
export const supabaseProjectUrl = SUPABASE_URL;
