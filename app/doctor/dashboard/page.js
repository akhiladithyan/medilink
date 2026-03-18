'use client'
import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const id = localStorage.getItem('doctor_id')
    const name = localStorage.getItem('doctor_name')
    const spec = localStorage.getItem('doctor_specialization')
    if (!id) { router.push('/doctor/login'); return }
    setDoctorName(name || 'Doctor')
    setSpecialization(spec || '')
    fetchAppointments(id)
  }, [])

  const fetchAppointments = async (doctor_id) => {
    const { data } = await supabase.from('appointments').select('*').eq('doctor_id', doctor_id).order('created_at', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }

  const fetchPatientDetails = async (medilink_id) => {
    setSelectedPatient(medilink_id)
    const { data: pat } = await supabase.from('patients').select('*').eq('medilink_id', medilink_id).single()
    setPatientData(pat)
    const { data: records } = await supabase.from('health_records').select('*').eq('patient_medilink_id', medilink_id).order('created_at', { ascending: false })
    setPatientRecords(records || [])
    const { data: prescriptions } = await supabase.from('prescriptions').select('*').eq('patient_medilink_id', medilink_id).order('created_at', { ascending: false })
    setPatientPrescriptions(prescriptions || [])
    const { data: chats } = await supabase.from('chat_messages').select('*').or(`sender_id.eq.${medilink_id},receiver_id.eq.${medilink_id}`).order('created_at', { ascending: true })
    setChatMessages(chats || [])
    setActiveTab('patient')
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
    const { data } = await supabase.from('chat_messages').insert([{ sender_id: doctor_id, receiver_id: selectedPatient, message: chatInput, type: 'doctor-patient' }]).select()
    if (data) setChatMessages(prev => [...prev, data[0]])
    setChatInput('')
  }

  const statusStyle = (s) => {
    if (s === 'emergency') return { bg: '#FFECEC', color: '#C94040', icon: '🚨' }
    if (s === 'completed') return { bg: '#E8F7F1', color: '#0E8A5F', icon: '✅' }
    return { bg: '#FFF8EC', color: '#D4880A', icon: '⏳' }
  }

  const inputStyle = { width: '100%', border: '2px solid #EDF0F5', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC', marginBottom: 10 }

  const mainTabs = [
    { key: 'appointments', label: '📅 Appointments' },
    ...(selectedPatient ? [
      { key: 'patient', label: '👤 Patient' },
      { key: 'prescribe', label: '✍️ Prescribe' },
      { key: 'chat', label: '💬 Chat' }
    ] : [])
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', padding: '52px 24px 24px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👨‍⚕️</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500 }}>Doctor Portal</p>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>Dr. {doctorName}</h1>
              <span style={{ background: 'rgba(255,255,255,0.18)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{specialization}</span>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
          {[
            { label: 'Total', value: appointments.length },
            { label: 'Emergency', value: appointments.filter(a => a.status === 'emergency').length },
            { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length }
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16, overflowX: 'auto', position: 'relative', paddingBottom: 2 }}>
          {mainTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.18)',
              color: activeTab === tab.key ? '#2563EB' : 'white',
              border: 'none', borderRadius: 20, padding: '8px 16px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div style={{ margin: '16px 20px 0', background: '#E8F7F1', color: '#0E8A5F', borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ padding: '20px' }}>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Your Appointments</p>
            {loading ? <p style={{ color: '#9AA5B4' }}>Loading...</p> :
              appointments.length === 0 ? (
                <div style={{ background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: 72, height: 72, background: '#EBF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>📅</div>
                  <p style={{ fontWeight: 700, color: '#1A1F2E', fontSize: 16 }}>No appointments yet</p>
                </div>
              ) : appointments.map(a => {
                const sc = statusStyle(a.status)
                return (
                  <div key={a.id} style={{ background: 'white', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 46, height: 46, background: sc.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{sc.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1F2E' }}>{a.patient_medilink_id}</p>
                          <span style={{ ...statusStyle(a.status), background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{a.status}</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#9AA5B4' }}>📅 {a.date} · {a.booked_by}</p>
                        {a.notes && <p style={{ fontSize: 12, color: '#9AA5B4', marginTop: 2 }}>{a.notes}</p>}
                      </div>
                    </div>
                    <button onClick={() => fetchPatientDetails(a.patient_medilink_id)} style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 12, padding: '11px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      View Patient Details →
                    </button>
                  </div>
                )
              })
            }
          </>
        )}

        {/* Patient Tab */}
        {activeTab === 'patient' && selectedPatient && (
          <>
            {patientData && (
              <div style={{ background: 'white', borderRadius: 20, padding: '20px', marginBottom: 16, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, paddingBottom: 16, borderBottom: '1.5px solid #EDF0F5' }}>
                  <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
                    {patientData.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 17, color: '#1A1F2E' }}>{patientData.name}</p>
                    <p style={{ fontSize: 12, color: '#9AA5B4' }}>{patientData.medilink_id}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'Blood', value: patientData.blood_group || 'N/A', bg: '#FFECEC', color: '#C94040' },
                    { label: 'Age', value: patientData.age || 'N/A', bg: '#EBF4FF', color: '#2563EB' },
                    { label: 'Phone', value: patientData.phone?.slice(-4) ? `****${patientData.phone.slice(-4)}` : 'N/A', bg: '#E8F7F1', color: '#0E8A5F' }
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: 11, color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Health Records</p>
            {patientRecords.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1.5px solid #EDF0F5', textAlign: 'center' }}>
                <p style={{ color: '#9AA5B4', fontSize: 14 }}>No health records found.</p>
              </div>
            ) : patientRecords.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: 16, padding: '14px', marginBottom: 10, border: '1.5px solid #EDF0F5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ background: '#FFF8EC', color: '#D4880A', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{r.record_type}</span>
                  <p style={{ fontSize: 11, color: '#9AA5B4' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize: 14, color: '#1A1F2E', fontWeight: 600 }}>{r.details}</p>
              </div>
            ))}

            <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', margin: '16px 0 12px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Past Prescriptions</p>
            {patientPrescriptions.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1.5px solid #EDF0F5', textAlign: 'center' }}>
                <p style={{ color: '#9AA5B4', fontSize: 14 }}>No prescriptions found.</p>
              </div>
            ) : patientPrescriptions.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: 16, padding: '14px', marginBottom: 10, border: '1.5px solid #EDF0F5' }}>
                <p style={{ fontSize: 11, color: '#9AA5B4', marginBottom: 8 }}>{new Date(p.created_at).toLocaleDateString()}</p>
                {Array.isArray(p.medicines) && p.medicines.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #EDF0F5' }}>
                    <p style={{ fontSize: 13, color: '#1A1F2E', fontWeight: 700 }}>{m.name}</p>
                    <p style={{ fontSize: 12, color: '#9AA5B4' }}>{m.dosage} · {m.frequency}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {/* Prescribe Tab */}
        {activeTab === 'prescribe' && selectedPatient && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Write Prescription</p>
            <div style={{ background: 'white', borderRadius: 20, padding: '20px', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

              {prescription.medicines.map((med, i) => (
                <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < prescription.medicines.length - 1 ? '1.5px solid #EDF0F5' : 'none' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#9AA5B4', marginBottom: 8, textTransform: 'uppercase' }}>Medicine {i + 1}</p>
                  <input placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} style={inputStyle} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <input placeholder="Dosage (500mg)" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                    <input placeholder="Frequency" value={med.frequency} onChange={e => updateMedicine(i, 'frequency', e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                  </div>
                </div>
              ))}

              <button onClick={addMedicine} style={{ color: '#2563EB', background: '#EBF4FF', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>
                + Add Medicine
              </button>

              <textarea
                placeholder="Additional notes for patient..."
                value={prescription.notes}
                onChange={e => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />

              <button onClick={submitPrescription} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 20px rgba(37,99,235,0.3)' }}>
                Send Prescription →
              </button>
            </div>
          </>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && selectedPatient && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Chat with Patient</p>
            <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ height: 360, overflowY: 'auto', padding: '16px', background: '#F7F9FC', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {chatMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 60 }}>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
                    <p style={{ color: '#9AA5B4', fontSize: 14 }}>No messages yet. Start the conversation!</p>
                  </div>
                ) : chatMessages.map((msg, i) => {
                  const isDoctor = msg.sender_id === localStorage.getItem('doctor_id')
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isDoctor ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: isDoctor ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, fontWeight: 600, lineHeight: 1.5, background: isDoctor ? 'linear-gradient(135deg, #2563EB, #1E3A8A)' : 'white', color: isDoctor ? 'white' : '#1A1F2E', border: isDoctor ? 'none' : '1.5px solid #EDF0F5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        {msg.message}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 10, padding: '12px 16px', borderTop: '1.5px solid #EDF0F5', background: 'white' }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Type a message..."
                  style={{ flex: 1, border: '2px solid #EDF0F5', borderRadius: 50, padding: '11px 18px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#F7F9FC' }}
                />
                <button onClick={sendChat} style={{ background: 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: '50%', width: 44, height: 44, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</button>
              </div>
            </div>
          </>
        )}

      </div>
    </main>
  )
}