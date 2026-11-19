package com.sada.voicechat

import android.os.Bundle
import android.Manifest
import android.content.pm.PackageManager
import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import android.net.Uri
import android.widget.VideoView
import androidx.compose.ui.viewinterop.AndroidView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val PROJECT_URL = "https://pkqcxcfuelubonlkjgoq.supabase.co"
private const val PUBLISHABLE_KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade"
private const val PREFS = "sada_auth"
private fun publicAssetUrl(path: String): String = PROJECT_URL + "/storage/v1/object/public/sada-app-assets/" + path.split("/").joinToString("/") { Uri.encode(it) }

data class SadaSession(val accessToken: String, val refreshToken: String, val userId: String, val phone: String = "", val expiresAt: Long = 0L)

private fun stableAgoraUid(userId: String): Int {
    var hash = 0
    userId.forEach { hash = 31 * hash + it.code }
    return (hash and 0x7fffffff).takeIf { it != 0 } ?: 1
}

private suspend fun api(path: String, method: String = "GET", body: JSONObject? = null, token: String? = null): String =
    withContext(Dispatchers.IO) {
        val connection = URL(PROJECT_URL + path).openConnection() as HttpURLConnection
        connection.requestMethod = method
        connection.connectTimeout = 15000
        connection.readTimeout = 20000
        connection.setRequestProperty("apikey", PUBLISHABLE_KEY)
        connection.setRequestProperty("Authorization", "Bearer ${token ?: PUBLISHABLE_KEY}")
        connection.setRequestProperty("Content-Type", "application/json")
        if (body != null) {
            connection.doOutput = true
            connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
        }
        val code = connection.responseCode
        val stream = if (code in 200..299) connection.inputStream else connection.errorStream
        val text = stream?.bufferedReader()?.use { it.readText() } ?: ""
        connection.disconnect()
        if (code !in 200..299) {
            val message = try { JSONObject(text).optString("message", JSONObject(text).optString("msg", text)) } catch (_: Exception) { text }
            throw IllegalStateException(message.ifBlank { "HTTP $code" })
        }
        text
    }

private fun authBody(json: String): SadaSession {
    val data = JSONObject(json)
    val user = data.optJSONObject("user") ?: throw IllegalStateException("Supabase لم يرجع بيانات المستخدم")
    return SadaSession(data.getString("access_token"), data.getString("refresh_token"), user.getString("id"), user.optString("phone"), System.currentTimeMillis() / 1000 + data.optLong("expires_in", 3600))
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { SadaNativeApp(this) }
    }
}

