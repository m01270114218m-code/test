package com.sada.voicechat

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.*
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.*
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import coil.compose.AsyncImage
import org.json.JSONObject

private val IceBg = Color(0xFFEAF3FF)
private val IceInk = Color(0xFF0F2D6E)
private val IceBlue = Color(0xFF3B82E6)
private val IceMuted = Color(0xFF7B8DB5)
private val IceGold = Color(0xFFE9B64B)
private val IceCard = Color(0xFFF8FBFF)

@Composable
private fun IceCard(modifier: Modifier = Modifier, content: @Composable ColumnScope.() -> Unit) {
    Card(modifier, shape = RoundedCornerShape(18.dp), colors = CardDefaults.cardColors(containerColor = Color.White), elevation = CardDefaults.cardElevation(3.dp), content = content)
}

@Composable
private fun FrostHeader(title: String, subtitle: String = "", onBack: (() -> Unit)? = null, trailing: @Composable RowScope.() -> Unit = {}) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        if (onBack != null) IconButton(onClick = onBack) { Icon(Icons.Default.ArrowForward, null, tint = IceInk) }
        Column(Modifier.weight(1f)) {
            Text(title, color = IceInk, fontSize = 23.sp, fontWeight = FontWeight.ExtraBold)
            if (subtitle.isNotBlank()) Text(subtitle, color = IceMuted, fontSize = 12.sp)
        }
        Row(content = trailing)
    }
}

@Composable
private fun FrostBackdrop() {
    Box(Modifier.fillMaxWidth().height(226.dp).background(Brush.verticalGradient(listOf(Color(0xFF2F6FD0), Color(0xFF82B7ED), IceBg)))) {
        repeat(46) { i ->
            val x = (i * 67 % 360).dp
            val y = (i * 41 % 190).dp
            Box(Modifier.offset(x, y).size(if (i % 4 == 0) 3.dp else 2.dp).background(Color.White.copy(alpha = .55f), CircleShape))
        }
        Text("❄", Modifier.align(Alignment.BottomEnd).padding(end = 25.dp, bottom = 24.dp), color = Color.White.copy(alpha = .6f), fontSize = 56.sp)
    }
}

