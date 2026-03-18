'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DoctorLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('doctors').select('*').eq('phone', form.phone).eq('password', form.password).single()
    if (error || !data) { setError('Invalid phone or password'); setLoading(false); return }
    localStorage.setItem('doctor_id', data.id)
    localStorage.setItem('doctor_name', data.name)
    localStorage.setItem('doctor_specialization', data.specialization)
    router.push('/doctor/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', padding: '60px 28px 80px', borderRadius: '0 0 40px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: 10, left: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.18)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18 }}>👨‍⚕️</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Doctor Portal</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15 }}>Access your patients and consultations</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ margin: '-32px 20px 0', background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
        <input
          placeholder="Registered phone number"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC', marginBottom: 16 }}
        />

        <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
        <input
          placeholder="Your password"
          type="password"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC', marginBottom: 24 }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: loading ? '#9AA5B4' : 'linear-gradient(135deg, #2563EB, #1E3A8A)', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.3)' }}
        >
          {loading ? 'Logging in...' : 'Login to Portal →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          Patient?{' '}
          <Link href="/login" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>

      {/* Info Card */}
      <div style={{ margin: '16px 20px 0', background: '#EBF4FF', borderRadius: 16, padding: '16px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>🔒 Secure Doctor Access</p>
        <p style={{ fontSize: 13, color: '#4A90D9' }}>Your patient data is encrypted and protected. Only you can access your patient records.</p>
      </div>

    </main>
  )
}