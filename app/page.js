'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const translations = {
  English: {
    badge: 'MediLink AI',
    headline1: 'Your Personal',
    headline2: 'Health Assistant',
    subtitle: 'AI-powered symptom checker, doctor consultations, and digital health records — all in one place.',
    features: ['AI Diagnosis', 'Hospitals', 'Medicines', 'Records'],
    stat1: '10K+', stat1Label: 'Patients',
    stat2: '200+', stat2Label: 'Doctors',
    stat3: '24/7', stat3Label: 'AI Support',
    create: 'Create Free Account →',
    login: 'Patient Login',
    doctor: '👨‍⚕️ Doctor Portal',
    trust: 'Trusted by doctors across South India',
    langLabel: 'Select Language',
  },
  தமிழ்: {
    badge: 'மெடிலிங்க் AI',
    headline1: 'உங்கள் தனிப்பட்ட',
    headline2: 'சுகாதார உதவியாளர்',
    subtitle: 'AI-சக்தி வாய்ந்த அறிகுறி சரிபார்ப்பு, மருத்துவர் ஆலோசனை, மற்றும் டிஜிட்டல் சுகாதார பதிவுகள்.',
    features: ['AI நோய் கண்டறிதல்', 'மருத்துவமனைகள்', 'மருந்துகள்', 'பதிவுகள்'],
    stat1: '10K+', stat1Label: 'நோயாளிகள்',
    stat2: '200+', stat2Label: 'மருத்துவர்கள்',
    stat3: '24/7', stat3Label: 'AI ஆதரவு',
    create: 'இலவச கணக்கு உருவாக்கு →',
    login: 'நோயாளி உள்நுழைவு',
    doctor: '👨‍⚕️ மருத்துவர் நுழைவாயில்',
    trust: 'தென்னிந்தியா முழுதும் மருத்துவர்களால் நம்பப்படுகிறது',
    langLabel: 'மொழி தேர்வு',
  },
  हिंदी: {
    badge: 'मेडिलिंक AI',
    headline1: 'आपका व्यक्तिगत',
    headline2: 'स्वास्थ्य सहायक',
    subtitle: 'AI-संचालित लक्षण जांचक, डॉक्टर परामर्श और डिजिटल स्वास्थ्य रिकॉर्ड — एक जगह।',
    features: ['AI निदान', 'अस्पताल', 'दवाइयां', 'रिकॉर्ड'],
    stat1: '10K+', stat1Label: 'मरीज़',
    stat2: '200+', stat2Label: 'डॉक्टर',
    stat3: '24/7', stat3Label: 'AI सहायता',
    create: 'मुफ़्त खाता बनाएं →',
    login: 'मरीज़ लॉगिन',
    doctor: '👨‍⚕️ डॉक्टर पोर्टल',
    trust: 'दक्षिण भारत के डॉक्टरों द्वारा भरोसेमंद',
    langLabel: 'भाषा चुनें',
  }
}

const featureIcons = ['🤖', '🏥', '💊', '📋']

export default function Home() {
  const [lang, setLang] = useState('English')
  const t = translations[lang]

  useEffect(() => {
    const saved = localStorage.getItem('medilink_lang')
    if (saved && translations[saved]) setLang(saved)
  }, [])

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem('medilink_lang', l)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F0F7F4', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>

      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(150deg, #0A7A53 0%, #12926A 40%, #1AAF7E 75%, #22C78F 100%)',
        padding: '36px 24px 56px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -50, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: 20, right: 20, width: 80, height: 80, background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -30, width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />

        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 50, padding: '5px 12px', marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>🏥</span>
            <span style={{ color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>{t.badge}</span>
          </div>

          {/* Headline */}
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 800, lineHeight: 1.15, marginBottom: 10, letterSpacing: '-0.5px' }}>
            {t.headline1} <br/> {t.headline2}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.5, marginBottom: 20, maxWidth: 300 }}>
            {t.subtitle}
          </p>

          {/* Language Switcher */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(translations).map(l => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                style={{
                  background: lang === l ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.15)',
                  color: lang === l ? '#0A7A53' : 'white',
                  border: lang === l ? '2px solid white' : '2px solid rgba(255,255,255,0.3)',
                  padding: '5px 14px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(8px)'
                }}
              >{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Bar + Features Card (overlapping hero) */}
      <div style={{ padding: '0 20px', marginTop: -36 }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', overflow: 'hidden' }}>
          {/* Stats Row */}
          <div style={{ display: 'flex', borderBottom: '1px solid #EDF2EF' }}>
            {[
              { val: t.stat1, label: t.stat1Label },
              { val: t.stat2, label: t.stat2Label },
              { val: t.stat3, label: t.stat3Label },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center', padding: '16px 8px', borderRight: i < 2 ? '1px solid #EDF2EF' : 'none' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0A7A53' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#9AA5B4', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Feature Icons Row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '18px 16px' }}>
            {featureIcons.map((icon, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'linear-gradient(135deg, #E8F8F1, #D0F0E4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, marginBottom: 6, marginInline: 'auto'
                }}>{icon}</div>
                <div style={{ fontSize: 11, color: '#4A5568', fontWeight: 700 }}>{t.features[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Badge */}
      <div style={{ textAlign: 'center', padding: '20px 24px 4px' }}>
        <span style={{ fontSize: 12, color: '#9AA5B4', fontWeight: 600 }}>
          ✓ {t.trust}
        </span>
      </div>

      {/* CTA Buttons */}
      <div style={{ padding: '16px 24px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            background: 'linear-gradient(135deg, #12926A, #0A7A53)',
            color: 'white',
            border: 'none',
            borderRadius: 18,
            padding: '18px',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 8px 24px rgba(10,122,83,0.38)',
            letterSpacing: '0.01em'
          }}>
            {t.create}
          </button>
        </Link>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            background: 'white',
            color: '#0A7A53',
            border: '2px solid #B8E8D4',
            borderRadius: 18,
            padding: '17px',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
          }}>
            {t.login}
          </button>
        </Link>

        <Link href="/doctor/login" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            background: 'linear-gradient(135deg, #EBF5FF, #DBEEFF)',
            color: '#2B71C4',
            border: '2px solid #C5DFFE',
            borderRadius: 18,
            padding: '17px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {t.doctor}
          </button>
        </Link>
      </div>

    </main>
  )
}