@Composable
private fun FrostChip(text: String, selected: Boolean, onClick: () -> Unit) {
    Surface(onClick = onClick, shape = CircleShape, color = if (selected) IceBlue else Color.White, border = BorderStroke(1.dp, if (selected) Color(0xFFBFE0FF) else Color(0xFFD7E3F3))) {
        Text(text, Modifier.padding(horizontal = 16.dp, vertical = 8.dp), color = if (selected) Color.White else IceInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun FrostAvatar(name: String, url: String = "", size: Dp = 48.dp, frame: Boolean = false) {
    Box(Modifier.size(size).then(if (frame) Modifier.border(3.dp, Brush.sweepGradient(listOf(Color(0xFFFFE9A0), Color(0xFFC8902C), Color.White, Color(0xFF8CC6FF), Color(0xFFFFE9A0))), CircleShape).padding(3.dp) else Modifier).clip(CircleShape).background(Brush.radialGradient(listOf(Color(0xFFB9DFFF), IceBlue, IceInk))), contentAlignment = Alignment.Center) {
        if (url.isNotBlank()) AsyncImage(url, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
        else Text(name.trim().firstOrNull()?.toString() ?: "؟", color = Color.White, fontWeight = FontWeight.Bold, fontSize = (size.value * .4f).sp)
    }
}

@Composable
private fun FrostRoomCard(room: JSONObject, onClick: () -> Unit) {
    val title = room.optString("title", "غرفة صوتية")
    val cover = room.optString("cover_url")
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(Brush.horizontalGradient(listOf(Color(0xFFDCEBFC), Color(0xFFF3F8FF), Color(0xFFE6F0FC)))).border(1.dp, Color(0xFFC6DCF5), RoundedCornerShape(20.dp)).clickable(onClick = onClick).padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(104.dp).clip(RoundedCornerShape(14.dp)).background(Brush.linearGradient(listOf(IceBlue, IceInk))), contentAlignment = Alignment.Center) {
            if (cover.isNotBlank()) AsyncImage(cover, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            else Icon(Icons.Default.Groups, null, tint = Color(0xFFFFE3A3), modifier = Modifier.size(38.dp))
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text(title, color = IceInk, fontWeight = FontWeight.Bold, fontSize = 17.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(room.optString("description", "دردشة صوتية"), color = IceMuted, fontSize = 12.sp, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(color = Color(0xFFFFF1C7), shape = RoundedCornerShape(7.dp)) { Text("غرفة صوتية", Modifier.padding(horizontal = 7.dp, vertical = 3.dp), color = Color(0xFF8A5B0C), fontSize = 10.sp, fontWeight = FontWeight.Bold) }
                Spacer(Modifier.weight(1f))
                Icon(Icons.Default.GraphicEq, null, tint = IceBlue, modifier = Modifier.size(16.dp))
                Text("مباشر", color = IceBlue, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun FrostBanner(title: String, subtitle: String, hue: Color, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Box(Modifier.fillMaxWidth().height(122.dp).clip(RoundedCornerShape(17.dp)).background(Brush.linearGradient(listOf(hue.copy(alpha = .85f), IceInk, hue))).padding(15.dp)) {
        Column(Modifier.align(Alignment.CenterEnd).fillMaxWidth(.68f), verticalArrangement = Arrangement.Center) {
            Text("SADA ROYALE", color = Color(0xFFCFE4FF), fontSize = 9.sp, fontWeight = FontWeight.Bold)
            Text(title, color = Color.White, fontSize = 21.sp, fontWeight = FontWeight.ExtraBold)
            Text(subtitle, color = Color(0xFFE3F0FF), fontSize = 11.sp)
        }
        Box(Modifier.align(Alignment.CenterStart).size(78.dp).border(3.dp, Brush.sweepGradient(listOf(Color(0xFFFFE9A0), Color(0xFFC8902C), Color.White, Color(0xFFFFE9A0))), CircleShape).padding(5.dp).clip(CircleShape).background(hue.copy(alpha = .5f)), contentAlignment = Alignment.Center) {
            Icon(icon, null, tint = Color.White, modifier = Modifier.size(36.dp))
        }
        Box(Modifier.fillMaxSize().padding(5.dp).border(1.dp, Color(0x99FFE6A0), RoundedCornerShape(13.dp)))
    }
}

@Composable
fun SadaNativeShell(
    profile: JSONObject, coins: Long, diamonds: Long, rooms: List<JSONObject>, gifts: List<JSONObject>, assets: List<JSONObject>,
    activeRoom: JSONObject?, rtcRole: String, rtcStatus: String, muted: Boolean, busy: Boolean, error: String,
    onOpenRoom: (JSONObject) -> Unit, onCreateRoom: (String) -> Unit, onLeaveRoom: () -> Unit, onTakeSeat: () -> Unit,
    onToggleMute: () -> Unit, onSignOut: () -> Unit, onBuyAsset: (JSONObject) -> Unit, onEquipAsset: (JSONObject) -> Unit,
    onBuyVip: (JSONObject) -> Unit
) {
    var tab by remember { mutableStateOf("party") }
    var partyTab by remember { mutableStateOf("parties") }
    var page by remember { mutableStateOf("") }
    var assetCategory by remember { mutableStateOf("all") }
    var roomTitle by remember { mutableStateOf("") }
    var createDialog by remember { mutableStateOf(false) }
    val name = profile.optString("display_name", profile.optString("username", "عضو"))
    val avatar = profile.optString("avatar_url")
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        Box(Modifier.fillMaxSize().background(IceBg)) {
            if (page.isEmpty() && activeRoom == null) {
                when (tab) {
                    "party" -> {
                        Box(Modifier.fillMaxSize()) {
                            Column(Modifier.fillMaxSize()) {
                                Box {
                                    FrostBackdrop()
                                    Column(Modifier.fillMaxWidth().padding(top = 28.dp)) {
                                        FrostHeader("صدى", "غرف دردشة صوتية", trailing = {
                                            IconButton(onClick = { createDialog = true }) { Icon(Icons.Default.AddCircle, null, tint = Color.White) }
                                            IconButton(onClick = { tab = "msg" }) { Icon(Icons.Default.Search, null, tint = Color.White) }
                                        })
                                        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                                            listOf("mine" to "ملكي", "parties" to "حفلات", "events" to "فعالية").forEach { (id, label) ->
                                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                                    TextButton(onClick = { partyTab = id }) { Text(label, color = if (partyTab == id) IceInk else Color.White, fontSize = if (partyTab == id) 23.sp else 17.sp, fontWeight = FontWeight.Bold) }
                                                    if (partyTab == id) Box(Modifier.size(width = 20.dp, height = 4.dp).clip(CircleShape).background(IceInk))
                                                }
                                            }
                                        }
                                    }
                                }
                                when (partyTab) {
                                    "mine" -> Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        FrostBanner("غرفتي الصوتية", "ابدأ غرفة جديدة وادعُ أصدقاءك", Color(0xFF4B93E8), Icons.Default.Castle)
                                        Button(onClick = { createDialog = true }, Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = IceBlue)) { Icon(Icons.Default.Add, null); Spacer(Modifier.width(6.dp)); Text("إنشاء غرفة") }
                                        rooms.filter { it.optString("owner_id") == profile.optString("id") }.forEach { FrostRoomCard(it) { onOpenRoom(it) } }
                                    }
                                    "parties" -> LazyColumn(Modifier.weight(1f).padding(bottom = 4.dp), contentPadding = PaddingValues(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        item { FrostBanner("مكافآت صدى", "اكتشف الغرف الصوتية النشطة", Color(0xFF3C83D8), Icons.Default.CardGiftcard) }
                                        item {
                                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                                listOf("الأكثر نشاطاً", "الغرف العامة", "غرف الأصدقاء").forEachIndexed { i, label -> FrostChip(label, i == 0) {} }
                                            }
                                        }
                                        if (rooms.isEmpty()) item { EmptyNative("لا توجد غرف متاحة حالياً", "ستظهر الغرف التي ينشئها المستخدمون هنا") }
                                        items(rooms) { room -> FrostRoomCard(room) { onOpenRoom(room) } }
                                    }
                                    else -> Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        FrostBanner("فعاليات صدى", "تابع الإعلانات والفعاليات الرسمية", Color(0xFF2F70BD), Icons.Default.EmojiEvents)
                                        EmptyNative("لا توجد فعاليات منشورة", "ستظهر الفعاليات التي تضيفها الإدارة هنا")
                                    }
                                }
                            }
                        }
                    }
                    "msg" -> Column(Modifier.fillMaxSize()) {
                        Box {
                            FrostBackdrop()
                            Column(Modifier.padding(top = 30.dp)) {
                                FrostHeader("الرسائل", "تواصل مع أصدقائك")
                                Row(Modifier.padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) { FrostChip("الرسائل", true) {}; FrostChip("الأصدقاء", false) {} }
                            }
                        }
                        EmptyNative("لا توجد رسائل بعد", "ابدأ محادثة عندما تتوفر قائمة الأصدقاء")
                    }
                    else -> Column(Modifier.fillMaxSize()) {
                        Box {
                            FrostBackdrop()
                            Column(Modifier.padding(top = 28.dp)) {
                                FrostHeader("أنا", "الملف الشخصي والإعدادات", trailing = { IconButton(onClick = { page = "settings" }) { Icon(Icons.Default.Settings, null, tint = Color.White) } })
                            }
                        }
                        Column(Modifier.fillMaxSize().offset(y = (-30).dp).verticalScroll(rememberScrollState()).padding(horizontal = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            IceCard(Modifier.fillMaxWidth()) {
                                Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                                    FrostAvatar(name, avatar, 76.dp, true)
                                    Spacer(Modifier.width(12.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text(name, color = IceInk, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp)
                                        Text("ID: " + profile.optString("id").take(8), color = IceMuted, fontSize = 11.sp)
                                        Text("المستوى " + profile.optInt("level", 1), color = IceBlue, fontSize = 12.sp)
                                    }
                                    Icon(Icons.Default.ChevronLeft, null, tint = IceMuted)
                                }
                            }
                            FrostBanner("VIP", "افتح الامتيازات والإطارات والدخوليات", Color(0xFF8055A9), Icons.Default.WorkspacePremium)
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                QuickAction("المتجر", Icons.Default.Storefront) { page = "store" }
                                QuickAction("VIP", Icons.Default.WorkspacePremium) { page = "vip" }
                                QuickAction("المحفظة", Icons.Default.AccountBalanceWallet) { page = "wallet" }
                            }
                            IceCard(Modifier.fillMaxWidth()) {
                                Column(Modifier.padding(horizontal = 14.dp)) {
                                    ProfileRow("المحفظة", Icons.Default.Wallet, "$coins عملة · $diamonds ألماس") { page = "wallet" }
                                    ProfileRow("المتجر", Icons.Default.Store, "الإطارات والهدايا والدخوليات") { page = "store" }
                                    ProfileRow("VIP", Icons.Default.Crown, "الباقات والامتيازات") { page = "vip" }
                                    ProfileRow("الإعدادات", Icons.Default.Settings, "الحساب والتفضيلات") { page = "settings" }
                                    ProfileRow("تسجيل الخروج", Icons.Default.Logout, "") { onSignOut() }
                                }
                            }
                        }
                    }
                }
                Row(Modifier.align(Alignment.BottomCenter).fillMaxWidth().height(94.dp).background(Brush.verticalGradient(listOf(Color(0xFF5BA8F2), Color(0xFF1F68C8)))).padding(horizontal = 28.dp, vertical = 10.dp), horizontalArrangement = Arrangement.SpaceAround, verticalAlignment = Alignment.CenterVertically) {
                    listOf(Triple("party", "حفلة", Icons.Default.Castle), Triple("msg", "رسالة", Icons.Default.Mail), Triple("me", "أنا", Icons.Default.AccountCircle)).forEach { (id, label, icon) ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable { tab = id; page = "" }) {
                            Icon(icon, null, tint = Color.White, modifier = Modifier.size(if (tab == id) 35.dp else 28.dp))
                            Text(label, color = Color.White, fontSize = 12.sp, fontWeight = if (tab == id) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }
            } else if (activeRoom != null) {
                NativeRoomScreen(activeRoom, name, avatar, rtcRole, rtcStatus, muted, busy, error, onTakeSeat, onToggleMute, onLeaveRoom)
            } else {
                when (page) {
                    "store" -> NativeStoreScreen(assets, assetCategory, { assetCategory = it }, onBuyAsset, onEquipAsset) { page = "" }
                    "vip" -> NativeVipScreen(assets, onBuyVip) { page = "" }
                    "wallet" -> NativeWalletScreen(coins, diamonds) { page = "" }
                    else -> Column(Modifier.fillMaxSize()) { FrostHeader("الإعدادات", onBack = { page = "" }); ProfileRow("تسجيل الخروج", Icons.Default.Logout, "") { onSignOut() } }
                }
            }
            if (createDialog) AlertDialog(onDismissRequest = { createDialog = false }, title = { Text("إنشاء غرفة صوتية", color = IceInk) }, text = { OutlinedTextField(roomTitle, { roomTitle = it }, label = { Text("اسم الغرفة") }, singleLine = true) }, confirmButton = { TextButton(onClick = { if (roomTitle.isNotBlank()) { onCreateRoom(roomTitle.trim()); roomTitle = ""; createDialog = false } }) { Text("إنشاء") } }, dismissButton = { TextButton(onClick = { createDialog = false }) { Text("إلغاء") } })
        }
    }
}

@Composable
private fun QuickAction(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    IceCard(Modifier.weight(1f).clickable(onClick = onClick)) { Column(Modifier.fillMaxWidth().padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) { Icon(icon, null, tint = IceBlue, modifier = Modifier.size(25.dp)); Text(label, color = IceInk, fontWeight = FontWeight.Bold, fontSize = 12.sp) } }
}

@Composable
private fun ProfileRow(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, value: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = IceBlue, modifier = Modifier.size(20.dp))
        Spacer(Modifier.width(12.dp))
        Text(label, Modifier.weight(1f), color = IceInk, fontWeight = FontWeight.SemiBold)
        if (value.isNotBlank()) Text(value, color = IceMuted, fontSize = 11.sp)
        Icon(Icons.Default.ChevronLeft, null, tint = IceMuted)
    }
    HorizontalDivider(color = Color(0xFFEEF3FA))
}

@Composable
private fun EmptyNative(title: String, subtitle: String) {
    Column(Modifier.fillMaxWidth().padding(28.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Icon(Icons.Default.AcUnit, null, tint = Color(0xFF9EC3F0), modifier = Modifier.size(54.dp))
        Text(title, color = IceInk, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        Text(subtitle, color = IceMuted, fontSize = 12.sp)
    }
}

@Composable
private fun NativeRoomScreen(room: JSONObject, name: String, avatar: String, role: String, status: String, muted: Boolean, busy: Boolean, error: String, onTakeSeat: () -> Unit, onMute: () -> Unit, onLeave: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF0D3479), Color(0xFF226BC3), Color(0xFF071B3B))))) {
        Column(Modifier.fillMaxSize().padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onLeave) { Icon(Icons.Default.ArrowForward, null, tint = Color.White) }
                Column(Modifier.weight(1f)) { Text(room.optString("title"), color = Color.White, fontWeight = FontWeight.ExtraBold, fontSize = 20.sp); Text(room.optString("description", "غرفة دردشة صوتية"), color = Color(0xFFBFDFFF), fontSize = 12.sp) }
                Surface(color = Color(0x33FFFFFF), shape = CircleShape) { Text("● مباشر", Modifier.padding(8.dp), color = Color(0xFF9EF0C8), fontSize = 11.sp) }
            }
            Spacer(Modifier.height(18.dp))
            IceCard(Modifier.fillMaxWidth()) {
                Row(Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    FrostAvatar(name, avatar, 64.dp, true)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) { Text(name + " · المضيف", color = IceInk, fontWeight = FontWeight.Bold); Text("مستمعون ومقاعد صوتية", color = IceMuted, fontSize = 12.sp) }
                    Icon(Icons.Default.Crown, null, tint = IceGold, modifier = Modifier.size(26.dp))
                }
            }
            Spacer(Modifier.height(18.dp))
            Text("مقاعد المايك", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
            Column(Modifier.weight(1f).fillMaxWidth(), verticalArrangement = Arrangement.Center) {
                repeat(2) { row ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        repeat(4) { col ->
                            val n = row * 4 + col + 1
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.padding(vertical = 10.dp)) {
                                Box(Modifier.size(58.dp).border(1.5.dp, Color(0xFF8CCBFF), CircleShape).background(Color(0x332F78E0), CircleShape), contentAlignment = Alignment.Center) { Icon(Icons.Default.Mic, null, tint = Color(0xFFB9D6FF)) }
                                Text("$n", color = Color(0xFFB9D6FF), fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
            Text(status, color = Color(0xFF9EF0C8), fontSize = 12.sp)
            if (error.isNotBlank()) Text(error, color = Color(0xFFFFA5B3), fontSize = 12.sp)
            Row(Modifier.fillMaxWidth().padding(vertical = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (role != "publisher") Button(onClick = onTakeSeat, enabled = !busy, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = IceBlue)) { Text("الصعود للمايك") }
                else Button(onClick = onMute, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = if (muted) Color(0xFFE2466B) else IceBlue)) { Icon(if (muted) Icons.Default.MicOff else Icons.Default.Mic, null); Text(if (muted) "فتح المايك" else "كتم المايك") }
                OutlinedButton(onClick = onLeave, modifier = Modifier.weight(1f)) { Text("مغادرة") }
            }
        }
    }
}

@Composable
private fun NativeStoreScreen(assets: List<JSONObject>, category: String, onCategory: (String) -> Unit, onBuy: (JSONObject) -> Unit, onEquip: (JSONObject) -> Unit, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(IceBg)) {
        FrostHeader("المتجر", "أصول صدى والإطارات والدخوليات", onBack)
        Row(Modifier.horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            listOf("all" to "الكل", "frame" to "الإطارات", "entrance" to "الدخوليات", "gift" to "الهدايا", "vip" to "VIP", "background" to "الخلفيات").forEach { (id, label) -> FrostChip(label, category == id) { onCategory(id) } }
        }
        val shown = assets.filter { category == "all" || it.optString("category").contains(category, true) || it.optString("asset_key").contains(category, true) }
        if (shown.isEmpty()) EmptyNative("لا توجد أصول منشورة", "ارفع الأصول من لوحة التحكم لتظهر هنا")
        else LazyColumn(contentPadding = PaddingValues(12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            items(shown) { asset ->
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color.White).padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    val path = asset.optString("storage_path")
                    val url = "https://pkqcxcfuelubonlkjgoq.supabase.co/storage/v1/object/public/sada-app-assets/" + path
                    if (path.isNotBlank() && asset.optString("mime_type").startsWith("image/")) AsyncImage(url, null, Modifier.size(68.dp).clip(RoundedCornerShape(12.dp)), contentScale = ContentScale.Crop)
                    else Box(Modifier.size(68.dp).background(IceBg, RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Icon(Icons.Default.AutoAwesome, null, tint = IceBlue) }
                    Spacer(Modifier.width(10.dp))
                    Column(Modifier.weight(1f)) { Text(asset.optString("title"), color = IceInk, fontWeight = FontWeight.Bold); Text(asset.optString("category"), color = IceMuted, fontSize = 11.sp); Text(asset.optString("price", "مجاني") + " " + asset.optString("currency"), color = IceBlue, fontSize = 12.sp) }
                    Column(horizontalAlignment = Alignment.End) { TextButton(onClick = { onBuy(asset) }) { Text("شراء") }; TextButton(onClick = { onEquip(asset) }) { Text("تجهيز") } }
                }
            }
        }
    }
}

