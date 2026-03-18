'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import OnDocBot from '@/components/OnDocBot'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [medilink_id, setMedilinkId] = useState('')
  const [language, setLanguage] = useState('en')
  const [greeting, setGreeting] = useState('Good day')
  const [appointments, setAppointments] = useState([])
  const [patient, setPatient] = useState(null)

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const n = localStorage.getItem('patient_name')
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
    const { data: appts } = await supabase.from('appointments').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false }).limit(2)
    setAppointments(appts || [])
    const { data: pat } = await supabase.from('patients').select('*').eq('medilink_id', id).single()
    setPatient(pat)
  }

  const labels = {
    en: { hospitals: 'Hospitals', prescriptions: 'Prescriptions', records: 'Health Records', medicines: 'Medicines' },
    ta: { hospitals: 'மருத்துவமனை', prescriptions: 'மருந்து சீட்டு', records: 'உடல்நல பதிவு', medicines: 'மருந்துகள்' },
    hi: { hospitals: 'अस्पताल', prescriptions: 'नुस्खे', records: 'स्वास्थ्य रिकॉर्ड', medicines: 'दवाइयाँ' }
  }
  const t = labels[language]

  const cards = [
    { label: t.hospitals, icon: '🏥', href: '/hospitals', bg: '#E8F7F1', color: '#0E8A5F' },
    { label: t.prescriptions, icon: '📄', href: '/prescriptions', bg: '#EBF4FF', color: '#4A90D9' },
    { label: t.records, icon: '📋', href: '/records', bg: '#FFF8EC', color: '#D4880A' },
    { label: t.medicines, icon: '💊', href: '/medicines', bg: '#FFECEC', color: '#C94040' },
  ]

  const statusColor = (s) => s === 'emergency' ? { bg: '#FFECEC', color: '#C94040' } : s === 'completed' ? { bg: '#E8F7F1', color: '#0E8A5F' } : { bg: '#FFF8EC', color: '#D4880A' }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', padding: '52px 24px 28px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{greeting} 👋</p>
            <h1 style={{ color: 'white', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>{name}</h1>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 12px' }}>
              <div style={{ width: 6, height: 6, background: '#A8FFD8', borderRadius: '50%' }}></div>
              <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{medilink_id}</span>
            </div>
          </div>
          <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: 'white', borderRadius: 12, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        {/* Patient Stats */}
        {patient && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, position: 'relative' }}>
            {[
              { label: 'Blood', value: patient.blood_group || 'N/A' },
              { label: 'Age', value: patient.age || 'N/A' },
              { label: 'Phone', value: patient.phone?.slice(-4) ? `****${patient.phone.slice(-4)}` : 'N/A' }
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Language Switcher */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 20px 0' }}>
        {[['en', 'English'], ['ta', 'தமிழ்'], ['hi', 'हिंदी']].map(([code, label]) => (
          <button key={code} onClick={() => setLanguage(code)} style={{
            background: language === code ? '#1A9E6E' : 'white',
            color: language === code ? 'white' : '#9AA5B4',
            border: language === code ? 'none' : '1.5px solid #EDF0F5',
            borderRadius: 20, padding: '6px 14px',
            fontSize: 12, fontWeight: 600, cursor: 'pointer'
          }}>{label}</button>
        ))}
      </div>

      {/* Quick Access */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Quick Access</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {cards.map(card => (
            <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'white', borderRadius: 20, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, background: card.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{card.icon}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1F2E' }}>{card.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Recent Appointments</p>
          {appointments.map(a => {
            const sc = statusColor(a.status)
            return (
              <div key={a.id} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', marginBottom: 10, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: sc.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📅</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1F2E' }}>Appointment</p>
                    <p style={{ fontSize: 12, color: '#9AA5B4' }}>{a.date}</p>
                  </div>
                </div>
                <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{a.status}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Health Tip */}
      <div style={{ margin: '20px', background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', borderRadius: 20, padding: '18px 20px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#A8FFD8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Daily Tip</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'white', lineHeight: 1.5 }}>💧 Drink 8 glasses of water daily. Staying hydrated improves energy, focus and skin health!</p>
      </div>

      <OnDocBot />
    </main>
  )
}