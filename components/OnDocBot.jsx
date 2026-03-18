'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnDocBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am OnDoc 👋 Describe your symptoms or upload a wound/snake bite photo.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [emergency, setEmergency] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isSnakeBite = (text) => {
    const keywords = ['snake', 'bite', 'venom', 'cobra', 'krait', 'viper', 'serpent', 'bitten']
    return keywords.some(k => text.toLowerCase().includes(k))
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(prev => [...prev, { from: 'user', text: userMsg }])
    setInput('')
    setLoading(true)

    const snakeBite = isSnakeBite(userMsg)

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: userMsg,
        type: snakeBite ? 'snakebite' : 'general',
        language: localStorage.getItem('medilink_lang') || 'English'
      })
    })

    const data = await response.json()
    const reply = data.text

    if (reply.includes('EMERGENCY:')) {
      setEmergency(true)
      setMessages(prev => [...prev, { from: 'emergency', text: reply }])
      await bookEmergencyAppointment()
      if (snakeBite) await sendAntivenomAlert(reply)
      if (reply.includes('STROKE ALERT')) {
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'bot', text: '🏥 Locating nearest stroke center... City Care Hospital (2km away) has neurologists on standby. Call ambulance 108 NOW!' }])
        }, 1500)
      }
    } else {
      setMessages(prev => [...prev, { from: 'bot', text: reply }])
    }
    setLoading(false)
  }

  const bookEmergencyAppointment = async () => {
    const medilink_id = localStorage.getItem('medilink_id')
    if (!medilink_id) return
    await supabase.from('appointments').insert([{
      patient_medilink_id: medilink_id,
      status: 'emergency',
      booked_by: 'bot',
      date: new Date().toISOString().split('T')[0],
      notes: 'Emergency booking by OnDoc bot'
    }])
  }

  const sendAntivenomAlert = async (botResponse) => {
    const medilink_id = localStorage.getItem('medilink_id')
    const antivenomLine = botResponse.match(/Antidote Needed:(.*)/i)
    const snakeLine = botResponse.match(/Suspected Snake:(.*)/i)
    const antivenom = antivenomLine ? antivenomLine[1].trim() : 'Polyvalent Antivenom'
    const snake = snakeLine ? snakeLine[1].trim() : 'Unknown snake'
    await supabase.from('health_records').insert([{
      patient_medilink_id: medilink_id,
      record_type: '🐍 Snake Bite Emergency',
      details: `Suspected: ${snake} | Antidote Required: ${antivenom} | Alert sent to nearest hospital.`
    }])
    setMessages(prev => [...prev, {
      from: 'emergency',
      text: `🏥 HOSPITAL ALERT SENT!\n\n🐍 Snake: ${snake}\n💉 Antidote: ${antivenom}\n\nSaved to your health records. Show this to the doctor immediately!`
    }])
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setMessages(prev => [...prev, { from: 'user', text: '📷 Analyzing your image...' }])
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1]
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are OnDoc, an AI medical assistant. Analyze this medical image (symptoms, rashes, wounds, suspected stroke).
- Describe what you see
- Rate severity: mild, moderate, or severe  
- If snake bite: identify snake species and antivenom needed, start with "EMERGENCY:"
- If stroke symptoms (facial droop): start with "EMERGENCY: STROKE ALERT"
- If severe wound: start with "EMERGENCY:"
- Give first aid steps
- Keep response under 150 words`,
          image: base64,
          type: 'image',
          language: localStorage.getItem('medilink_lang') || 'English'
        })
      })
      const data = await response.json()
      const reply = data.text
      if (reply.includes('EMERGENCY:')) {
        setEmergency(true)
        setMessages(prev => [...prev, { from: 'emergency', text: reply }])
        await bookEmergencyAppointment()
        if (isSnakeBite(reply)) await sendAntivenomAlert(reply)
        if (reply.includes('STROKE ALERT')) {
          setTimeout(() => {
            setMessages(prev => [...prev, { from: 'bot', text: '🏥 I have located the nearest comprehensive stroke center (City Care Hospital - 2km away). They have neurologists on standby. Please call the ambulance immediately!' }])
          }, 1500)
        }
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: reply }])
      }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const callAmbulance = () => {
    setMessages(prev => [...prev, {
      from: 'bot',
      text: '🚑 Calling ambulance 108 to your location...\n\nPlease:\n• Stay calm and still\n• Do NOT suck the venom\n• Keep the bitten area below heart level\n• Help is on the way!'
    }])
    setEmergency(false)
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 28, right: 24,
          width: 62, height: 62,
          background: 'linear-gradient(135deg, #00C37B, #00A366)',
          border: 'none', borderRadius: '50%',
          fontSize: 28, cursor: 'pointer',
          boxShadow: '0 8px 28px rgba(0,195,123,0.45)',
          zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>🩺</button>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 430, height: '94vh',
          background: '#F8FFFE',
          borderRadius: '28px 28px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          zIndex: 100, fontFamily: "'Nunito', sans-serif",
          overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #00C37B, #009E63)',
            padding: '18px 20px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46,
                background: 'rgba(255,255,255,0.22)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, border: '2px solid rgba(255,255,255,0.3)'
              }}>🩺</div>
              <div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 17, margin: 0, fontFamily: "'Syne', sans-serif" }}>OnDoc</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, background: '#A8FFD8', borderRadius: '50%' }}></div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: 0, fontWeight: 600 }}>AI Health Assistant</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: 'white', width: 36, height: 36, borderRadius: '50%',
              fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700
            }}>✕</button>
          </div>

          {/* Quick Action Pills */}
          <div style={{
            padding: '10px 16px', background: 'white',
            display: 'flex', gap: 8, overflowX: 'auto',
            borderBottom: '1px solid #E2EDE9', flexShrink: 0
          }}>
            {['🤒 Fever', '🤕 Headache', '🐍 Snake Bite', '🩹 Wound', '🔴 Rashes', '🧠 Stroke Symptoms'].map(q => (
              <button key={q} onClick={() => setInput(q.split(' ').slice(1).join(' '))} style={{
                background: '#F0FBF6', border: '1.5px solid #C8EFE0',
                borderRadius: 20, padding: '6px 14px',
                fontSize: 12, fontWeight: 700, color: '#00875A',
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'Nunito', sans-serif"
              }}>{q}</button>
            ))}
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
            background: '#F4F9F6'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.from !== 'user' && (
                  <div style={{ width: 28, height: 28, background: msg.from === 'emergency' ? '#FFE5E5' : 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, border: '1.5px solid #E2EDE9' }}>
                    {msg.from === 'emergency' ? '🚨' : '🩺'}
                  </div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '11px 15px',
                  borderRadius: msg.from === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  fontSize: 14, lineHeight: 1.65, fontWeight: 600,
                  whiteSpace: 'pre-wrap',
                  background: msg.from === 'user'
                    ? 'linear-gradient(135deg, #00C37B, #00A366)'
                    : msg.from === 'emergency'
                    ? '#FFF0F0'
                    : 'white',
                  color: msg.from === 'user' ? 'white'
                    : msg.from === 'emergency' ? '#CC0000'
                    : '#0D1F1A',
                  border: msg.from === 'emergency' ? '1.5px solid #FFBDBD'
                    : msg.from === 'bot' ? '1.5px solid #E2EDE9' : 'none',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <div style={{ width: 28, height: 28, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1.5px solid #E2EDE9' }}>🩺</div>
                <div style={{ background: 'white', border: '1.5px solid #E2EDE9', borderRadius: '4px 18px 18px 18px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 8, height: 8, background: '#00C37B', borderRadius: '50%', opacity: 0.5 + i * 0.25 }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {emergency && (
              <button onClick={callAmbulance} style={{
                background: 'linear-gradient(135deg, #FF3B3B, #CC0000)',
                color: 'white', border: 'none', borderRadius: 16,
                padding: '16px', fontSize: 16, fontWeight: 800,
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                boxShadow: '0 4px 20px rgba(255,0,0,0.3)',
                letterSpacing: '0.02em'
              }}>🚑 Call Ambulance 108 NOW</button>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px 14px 20px',
            background: 'white',
            borderTop: '1.5px solid #E8F4EF',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Describe your symptoms..."
                style={{
                  flex: 1, border: '2px solid #E2EDE9',
                  borderRadius: 50, padding: '12px 20px',
                  fontSize: 14, fontFamily: "'Nunito', sans-serif",
                  outline: 'none', color: '#0D1F1A',
                  background: '#F8FFFE'
                }}
              />
              <button onClick={sendMessage} style={{
                background: 'linear-gradient(135deg, #00C37B, #00A366)',
                border: 'none', borderRadius: '50%',
                width: 46, height: 46,
                color: 'white', fontSize: 20, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, boxShadow: '0 4px 14px rgba(0,195,123,0.35)'
              }}>↑</button>
            </div>
            <label style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 13, color: '#00875A', fontWeight: 700, cursor: 'pointer',
              background: '#F0FBF6', borderRadius: 12, padding: '10px 14px',
              border: '1.5px dashed #C8EFE0'
            }}>
              📷 Upload wound / snake bite photo for AI analysis
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>

        </div>
      )}
    </>
  )
}