@Composable
private fun NativeVipScreen(assets: List<JSONObject>, onBuy: (JSONObject) -> Unit, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(IceBg)) {
        FrostHeader("VIP", "الامتيازات والعضويات", onBack)
        FrostBanner("VIP ROYALE", "إطارات حصرية ودخوليات مميزة", Color(0xFF8957AE), Icons.Default.WorkspacePremium)
        EmptyNative("باقات VIP", "ستظهر الباقات المنشورة من لوحة الإدارة بعد ربط قائمة الباقات")
    }
}

@Composable
private fun NativeWalletScreen(coins: Long, diamonds: Long, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(IceBg)) {
        FrostHeader("المحفظة", "رصيد حسابك", onBack)
        IceCard(Modifier.fillMaxWidth().padding(14.dp)) {
            Column(Modifier.padding(18.dp)) {
                Text("العملات", color = IceMuted)
                Text(coins.toString(), color = IceInk, fontWeight = FontWeight.ExtraBold, fontSize = 30.sp)
                HorizontalDivider(Modifier.padding(vertical = 12.dp), color = IceBg)
                Text("الألماس", color = IceMuted)
                Text(diamonds.toString(), color = IceBlue, fontWeight = FontWeight.ExtraBold, fontSize = 30.sp)
            }
        }
        EmptyNative("الشحن", "خيارات الدفع ستظهر عند تفعيل بوابة الدفع")
    }
}
