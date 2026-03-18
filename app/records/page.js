'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Records() {
  const router = useRouter()
  const [records, setRecords] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('records')
  const [patient, setPatient] = useState(null)
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      header: 'Health Records',
      subHeader: 'Your complete health history',
      tabs: { records: 'Records', appointments: 'Appointments', profile: 'Profile' },
      loading: 'Loading...',
      noRecords: 'No records yet',
      noRecordsSub: 'Your health history will appear here.',
      noAppts: 'No appointments yet',
      noApptsSub: 'Book an appointment from Hospitals.',
      general: 'General',
      bookedBy: 'Booked by',
      status: { emergency: 'Emergency', completed: 'Completed', pending: 'Pending' },
      profile: {
        blood: 'Blood Type',
        age: 'Age',
        lang: 'Language',
        phone: 'Phone',
        id: 'MediLink ID',
        since: 'Member Since',
      }
    },
    தமிழ்: {
      header: 'உடல்நலப் பதிவுகள்',
      subHeader: 'உங்கள் முழுமையான உடல்நல வரலாறு',
      tabs: { records: 'பதிவுகள்', appointments: 'சந்திப்புகள்', profile: 'சுயவிவரம்' },
      loading: 'ஏற்றுகிறது...',
      noRecords: 'பதிவுகள் எதுவும் இல்லை',
      noRecordsSub: 'உங்கள் உடல்நல வரலாறு இங்கே தோன்றும்.',
      noAppts: 'சந்திப்புகள் எதுவும் இல்லை',
      noApptsSub: 'மருத்துவமனைகளில் இருந்து சந்திப்பை முன்பதிவு செய்யுங்கள்.',
      general: 'பொதுவானது',
      bookedBy: 'முன்பதிவு செய்தவர்',
      status: { emergency: 'அவசரநிலை', completed: 'முடிந்தது', pending: 'நிலுவையில்' },
      profile: {
        blood: 'இரத்த வகை',
        age: 'வயது',
        lang: 'மொழி',
        phone: 'தொலைபேசி',
        id: 'MediLink அடையாளம்',
        since: 'உறுப்பினர் சேர்ந்தது',
      }
    },
    हिंदी: {
      header: 'स्वास्थ्य रिकॉर्ड',
      subHeader: 'आपका संपूर्ण स्वास्थ्य इतिहास',
      tabs: { records: 'रिकॉर्ड', appointments: 'नियुक्तियाँ', profile: 'प्रोफ़ाइल' },
      loading: 'लोड हो रहा है...',
      noRecords: 'अभी कोई रिकॉर्ड नहीं',
      noRecordsSub: 'आपका स्वास्थ्य इतिहास यहाँ दिखाई देगा।',
      noAppts: 'कोई नियुक्ति नहीं',
      noApptsSub: 'अस्पतालों से अपॉइंटमेंट बुक करें।',
      general: 'सामान्य',
      bookedBy: 'द्वारा बुक किया गया',
      status: { emergency: 'आपातकाल', completed: 'पूर्ण', pending: 'लंबित' },
      profile: {
        blood: 'रक्त प्रकार',
        age: 'आयु',
        lang: 'भाषा',
        phone: 'फोन',
        id: 'MediLink पहचान',
        since: 'सदस्यता की शुरुआत',
      }
    }
  }

  const tx = t[language]

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
    if (!id) { router.push('/login'); return }
    fetchAll(id)
  }, [])

  const fetchAll = async (id) => {
    const { data: r } = await supabase.from('health_records').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false })
    const { data: a } = await supabase.from('appointments').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false })
    const { data: p } = await supabase.from('patients').select('*').eq('medilink_id', id).single()
    setRecords(r || [])
    setAppointments(a || [])
    setPatient(p)
    setLoading(false)
  }

  const statusStyle = (s) => {
    if (s === 'emergency') return { bg: '#FFECEC', color: '#C94040', icon: '🚨' }
    if (s === 'completed') return { bg: '#E8F7F1', color: '#0E8A5F', icon: '✅' }
    return { bg: '#FFF8EC', color: '#D4880A', icon: '⏳' }
  }

  const tabsItems = [
    { key: 'records', label: tx.tabs.records, count: records.length },
    { key: 'appointments', label: tx.tabs.appointments, count: appointments.length },
    { key: 'profile', label: tx.tabs.profile, count: null }
  ]

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #D4880A, #F5A623)', padding: '52px 24px 24px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{tx.header}</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{tx.subHeader}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          {tabsItems.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              background: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === tab.key ? '#D4880A' : 'white',
              border: 'none', borderRadius: 20, padding: '8px 16px',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              {tab.label}
              {tab.count !== null && <span style={{ background: activeTab === tab.key ? '#FFF8EC' : 'rgba(255,255,255,0.3)', color: activeTab === tab.key ? '#D4880A' : 'white', borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? <p style={{ color: '#9AA5B4' }}>{tx.loading}</p> :

          activeTab === 'records' ? (
            records.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 72, height: 72, background: '#FFF8EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>📋</div>
                <p style={{ fontWeight: 700, color: '#1A1F2E', fontSize: 16, marginBottom: 6 }}>{tx.noRecords}</p>
                <p style={{ fontSize: 14, color: '#9AA5B4' }}>{tx.noRecordsSub}</p>
              </div>
            ) : records.map(r => (
              <div key={r.id} style={{ background: 'white', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ background: '#FFF8EC', color: '#D4880A', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{r.record_type || tx.general}</span>
                  <p style={{ fontSize: 12, color: '#9AA5B4' }}>{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <p style={{ fontSize: 14, color: '#1A1F2E', fontWeight: 600, lineHeight: 1.6 }}>{r.details}</p>
              </div>
            ))

          ) : activeTab === 'appointments' ? (
            appointments.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 72, height: 72, background: '#FFF8EC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>📅</div>
                <p style={{ fontWeight: 700, color: '#1A1F2E', fontSize: 16, marginBottom: 6 }}>{tx.noAppts}</p>
                <p style={{ fontSize: 14, color: '#9AA5B4' }}>{tx.noApptsSub}</p>
              </div>
            ) : appointments.map(a => {
              const sc = statusStyle(a.status)
              return (
                <div key={a.id} style={{ background: 'white', borderRadius: 18, padding: '16px', marginBottom: 12, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, background: sc.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{sc.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{tx.status[a.status] || a.status}</span>
                      <p style={{ fontSize: 12, color: '#9AA5B4' }}>{a.date}</p>
                    </div>
                    <p style={{ fontSize: 13, color: '#9AA5B4', fontWeight: 500 }}>{tx.bookedBy}: {a.booked_by}</p>
                    {a.notes && <p style={{ fontSize: 12, color: '#9AA5B4', marginTop: 2 }}>{a.notes}</p>}
                  </div>
                </div>
              )
            })

          ) : patient && (
            <div style={{ background: 'white', borderRadius: 24, padding: '24px', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1.5px solid #EDF0F5' }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'white', fontWeight: 700 }}>
                  {patient.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 18, color: '#1A1F2E' }}>{patient.name}</p>
                  <p style={{ fontSize: 13, color: '#9AA5B4' }}>{patient.medilink_id}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: tx.profile.blood, value: patient.blood_group || 'N/A', bg: '#FFECEC', color: '#C94040' },
                  { label: tx.profile.age, value: patient.age || 'N/A', bg: '#EBF4FF', color: '#2563EB' },
                  { label: tx.profile.lang, value: language, bg: '#E8F7F1', color: '#0E8A5F' }
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                    <p style={{ fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: s.color, opacity: 0.8, fontWeight: 600 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              {[
                { label: tx.profile.phone, value: patient.phone, icon: '📞' },
                { label: tx.profile.id, value: patient.medilink_id, icon: '🪪' },
                { label: tx.profile.since, value: new Date(patient.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }), icon: '📅' }
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #EDF0F5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{d.icon}</span>
                    <p style={{ fontSize: 14, color: '#9AA5B4', fontWeight: 500 }}>{d.label}</p>
                  </div>
                  <p style={{ fontSize: 14, color: '#1A1F2E', fontWeight: 700 }}>{d.value}</p>
                </div>
              ))}
            </div>
          )
        }
      </div>

    </main>
  )
}