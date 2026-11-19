package com.sada.voicechat

import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val PROJECT_URL = "https://pkqcxcfuelubonlkjgoq.supabase.co"
private const val PUBLISHABLE_KEY = "sb_publishable_rTPtpxMftXim8X_Re9LxMg_vZaF_ade"
private const val PREFS = "sada_auth"
private const val ASSET_ORIGIN = "https://appassets.androidplatform.net"

private suspend fun supabase(path: String, body: JSONObject): JSONObject = withContext(Dispatchers.IO) {
    val connection = (URL(PROJECT_URL + path).openConnection() as HttpURLConnection).apply {
        requestMethod = "POST"
        connectTimeout = 20000
        readTimeout = 25000
        doOutput = true
        setRequestProperty("apikey", PUBLISHABLE_KEY)
        setRequestProperty("Authorization", "Bearer $PUBLISHABLE_KEY")
        setRequestProperty("Content-Type", "application/json")
    }
    connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
    val code = connection.responseCode
    val stream = if (code in 200..299) connection.inputStream else connection.errorStream
    val response = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
    connection.disconnect()
    if (code !in 200..299) {
        val message = try {
            val json = JSONObject(response)
            json.optString("msg", json.optString("message", json.optString("error_description", response)))
        } catch (_: Exception) { response }
        throw IllegalStateException(message.ifBlank { "تعذر تسجيل الدخول ($code)" })
    }
    JSONObject(response)
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = android.graphics.Color.rgb(7, 26, 58)
        window.navigationBarColor = android.graphics.Color.rgb(7, 26, 58)
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        setContent {
            var session by remember { mutableStateOf(prefs.getString("session", null)) }
            var phone by remember { mutableStateOf("") }
            var password by remember { mutableStateOf("") }
            var busy by remember { mutableStateOf(false) }
            var error by remember { mutableStateOf("") }
            val scope = rememberCoroutineScope()

            MaterialTheme(colorScheme = darkColorScheme(
                primary = Color(0xFF8CCBFF),
                background = Color(0xFF071A3A),
                surface = Color(0xFF102B58),
                onSurface = Color.White
            )) {
                if (session != null) {
                    key(session) {
                        SadaWebApp(
                            sessionJson = session!!,
                            onLogout = {
                                prefs.edit().remove("session").apply()
                                session = null
                                password = ""
                            }
                        )
                    }
                } else {
                    Surface(Modifier.fillMaxSize(), color = Color(0xFF071A3A)) {
                        Column(
                            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(26.dp),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("صدى", fontSize = 46.sp, color = Color.White)
                            Text("غرف الدردشة الصوتية", color = Color(0xFF8CCBFF), fontSize = 16.sp)
                            Spacer(Modifier.height(36.dp))
                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it.filter { c -> c.isDigit() || c == '+' } },
                                label = { Text("رقم الهاتف") },
                                placeholder = { Text("رقم الهاتف مع مفتاح الدولة") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(Modifier.height(12.dp))
                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("كلمة المرور") },
                                visualTransformation = PasswordVisualTransformation(),
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(Modifier.height(20.dp))
                            Button(
                                onClick = {
                                    scope.launch {
                                        busy = true
                                        error = ""
                                        try {
                                            val digits = phone.trim().replace(" ", "").replace("-", "")
                                            val e164 = when {
                                                digits.startsWith("+") -> digits
                                                digits.startsWith("0") -> "+20" + digits.drop(1)
                                                digits.startsWith("20") -> "+" + digits
                                                else -> "+20" + digits
                                            }
                                            val response = supabase(
                                                "/auth/v1/token?grant_type=password",
                                                JSONObject().put("phone", e164).put("password", password)
                                            )
                                            if (!response.has("access_token") || !response.has("user")) {
                                                throw IllegalStateException("Supabase لم يرجع جلسة دخول صالحة")
                                            }
                                            response.put("expires_at", System.currentTimeMillis() / 1000 + response.optLong("expires_in", 3600))
                                            val saved = response.toString()
                                            prefs.edit().putString("session", saved).apply()
                                            session = saved
                                        } catch (e: Exception) {
                                            error = e.message ?: "تعذر تسجيل الدخول"
                                        } finally {
                                            busy = false
                                        }
                                    }
                                },
                                enabled = !busy && phone.filter(Char::isDigit).length >= 8 && password.isNotBlank(),
                                modifier = Modifier.fillMaxWidth().height(52.dp)
                            ) { Text(if (busy) "جارٍ تسجيل الدخول…" else "تسجيل الدخول") }
                            if (error.isNotBlank()) {
                                Spacer(Modifier.height(14.dp))
                                Text(error, color = Color(0xFFFF9BA8))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SadaWebApp(sessionJson: String, onLogout: () -> Unit) {
    val context = androidx.compose.ui.platform.LocalContext.current
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { ctx ->
            val assetLoader = WebViewAssetLoader.Builder()
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(ctx))
                .build()
            WebView(ctx).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.databaseEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = true
                settings.javaScriptCanOpenWindowsAutomatically = false
                settings.setSupportMultipleWindows(false)
                webViewClient = object : WebViewClientCompat() {
                    override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? {
                        return assetLoader.shouldInterceptRequest(request.url)
                    }
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        val url = request.url.toString()
                        if (url == "$ASSET_ORIGIN/" || url == "$ASSET_ORIGIN") {
                            onLogout()
                            return true
                        }
                        return !url.startsWith(ASSET_ORIGIN + "/") &&
                            !url.startsWith("https://pkqcxcfuelubonlkjgoq.supabase.co/") &&
                            !url.startsWith("https://fonts.googleapis.com/") &&
                            !url.startsWith("https://fonts.gstatic.com/") &&
                            !url.startsWith("https://unpkg.com/")
                    }
                    override fun onPageFinished(view: WebView, url: String) {
                        if (url.endsWith("/assets/bootstrap.html")) {
                            val encoded = JSONObject.quote(sessionJson)
                            view.evaluateJavascript(
                                "localStorage.setItem('sada.supabase.session', $encoded);" +
                                "window.location.replace('$ASSET_ORIGIN/assets/www/sada.html');",
                                null
                            )
                        }
                    }
                }
                loadUrl("$ASSET_ORIGIN/assets/bootstrap.html")
            }
        }
    )
}
