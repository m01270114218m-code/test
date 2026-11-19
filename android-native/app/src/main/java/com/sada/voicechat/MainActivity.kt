package com.sada.voicechat

import android.os.Bundle
import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
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

data class SadaSession(val accessToken: String, val refreshToken: String, val userId: String, val phone: String = "", val expiresAt: Long = 0L)

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
    var profile by remember { mutableStateOf(JSONObject()) }
    var coins by remember { mutableStateOf(0L) }
    var diamonds by remember { mutableStateOf(0L) }
    val scope = rememberCoroutineScope()
    val bg = Color(0xFF071426)
    val panel = Color(0xFF10243D)
    val accent = Color(0xFF8CCBFF)

    suspend fun loadApp(s: SadaSession) {
        val p = JSONArray(api("/rest/v1/profiles?select=id,display_name,username,avatar_url,level&id=eq.${s.userId}", token = s.accessToken))
        profile = if (p.length() > 0) p.getJSONObject(0) else JSONObject()
        val r = JSONArray(api("/rest/v1/rooms?select=id,title,description,cover_url,owner_id,room_type&status=eq.active&limit=100", token = s.accessToken))
        rooms = (0 until r.length()).map { r.getJSONObject(it) }
        val g = JSONArray(api("/rest/v1/gifts?select=id,name,image_url,price,currency&is_active=eq.true&order=price.asc", token = s.accessToken))
        gifts = (0 until g.length()).map { g.getJSONObject(it) }
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
                                        api("/auth/v1/otp", "POST", JSONObject().put("phone", "+20" + phone).put("create_user", true))
                                        otpSent = true
                                    } else {
                                        val s = authBody(api("/auth/v1/verify", "POST", JSONObject().put("phone", "+20" + phone).put("token", otp).put("type", "sms")))
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
                                    prefs.edit().putString("session", JSONObject().put("access", s.accessToken).put("refresh", s.refreshToken).put("uid", s.userId).put("phone", s.phone).toString()).apply()
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
                        TextButton(onClick = { session = null; prefs.edit().remove("session").apply(); rooms = emptyList(); gifts = emptyList() }) { Text("خروج") }
                    }
                    Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = panel)) { Column(Modifier.padding(14.dp)) { Text("العملات", color = accent); Text(coins.toString(), color = Color.White, fontWeight = FontWeight.Bold) } }
                        Card(Modifier.weight(1f), colors = CardDefaults.cardColors(containerColor = panel)) { Column(Modifier.padding(14.dp)) { Text("الألماس", color = accent); Text(diamonds.toString(), color = Color.White, fontWeight = FontWeight.Bold) } }
                    }
                    Text("الغرف الصوتية", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White, modifier = Modifier.padding(vertical = 8.dp))
                    if (rooms.isEmpty()) Text("لا توجد غرف منشأة حالياً. أنشئ الغرف من لوحة الإدارة.", color = Color.LightGray)
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.weight(1f)) {
                        items(rooms) { room ->
                            Card(colors = CardDefaults.cardColors(containerColor = panel), shape = RoundedCornerShape(18.dp)) {
                                Column(Modifier.fillMaxWidth().padding(14.dp)) {
                                    Text(room.optString("title"), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                                    Text(room.optString("description"), color = Color.LightGray, fontSize = 13.sp)
                                    Text("غرفة حقيقية مسجلة في قاعدة البيانات · ${room.optString("room_type")}", color = accent, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                                }
                            }
                        }
                    }
                    Text("الهدايا المتاحة: ${gifts.size}", color = accent, modifier = Modifier.padding(top = 10.dp))
                    if (gifts.isNotEmpty()) Text(gifts.joinToString(" · ") { it.optString("name") }, color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}
