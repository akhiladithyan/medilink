'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function PatientChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [language, setLanguage] = useState('English')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [doctorsList, setDoctorsList] = useState([])
  const [activeDoctorId, setActiveDoctorId] = useState(null)

  const t = {
    English: {
      header: 'Your Doctors',
      subHeader: 'Select a doctor to chat',
      noDocs: 'No doctors found',
      noDocsSub: 'Book an appointment to start chatting with a doctor.',
      startConv: 'Start the conversation',
      startConvSub: (name) => `You can now message Dr. ${name.replace('Dr. ', '')} directly.`,
      placeholder: (name) => `Message Dr. ${name.replace('Dr. ', '')}...`,
    },
    தமிழ்: {
      header: 'உங்கள் மருத்துவர்கள்',
      subHeader: 'அரட்டை அடிக்க ஒரு மருத்துவரைத் தேர்ந்தெடுக்கவும்',
      noDocs: 'மருத்துவர்கள் யாரும் இல்லை',
      noDocsSub: 'மருத்துவருடன் அரட்டையடிக்க சந்திப்பை முன்பதிவு செய்யுங்கள்.',
      startConv: 'உரையாடலைத் தொடங்குங்கள்',
      startConvSub: (name) => `நீங்கள் இப்போது டாக்டர் ${name.replace('Dr. ', '')}-க்கு நேரடியாக செய்தி அனுப்பலாம்.`,
      placeholder: (name) => `டாக்டர் ${name.replace('Dr. ', '')}-க்கு செய்தி அனுப்பவும்...`,
    },
    हिंदी: {
      header: 'आपके डॉक्टर',
      subHeader: 'चैट करने के लिए डॉक्टर चुनें',
      noDocs: 'कोई डॉक्टर नहीं मिला',
      noDocsSub: 'डॉक्टर से चैट शुरू करने के लिए अपॉइंटमेंट बुक करें।',
      startConv: 'बातचीत शुरू करें',
      startConvSub: (name) => `अब आप डॉ. ${name.replace('Dr. ', '')} को सीधे संदेश भेज सकते हैं।`,
      placeholder: (name) => `डॉ. ${name.replace('Dr. ', '')} को संदेश भेजें...`,
    }
  }

  const tx = t[language]

  useEffect(() => {
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
  }, [open])

  const bottomRef = useRef(null)
  const pollingRef = useRef(null)
  const patientId = typeof window !== 'undefined' ? localStorage.getItem('medilink_id') : null

  useEffect(() => {
    if (!patientId) return
    checkUnread()
    pollingRef.current = setInterval(checkUnread, 10000)
    return () => clearInterval(pollingRef.current)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (activeDoctorId && open) fetchMessages()
  }, [activeDoctorId, open])

  const checkUnread = async () => {
    if (!patientId) return
    const { data } = await supabase.from('chat_messages').select('id').eq('receiver_id', patientId).eq('is_read', false)
    setUnread(data?.length || 0)
    if (open) fetchMessages() // Silently update open chat
  }

  const openChat = async () => {
    setOpen(true)
    setLoading(true)
    if (!patientId) { setLoading(false); return }

    // Find doctors this patient has appointments with
    const { data: appts } = await supabase.from('appointments')
      .select('doctor_id')
      .eq('patient_medilink_id', patientId)
    
    const docIds = [...new Set(appts?.map(a => a.doctor_id).filter(Boolean) || [])]

    if (docIds.length > 0) {
      const { data: docs } = await supabase.from('doctors')
        .select('id, name, specialization')
        .in('id', docIds)
      
      if (docs && docs.length > 0) {
        // Map 'id' to 'doctor_id' for consistency with state
        const mappedDocs = docs.map(d => ({ ...d, doctor_id: d.id }))
        setDoctorsList(mappedDocs)
        if (!activeDoctorId) {
          setActiveDoctorId(mappedDocs[0].doctor_id)
        }
      } else {
        setDoctorsList([])
      }
    } else {
      setDoctorsList([])
    }
    
    await fetchMessages()
    setLoading(false)
  }

  const fetchMessages = async () => {
    if (!patientId) return
    const { data: chats } = await supabase.from('chat_messages').select('*').or(`receiver_id.eq.${patientId},sender_id.eq.${patientId}`).order('created_at', { ascending: true })
    setMessages(chats || [])

    // Mark incoming messages as read for active doctor
    if (activeDoctorId) {
      await supabase.from('chat_messages').update({ is_read: true }).eq('receiver_id', patientId).eq('sender_id', activeDoctorId).eq('is_read', false)
    }
  }

  const sendMessage = async (imageUrl = null) => {
    if ((!input.trim() && !imageUrl) || !patientId || !activeDoctorId) return

    const { data } = await supabase.from('chat_messages').insert([{
      sender_id: patientId, 
      receiver_id: activeDoctorId, 
      message: input.trim(), 
      type: 'doctor-patient', 
      is_read: false,
      image_url: imageUrl
    }]).select()

    if (data) setMessages(prev => [...prev, data[0]])
    setInput('')
    setSelectedFile(null)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `patient-${patientId}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      await sendMessage(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      alert(`Upload failed: ${err.message || 'Check your Supabase RLS policies'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => setOpen(false)

  const activeMessages = messages.filter(m => m.sender_id === activeDoctorId || m.receiver_id === activeDoctorId)
  const activeDoctorInfo = doctorsList.find(d => d.doctor_id === activeDoctorId)

  return (
    <>
      {!open && (
        <button onClick={openChat} style={{
          position: 'fixed', bottom: 100, right: 24, width: 62, height: 62,
          background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', border: 'none', borderRadius: '50%',
          fontSize: 26, cursor: 'pointer', boxShadow: '0 8px 28px rgba(37,99,235,0.45)', zIndex: 49,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          👨‍⚕️
          {unread > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff4d4f', color: 'white', fontSize: 11, fontWeight: 800, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid white' }}>{unread}</span>
          )}
        </button>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430,
          height: '88vh', background: 'white', borderRadius: '28px 28px 0 0', boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', zIndex: 100, fontFamily: "'DM Sans', sans-serif", overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '2px solid rgba(255,255,255,0.3)' }}>👨‍⚕️</div>
              <div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: 16, margin: 0 }}>
                  {activeDoctorInfo ? `Dr. ${activeDoctorInfo.name.replace('Dr. ', '')}` : tx.header}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <div style={{ width: 7, height: 7, background: '#a8d8ff', borderRadius: '50%' }} />
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: 0, fontWeight: 600 }}>
                    {activeDoctorInfo?.specialization || tx.subHeader}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', width: 36, height: 36, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>✕</button>
          </div>

          {/* Doctor Switcher Bar */}
          {doctorsList.length > 1 && (
            <div style={{ display: 'flex', overflowX: 'auto', padding: '12px 14px', background: '#f8fafc', borderBottom: '1px solid #e8ecf0', gap: 8, flexShrink: 0 }}>
              {doctorsList.map(doc => (
                <button
                  key={doc.doctor_id}
                  onClick={() => { setActiveDoctorId(doc.doctor_id); }}
                  style={{
                    padding: '8px 14px', borderRadius: 20, whiteSpace: 'nowrap',
                    background: activeDoctorId === doc.doctor_id ? '#1E3A8A' : 'white',
                    color: activeDoctorId === doc.doctor_id ? 'white' : '#64748b',
                    border: activeDoctorId === doc.doctor_id ? 'none' : '1px solid #cbd5e1',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: activeDoctorId === doc.doctor_id ? '0 4px 10px rgba(30,58,138,0.2)' : 'none'
                  }}
                >
                  Dr. {doc.name.replace('Dr. ', '')}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12, background: '#f4f7ff' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '10px 0' }}>
                {[80, 60, 90].map((w, i) => <div key={i} style={{ height: 40, width: `${w}%`, background: '#e8ecf0', borderRadius: 16, alignSelf: i % 2 === 0 ? 'flex-start' : 'flex-end', opacity: 0.6 }} />)}
              </div>
            ) : !activeDoctorId ? (
              <div style={{ textAlign: 'center', marginTop: 80 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📅</div>
                <p style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{tx.noDocs}</p>
                <p style={{ color: '#b0b8c8', fontSize: 13 }}>{tx.noDocsSub}</p>
              </div>
            ) : activeMessages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: 80 }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>💬</div>
                <p style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{tx.startConv}</p>
                <p style={{ color: '#b0b8c8', fontSize: 13 }}>{tx.startConvSub(activeDoctorInfo?.name || '')}</p>
              </div>
            ) : (
              activeMessages.map((msg, i) => {
                const isMe = msg.sender_id === patientId
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                    {!isMe && <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>👨‍⚕️</div>}
                    <div style={{ maxWidth: '75%', padding: '11px 15px', borderRadius: isMe ? '18px 18px 4px 18px' : '4px 18px 18px 18px', fontSize: 14, lineHeight: 1.6, fontWeight: 500, background: isMe ? 'linear-gradient(135deg, #1A9E6E, #0A7A53)' : 'white', color: isMe ? 'white' : '#1a1f2e', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: isMe ? 'none' : '1.5px solid #e8ecf0' }}>
                      {msg.image_url && (
                        <div style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                          <img src={msg.image_url} alt="attachment" style={{ width: '100%', display: 'block' }} />
                        </div>
                      )}
                      {msg.message}
                      <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.65)' : '#b0b8c8', marginTop: 4, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px 20px', background: 'white', borderTop: '1.5px solid #e8f0fe', flexShrink: 0 }}>
            {activeDoctorId && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <label style={{ cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.5 : 1 }}>
                  <div style={{ background: '#f8fafc', border: '2px solid #e8ecf0', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {uploading ? '⏳' : '🖼️'}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={tx.placeholder(activeDoctorInfo?.name || '')}
                  style={{ flex: 1, border: '2px solid #e8ecf0', borderRadius: 50, padding: '12px 20px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1a1f2e', background: '#f8fafc' }}
                />
                <button onClick={() => sendMessage()} disabled={uploading} style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', border: 'none', borderRadius: '50%', width: 46, height: 46, color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: uploading ? 0.5 : 1 }}>↑</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
