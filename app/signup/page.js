'use client'
import { useState } from 'react'
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
  const [step, setStep] = useState(1)

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    if (!form.name || !form.phone || !form.password) { setError('Please fill all required fields'); setLoading(false); return }
    const medilink_id = generateMediLinkID()
    const { error } = await supabase.from('patients').insert([{ medilink_id, name: form.name, age: parseInt(form.age), blood_group: form.blood_group, phone: form.phone, password: form.password, language_preference: form.language }])
    if (error) { setError(error.message); setLoading(false); return }
    localStorage.setItem('medilink_id', medilink_id)
    localStorage.setItem('patient_name', form.name)
    alert(`🎉 Welcome to MediLink!\n\nYour Unique ID:\n${medilink_id}\n\n⚠️ Save this ID — you need it to login!`)
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
          <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Create Account</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15 }}>Join MediLink — your health companion</p>
        </div>
      </div>

      {/* Form Card */}
      <div style={{ margin: '-32px 20px 24px', background: 'white', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>

        {error && (
          <div style={{ background: '#FFECEC', color: '#C94040', borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        <label style={labelStyle}>Full Name *</label>
        <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Age</label>
            <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Age" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Blood Group</label>
            <select style={{ ...inputStyle, marginBottom: 0 }} value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
              <option value="">Select</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg}>{bg}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={labelStyle}>Phone Number *</label>
          <input style={inputStyle} placeholder="10-digit phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>

        <label style={labelStyle}>Password *</label>
        <input style={inputStyle} placeholder="Create a password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

        <label style={labelStyle}>Language</label>
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
          {loading ? 'Creating Account...' : 'Create Account →'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#9AA5B4', marginTop: 20 }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1A9E6E', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
        </p>
      </div>

    </main>
  )
}