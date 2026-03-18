'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DoctorLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      portal: 'Doctor Portal',
      subtitle: 'Access your patients and consultations',
      phone: 'Phone Number',
      phonePlaceholder: 'Registered phone number',
      password: 'Password',
      pwdPlaceholder: 'Your password',
      login: 'Login to Portal →',
      loggingIn: 'Logging in...',
      isPatient: 'Patient?',
      loginHere: 'Login here',
      secureAccess: 'Secure Doctor Access',
      secureNote: 'Your patient data is encrypted and protected. Only you can access your patient records.',
      invalid: 'Invalid phone or password',
    },
    தமிழ்: {
      portal: 'மருத்துவர் போர்டல்',
      subtitle: 'உங்கள் நோயாளிகள் மற்றும் ஆலோசனைகளை அணுகவும்',
      phone: 'தொலைபேசி எண்',
      phonePlaceholder: 'பதிவு செய்யப்பட்ட தொலைபேசி எண்',
      password: 'கடவுச்சொல்',
      pwdPlaceholder: 'உங்கள் கடவுச்சொல்',
      login: 'போர்ட்டலில் உள்நுழைக →',
      loggingIn: 'உள்நுழைகிறது...',
      isPatient: 'நோயாளியா?',
      loginHere: 'இங்கே உள்நுழையவும்',
      secureAccess: 'பாதுகாப்பான மருத்துவர் அணுகல்',
      secureNote: 'உங்கள் நோயாளி தரவு குறியாக்கம் செய்யப்பட்டு பாதுகாக்கப்படுகிறது. உங்கள் நோயாளி பதிவுகளை நீங்கள் மட்டுமே அணுக முடியும்.',
      invalid: 'தவறான தொலைபேசி அல்லது கடவுச்சொல்',
    },
    हिंदी: {
      portal: 'डॉक्टर पोर्टल',
      subtitle: 'अपने मरीजों और परामर्शों तक पहुंचें',
      phone: 'फ़ोन नंबर',
      phonePlaceholder: 'पंजीकृत फ़ोन नंबर',
      password: 'पासवर्ड',
      pwdPlaceholder: 'आपका पासवर्ड',
      login: 'पोर्टल पर लॉग इन करें →',
      loggingIn: 'लॉग इन हो रहा है...',
      isPatient: 'रोगी?',
      loginHere: 'यहाँ लॉग इन करें',
      secureAccess: 'सुरक्षित डॉक्टर एक्सेस',
      secureNote: 'आपका रोगी डेटा एन्क्रिप्टेड और सुरक्षित है। केवल आप ही अपने रोगी रिकॉर्ड तक पहुँच सकते हैं।',
      invalid: 'अमान्य फ़ोन या पासवर्ड',
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
    const { data, loginError } = await supabase.from('doctors').select('*').eq('phone', form.phone).eq('password', form.password).single()
    if (loginError || !data) { setError(tx.invalid); setLoading(false); return }
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
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{tx.portal}</h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 15 }}>{tx.subtitle}</p>
        </div>
      </div>

      {/* Card */}
      <div style={{ margin: '-32px 20px 0', background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.phone}</label>
        <input
          placeholder={tx.phonePlaceholder}
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          style={{ width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC', marginBottom: 16 }}
        />

        <label style={{ fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tx.password}</label>
        <input
          placeholder={tx.pwdPlaceholder}
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
          {loading ? tx.loggingIn : tx.login}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          {tx.isPatient}{' '}
          <Link href="/login" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>{tx.loginHere}</Link>
        </p>
      </div>

      {/* Info Card */}
      <div style={{ margin: '16px 20px 0', background: '#EBF4FF', borderRadius: 16, padding: '16px 18px' }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E3A8A', marginBottom: 4 }}>🔒 {tx.secureAccess}</p>
        <p style={{ fontSize: 13, color: '#4A90D9' }}>{tx.secureNote}</p>
      </div>


    </main>
  )
}