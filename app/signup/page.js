'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function generateMediLinkID() {
  const year = new Date().getFullYear()
  const random = Math.floor(100000 + Math.random() * 900000)
  return `MED-${year}-TN-${random}`
}

export default function Signup() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', age: '', blood_group: '', phone: '', password: '', language: 'en' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState('English')

  const t = {
    English: {
      header: 'Create Account',
      subtitle: 'Join MediLink — your health companion',
      name: 'Full Name *',
      namePlaceholder: 'Your full name',
      age: 'Age',
      blood: 'Blood Group',
      select: 'Select',
      phone: 'Phone Number *',
      phonePlaceholder: '10-digit phone',
      password: 'Password *',
      pwdPlaceholder: 'Create a password',
      lang: 'Language',
      create: 'Create Account',
      creating: 'Creating Account...',
      already: 'Already have an account?',
      login: 'Login',
      fillAll: 'Please fill all required fields',
      welcome: 'Welcome to MediLink!',
      uniqueId: 'Your Unique ID:',
      saveId: 'Save this ID — you need it to login!',
    },
    தமிழ்: {
      header: 'கணக்கை உருவாக்கு',
      subtitle: 'மெடிலிங்கில் சேருங்கள் — உங்கள் ஆரோக்கியத் தோழன்',
      name: 'முழு பெயர் *',
      namePlaceholder: 'உங்கள் முழு பெயர்',
      age: 'வயது',
      blood: 'இரத்த வகை',
      select: 'தேர்வு செய்க',
      phone: 'தொலைபேசி எண் *',
      phonePlaceholder: '10-இலக்க தொலைபேசி',
      password: 'கடவுச்சொல் *',
      pwdPlaceholder: 'கடவுச்சொல்லை உருவாக்கவும்',
      lang: 'மொழி',
      create: 'கணக்கை உருவாக்கு',
      creating: 'கணக்கை உருவாக்குகிறது...',
      already: 'ஏற்கனவே கணக்கு உள்ளதா?',
      login: 'உள்நுழை',
      fillAll: 'தேவையான அனைத்து புலங்களையும் நிரப்பவும்',
      welcome: 'மெடிலிங்கிற்கு வரவேற்கிறோம்!',
      uniqueId: 'உங்கள் தனிப்பட்ட ஐடி:',
      saveId: 'இந்த ஐடியைச் சேமிக்கவும் — நீங்கள் உள்நுழைய இது தேவை!',
    },
    हिंदी: {
      header: 'खाता बनाएं',
      subtitle: 'मेडिलिंक से जुड़ें — आपका स्वास्थ्य साथी',
      name: 'पूरा नाम *',
      namePlaceholder: 'आपका पूरा नाम',
      age: 'आयु',
      blood: 'रक्त समूह',
      select: 'चुनें',
      phone: 'फ़ोन नंबर *',
      phonePlaceholder: '10-अंकीय फ़ोन',
      password: 'पासवर्ड *',
      pwdPlaceholder: 'एक पासवर्ड बनाएं',
      lang: 'भाषा',
      create: 'खाता बनाएं',
      creating: 'खाता बनाया जा रहा है...',
      already: 'पहले से ही एक खाता है?',
      login: 'लॉगिन',
      fillAll: 'कृपया सभी आवश्यक फ़ील्ड भरें',
      welcome: 'मेडिलिंक में आपका स्वागत है!',
      uniqueId: 'आपकी विशिष्ट आईडी:',
      saveId: 'इस आईडी को सुरक्षित रखें — आपको लॉगिन करने के लिए इसकी आवश्यकता होगी!',
    }
  }

  const tx = t[language]

  useEffect(() => {
    const saved = localStorage.getItem('medilink_lang')
    if (saved && t[saved]) setLanguage(saved)
  }, [])

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    if (!form.name || !form.phone || !form.password) { setError(tx.fillAll); setLoading(false); return }
    const medilink_id = generateMediLinkID()
    const { error: signUpError } = await supabase.from('patients').insert([{ medilink_id, name: form.name, age: parseInt(form.age), blood_group: form.blood_group, phone: form.phone, password: form.password, language_preference: form.language }])
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    localStorage.setItem('medilink_id', medilink_id)
    localStorage.setItem('patient_name', form.name)
    alert(`🎉 ${tx.welcome}\n\n${tx.uniqueId}\n${medilink_id}\n\n⚠️ ${tx.saveId}`)
    router.push('/dashboard')
  }

  const inputStyle = { width: '100%', border: '2px solid #EDF0F5', borderRadius: 14, padding: '14px 16px', fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1F2E', background: '#F7F9FC', marginBottom: 16 }
  const labelStyle = { fontSize: 13, fontWeight: 700, color: '#9AA5B4', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }

  return (
    <main style={{ minHeight: '100vh', background: '#F7F9FC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0E8A5F, #1A9E6E)', padding: '60px 28px 80px', borderRadius: '0 0 40px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }}></div>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(255,255,255,0.2)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16 }}>✨</div>
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{tx.header}</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>{tx.subtitle}</p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ margin: '-32px 20px 24px', background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={labelStyle}>{tx.name}</label>
        <input style={inputStyle} placeholder={tx.namePlaceholder} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>{tx.age}</label>
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder={tx.age} type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>{tx.blood}</label>
            <select style={{ ...inputStyle, marginBottom: 0 }} value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">{tx.select}</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>{tx.phone}</label>
          <input style={inputStyle} placeholder={tx.phonePlaceholder} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>

        <label style={labelStyle}>{tx.password}</label>
        <input style={inputStyle} placeholder={tx.pwdPlaceholder} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

        <label style={labelStyle}>{tx.lang}</label>
        <select style={inputStyle} value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिंदी</option>
        </select>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ width: '100%', background: loading ? '#9AA5B4' : 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', color: 'white', border: 'none', borderRadius: 14, padding: '16px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: loading ? 'none' : '0 6px 20px rgba(26,158,110,0.3)' }}
        >
          {loading ? tx.creating : tx.create}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          {tx.already}{' '}
          <Link href="/login" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>{tx.login}</Link>
        </p>
      </div>


    </main>
  )
}