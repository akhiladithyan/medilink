'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Prescriptions() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      header: 'Prescriptions',
      total: (n) => `${n} prescriptions total`,
      loading: 'Loading...',
      noPres: 'No prescriptions yet',
      noPresSub: 'Your doctor will add prescriptions after consultation.',
      prescribedMeds: 'Prescribed Medicines',
      notes: 'Notes',
      date: (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    தமிழ்: {
      header: 'மருந்துச் சீட்டுகள்',
      total: (n) => `மொத்தம் ${n} மருந்துச் சீட்டுகள்`,
      loading: 'ஏற்றுகிறது...',
      noPres: 'மருந்துச் சீட்டுகள் எதுவும் இல்லை',
      noPresSub: 'ஆலோசனைக்குப் பிறகு உங்கள் மருத்துவர் மருந்துச் சீட்டுகளைச் சேர்ப்பார்.',
      prescribedMeds: 'பரிந்துரைக்கப்பட்ட மருந்துகள்',
      notes: 'குறிப்புகள்',
      date: (d) => new Date(d).toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    },
    हिंदी: {
      header: 'नुस्खे',
      total: (n) => `कुल ${n} नुस्खे`,
      loading: 'लोड हो रहा है...',
      noPres: 'अभी कोई नुस्खा नहीं',
      noPresSub: 'परामर्श के बाद आपके डॉक्टर नुस्खे जोड़ देंगे।',
      prescribedMeds: 'निर्धारित दवाएं',
      notes: 'नोट्स',
      date: (d) => new Date(d).toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
    }
  }

  const tx = t[language]

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
    if (!id) { router.push('/login'); return }
    fetchPrescriptions(id)
  }, [])

  const fetchPrescriptions = async (id) => {
    const { data } = await supabase.from('prescriptions').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false })
    setPrescriptions(data || [])
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2563EB, #4A90D9)', padding: '52px 24px 28px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{tx.header}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{tx.total(prescriptions.length)}</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2].map(i => <div key={i} style={{ background: 'white', borderRadius: 20, height: 120, border: '1.5px solid #EDF0F5' }}></div>)}
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 72, height: 72, background: '#EBF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>📄</div>
            <p style={{ fontWeight: 700, color: '#1A1F2E', fontSize: 16, marginBottom: 6 }}>{tx.noPres}</p>
            <p style={{ fontSize: 14, color: '#9AA5B4' }}>{tx.noPresSub}</p>
          </div>
        ) : prescriptions.map(p => (
          <div key={p.id} style={{ background: 'white', borderRadius: 20, padding: '18px', marginBottom: 14, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>

            {/* Prescription Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, background: '#EBF4FF', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍⚕️</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1F2E' }}>Dr. {p.doctor_name || 'N/A'}</p>
                  <p style={{ fontSize: 12, color: '#9AA5B4' }}>{tx.date(p.created_at)}</p>
                </div>
              </div>
              <span style={{ background: '#EBF4FF', color: '#2563EB', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>Digital Rx</span>
            </div>

            {/* Medicines */}
            <div style={{ background: '#F7F9FC', borderRadius: 14, padding: '14px', border: '1px solid #EDF0F5' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9AA5B4', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>{tx.prescribedMeds}</p>
              {Array.isArray(p.medicines) ? p.medicines.map((med, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < p.medicines.length - 1 ? '1px solid #EDF0F5' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, background: '#EBF4FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💊</div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: '#1A1F2E' }}>{med.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: '#4A90D9', fontWeight: 600 }}>{med.dosage}</p>
                    <p style={{ fontSize: 11, color: '#9AA5B4' }}>{med.frequency}</p>
                  </div>
                </div>
              )) : <p style={{ fontSize: 14, color: '#1A1F2E' }}>{p.medicines}</p>}
            </div>

            {p.notes && (
              <div style={{ marginTop: 10, background: '#FFF8EC', borderRadius: 12, padding: '10px 14px', border: '1px solid #FDECC8' }}>
                <p style={{ fontSize: 13, color: '#D4880A', fontWeight: 600 }}>📝 {p.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}