'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OnDocBot() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState('English')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [emergency, setEmergency] = useState(false)
  const bottomRef = useRef(null)

  const t = {
    English: {
      botName: 'OnDoc',
      botRole: 'AI Health Assistant',
      initialMsg: 'Hi! I am OnDoc 👋 Describe your symptoms or upload a wound/snake bite photo.',
      pills: ['🤒 Fever', '🤕 Headache', '🐍 Snake Bite', '🩹 Wound', '🔴 Rashes', '🧠 Stroke Symptoms'],
      placeholder: 'Describe your symptoms...',
      uploadLabel: '📷 Upload wound / snake bite photo for AI analysis',
      ambulanceBtn: '🚑 Call Ambulance 108 NOW',
      analyzing: '📷 Analyzing your image...',
      locating: '🏥 Locating nearest stroke center... City Care Hospital (2km away) has neurologists on standby. Call ambulance 108 NOW!',
      ambulanceMsg: '🚑 Calling ambulance 108 to your location...\n\nPlease:\n• Stay calm and still\n• Do NOT suck the venom\n• Keep the bitten area below heart level\n• Help is on the way!'
    },
    தமிழ்: {
      botName: 'OnDoc',
      botRole: 'AI சுகாதார உதவியாளர்',
      initialMsg: 'வணக்கம்! நான் OnDoc 👋 உங்கள் அறிகுறிகளை விவரிக்கவும் அல்லது காயம்/பாம்பு கடியின் புகைப்படத்தை பதிவேற்றவும்.',
      pills: ['🤒 காய்ச்சல்', '🤕 தலைவலி', '🐍 பாம்பு கடி', '🩹 காயம்', '🔴 தடிப்புகள்', '🧠 பக்கவாதம்'],
      placeholder: 'உங்கள் அறிகுறிகளை விவரிக்கவும்...',
      uploadLabel: '📷 AI ஆய்வுக்கு காயம் / பாம்பு கடியின் புகைப்படத்தை பதிவேற்றவும்',
      ambulanceBtn: '🚑 108 ஆம்புலன்ஸை இப்போதே அழைக்கவும்',
      analyzing: '📷 உங்கள் படத்தை ஆய்வு செய்கிறது...',
      locating: '🏥 அருகில் உள்ள பக்கவாத மையத்தை கண்டறிகிறது... City Care மருத்துவமனை (2km தூரம்). 108 ஆம்புலன்ஸை அழைக்கவும்!',
      ambulanceMsg: '🚑 உங்கள் இடத்திற்கு 108 ஆம்புலன்ஸ் அழைக்கப்படுகிறது...\n\nதயவுசெய்து:\n• அமைதியாகவும் அசையாமலும் இருக்கவும்\n• விஷத்தை உறிஞ்ச வேண்டாம்\n• கடித்த பகுதியை இதய நிலைக்கு கீழே வைக்கவும்\n• உதவி வந்து கொண்டிருக்கிறது!'
    },
    हिंदी: {
      botName: 'OnDoc',
      botRole: 'AI स्वास्थ्य सहायक',
      initialMsg: 'नमस्ते! मैं OnDoc हूँ 👋 अपने लक्षण बताएं या घाव/सांप के काटने की फोटो अपलोड करें।',
      pills: ['🤒 बुखार', '🤕 सिरदर्द', '🐍 सांप का काटना', '🩹 घाव', '🔴 चकत्ते', '🧠 स्ट्रोक के लक्षण'],
      placeholder: 'अपने लक्षण बताएं...',
      uploadLabel: '📷 AI विश्लेषण के लिए घाव / सांप के काटने की फोटो अपलोड करें',
      ambulanceBtn: '🚑 अभी 108 एम्बुलेंस बुलाएं',
      analyzing: '📷 आपकी इमेज का विश्लेषण कर रहा है...',
      locating: '🏥 निकटतम स्ट्रोक केंद्र खोज रहा है... सिटी केयर अस्पताल (2 किमी दूर)। अभी 108 एम्बुलेंस बुलाएं!',
      ambulanceMsg: '🚑 आपके स्थान पर 108 एम्बुलेंस बुलाई जा रही है...\n\nकृपया:\n• शांत और स्थिर रहें\n• जहर को न चूसें\n• काटे गए हिस्से को हृदय स्तर से नीचे रखें\n• सहायता रास्ते में है!'
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) {
      setLanguage(saved)
      setMessages([{ from: 'bot', text: t[saved].initialMsg }])
    }
  }, [])

  const tx = t[language]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const isSnakeBite = (text) => {
    const keywords = ['snake', 'bite', 'venom', 'cobra', 'krait', 'viper', 'serpent', 'bitten', 'பாம்பு', 'கடி', 'सांप', 'काटना']
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
        language: language
      })
    })

    const data = await response.json()
    const reply = data.text

    if (reply.includes('BOOK_SPECIALIST:')) {
      const spec = reply.match(/BOOK_SPECIALIST:\s*([a-zA-Z\s]+)/)?.[1]?.trim()
      if (spec) await bookSpecialistAppointment(spec)
    }

    if (reply.includes('EMERGENCY:')) {
      setEmergency(true)
      setMessages(prev => [...prev, { from: 'emergency', text: reply }])
      await bookEmergencyAppointment()
      if (isSnakeBite(userMsg) || reply.toLowerCase().includes('snake')) await sendAntivenomAlert(reply)
      if (reply.includes('STROKE ALERT')) {
        setTimeout(() => {
          setMessages(prev => [...prev, { from: 'bot', text: tx.locating }])
        }, 1500)
      }
    } else {
      setMessages(prev => [...prev, { from: 'bot', text: reply }])
    }
    setLoading(false)
  }

  const bookSpecialistAppointment = async (specialty, imageUrl = null, aiDescription = null) => {
    const medilink_id = localStorage.getItem('medilink_id')
    if (!medilink_id) return

    // Find the first doctor with this specialty
    const { data: doctors } = await supabase.from('doctors').select('*').ilike('specialization', `%${specialty}%`).limit(1)
    const doctorId = doctors?.[0]?.id || null

    const note = language === 'தமிழ்'
      ? `OnDoc போட் மூலம் ${specialty} சந்திப்பு தானாகவே முன்பதிவு செய்யப்பட்டது`
      : language === 'हिंदी'
      ? `OnDoc बॉट द्वारा ${specialty} अपॉइंटमेंट स्वचालित रूप से बुक किया गया`
      : `Auto-booked ${specialty} appointment via OnDoc Bot`

    await supabase.from('appointments').insert([{
      patient_medilink_id: medilink_id,
      doctor_id: doctorId,
      status: 'pending',
      booked_by: 'bot',
      date: new Date().toISOString().split('T')[0],
      notes: note,
      image_url: imageUrl
    }])

    // If there's an image, also send it to the doctor's chat with AI reasoning
    if (doctorId && imageUrl) {
      const cleanDesc = aiDescription ? aiDescription.replace(/BOOK_SPECIALIST:\s*[a-zA-Z\s]+/i, '').trim() : `AI suggested a ${specialty} consultation.`
      await supabase.from('chat_messages').insert([{
        sender_id: medilink_id,
        receiver_id: doctorId,
        message: `🚨 [OnDoc AI Diagnostic Request]\n\n${cleanDesc}`,
        type: 'patient-doctor',
        is_read: false,
        image_url: imageUrl
      }])
    }

    setMessages(prev => [...prev, {
      from: 'bot',
      text: language === 'தமிழ்'
        ? `✅ உங்களுக்காக ${specialty} சந்திப்பை நான் முன்பதிவு செய்துள்ளேன்.`
        : language === 'हिंदी'
        ? `✅ मैंने आपके लिए एक ${specialty} अपॉइंटमेंट बुक किया है।`
        : `✅ I've automatically booked a ${specialty} appointment for you.`
    }])
  }

  const bookEmergencyAppointment = async (imageUrl = null) => {
    const medilink_id = localStorage.getItem('medilink_id')
    if (!medilink_id) return
    await supabase.from('appointments').insert([{
      patient_medilink_id: medilink_id,
      status: 'emergency',
      booked_by: 'bot',
      date: new Date().toISOString().split('T')[0],
      notes: language === 'தமிழ்' ? 'OnDoc போட் மூலம் அவசர முன்பதிவு' : language === 'हिंदी' ? 'OnDoc बॉट द्वारा आपातकालीन बुकिंग' : 'Emergency booking by OnDoc bot',
      image_url: imageUrl
    }])
  }

  const sendAntivenomAlert = async (botResponse, imageUrl = null) => {
    const medilink_id = localStorage.getItem('medilink_id')
    const antivenomLine = botResponse.match(/Antidote Needed:(.*)/i)
    const snakeLine = botResponse.match(/Suspected Snake:(.*)/i)
    const antivenom = antivenomLine ? antivenomLine[1].trim() : 'Polyvalent Antivenom'
    const snake = snakeLine ? snakeLine[1].trim() : 'Unknown snake'
    
    let recordDetails = `Suspected: ${snake} | Antidote Required: ${antivenom} | Alert sent to nearest hospital.`
    if (language === 'தமிழ்') recordDetails = `சந்தேகிக்கப்படுவது: ${snake} | தேவைப்படும் விஷமுறிவு மருந்து: ${antivenom} | அருகிலுள்ள மருத்துவமனைக்கு எச்சரிக்கை அனுப்பப்பட்டது.`
    if (language === 'हिंदी') recordDetails = `संदिग्ध: ${snake} | आवश्यक एंटीडोट: ${antivenom} | निकटतम अस्पताल को अलर्ट भेज दिया गया है।`

    await supabase.from('health_records').insert([{
      patient_medilink_id: medilink_id,
      record_type: language === 'தமிழ்' ? '🐍 பாம்பு கடி அவசரநிலை' : language === 'हिंदी' ? '🐍 सांप के काटने की आपात स्थिति' : '🐍 Snake Bite Emergency',
      details: recordDetails,
      image_url: imageUrl
    }])

    setMessages(prev => [...prev, {
      from: 'emergency',
      text: language === 'தமிழ்' 
        ? `🏥 மருத்துவமனைக்கு எச்சரிக்கை அனுப்பப்பட்டது!\n\n🐍 பாம்பு: ${snake}\n💉 விஷமுறிவு மருந்து: ${antivenom}\n\nஉங்கள் உடல்நலப் பதிவுகளில் சேமிக்கப்பட்டது.`
        : language === 'हिंदी'
        ? `🏥 अस्पताल अलर्ट भेज दिया गया!\n\n🐍 सांप: ${snake}\n💉 एंटीडोट: ${antivenom}\n\nआपके स्वास्थ्य रिकॉर्ड में सहेज लिया गया है।`
        : `🏥 HOSPITAL ALERT SENT!\n\n🐍 Snake: ${snake}\n💉 Antidote: ${antivenom}\n\nSaved to your health records. Show this to the doctor immediately!`
    }])
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    setMessages(prev => [...prev, { from: 'user', text: tx.analyzing }])

    const medilink_id = localStorage.getItem('medilink_id')
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `diagnostics/${medilink_id}/${fileName}`

    try {
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      // 2. Send URL to AI for analysis
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Identify this medical condition and advise.',
          image: publicUrl,
          type: 'image',
          language: language
        })
      })

      const data = await response.json()
      const reply = data.text

      if (reply.includes('BOOK_SPECIALIST:')) {
        const spec = reply.match(/BOOK_SPECIALIST:\s*([a-zA-Z\s]+)/)?.[1]?.trim()
        if (spec) await bookSpecialistAppointment(spec, publicUrl, reply)
      }

      if (reply.includes('EMERGENCY:')) {
        setEmergency(true)
        setMessages(prev => [...prev, { from: 'emergency', text: reply }])
        await bookEmergencyAppointment(publicUrl)
        if (reply.toLowerCase().includes('snake')) await sendAntivenomAlert(reply, publicUrl)
      } else {
        setMessages(prev => [...prev, { from: 'bot', text: reply }])
      }
    } catch (err) {
      console.error('Diagnostic error:', err)
      setMessages(prev => [...prev, { from: 'bot', text: 'Sorry, I failed to process that image. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const callAmbulance = () => {
    setMessages(prev => [...prev, {
      from: 'bot',
      text: tx.ambulanceMsg
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
                <p style={{ color: 'white', fontWeight: 800, fontSize: 17, margin: 0, fontFamily: "'Syne', sans-serif" }}>{tx.botName}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 7, height: 7, background: '#A8FFD8', borderRadius: '50%' }}></div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: 0, fontWeight: 600 }}>{tx.botRole}</p>
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
            {tx.pills.map(q => (
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
              }}>{tx.ambulanceBtn}</button>
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
                placeholder={tx.placeholder}
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
              {tx.uploadLabel}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>


        </div>
      )}
    </>
  )
}