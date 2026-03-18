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
  const chatBottomRef = useRef(null)
  const pollingRef = useRef(null)

  useEffect(() => {
    const id = localStorage.getItem('doctor_id')
    const name = localStorage.getItem('doctor_name')
    const spec = localStorage.getItem('doctor_specialization')
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
    const { data } = await supabase.from('appointments').select('*').eq('doctor_id', doctor_id).order('created_at', { ascending: false })
    setAppointments(data || [])
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
    setSuccessMsg('Prescription sent successfully!')
    setTimeout(() => setSuccessMsg(''), 3000)
    setPrescription({ medicines: [{ name: '', dosage: '', frequency: '' }], notes: '' })
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const doctor_id = localStorage.getItem('doctor_id')
    const { data } = await supabase.from('chat_messages').insert([{
      sender_id: doctor_id,
      receiver_id: selectedPatient,
      message: chatInput,
      type: 'doctor-patient',
      is_read: false
    }]).select()
    if (data) setChatMessages(prev => [...prev, data[0]])
    setChatInput('')
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
    { key: 'appointments', label: '📅', full: 'Appointments' },
    ...(selectedPatient ? [
      { key: 'patient', label: '👤', full: 'Patient' },
      { key: 'prescribe', label: '✍️', full: 'Prescribe' },
      { key: 'chat', label: '💬', full: 'Chat' }
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
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, marginBottom: 3 }}>Doctor Portal</p>
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
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          {[
            { label: 'Total', value: appointments.length, icon: '📋' },
            { label: 'Emergency', value: appointments.filter(a => a.status === 'emergency').length, icon: '🚨' },
            { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳' }
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
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Appointments</p>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => <div key={i} style={{ background: '#f0f0f0', borderRadius: 18, height: 90, animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 24, padding: '52px 24px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 52, marginBottom: 14 }}>📅</div>
                <p style={{ fontWeight: 700, color: '#1a1f2e', fontSize: 16, marginBottom: 8 }}>No appointments yet</p>
                <p style={{ color: '#8c8c8c', fontSize: 13 }}>Appointments will appear here when patients book.</p>
              </div>
            ) : appointments.map(a => {
              const sc = statusStyle(a.status)
              return (
                <div key={a.id} style={{ background: 'white', borderRadius: 20, padding: '18px', marginBottom: 12, boxShadow: '0 2px 14px rgba(0,0,0,0.05)', border: `1px solid ${sc.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 50, height: 50, background: sc.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{sc.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                        <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1f2e' }}>{a.patient_medilink_id}</p>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${sc.border}` }}>{a.status}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#8c8c8c' }}>📅 {a.date} · By {a.booked_by}</p>
                      {a.notes && <p style={{ fontSize: 12, color: '#8c8c8c', marginTop: 3 }}>📝 {a.notes}</p>}
                    </div>
                  </div>
                  <button onClick={() => fetchPatientDetails(a.patient_medilink_id)} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 14, padding: '13px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 4px 14px rgba(37,99,235,0.25)' }}>
                    View Patient Details →
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
                    <span style={{ background: '#f0fff4', color: '#389e0d', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, border: '1px solid #b7eb8f' }}>Active Patient</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
                  {[
                    { label: 'Blood Type', value: patientData.blood_group || 'N/A', bg: '#fff1f0', color: '#cf1322' },
                    { label: 'Age', value: patientData.age || 'N/A', bg: '#e8f3ff', color: '#1677ff' },
                    { label: 'Language', value: patientData.language_preference?.toUpperCase() || 'EN', bg: '#f6ffed', color: '#389e0d' }
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '12px 8px', textAlign: 'center' }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: s.color, marginBottom: 3 }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Detail items */}
                {[
                  { label: 'Phone', value: patientData.phone, icon: '📞' },
                  { label: 'Member Since', value: new Date(patientData.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), icon: '📅' }
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

            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Health Records</p>
            {patientRecords.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 18, padding: '24px', marginBottom: 18, textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#8c8c8c', fontSize: 14 }}>No health records found.</p>
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

            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Past Prescriptions</p>
            {patientPrescriptions.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 18, padding: '24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <p style={{ color: '#8c8c8c', fontSize: 14 }}>No prescriptions found.</p>
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
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Write Prescription</p>
            <div style={{ background: 'white', borderRadius: 24, padding: '22px', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
              {prescription.medicines.map((med, i) => (
                <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < prescription.medicines.length - 1 ? '1.5px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💊</div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Medicine {i + 1}</p>
                  </div>
                  <input placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input placeholder="Dosage (500mg)" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                    <input placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                </div>
              ))}

              <button onClick={addMedicine} style={{ color: '#2563EB', background: '#e8f3ff', border: '1px solid #bdd7f7', borderRadius: 12, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: 18 }}>
                + Add Medicine
              </button>

              <textarea placeholder="Additional notes for patient..." value={prescription.notes} onChange={e => setPrescription(prev => ({ ...prev, notes: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'none' }} />

              <button onClick={submitPrescription} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                Send Prescription →
              </button>
            </div>
          </>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && selectedPatient && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chat with Patient</p>
            <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', overflow: 'hidden' }}>

              {/* Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1.5px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700 }}>
                  {patientData?.name?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1f2e' }}>{patientData?.name || 'Patient'}</p>
                  <p style={{ fontSize: 11, color: '#389e0d', fontWeight: 600 }}>● Online</p>
                </div>
              </div>

              {/* Messages */}
              <div style={{ height: 400, overflowY: 'auto', padding: '18px 16px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 80 }}>
                    <p style={{ fontSize: 42, marginBottom: 10 }}>💬</p>
                    <p style={{ color: '#8c8c8c', fontSize: 14, fontWeight: 500 }}>No messages yet. Start the conversation!</p>
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
                        {msg.message}
                      </div>
                    </div>
                  )
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderTop: '1.5px solid #f0f0f0', background: 'white', alignItems: 'center' }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  style={{ flex: 1, border: '1.5px solid #e8ecf0', borderRadius: 50, padding: '12px 20px', fontSize: 14, fontFamily: "'Inter', sans-serif", outline: 'none', background: '#f8fafc', color: '#1a1f2e' }}
                />
                <button onClick={sendChat} style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: '50%', width: 46, height: 46, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>↑</button>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  )
}