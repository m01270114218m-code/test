import { createClient } from "npm:@supabase/supabase-js@2";
import { RtcRole, RtcTokenBuilder } from "npm:agora-token@2.0.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stableUid(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (Math.imul(31, hash) + userId.charCodeAt(i)) | 0;
  return (hash & 0x7fffffff) || 1;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\\s+/i, "");
    if (!jwt) return json({ error: "Authentication required" }, 401);

    const appCertificate = Deno.env.get("AGORA_APP_CERTIFICATE");
    const configuredAppId = Deno.env.get("AGORA_APP_ID");
    if (!appCertificate) return json({ error: "AGORA_APP_CERTIFICATE is not configured in Supabase secrets" }, 503);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) return json({ error: "Invalid or expired Supabase session" }, 401);

    const payload = await req.json();
    const appId = configuredAppId || String(payload.appId ?? "");
    const channel = String(payload.channel ?? "");
    const uid = stableUid(user.id);
    if (!appId || !channel || channel.length > 64 || Number(payload.uid) !== uid) {
      return json({ error: "Invalid Agora app id, channel, or user id" }, 400);
    }

    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id,owner_id,agora_channel,status")
      .eq("agora_channel", channel)
      .eq("status", "active")
      .maybeSingle();
    if (roomError || !room) return json({ error: "Room not found or inactive" }, 404);

    const { data: membership } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .maybeSingle();
    const isOwner = room.owner_id === user.id;
    if (!membership && !isOwner) return json({ error: "Join the room before requesting an RTC token" }, 403);

    const { data: seat } = await supabase
      .from("room_seats")
      .select("id")
      .eq("room_id", room.id)
      .eq("user_id", user.id)
      .maybeSingle();
    const role = isOwner || seat ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channel,
      uid,
      role,
      expiresAt,
    );
    return json({ rtcToken, uid, role: isOwner || seat ? "publisher" : "subscriber", expiresAt });
  } catch (error) {
    console.error("agora-token error", error);
    return json({ error: "Unable to generate Agora token" }, 500);
  }
});
