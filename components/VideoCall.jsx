'use client'
import { useState, useEffect } from 'react'
import AgoraRTC, {
  AgoraRTCProvider,
  useJoin,
  useLocalCameraTrack,
  useLocalMicrophoneTrack,
  useRemoteAudioTracks,
  useRemoteUsers,
  usePublish,
  RemoteUser,
  LocalVideoTrack,
} from 'agora-rtc-react'

// Initialize the Agora client
const client = typeof window !== 'undefined' ? AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }) : null

export default function VideoCall({ channelName, onHangUp, role = 'patient' }) {
  if (!client) return null

  return (
    <AgoraRTCProvider client={client}>
      <VideoCallInner channelName={channelName} onHangUp={onHangUp} role={role} />
    </AgoraRTCProvider>
  )
}

function VideoCallInner({ channelName, onHangUp, role }) {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID
  const [token, setToken] = useState(null)
  const [uid, setUid] = useState(null)
  
  const [micOn, setMicOn] = useState(true)
  const [cameraOn, setCameraOn] = useState(true)

  // Fetch token from our API
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`/api/agora/token?channelName=${channelName}`)
        const data = await response.json()
        if (data.token) {
          setToken(data.token)
          setUid(Math.floor(Math.random() * 1000000))
        } else {
          console.error('Failed to get Agora token:', data.error)
        }
      } catch (err) {
        console.error('Error fetching Agora token:', err)
      }
    }
    fetchToken()
  }, [channelName])

  // Join the channel
  useJoin({
    appid: appId,
    channel: channelName,
    token: token,
    uid: uid,
  }, !!token)

  // Local tracks
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn)
  const { localCameraTrack } = useLocalCameraTrack(cameraOn)
  
  usePublish([localMicrophoneTrack, localCameraTrack])

  // Remote users
  const remoteUsers = useRemoteUsers()
  const { audioTracks } = useRemoteAudioTracks(remoteUsers)

  // Play remote audio
  useEffect(() => {
    audioTracks.forEach((track) => track.play())
  }, [audioTracks])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: '#0a0a0a', zIndex: 9999, display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif", color: 'white'
    }}>
      {/* Remote Video (Fullscreen) */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {remoteUsers.length > 0 ? (
          <RemoteUser user={remoteUsers[0]} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ 
            width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' 
          }}>
            <div style={{ 
              width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20,
              boxShadow: '0 0 30px rgba(37,99,235,0.3)'
            }}>
              {role === 'doctor' ? '👤' : '👨‍⚕️'}
            </div>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8' }}>Waiting for {role === 'doctor' ? 'patient' : 'doctor'}...</p>
          </div>
        )}

        {/* Local Video (PiP) */}
        <div style={{
          position: 'absolute', top: 20, right: 20, width: 120, height: 180,
          borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)', background: '#1a1a1a', zIndex: 10
        }}>
          {cameraOn ? (
            <LocalVideoTrack track={localCameraTrack} play style={{ width: '100%', height: '100%' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📷
            </div>
          )}
        </div>

        {/* Header Info */}
        <div style={{
          position: 'absolute', top: 20, left: 20, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)', padding: '10px 16px', borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 10, border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em' }}>LIVE CONSULTATION</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        padding: '30px 20px 40px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, position: 'absolute', bottom: 0, width: '100%'
      }}>
        <button 
          onClick={() => setMicOn(!micOn)}
          style={{
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: micOn ? 'rgba(255,255,255,0.15)' : '#ef4444',
            color: 'white', fontSize: 22, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {micOn ? '🎤' : '🔇'}
        </button>

        <button 
          onClick={onHangUp}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none',
            background: '#dc2626', color: 'white', fontSize: 32, cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(220,38,38,0.4)', transition: 'all 0.2s'
          }}
        >
          📞
        </button>

        <button 
          onClick={() => setCameraOn(!cameraOn)}
          style={{
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: cameraOn ? 'rgba(255,255,255,0.15)' : '#ef4444',
            color: 'white', fontSize: 22, cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          {cameraOn ? '📹' : '🚫'}
        </button>
      </div>
    </div>
  )
}