@Composable
private fun SadaNativeApp(context: Context) {
    val prefs = remember { context.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
    var session by remember {
        mutableStateOf(prefs.getString("session", null)?.let {
            try { val j = JSONObject(it); SadaSession(j.getString("access"), j.getString("refresh"), j.getString("uid"), j.optString("phone"), j.optLong("expires")) } catch (_: Exception) { null }
        })
    }
    var mode by remember { mutableStateOf("phone") }
    var phone by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var otp by remember { mutableStateOf("") }
    var otpSent by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    var rooms by remember { mutableStateOf(listOf<JSONObject>()) }
    var gifts by remember { mutableStateOf(listOf<JSONObject>()) }
    var assets by remember { mutableStateOf(listOf<JSONObject>()) }
    var profile by remember { mutableStateOf(JSONObject()) }
    var coins by remember { mutableStateOf(0L) }
    var diamonds by remember { mutableStateOf(0L) }
    var agoraAppId by remember { mutableStateOf("") }
    var activeRoom by remember { mutableStateOf<JSONObject?>(null) }
    var pendingRoom by remember { mutableStateOf<JSONObject?>(null) }
    var rtcRole by remember { mutableStateOf("") }
    var rtcStatus by remember { mutableStateOf("غير متصل") }
    var muted by remember { mutableStateOf(false) }
    var busyRoom by remember { mutableStateOf(false) }
    val rtc = remember(context) { AgoraVoiceManager(context) { status -> rtcStatus = status } }
    val scope = rememberCoroutineScope()
    val bg = Color(0xFF071426)
    val panel = Color(0xFF10243D)
    val accent = Color(0xFF8CCBFF)
    fun startRoom(room: JSONObject) {
        val s = session ?: return
        scope.launch {
            busyRoom = true; error = ""
            try {
                if (agoraAppId.isBlank()) throw IllegalStateException("أضف agora_app_id في إعدادات Supabase العامة أولاً")
                val roomId = room.getString("id")
                val channel = room.optString("agora_channel")
                if (channel.isBlank()) throw IllegalStateException("قناة Agora غير مهيأة لهذه الغرفة")
                val memberPath = "/rest/v1/room_members?select=user_id&room_id=eq." + roomId + "&user_id=eq." + s.userId
                val memberRows = JSONArray(api(memberPath, token = s.accessToken))
                if (memberRows.length() == 0) api("/rest/v1/room_members", "POST", JSONObject().put("room_id", roomId).put("user_id", s.userId).put("role", "member"), s.accessToken)
                val uid = stableAgoraUid(s.userId)
                val tokenData = JSONObject(api("/functions/v1/agora-token", "POST", JSONObject().put("appId", agoraAppId).put("channel", channel).put("uid", uid), s.accessToken))
                rtcRole = tokenData.optString("role", "subscriber")
                rtc.join(agoraAppId, tokenData.getString("rtcToken"), channel, uid, rtcRole)
                activeRoom = room
                muted = false
            } catch (e: Exception) { error = e.message ?: "تعذر دخول الغرفة الصوتية" }
            finally { busyRoom = false }
        }
    }

    fun leaveRoom() {
        val room = activeRoom ?: return
        val s = session
        rtc.leave()
        if (s != null) scope.launch {
            try {
                api("/rest/v1/room_seats?room_id=eq." + room.getString("id") + "&user_id=eq." + s.userId, "DELETE", token = s.accessToken)
                api("/rest/v1/room_members?room_id=eq." + room.getString("id") + "&user_id=eq." + s.userId, "DELETE", token = s.accessToken)
            } catch (_: Exception) { }
        }
        activeRoom = null; rtcRole = ""; rtcStatus = "غير متصل"; muted = false
    }

    fun takeMicrophoneSeat() {
        val room = activeRoom ?: return
        val s = session ?: return
        scope.launch {
            busyRoom = true
            try {
                val roomId = room.getString("id")
                val occupied = JSONArray(api("/rest/v1/room_seats?select=seat_number&room_id=eq." + roomId, token = s.accessToken))
                val used = (0 until occupied.length()).map { occupied.getJSONObject(it).optInt("seat_number") }.toSet()
                val seatNumber = (0..7).firstOrNull { it !in used } ?: throw IllegalStateException("كل المقاعد مشغولة")
                api("/rest/v1/room_seats", "POST", JSONObject().put("room_id", roomId).put("seat_number", seatNumber).put("user_id", s.userId).put("seat_status", "occupied"), s.accessToken)
                val uid = stableAgoraUid(s.userId)
                val tokenData = JSONObject(api("/functions/v1/agora-token", "POST", JSONObject().put("appId", agoraAppId).put("channel", room.optString("agora_channel")).put("uid", uid), s.accessToken))
                rtcRole = tokenData.optString("role", "subscriber")
                rtc.join(agoraAppId, tokenData.getString("rtcToken"), room.optString("agora_channel"), uid, rtcRole)
                rtcStatus = "تم تفعيل الميكروفون"
            } catch (e: Exception) { error = e.message ?: "تعذر حجز الميكروفون" }
            finally { busyRoom = false }
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        val room = pendingRoom
        pendingRoom = null
        if (granted && room != null) startRoom(room) else if (!granted) error = "يجب السماح باستخدام الميكروفون لدخول الغرفة الصوتية"
    }

    suspend fun loadApp(s: SadaSession) {
        val p = JSONArray(api("/rest/v1/profiles?select=id,display_name,username,avatar_url,level&id=eq.${s.userId}", token = s.accessToken))
        profile = if (p.length() > 0) p.getJSONObject(0) else JSONObject()
        val r = JSONArray(api("/rest/v1/rooms?select=id,title,description,cover_url,owner_id,room_type,agora_channel&status=eq.active&limit=100", token = s.accessToken))
        rooms = (0 until r.length()).map { r.getJSONObject(it) }
        val g = JSONArray(api("/rest/v1/gifts?select=id,name,image_url,price,currency&is_active=eq.true&order=price.asc", token = s.accessToken))
        gifts = (0 until g.length()).map { g.getJSONObject(it) }
        val a = JSONArray(api("/rest/v1/app_assets?select=asset_key,title,category,storage_path,mime_type,metadata&is_active=eq.true&limit=500", token = s.accessToken))
        assets = (0 until a.length()).map { a.getJSONObject(it) }
        val config = JSONArray(api("/rest/v1/app_settings?select=value&setting_key=eq.agora_app_id&is_public=eq.true&limit=1", token = s.accessToken))
        if (config.length() > 0) {
            val value = config.getJSONObject(0).opt("value")
            agoraAppId = if (value is JSONObject) value.optString("app_id") else value?.toString()?.trim('"') ?: ""
        }
        val w = JSONArray(api("/rest/v1/wallets?select=coins,diamonds&user_id=eq.${s.userId}&limit=1", token = s.accessToken))
        if (w.length() > 0) { coins = w.getJSONObject(0).optLong("coins"); diamonds = w.getJSONObject(0).optLong("diamonds") }
    }

    LaunchedEffect(session?.accessToken) {
        var active = session ?: return@LaunchedEffect
        try {
            if (active.expiresAt <= System.currentTimeMillis() / 1000 + 60) {
                active = authBody(api("/auth/v1/token?grant_type=refresh_token", "POST", JSONObject().put("refresh_token", active.refreshToken)))
                session = active
                prefs.edit().putString("session", JSONObject().put("access", active.accessToken).put("refresh", active.refreshToken).put("uid", active.userId).put("phone", active.phone).put("expires", active.expiresAt).toString()).apply()
            }
            loadApp(active)
        } catch (e: Exception) { error = e.message ?: "تعذر تحميل بيانات التطبيق" }
    }

    MaterialTheme(colorScheme = darkColorScheme(primary = accent, background = bg, surface = panel, onSurface = Color.White)) {
        Surface(Modifier.fillMaxSize(), color = bg) {
            if (session == null) {
                Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("صدى", fontSize = 42.sp, fontWeight = FontWeight.Black, color = Color.White)
                    Text("غرف صوتية بلا حدود", color = accent, modifier = Modifier.padding(bottom = 28.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        FilterChip(selected = mode == "phone", onClick = { mode = "phone"; error = "" }, label = { Text("الهاتف") })
                        FilterChip(selected = mode == "email", onClick = { mode = "email"; error = "" }, label = { Text("البريد") })
                    }
                    Spacer(Modifier.height(16.dp))
                    if (mode == "phone") {
                        OutlinedTextField(value = phone, onValueChange = { phone = it.filter(Char::isDigit) }, label = { Text("رقم الهاتف مع مفتاح الدولة") }, placeholder = { Text("+2010...") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone), modifier = Modifier.fillMaxWidth())
                        if (otpSent) OutlinedTextField(value = otp, onValueChange = { otp = it.filter(Char::isDigit).take(6) }, label = { Text("رمز التحقق") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), modifier = Modifier.fillMaxWidth())
                        Button(enabled = !busy && if (otpSent) otp.length == 6 else phone.length >= 8, onClick = {
                            scope.launch {
                                busy = true; error = ""
                                try {
                                    if (!otpSent) {
                                        api("/auth/v1/otp", "POST", JSONObject().put("phone", "+20" + phone.removePrefix("0")).put("create_user", true))
                                        otpSent = true
                                    } else {
                                        val s = authBody(api("/auth/v1/verify", "POST", JSONObject().put("phone", "+20" + phone.removePrefix("0")).put("token", otp).put("type", "sms")))
                                        session = s
                                        prefs.edit().putString("session", JSONObject().put("access", s.accessToken).put("refresh", s.refreshToken).put("uid", s.userId).put("phone", s.phone).put("expires", s.expiresAt).toString()).apply()
                                    }
                                } catch (e: Exception) { error = e.message ?: "فشل التحقق" }
                                finally { busy = false }
                            }
                        }, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) { Text(if (busy) "جارٍ التنفيذ…" else if (otpSent) "تأكيد الدخول" else "إرسال رمز التحقق") }
                    } else {
                        OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("البريد الإلكتروني") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email), modifier = Modifier.fillMaxWidth())
                        OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("كلمة المرور") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth())
                        Button(enabled = !busy && email.contains("@") && password.length >= 6, onClick = {
                            scope.launch {
                                busy = true; error = ""
                                try {
                                    val s = authBody(api("/auth/v1/token?grant_type=password", "POST", JSONObject().put("email", email).put("password", password)))
                                    session = s
                                    prefs.edit().putString("session", JSONObject().put("access", s.accessToken).put("refresh", s.refreshToken).put("uid", s.userId).put("phone", s.phone).put("expires", s.expiresAt).toString()).apply()
                                } catch (e: Exception) { error = e.message ?: "فشل تسجيل الدخول" }
                                finally { busy = false }
                            }
                        }, modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) { Text(if (busy) "جارٍ الدخول…" else "تسجيل الدخول") }
                    }
                    if (error.isNotBlank()) Text(error, color = Color(0xFFFF8A9B), modifier = Modifier.padding(top = 12.dp))
                    Text("تسجيل الدخول يتم مباشرة عبر Supabase Auth", color = Color.LightGray, fontSize = 12.sp, modifier = Modifier.padding(top = 22.dp))
                }
            } else {
                Column(Modifier.fillMaxSize().padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column { Text("صدى", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White); Text(profile.optString("display_name", "مرحباً بك"), color = accent) }
                        TextButton(onClick = { leaveRoom(); session = null; prefs.edit().remove("session").apply(); rooms = emptyList(); gifts = emptyList() }) { Text("خروج") }
                    }
                    Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = panel)) { Column(Modifier.padding(14.dp)) { Text("العملات", color = accent); Text(coins.toString(), color = Color.White, fontWeight = FontWeight.Bold) } }
                        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = panel)) { Column(Modifier.padding(14.dp)) { Text("الألماس", color = accent); Text(diamonds.toString(), color = Color.White, fontWeight = FontWeight.Bold) } }
                    }
                    activeRoom?.let { room ->
                        Card(colors = CardDefaults.cardColors(containerColor = panel), shape = RoundedCornerShape(18.dp), modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                            Column(Modifier.padding(14.dp)) {
                                Text("أنت داخل: " + room.optString("title"), color = Color.White, fontWeight = FontWeight.Bold)
                                Text(rtcStatus, color = accent, fontSize = 12.sp, modifier = Modifier.padding(vertical = 6.dp))
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    if (rtcRole == "subscriber") Button(enabled = !busyRoom, onClick = { takeMicrophoneSeat() }) { Text("اصعد للميكروفون") }
                                    if (rtcRole == "publisher") Button(onClick = { muted = !muted; rtc.mute(muted) }) { Text(if (muted) "فتح الميكروفون" else "كتم الميكروفون") }
                                    OutlinedButton(onClick = { leaveRoom() }) { Text("مغادرة الغرفة") }
                                }
                            }
                        }
                    }
                    if (error.isNotBlank()) Text(error, color = Color(0xFFFF8A9B), fontSize = 12.sp, modifier = Modifier.padding(bottom = 8.dp))
                    Text("الغرف الصوتية", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(vertical = 8.dp))
                    if (rooms.isEmpty()) Text("لا توجد غرف منشأة حالياً. أنشئ الغرف من لوحة الإدارة.", color = Color.LightGray)
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                        items(rooms) { room ->
                            Card(colors = CardDefaults.cardColors(containerColor = panel), shape = RoundedCornerShape(18.dp)) {
                                Column(Modifier.fillMaxWidth().padding(14.dp)) {
                                    Text(room.optString("title"), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                                    Text(room.optString("description"), color = Color.LightGray, fontSize = 13.sp)
                                    Text("غرفة حقيقية مسجلة في قاعدة البيانات · ${room.optString("room_type")}", color = accent, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                                    Button(enabled = activeRoom == null && !busyRoom, onClick = { if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startRoom(room) else { pendingRoom = room; permissionLauncher.launch(Manifest.permission.RECORD_AUDIO) } }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) { Text(if (busyRoom) "جارٍ الاتصال…" else "دخول الغرفة صوتياً") }
                                }
                            }
                        }
                    }
                    Text("الهدايا المتاحة: ${gifts.size}", color = accent, modifier = Modifier.padding(top = 10.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(gifts) { gift ->
                            Card(colors = CardDefaults.cardColors(containerColor = panel), shape = RoundedCornerShape(14.dp)) {
                                Column(Modifier.width(116.dp).padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    val imageUrl = gift.optString("image_url")
                                    if (imageUrl.isNotBlank()) AsyncImage(model = imageUrl, contentDescription = gift.optString("name"), modifier = Modifier.size(70.dp))
                                    Text(gift.optString("name"), color = Color.White, fontWeight = FontWeight.Bold)
                                    Text(gift.optString("price") + " " + gift.optString("currency"), color = accent, fontSize = 11.sp)
                                }
                            }
                        }
                    }
                    Text("أصول التطبيق", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(top = 14.dp, bottom = 8.dp))
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(assets) { asset ->
                            Card(colors = CardDefaults.cardColors(containerColor = panel), shape = RoundedCornerShape(14.dp)) {
                                Column(Modifier.width(120.dp).padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                    val path = asset.optString("storage_path")
                                    if (path.isNotBlank() && asset.optString("mime_type").startsWith("image/")) AsyncImage(model = publicAssetUrl(path), contentDescription = asset.optString("title"), modifier = Modifier.size(76.dp)) else if (path.isNotBlank() && asset.optString("mime_type").startsWith("video/")) AndroidView(factory = { ctx -> VideoView(ctx).apply { setVideoURI(android.net.Uri.parse(publicAssetUrl(path))); setOnPreparedListener { player -> player.isLooping = true; start() } } }, modifier = Modifier.size(76.dp))
                                    Text(asset.optString("title"), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                    Text(asset.optString("category"), color = accent, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
