'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const HospitalMap = dynamic(() => import('@/components/HospitalMap'), { ssr: false })

export default function Hospitals() {
  const router = useRouter()
  const [hospitals, setHospitals] = useState([])
  const [doctors, setDoctors] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bookingMsg, setBookingMsg] = useState('')
  const [search, setSearch] = useState('')
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      header: 'Nearby Hospitals',
      hospitalsFound: (n) => `${n} hospitals found`,
      searchPlaceholder: 'Search hospitals or doctors...',
      selectHospital: 'Select a Hospital',
      loading: 'Loading hospitals...',
      open247: 'Open 24/7',
      viewDocs: 'View Doctors →',
      hideDocs: 'Hide Doctors ↑',
      specialists: 'Available Specialists',
      noDocs: 'No doctors listed.',
      book: 'Book',
      success: 'Appointment booked successfully!',
    },
    தமிழ்: {
      header: 'அருகிலுள்ள மருத்துவமனைகள்',
      hospitalsFound: (n) => `${n} மருத்துவமனைகள் உள்ளன`,
      searchPlaceholder: 'மருத்துவமனைகள் அல்லது மருத்துவர்களைத் தேடுங்கள்...',
      selectHospital: 'ஒரு மருத்துவமனையைத் தேர்ந்தெடுக்கவும்',
      loading: 'மருத்துவமனைகளை ஏற்றுகிறது...',
      open247: '24/7 திறந்திருக்கும்',
      viewDocs: 'மருத்துவர்களைக் காண்க →',
      hideDocs: 'மருத்துவர்களை மறைக்கவும் ↑',
      specialists: 'கிடைக்கக்கூடிய நிபுணர்கள்',
      noDocs: 'மருத்துவர்கள் யாரும் இல்லை.',
      book: 'முன்பதிவு',
      success: 'சந்திப்பு வெற்றிகரமாக முன்பதிவு செய்யப்பட்டது!',
    },
    हिंदी: {
      header: 'निकटतम अस्पताल',
      hospitalsFound: (n) => `${n} अस्पताल मिले`,
      searchPlaceholder: 'अस्पताल या डॉक्टरों की खोज करें...',
      selectHospital: 'अस्पताल चुनें',
      loading: 'अस्पताल लोड हो रहे हैं...',
      open247: '24/7 खुला',
      viewDocs: 'डॉक्टर देखें →',
      hideDocs: 'डॉक्टर छिपाएं ↑',
      specialists: 'उपलब्ध विशेषज्ञ',
      noDocs: 'कोई डॉक्टर सूचीबद्ध नहीं है।',
      book: 'बुक करें',
      success: 'अपॉइंटमेंट सफलतापूर्वक बुक हो गया!',
    }
  }

  const tx = t[language]

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
    if (!id) { router.push('/login'); return }
    fetchHospitals()
  }, [])

  const fetchHospitals = async () => {
    const { data } = await supabase.from('hospitals').select('*')
    setHospitals(data || [])
    setLoading(false)
  }

  const fetchDoctors = async (hospital_id) => {
    const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hospital_id)
    setDoctors(data || [])
    setSelectedHospital(selectedHospital === hospital_id ? null : hospital_id)
  }

  const bookAppointment = async (doctor_id) => {
    const medilink_id = localStorage.getItem('medilink_id')
    const { error } = await supabase.from('appointments').insert([{ patient_medilink_id: medilink_id, doctor_id, hospital_id: selectedHospital, date: new Date().toISOString().split('T')[0], status: 'pending', booked_by: 'patient' }])
    if (!error) { setBookingMsg(tx.success); setTimeout(() => setBookingMsg(''), 3000) }
  }

  const filtered = hospitals.filter(h => h.name?.toLowerCase().includes(search.toLowerCase()) || h.address?.toLowerCase().includes(search.toLowerCase()))

  const specColor = (spec) => {
    if (!spec) return { bg: '#E8F7F1', color: '#0E8A5F' }
    if (spec.toLowerCase().includes('cardio')) return { bg: '#FFECEC', color: '#C94040' }
    if (spec.toLowerCase().includes('general')) return { bg: '#E8F7F1', color: '#0E8A5F' }
    if (spec.toLowerCase().includes('ortho')) return { bg: '#EBF4FF', color: '#4A90D9' }
    return { bg: '#FFF8EC', color: '#D4880A' }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif", paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', padding: '52px 24px 28px', borderRadius: '0 0 28px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, position: 'relative' }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: 38, height: 38, borderRadius: '50%', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>{tx.header}</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{tx.hospitalsFound(hospitals.length)}</p>
          </div>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            placeholder={tx.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.95)', border: 'none', borderRadius: 14, padding: '13px 16px 13px 40px', fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E' }}
          />
        </div>
      </div>

      {/* Map */}
      <div style={{ margin: '20px 20px 0', borderRadius: 20, overflow: 'hidden', height: 180, border: '2px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <HospitalMap hospitals={hospitals} />
      </div>

      {bookingMsg && (
        <div style={{ margin: '16px 20px 0', background: '#E8F7F1', color: '#0E8A5F', borderRadius: 14, padding: '14px 16px', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          ✅ {bookingMsg}
        </div>
      )}

      {/* Hospital List */}
      <div style={{ padding: '20px 20px 0' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{tx.selectHospital}</p>
        {loading ? (
          <p style={{ color: '#9AA5B4', fontSize: 14 }}>{tx.loading}</p>
        ) : filtered.map(h => (
          <div key={h.id} style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 20, border: '1px solid #EDF0F5', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Large Hospital Image */}
              <div style={{ width: '100%', height: 160, borderRadius: 16, overflow: 'hidden', background: '#e1e5eb', position: 'relative' }}>
                <img src={
                  h.name.includes('MIOT') || h.name.includes('moit') ? '/images/MIOT-inter.jpg' :
                    h.name.includes('Sunrise') ? '/images/sunrise-hosp.jpg' :
                      h.name.includes('Government') ? '/images/heritage-hosp.jpg' :
                        h.name.includes('Coastline') ? '/images/costline-medical-cente.jpg' :
                          h.name.includes('Shore Temple') ? '/images/health-point.avif' :
                            h.name.includes('Heritage') ? '/images/heritage-hosp.jpg' :
                              h.name.includes('Apollo') ? '/images/apollo.webp' :
                                h.name.includes('Fortis') ? '/images/fortis-malar.jpg' :
                                  `/images/h${h.id % 5 || 5}.jpg`
                } alt={h.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#1A9E6E' }}>{tx.open247}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 18, color: '#1A1F2E', marginBottom: 4 }}>{h.name}</p>
                  <p style={{ fontSize: 13, color: '#9AA5B4', marginBottom: 2 }}>📍 {h.address}</p>
                  <p style={{ fontSize: 13, color: '#9AA5B4' }}>📞 {h.phone}</p>
                </div>
                <button onClick={() => fetchDoctors(h.id)} style={{
                  background: selectedHospital === h.id ? '#1A9E6E' : '#E8F7F1',
                  color: selectedHospital === h.id ? 'white' : '#0E8A5F',
                  border: 'none', borderRadius: 14, padding: '10px 16px',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.2s', boxShadow: selectedHospital === h.id ? '0 4px 12px rgba(26,158,110,0.3)' : 'none'
                }}>
                  {selectedHospital === h.id ? tx.hideDocs : tx.viewDocs}
                </button>
              </div>
            </div>

            {selectedHospital === h.id && (
              <div style={{ marginTop: 20, borderTop: '1.5px solid #EDF0F5', paddingTop: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.specialists}</p>
                {doctors.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA5B4' }}>{tx.noDocs}</p>
                ) : doctors.map((doc) => {
                  const sc = specColor(doc.specialization)

                  // Infer gender from name
                  const isFemale = doc.name.match(/Kavitha|Meena|Anjali|Deepa|Lakshmi|Sarah|Anita|Priyanka|Sushma|Vanathi/i)
                  const docImg = isFemale ? '/images/female-icon.png' : '/images/male-icon.png'

                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F9FC', borderRadius: 16, padding: '14px', marginBottom: 12, border: '1px solid #EDF0F5' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {/* Gender-specific Avatar */}
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: sc.bg, overflow: 'hidden', flexShrink: 0, border: `2px solid ${sc.color}30` }}>
                          <img src={docImg} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1F2E', marginBottom: 4 }}>Dr. {doc.name.replace('Dr. ', '')}</p>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{doc.specialization}</span>
                        </div>
                      </div>
                      <button onClick={() => bookAppointment(doc.id)} style={{ background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,158,110,0.25)' }}>
                        {tx.book}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

    </main>
  )
}