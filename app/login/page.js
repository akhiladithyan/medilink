'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ medilink_id: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('patients').select('*').eq('medilink_id', form.medilink_id).eq('password', form.password).single()
    if (error || !data) { setError('Invalid MediLink ID or password'); setLoading(false); return }
    localStorage.setItem('medilink_id', data.medilink_id)
    localStorage.setItem('patient_name', data.name)
    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top Green Section */}
      <div style={{ background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', padding: '60px 28px 80px', borderRadius: '0 0 40px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>🏥</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>Login to your MediLink account</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ margin: '-32px 20px 0', background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>MediLink ID</label>
          <input
            placeholder="MED-2026-TN-xxxxxx"
            value={form.medilink_id}
            onChange={e => setForm({ ...form, medilink_id: e.target.value })}
            style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
          <input
            placeholder="Enter your password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC' }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: loading ? '#9AA5B4' : 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 6px 20px rgba(26,158,110,0.3)' }}
        >
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          New to MediLink?{' '}
          <Link href="/signup" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>Create Account</Link>
        </p>
      </div>

      {/* Doctor Login Link */}
      <div style={{ margin: '16px 20px 0', background: '#EBF4FF', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>👨‍⚕️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1F2E' }}>Are you a Doctor?</p>
            <p style={{ fontSize: 12, color: '#9AA5B4' }}>Access doctor portal</p>
          </div>
        </div>
        <Link href="/doctor/login" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#4A90D9', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Login</button>
        </Link>
      </div>

    </main>
  )
}