'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [form, setForm] = useState({ medilink_id: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      welcome: 'Welcome back',
      subtitle: 'Login to your MediLink account',
      id: 'MediLink ID',
      idPlaceholder: 'MED-2026-TN-xxxxxx',
      password: 'Password',
      pwdPlaceholder: 'Enter your password',
      login: 'Login',
      loggingIn: 'Logging in...',
      newTo: 'New to MediLink?',
      create: 'Create Account',
      areDoctor: 'Are you a Doctor?',
      accessDoctor: 'Access doctor portal',
      invalid: 'Invalid MediLink ID or password',
    },
    தமிழ்: {
      welcome: 'மீண்டும் வருக',
      subtitle: 'உங்கள் மெடிலிங்க் கணக்கில் உள்நுழைக',
      id: 'மெடிலிங்க் ஐடி',
      idPlaceholder: 'MED-2026-TN-xxxxxx',
      password: 'கடவுச்சொல்',
      pwdPlaceholder: 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
      login: 'உள்நுழை',
      loggingIn: 'உள்நுழைகிறது...',
      newTo: 'மெடிலிங்கிற்கு புதியவரா?',
      create: 'கணக்கை உருவாக்கு',
      areDoctor: 'நீங்கள் ஒரு மருத்துவரா?',
      accessDoctor: 'மருத்துவர் போர்ட்டலை அணுகவும்',
      invalid: 'தவறான மெடிலிங்க் ஐடி அல்லது கடவுச்சொல்',
    },
    हिंदी: {
      welcome: 'वापसी पर स्वागत है',
      subtitle: 'अपने मेडिलिंक खाते में लॉगिन करें',
      id: 'मेडिलिंक आईडी',
      idPlaceholder: 'MED-2026-TN-xxxxxx',
      password: 'पासवर्ड',
      pwdPlaceholder: 'अपना पासवर्ड दर्ज करें',
      login: 'लॉगिन',
      loggingIn: 'लॉग इन हो रहा है...',
      newTo: 'मेडिलिंक में नए हैं?',
      create: 'खाता बनाएं',
      areDoctor: 'क्या आप डॉक्टर हैं?',
      accessDoctor: 'डॉक्टर पोर्टल तक पहुँचें',
      invalid: 'अमान्य मेडिलिंक आईडी या पासवर्ड',
    }
  }

  const tx = t[language]

  useEffect(() => {
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { data, loginError } = await supabase.from('patients').select('*').eq('medilink_id', form.medilink_id).eq('password', form.password).single()
    if (loginError || !data) { setError(tx.invalid); setLoading(false); return }
    localStorage.setItem('medilink_id', data.medilink_id)
    localStorage.setItem('patient_name', data.name)
    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top Green Section */}
      <div style={{ background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', padding: '40px 24px 50px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏥</div>
          <div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 2 }}>{tx.welcome}</h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0 }}>{tx.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ margin: '-20px 20px 0', background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.id}</label>
          <input
            placeholder={tx.idPlaceholder}
            value={form.medilink_id}
            onChange={e => setForm({ ...form, medilink_id: e.target.value })}
            style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.password}</label>
          <input
            placeholder={tx.pwdPlaceholder}
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
          {loading ? tx.loggingIn : `${tx.login} →`}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          {tx.newTo}{' '}
          <Link href="/signup" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>{tx.create}</Link>
        </p>
      </div>

      {/* Doctor Login Link */}
      <div style={{ margin: '16px 20px 0', background: '#EBF4FF', borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>👨‍⚕️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1F2E' }}>{tx.areDoctor}</p>
            <p style={{ fontSize: 12, color: '#9AA5B4' }}>{tx.accessDoctor}</p>
          </div>
        </div>
        <Link href="/doctor/login" style={{ textDecoration: 'none' }}>
          <button style={{ background: '#4A90D9', color: 'white', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{tx.login}</button>
        </Link>
      </div>


    </main>
  )
}