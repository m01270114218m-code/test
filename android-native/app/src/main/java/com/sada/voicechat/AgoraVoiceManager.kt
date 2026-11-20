package com.sada.voicechat

import android.content.Context
import io.agora.rtc2.ChannelMediaOptions
import io.agora.rtc2.Constants
import io.agora.rtc2.IRtcEngineEventHandler
import io.agora.rtc2.RtcEngine
import io.agora.rtc2.RtcEngineConfig

class AgoraVoiceManager(
    context: Context,
    private val onStatus: (String) -> Unit
) {
    private val appContext = context.applicationContext
    private var engine: RtcEngine? = null

    fun join(appId: String, token: String, channel: String, uid: Int, role: String) {
        leave()
        val config = RtcEngineConfig().apply {
            mContext = appContext
            mAppId = appId
            mEventHandler = object : IRtcEngineEventHandler() {
                override fun onJoinChannelSuccess(channel: String?, uid: Int, elapsed: Int) {
                    onStatus("متصل صوتياً")
                }
                override fun onConnectionLost() {
                    onStatus("انقطع الاتصال الصوتي، جارٍ إعادة الاتصال…")
                }
                override fun onError(err: Int) {
                    onStatus("خطأ صوتي: $err")
                }
                override fun onUserJoined(uid: Int, elapsed: Int) {
                    onStatus("انضم مستخدم إلى الصوت")
                }
                override fun onUserOffline(uid: Int, reason: Int) {
                    onStatus("غادر مستخدم الصوت")
                }
            }
        }
        val rtc = try { RtcEngine.create(config) } catch (e: Exception) {
            onStatus(e.message ?: "تعذر تشغيل محرك الصوت")
            return
        }
        engine = rtc
        rtc.enableAudio()
        rtc.setEnableSpeakerphone(true)
        val options = ChannelMediaOptions().apply {
            channelProfile = Constants.CHANNEL_PROFILE_LIVE_BROADCASTING
            clientRoleType = if (role == "publisher") Constants.CLIENT_ROLE_BROADCASTER else Constants.CLIENT_ROLE_AUDIENCE
            publishMicrophoneTrack = role == "publisher"
            autoSubscribeAudio = true
        }
        val result = rtc.joinChannel(token, channel, uid, options)
        if (result != 0) onStatus("تعذر دخول القناة الصوتية: $result")
    }

    fun mute(muted: Boolean) {
        engine?.muteLocalAudioStream(muted)
    }

    fun speaker(enabled: Boolean) {
        engine?.setEnableSpeakerphone(enabled)
    }

    fun leave() {
        try { engine?.leaveChannel() } catch (_: Exception) { }
        try { RtcEngine.destroy() } catch (_: Exception) { }
        engine = null
    }
}
