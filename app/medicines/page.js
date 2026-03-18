'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Medicines() {
  const router = useRouter()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      header: 'Medicine Schedule',
      prescribed: (n) => `${n} medicines prescribed`,
      total: 'Total',
      morning: 'Morning',
      afternoon: 'Afternoon',
      night: 'Night',
      loading: 'Loading...',
      noMeds: 'No medicines yet',
      noMedsSub: 'Your doctor will add your medicine schedule after consultation.',
      asNeeded: 'As needed',
      twiceDaily: 'Twice Daily',
      ongoing: 'ongoing',
    },
    தமிழ்: {
      header: 'மருந்து அட்டவணை',
      prescribed: (n) => `${n} மருந்துகள் பரிந்துரைக்கப்பட்டுள்ளன`,
      total: 'மொத்தம்',
      morning: 'காலை',
      afternoon: 'மதியம்',
      night: 'இரவு',
      loading: 'ஏற்றுகிறது...',
      noMeds: 'மருந்துகள் எதுவும் இல்லை',
      noMedsSub: 'ஆலோசனைக்குப் பிறகு உங்கள் மருத்துவர் உங்கள் மருந்து அட்டவணையைச் சேர்ப்பார்.',
      asNeeded: 'தேவைப்படும்போது',
      twiceDaily: 'ஒரு நாளைக்கு இருமுறை',
      ongoing: 'தற்போது',
    },
    हिंदी: {
      header: 'दवाओं की समय-सारणी',
      prescribed: (n) => `${n} दवाएं निर्धारित की गई हैं`,
      total: 'कुल',
      morning: 'सुबह',
      afternoon: 'दोपहर',
      night: 'रात',
      loading: 'लोड हो रहा है...',
      noMeds: 'अभी कोई दवा नहीं',
      noMedsSub: 'परामर्श के बाद आपके डॉक्टर आपकी दवाओं की समय-सारणी जोड़ देंगे।',
      asNeeded: 'आवश्यकतानुसार',
      twiceDaily: 'दिन में दो बार',
      ongoing: 'जारी है',
    }
  }

  const tx = t[language]

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
    if (!id) { router.push('/login'); return }
    fetchMedicines(id)
  }, [])

  const fetchMedicines = async (id) => {
    const { data } = await supabase.from('medicine_schedule').select('*').eq('patient_medilink_id', id).order('created_at', { ascending: false })
    setMedicines(data || [])
    setLoading(false)
  }

  const timingInfo = (timing) => {
    if (!timing) return { bg: '#E8F7F1', color: '#0E8A5F', icon: '💊', label: tx.asNeeded }
    const low = timing.toLowerCase()
    if (low.includes('morning')) return { bg: '#FFF8EC', color: '#D4880A', icon: '🌅', label: tx.morning }
    if (low.includes('night')) return { bg: '#EBF4FF', color: '#2563EB', icon: '🌙', label: tx.night }
    if (low.includes('afternoon')) return { bg: '#FFECEC', color: '#C94040', icon: '☀️', label: tx.afternoon }
    if (low.includes('twice')) return { bg: '#F3EEFF', color: '#7C3AED', icon: '🔁', label: tx.twiceDaily }
    return { bg: '#E8F7F1', color: '#0E8A5F', icon: '💊', label: timing }
  }

  const grouped = medicines.reduce((acc, m) => {
    const key = m.timing || tx.asNeeded
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #C94040, #E85555)', padding: '52px 24px 28px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{tx.header}</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{tx.prescribed(medicines.length)}</p>
          </div>
        </div>

        {/* Today's count */}
        {medicines.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, position: 'relative' }}>
            {[
              { label: tx.total, value: medicines.length },
              { label: tx.morning, value: medicines.filter(m => m.timing?.toLowerCase().includes('morning')).length },
              { label: tx.night, value: medicines.filter(m => m.timing?.toLowerCase().includes('night')).length }
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: '10px', textAlign: 'center' }}>
                <p style={{ color: 'white', fontWeight: 700, fontSize: 20 }}>{s.value}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ color: '#9AA5B4' }}>{tx.loading}</p>
        ) : medicines.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 72, height: 72, background: '#FFECEC', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px' }}>💊</div>
            <p style={{ fontWeight: 700, color: '#1A1F2E', fontSize: 16, marginBottom: 6 }}>{tx.noMeds}</p>
            <p style={{ fontSize: 14, color: '#9AA5B4' }}>{tx.noMedsSub}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([timing, meds]) => {
            const ti = timingInfo(timing)
            return (
              <div key={timing} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{ti.icon}</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{ti.label}</p>
                  <div style={{ flex: 1, height: 1, background: '#EDF0F5' }}></div>
                  <span style={{ background: ti.bg, color: ti.color, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>{meds.length}</span>
                </div>
                {meds.map(m => (
                  <div key={m.id} style={{ background: 'white', borderRadius: 18, padding: '14px 16px', marginBottom: 10, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 50, height: 50, background: ti.bg, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{ti.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1F2E', marginBottom: 4 }}>{m.medicine_name}</p>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ background: ti.bg, color: ti.color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{m.dosage}</span>
                        <span style={{ background: '#F7F9FC', color: '#9AA5B4', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, border: '1px solid #EDF0F5' }}>{m.frequency}</span>
                      </div>
                      {m.start_date && <p style={{ fontSize: 11, color: '#9AA5B4', marginTop: 6, fontWeight: 500 }}>📅 {m.start_date} {m.end_date ? `→ ${m.end_date}` : `→ ${tx.ongoing}`}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>

    </main>
  )
}