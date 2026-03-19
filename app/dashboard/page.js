'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OnDocBot from '@/components/OnDocBot'
import PatientChat from '@/components/PatientChat'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [medilink_id, setMedilinkId] = useState('')
  const [language, setLanguage] = useState('English')
  const [greeting, setGreeting] = useState('Good day')
  const [appointments, setAppointments] = useState([])
  const [patient, setPatient] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const langNames = { en: 'English', ta: 'தமிழ்', hi: 'हिंदी' }

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const n = localStorage.getItem('patient_name')
    const savedLang = localStorage.getItem('medilink_lang')
    if (savedLang) setLanguage(savedLang)
    if (!id) { router.push('/login'); return }
    setMedilinkId(id)
    setName(n || 'Patient')
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else setGreeting('Good evening')
    fetchData(id)
  }, [])

  const fetchData = async (id) => {
    const { data: appts } = await supabase.from('appointments').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false }).limit(3)
    setAppointments(appts || [])
    const { data: pat } = await supabase.from('patients').select('*').eq('medilink_id', id).single()
    setPatient(pat)
    const { data: chats } = await supabase.from('chat_messages').select('id').eq('receiver_id', id).eq('is_read', false)
    setUnreadCount(chats?.length || 0)
  }

  const setLang = (name) => {
    setLanguage(name)
    localStorage.setItem('medilink_lang', name)
  }

  const t = {
    English: {
      greeting: greeting,
      id: 'MediLink ID',
      quickAccess: 'Quick Access',
      doctor: 'Doctors',
      hospital: 'Hospitals',
      prescriptions: 'Prescriptions',
      records: 'Health Records',
      medicines: 'Medicines',
      upcoming: 'Upcoming Appointments',
      noAppts: 'No appointments yet',
      status: { emergency: 'Emergency', completed: 'Completed', pending: 'Pending' },
      logout: 'Logout',
    },
    தமிழ்: {
      greeting: greeting === 'Good morning' ? 'காலை வணக்கம்' : greeting === 'Good afternoon' ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்',
      id: 'MediLink அடையாளம்',
      quickAccess: 'விரைவு அணுகல்',
      doctor: 'மருத்துவர்கள்',
      hospital: 'மருத்துவமனை',
      prescriptions: 'மருந்து சீட்டு',
      records: 'உடல்நல பதிவு',
      medicines: 'மருந்துகள்',
      upcoming: 'வரவிருக்கும் சந்திப்புகள்',
      noAppts: 'சந்திப்புகள் இல்லை',
      status: { emergency: 'அவசரநிலை', completed: 'முடிந்தது', pending: 'நிலுவையில்' },
      logout: 'வெளியேறு',
    },
    हिंदी: {
      greeting: greeting === 'Good morning' ? 'सुप्रभात' : greeting === 'Good afternoon' ? 'नमस्ते' : 'शुभ संध्या',
      id: 'MediLink पहचान',
      quickAccess: 'त्वरित पहुँच',
      doctor: 'डॉक्टर',
      hospital: 'अस्पताल',
      prescriptions: 'नुस्खे',
      records: 'स्वास्थ्य रिकॉर्ड',
      medicines: 'दवाइयाँ',
      upcoming: 'आगामी नियुक्तियाँ',
      noAppts: 'कोई नियुक्ति नहीं',
      status: { emergency: 'आपातकाल', completed: 'पूर्ण', pending: 'लंबित' },
      logout: 'लॉगआउट',
    }
  }

  const tx = t[language]

  const cards = [
    { label: tx.hospital, icon: '🏥', href: '/hospitals', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
    { label: tx.prescriptions, icon: '📄', href: '/prescriptions', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
    { label: tx.records, icon: '📋', href: '/records', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
    { label: tx.medicines, icon: '💊', href: '/medicines', gradient: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  ]

  const statusColor = (s) =>
    s === 'emergency' ? { bg: '#fff1f0', color: '#cf1322', border: '#ffa39e' } :
    s === 'completed' ? { bg: '#f6ffed', color: '#389e0d', border: '#b7eb8f' } :
    { bg: '#fffbe6', color: '#d48806', border: '#ffe58f' }

  return (
    <main style={{ minHeight: '100vh', background: '#f0f4ff', fontFamily: "'Inter', 'DM Sans', sans-serif", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A9E6E 0%, #0e6e4a 100%)', padding: '52px 22px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        {/* Top Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '2px solid rgba(255,255,255,0.3)' }}>🧑</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{tx.greeting} 👋</p>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, letterSpacing: '-0.3px' }}>{name}</h1>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <Link href="/records" style={{ textDecoration: 'none' }}>
                <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</div>
              </Link>
              {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ff4d4f', color: 'white', fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unreadCount}</span>}
            </div>
            <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', borderRadius: 20, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{tx.logout}</button>
          </div>
        </div>

        {/* MediLink ID badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 30, padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', position: 'relative' }}>
          <div style={{ width: 7, height: 7, background: '#a8ffd8', borderRadius: '50%' }} />
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 600 }}>{tx.id}: {medilink_id}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, position: 'relative' }}>
          {[['English', 'EN'], ['தமிழ்', 'தமிழ்'], ['हिंदी', 'हिं']].map(([name, label]) => (
            <button key={name} onClick={() => setLang(name)} style={{
              background: language === name ? 'white' : 'rgba(255,255,255,0.18)',
              color: language === name ? '#1A9E6E' : 'white',
              border: 'none', borderRadius: 20, padding: '6px 14px',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Patient Stats Card — floating over header */}
      {patient && (
        <div style={{ margin: '0 18px', marginTop: -44, background: 'white', borderRadius: 22, padding: '18px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, position: 'relative', zIndex: 10, border: '1px solid rgba(255,255,255,0.8)' }}>
          {[
            { label: '🩸 Blood', value: patient.blood_group || 'N/A', color: '#cf1322' },
            { label: '🎂 Age', value: patient.age || 'N/A', color: '#1677ff' },
            { label: '📞 Phone', value: patient.phone ? `****${patient.phone.slice(-4)}` : 'N/A', color: '#389e0d' }
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: 'center', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none', padding: '4px 8px' }}>
              <p style={{ fontWeight: 800, fontSize: 18, color: s.color, marginBottom: 3 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#8c8c8c', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Access */}
      <div style={{ padding: '24px 18px 0' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.quickAccess}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {cards.map(card => (
            <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 22, padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', cursor: 'pointer', border: '1px solid #f0f0f0', transition: 'transform 0.15s' }}>
                <div style={{ width: 50, height: 50, background: card.gradient, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{card.icon}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1f2e', lineHeight: 1.3 }}>{card.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div style={{ padding: '24px 18px 0' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#8c8c8c', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tx.upcoming}</p>
        {appointments.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 22, padding: '36px 20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
            <p style={{ color: '#8c8c8c', fontSize: 14 }}>{tx.noAppts}</p>
          </div>
        ) : appointments.map(a => {
          const sc = statusColor(a.status)
          return (
            <div key={a.id} style={{ background: 'white', borderRadius: 18, padding: '16px', marginBottom: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${sc.border}` }}>
              <div style={{ width: 46, height: 46, background: sc.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {a.status === 'emergency' ? '🚨' : a.status === 'completed' ? '✅' : '⏳'}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1f2e', marginBottom: 3 }}>{a.notes || 'Appointment'}</p>
                <p style={{ fontSize: 12, color: '#8c8c8c' }}>📅 {a.date} · {a.booked_by}</p>
              </div>
              <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 700, border: `1px solid ${sc.border}` }}>
                {tx.status[a.status] || a.status}
              </span>
            </div>
          )
        })}
      </div>

      <PatientChat />
      <OnDocBot />
    </main>
  )
}