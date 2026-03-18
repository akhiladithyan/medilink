import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'white', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>

      {/* Hero Section */}
      <div style={{ background: 'linear-gradient(160deg, #0E8A5F 0%, #1A9E6E 50%, #25C085 100%)', padding: '64px 28px 48px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: 20, right: 20, width: 100, height: 100, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}></div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '6px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>🏥</span>
            <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>MediLink AI</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 36, fontWeight: 700, lineHeight: 1.2, marginBottom: 14 }}>
            Your Personal<br />Health Assistant
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            AI-powered symptom checker, doctor consultations, and digital health records — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['English', 'தமிழ்', 'हिंदी'].map(l => (
              <span key={l} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ background: 'white', margin: '0 20px', marginTop: -20, borderRadius: 20, padding: '16px 20px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-around' }}>
        {[['🤖', 'AI Diagnosis'], ['🏥', 'Hospitals'], ['💊', 'Medicines'], ['📋', 'Records']].map(([icon, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 11, color: '#9AA5B4', fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: 'linear-gradient(135deg, #1A9E6E, #0E8A5F)', color: 'white', border: 'none', borderRadius: 16, padding: '17px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 20px rgba(26,158,110,0.35)' }}>
            Create Free Account →
          </button>
        </Link>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: 'white', color: '#1A9E6E', border: '2px solid #C2EAD8', borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Patient Login
          </button>
        </Link>
        <Link href="/doctor/login" style={{ textDecoration: 'none' }}>
          <button style={{ width: '100%', background: '#EBF4FF', color: '#4A90D9', border: 'none', borderRadius: 16, padding: '16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            👨‍⚕️ Doctor Portal
          </button>
        </Link>
      </div>

    </main>
  )
}