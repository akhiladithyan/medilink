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

  useEffect(() => {
    const id = localStorage.getItem('medilink_id')
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
    if (!error) { setBookingMsg('Appointment booked successfully!'); setTimeout(() => setBookingMsg(''), 3000) }
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
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700 }}>Nearby Hospitals</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{hospitals.length} hospitals found</p>
          </div>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
          <input
            placeholder="Search hospitals or doctors..."
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
        <p style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Select a Hospital</p>
        {loading ? (
          <p style={{ color: '#9AA5B4', fontSize: 14 }}>Loading hospitals...</p>
        ) : filtered.map(h => (
          <div key={h.id} style={{ background: 'white', borderRadius: 20, padding: '16px', marginBottom: 14, border: '1.5px solid #EDF0F5', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12, flex: 1 }}>
                <div style={{ width: 46, height: 46, background: '#E8F7F1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏥</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1A1F2E', marginBottom: 3 }}>{h.name}</p>
                  <p style={{ fontSize: 12, color: '#9AA5B4', marginBottom: 2 }}>📍 {h.address}</p>
                  <p style={{ fontSize: 12, color: '#9AA5B4' }}>📞 {h.phone}</p>
                </div>
              </div>
              <button onClick={() => fetchDoctors(h.id)} style={{
                background: selectedHospital === h.id ? '#1A9E6E' : '#E8F7F1',
                color: selectedHospital === h.id ? 'white' : '#0E8A5F',
                border: 'none', borderRadius: 12, padding: '8px 14px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0
              }}>
                {selectedHospital === h.id ? 'Hide ↑' : 'Doctors →'}
              </button>
            </div>

            {selectedHospital === h.id && (
              <div style={{ marginTop: 14, borderTop: '1.5px solid #EDF0F5', paddingTop: 14 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#9AA5B4', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Available Doctors</p>
                {doctors.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9AA5B4' }}>No doctors listed.</p>
                ) : doctors.map(doc => {
                  const sc = specColor(doc.specialization)
                  return (
                    <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F7F9FC', borderRadius: 14, padding: '12px 14px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, background: sc.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👨‍⚕️</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#1A1F2E' }}>{doc.name}</p>
                          <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{doc.specialization}</span>
                        </div>
                      </div>
                      <button onClick={() => bookAppointment(doc.id)} style={{ background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', color: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(26,158,110,0.25)' }}>
                        Book
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