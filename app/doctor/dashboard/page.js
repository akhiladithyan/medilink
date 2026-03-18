'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DoctorDashboard() {
  const router = useRouter()
  const [doctorName, setDoctorName] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [appointments, setAppointments] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [patientRecords, setPatientRecords] = useState([])
  const [patientPrescriptions, setPatientPrescriptions] = useState([])
  const [activeTab, setActiveTab] = useState('appointments')
  const [prescription, setPrescription] = useState({ medicines: [{ name: '', dosage: '', frequency: '' }], notes: '' })
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const [unreadMsgCount, setUnreadMsgCount] = useState(0)
  const [language, setLanguage] = useState('English')
  const chatBottomRef = useRef(null)
  const pollingRef = useRef(null)

  const t = {
    English: {
      portal: 'Doctor Portal',
      logout: 'Logout',
      total: 'Total',
      emergency: 'Emergency',
      pending: 'Pending',
      completed: 'Completed',
      appointments: 'Appointments',
      patient: 'Patient',
      prescribe: 'Prescribe',
      chat: 'Chat',
      yourAppts: 'Your Appointments',
      loading: 'Loading...',
      noAppts: 'No appointments yet',
      noApptsSub: 'Appointments will appear here when patients book.',
      viewPatient: 'View Patient Details →',
      activePatient: 'Active Patient',
      bloodType: 'Blood Type',
      age: 'Age',
      lang: 'Language',
      phone: 'Phone',
      since: 'Member Since',
      healthRecords: 'Health Records',
      noRecords: 'No health records found.',
      pastPres: 'Past Prescriptions',
      noPres: 'No prescriptions found.',
      writePres: 'Write Prescription',
      medName: 'Medicine name',
      dosage: 'Dosage (500mg)',
      frequency: 'Frequency',
      addMed: '+ Add Medicine',
      notePlaceholder: 'Additional notes for patient...',
      sendPres: 'Send Prescription →',
      chatWith: 'Chat with Patient',
      online: 'Online',
      noMsgs: 'No messages yet. Start the conversation!',
      typeMsg: 'Type a message...',
      successPres: 'Prescription sent successfully!',
      bookedBy: 'Booked by',
      statEmergency: 'EMERGENCY',
      statPending: 'PENDING',
      statCompleted: 'COMPLETED',
      unknownPatient: 'Unknown Patient',
      noteLabel: 'Note / Problem',
      patient: 'Patient',
      doctor: 'Doctor',
    },
    தமிழ்: {
      portal: 'மருத்துவர் போர்டல்',
      logout: 'வெளியேறு',
      total: 'மொத்தம்',
      emergency: 'அவசரம்',
      pending: 'நிலுவையில்',
      completed: 'முடிந்தது',
      appointments: 'சந்திப்புகள்',
      patient: 'நோயாளி',
      prescribe: 'பந்துரைக்கல்',
      chat: 'அரட்டை',
      yourAppts: 'உங்கள் சந்திப்புகள்',
      loading: 'ஏற்றுகிறது...',
      noAppts: 'சந்திப்புகள் எதுவும் இல்லை',
      noApptsSub: 'நோயாளிகள் முன்பதிவு செய்யும்போது சந்திப்புகள் இங்கே தோன்றும்.',
      viewPatient: 'நோயாளி விவரங்களைக் காண்க →',
      activePatient: 'செயலில் உள்ள நோயாளி',
      bloodType: 'இரத்த வகை',
      age: 'வயது',
      lang: 'மொழி',
      phone: 'தொலைபேசி',
      since: 'உறுப்பினர் சேர்ந்தது',
      healthRecords: 'உடல்நலப் பதிவுகள்',
      noRecords: 'உடல்நலப் பதிவுகள் எதுவும் இல்லை.',
      pastPres: 'கடந்த கால மருந்துச் சீட்டுகள்',
      noPres: 'மருந்துச் சீட்டுகள் எதுவும் இல்லை.',
      writePres: 'மருந்துச் சீட்டு எழுதுங்கள்',
      medName: 'மருந்தின் பெயர்',
      dosage: 'அளவு (500mg)',
      frequency: 'அதிர்வெண்',
      addMed: '+ மருந்தைச் சேர்க்கவும்',
      notePlaceholder: 'நோயாளிக்கான கூடுதல் குறிப்புகள்...',
      sendPres: 'மருந்துச் சீட்டு அனுப்பு →',
      chatWith: 'நோயாளியுடன் அரட்டையடிக்கவும்',
      online: 'ஆன்லைனில்',
      noMsgs: 'இன்னும் செய்திகள் இல்லை. உரையாடலைத் தொடங்குங்கள்!',
      typeMsg: 'செய்தியைத் தட்டச்சு செய்க...',
      successPres: 'மருந்துச் சீட்டு வெற்றிகரமாக அனுப்பப்பட்டது!',
      bookedBy: 'பதிவு செய்தவர்',
      statEmergency: 'அவசரம்',
      statPending: 'நிலுவையில்',
      statCompleted: 'முடிந்தது',
      unknownPatient: 'அறியப்படாத நோயாளி',
      noteLabel: 'குறிப்பு / சிக்கல்',
      patient: 'நோயாளி',
      doctor: 'மருத்துவர்',
    },
    हिंदी: {
      portal: 'डॉक्टर पोर्टल',
      logout: 'लॉग आउट',
      total: 'कुल',
      emergency: 'आपातकाल',
      pending: 'लंबित',
      completed: 'पूर्ण',
      appointments: 'नियुक्तियाँ',
      patient: 'रोगी',
      prescribe: 'लिखें',
      chat: 'चैट',
      yourAppts: 'आपकी नियुक्तियाँ',
      loading: 'लोड हो रहा है...',
      noAppts: 'अभी कोई नियुक्ति नहीं',
      noApptsSub: 'जब मरीज बुक करेंगे तो नियुक्तियां यहां दिखाई देंगी।',
      viewPatient: 'रोगी का विवरण देखें →',
      activePatient: 'सक्रिय रोगी',
      bloodType: 'रक्त प्रकार',
      age: 'आयु',
      lang: 'भाषा',
      phone: 'फोन',
      since: 'सदस्यता की शुरुआत',
      healthRecords: 'स्वास्थ्य रिकॉर्ड',
      noRecords: 'कोई स्वास्थ्य रिकॉर्ड नहीं मिला।',
      pastPres: 'पिछले नुस्खे',
      noPres: 'कोई नुस्खा नहीं मिला।',
      writePres: 'नुस्खा लिखें',
      medName: 'दवा का नाम',
      dosage: 'खुराक (500mg)',
      frequency: 'आवृत्ति',
      addMed: '+ दवा जोड़ें',
      notePlaceholder: 'मरीज के लिए अतिरिक्त नोट्स...',
      sendPres: 'नुस्खा भेजें →',
      chatWith: 'मरीज के साथ चैट करें',
      online: 'ऑनलाइन',
      noMsgs: 'अभी कोई संदेश नहीं। बातचीत शुरू करें!',
      typeMsg: 'एक संदेश लिखें...',
      successPres: 'नुस्खा सफलतापूर्वक भेजा गया!',
      bookedBy: 'द्वारा बुक किया गया',
      statEmergency: 'आपातकाल',
      statPending: 'लंबित',
      statCompleted: 'पूर्ण',
      unknownPatient: 'अज्ञात रोगी',
      noteLabel: 'नोट / समस्या',
      patient: 'रोगी',
      doctor: 'डॉक्टर',
    }
  }

  const tx = t[language]

  useEffect(() => {
    const id = localStorage.getItem('doctor_id')
    const name = localStorage.getItem('doctor_name')
    const spec = localStorage.getItem('doctor_specialization')
    const savedLang = localStorage.getItem('medilink_lang')
    if (savedLang && t[savedLang]) setLanguage(savedLang)
    if (!id) { router.push('/doctor/login'); return }
    setDoctorName(name || 'Doctor')
    setSpecialization(spec || '')
    fetchAppointments(id)
    // Poll for unread messages every 15s
    pollingRef.current = setInterval(() => checkUnreadMessages(id), 15000)
    return () => clearInterval(pollingRef.current)
  }, [])

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const checkUnreadMessages = async (doctorId) => {
    const did = doctorId || localStorage.getItem('doctor_id')
    const { data } = await supabase.from('chat_messages').select('id').eq('receiver_id', did).eq('is_read', false)
    setUnreadMsgCount(data?.length || 0)
  }

  const fetchAppointments = async (doctor_id) => {
    const { data: appts } = await supabase.from('appointments').select('*').eq('doctor_id', doctor_id).order('created_at', { ascending: false })
    
    if (appts && appts.length > 0) {
      const patientIds = [...new Set(appts.map(a => a.patient_medilink_id))]
      const { data: pts } = await supabase.from('patients').select('medilink_id, name').in('medilink_id', patientIds)
      const patientMap = {}
      pts?.forEach(p => { patientMap[p.medilink_id] = p.name })
      
      const enriched = appts.map(a => ({ ...a, patient_name: patientMap[a.patient_medilink_id] || tx.unknownPatient }))
      setAppointments(enriched)
    } else {
      setAppointments([])
    }
    
    setLoading(false)
    checkUnreadMessages(doctor_id)
  }

  const fetchPatientDetails = async (medilink_id) => {
    setSelectedPatient(medilink_id)
    const { data: pat } = await supabase.from('patients').select('*').eq('medilink_id', medilink_id).single()
    setPatientData(pat)
    const { data: records } = await supabase.from('health_records').select('*').eq('patient_medilink_id', medilink_id).order('created_at', { ascending: false })
    setPatientRecords(records || [])
    const { data: prescriptions } = await supabase.from('prescriptions').select('*').eq('patient_medilink_id', medilink_id).order('created_at', { ascending: false })
    setPatientPrescriptions(prescriptions || [])
    fetchChat(medilink_id)
    setActiveTab('patient')
  }

  const fetchChat = async (patientId) => {
    const doctor_id = localStorage.getItem('doctor_id')
    const { data: chats } = await supabase.from('chat_messages').select('*').or(`and(sender_id.eq.${doctor_id},receiver_id.eq.${patientId}),and(sender_id.eq.${patientId},receiver_id.eq.${doctor_id})`).order('created_at', { ascending: true })
    setChatMessages(chats || [])
    // Mark messages as read
    await supabase.from('chat_messages').update({ is_read: true }).eq('receiver_id', doctor_id).eq('sender_id', patientId)
    checkUnreadMessages(doctor_id)
  }

  const addMedicine = () => setPrescription(prev => ({ ...prev, medicines: [...prev.medicines, { name: '', dosage: '', frequency: '' }] }))

  const updateMedicine = (index, field, value) => {
    const updated = [...prescription.medicines]
    updated[index][field] = value
    setPrescription(prev => ({ ...prev, medicines: updated }))
  }

  const submitPrescription = async () => {
    const doctor_id = localStorage.getItem('doctor_id')
    await supabase.from('prescriptions').insert([{ patient_medilink_id: selectedPatient, doctor_id, doctor_name: doctorName, medicines: prescription.medicines, notes: prescription.notes }])
    for (const med of prescription.medicines) {
      if (med.name) {
        await supabase.from('medicine_schedule').insert([{ patient_medilink_id: selectedPatient, medicine_name: med.name, dosage: med.dosage, frequency: med.frequency, timing: med.frequency, start_date: new Date().toISOString().split('T')[0] }])
      }
    }
    setSuccessMsg(tx.successPres)
    setTimeout(() => setSuccessMsg(''), 3000)
    setPrescription({ medicines: [{ name: '', dosage: '', frequency: '' }], notes: '' })
  }

  const sendChat = async (imageUrl = null) => {
    if (!chatInput.trim() && !imageUrl) return
    const doctor_id = localStorage.getItem('doctor_id')
    const { data } = await supabase.from('chat_messages').insert([{
      sender_id: doctor_id,
      receiver_id: selectedPatient,
      message: chatInput,
      type: 'doctor-patient',
      is_read: false,
      image_url: imageUrl
    }]).select()
    if (data) setChatMessages(prev => [...prev, data[0]])
    setChatInput('')
  }

  const handleDoctorFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLoading(true)
    const doctor_id = localStorage.getItem('doctor_id')
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `doctor-${doctor_id}/${fileName}`

    try {
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath)

      await sendChat(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      alert(`Upload failed: ${err.message || 'Check your Supabase RLS policies'}`)
    } finally {
      setLoading(false)
    }
  }

  const statusStyle = (s) => {
    if (s === 'emergency') return { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e', icon: '🚨' }
    if (s === 'completed') return { bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f', icon: '✅' }
    return { bg: '#fffbe6', color: '#d48806', border: '#ffe58f', icon: '⏳' }
  }

  const inputStyle = {
    width: '100%', border: '1.5px solid #e8ecf0', borderRadius: 12,
    padding: '12px 14px', fontSize: 14, fontFamily: "'Inter', sans-serif",
    outline: 'none', color: '#1a1f2e', background: '#f8fafc',
    marginBottom: 10, boxSizing: 'border-box'
  }

  const activeTabStyle = { background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', color: 'white', border: 'none' }
  const inactiveTabStyle = { background: 'white', color: '#6b7280', border: '1.5px solid #e8ecf0' }

  const tabs = [
    { key: 'appointments', label: '📅', full: tx.appointments },
    ...(selectedPatient ? [
      { key: 'patient', label: '👤', full: tx.patient },
      { key: 'prescribe', label: '✍️', full: tx.prescribe },
      { key: 'chat', label: '💬', full: tx.chat }
    ] : [])
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', 'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1d4ed8 100%)', padding: '52px 22px 28px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: '2px solid rgba(255,255,255,0.25)' }}>👨‍⚕️</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>{tx.portal}</p>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Dr. {doctorName}</h1>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 600 }}>{specialization}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {unreadMsgCount > 0 && (
              <div style={{ position: 'relative' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</div>
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff4d4f', color: 'white', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadMsgCount}</span>
              </div>
            )}
            <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              {tx.logout}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          {[
            { label: tx.total, value: appointments.length, icon: '📋' },
            { label: tx.emergency, value: appointments.filter(a => a.status === 'emergency').length, icon: '🚨' },
            { label: tx.pending, value: appointments.filter(a => a.status === 'pending').length, icon: '⏳' }
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '12px 8px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</p>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 22, marginBottom: 2 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, margin: '18px 18px 0', overflowX: 'auto', paddingBottom: 2 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            ...(activeTab === tab.key ? activeTabStyle : inactiveTabStyle),
            borderRadius: 20, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
            boxShadow: activeTab === tab.key ? '0 4px 14px rgba(37,99,235,0.3)' : 'none'
          }}>
            {tab.label} {tab.full}
            {tab.key === 'chat' && unreadMsgCount > 0 && <span style={{ marginLeft: 6, background: '#ff4d4f', color: 'white', fontSize: 10, borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{unreadMsgCount}</span>}
          </button>
        ))}
      </div>

      {successMsg && (
        <div style={{ margin: '14px 18px 0', background: '#f6ffed', color: '#389e0d', borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #b7eb8f' }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ padding: '18px' }}>

        {/* APPOINTMENTS TAB */}
        {activeTab === 'appointments' && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.yourAppts}</p>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => <div key={i} style={{ background: '#f0f0f0', borderRadius: 18, height: 90, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 24, padding: '52px 24px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📅</div>
                <p style={{ fontWeight: 700, color: '#1a1f2e', fontSize: 16, marginBottom: 8 }}>{tx.noAppts}</p>
                <p style={{ color: '#8c8c8c', fontSize: 13 }}>{tx.noApptsSub}</p>
              </div>
            ) : appointments.map(a => {
              const sc = statusStyle(a.status)
              return (
                <div key={a.id} style={{ background: 'white', borderRadius: 20, padding: '18px', marginBottom: 12, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', border: `1px solid ${sc.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 50, height: 50, background: sc.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{sc.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <div>
                          <p style={{ fontWeight: 800, fontSize: 16, color: '#1a1f2e', marginBottom: 2 }}>{a.patient_name || a.patient_medilink_id}</p>
                          <p style={{ fontSize: 11, color: '#9AA5B4', fontWeight: 600 }}>🪪 {a.patient_medilink_id}</p>
                        </div>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${sc.border}` }}>
                          {a.status === 'emergency' ? tx.statEmergency : a.status === 'completed' ? tx.statCompleted : tx.statPending}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 12 }}>📅</span>
                        <p style={{ fontSize: 12, color: '#4A5568', fontWeight: 600 }}>{a.date} · {tx.bookedBy} {a.booked_by === 'patient' ? tx.patient : a.booked_by === 'doctor' ? tx.doctor : a.booked_by}</p>
                      </div>
                      {a.notes && (
                        <div style={{ marginTop: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 12, borderLeft: `3px solid ${sc.color}` }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA5B4', textTransform: 'uppercase', marginBottom: 4 }}>{tx.noteLabel}</p>
                          <p style={{ fontSize: 13, color: '#1a1f2e', lineHeight: 1.5, fontWeight: 500 }}>{a.notes}</p>
                        </div>
                      )}
                      
                      {a.image_url && (
                        <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid #e8ecf0', cursor: 'pointer' }} onClick={() => window.open(a.image_url, '_blank')}>
                          <img src={a.image_url} alt="Diagnostic" style={{ width: '100%', maxHeight: 150, objectFit: 'cover', display: 'block' }} />
                          <div style={{ padding: '6px 10px', background: '#f8fafc', fontSize: 11, color: '#666', textAlign: 'center', borderTop: '1px solid #e8ecf0' }}>
                            🔍 View Diagnostic Image
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => fetchPatientDetails(a.patient_medilink_id)} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
                    {tx.viewPatient}
                  </button>
                </div>
              )
            })}
          </>
        )}

        {/* PATIENT TAB */}
        {activeTab === 'patient' && selectedPatient && (
          <>
            {patientData && (
              <div style={{ background: 'white', borderRadius: 24, padding: '22px', marginBottom: 18, boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 18, borderBottom: '1.5px solid #f0f0f0' }}>
                  <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 26, fontWeight: 700, shadow: '0 4px 14px rgba(26,158,110,0.3)', flexShrink: 0 }}>
                    {patientData.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 18, color: '#1a1f2e', marginBottom: 4 }}>{patientData.name}</p>
                    <p style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>🪪 {patientData.medilink_id}</p>
                    <span style={{ background: '#f0fff4', color: '#389e0d', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, border: '1px solid #b7eb8f' }}>{tx.activePatient}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { label: tx.bloodType, value: patientData.blood_group || 'N/A', bg: '#fff1f0', color: '#cf1322' },
                    { label: tx.age, value: patientData.age || 'N/A', bg: '#e8f3ff', color: '#1677ff' },
                    { label: tx.lang, value: language, bg: '#f6ffed', color: '#389e0d' }
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: s.color, marginBottom: 3 }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Detail items */}
                {[
                  { label: tx.phone, value: patientData.phone, icon: '📞' },
                  { label: tx.since, value: new Date(patientData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), icon: '📅' }
                ].map(d => (
                  <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{d.icon}</span>
                      <p style={{ fontSize: 14, color: '#8c8c8c', fontWeight: 500 }}>{d.label}</p>
                    </div>
                    <p style={{ fontSize: 14, color: '#1a1f2e', fontWeight: 700 }}>{d.value}</p>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.healthRecords}</p>
            {patientRecords.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 18, padding: '24px', marginBottom: 18, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#8c8c8c', fontSize: 14 }}>{tx.noRecords}</p>
              </div>
            ) : patientRecords.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ background: '#fffbe6', color: '#d48806', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, border: '1px solid #ffe58f' }}>{r.record_type}</span>
                  <p style={{ fontSize: 11, color: '#8c8c8c' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize: 14, color: '#1a1f2e', fontWeight: 600, lineHeight: 1.6 }}>{r.details}</p>
              </div>
            ))}

            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.pastPres}</p>
            {patientPrescriptions.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#8c8c8c', fontSize: 14 }}>{tx.noPres}</p>
              </div>
            ) : patientPrescriptions.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: '16px', marginBottom: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 10 }}>{new Date(p.created_at).toLocaleDateString()}</p>
                {Array.isArray(p.medicines) && p.medicines.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, background: '#e8f3ff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💊</div>
                      <p style={{ fontSize: 14, color: '#1a1f2e', fontWeight: 700 }}>{m.name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 12, color: '#1677ff', fontWeight: 600 }}>{m.dosage}</p>
                      <p style={{ fontSize: 11, color: '#8c8c8c' }}>{m.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* PRESCRIBE TAB */}
        {activeTab === 'prescribe' && selectedPatient && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.writePres}</p>
            <div style={{ background: 'white', borderRadius: 24, padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              {prescription.medicines.map((med, i) => (
                <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < prescription.medicines.length - 1 ? '1.5px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💊</div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Medicine {i + 1}</p>
                  </div>
                  <input placeholder={tx.medName} value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input placeholder={tx.dosage} value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                    <input placeholder={tx.frequency} value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                </div>
              ))}

              <button onClick={addMedicine} style={{ color: '#2563EB', background: '#e8f3ff', border: '1px solid #bdd7f7', borderRadius: 12, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: 18 }}>
                {tx.addMed}
              </button>

              <textarea placeholder={tx.notePlaceholder} value={prescription.notes} onChange={e => setPrescription(prev => ({ ...prev, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'none' }} />

              <button onClick={submitPrescription} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                {tx.sendPres}
              </button>
            </div>
          </>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && selectedPatient && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.chatWith}</p>
            <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

              {/* Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>
                  {patientData?.name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1f2e' }}>{patientData?.name || tx.patient}</p>
                  <p style={{ fontSize: 11, color: '#389e0d', fontWeight: 600 }}>● {tx.online}</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ height: 400, overflowY: 'auto', padding: '18px 16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 80 }}>
                    <p style={{ fontSize: 42, marginBottom: 10 }}>💬</p>
                    <p style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 500 }}>{tx.noMsgs}</p>
                  </div>
                ) : chatMessages.map((msg, i) => {
                  const isDoctor = msg.sender_id === localStorage.getItem('doctor_id')
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isDoctor ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                      {!isDoctor && (
                        <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {patientData?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                      )}
                      <div style={{
                        maxWidth: '72%', padding: '11px 16px',
                        borderRadius: isDoctor ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                        fontSize: 14, fontWeight: 500, lineHeight: 1.6,
                        background: isDoctor ? 'linear-gradient(135deg, #2563EB, #1E3A8A)' : 'white',
                        color: isDoctor ? 'white' : '#1a1f2e',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        border: isDoctor ? 'none' : '1px solid #e8ecf0'
                      }}>
                        {msg.image_url && (
                          <div style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)' }}>
                            <img src={msg.image_url} alt="attachment" style={{ width: '100%', display: 'block' }} />
                          </div>
                        )}
                        {msg.message}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderTop: '1.5px solid #f0f0f0', background: 'white', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer' }}>
                  <div style={{ background: '#f8fafc', border: '1.5px solid #e8ecf0', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    🖼️
                  </div>
                  <input type="file" accept="image/*" onChange={handleDoctorFileUpload} style={{ display: 'none' }} />
                </label>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder={tx.typeMsg}
                  style={{ flex: 1, border: '1.5px solid #e8ecf0', borderRadius: 50, padding: '12px 20px', fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none', background: '#f8fafc', color: '#1a1f2e' }}
                />
                <button onClick={() => sendChat()} style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: '50%', width: 46, height: 46, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>↑</button>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  )
}