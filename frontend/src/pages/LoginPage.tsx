import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const S = {
  page: { minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif" } as React.CSSProperties,
  left: {
    width: '50%', background: '#09090b', display: 'flex' as const,
    flexDirection: 'column' as const, justifyContent: 'space-between',
    padding: '48px', position: 'relative' as const, overflow: 'hidden'
  },
  right: {
    width: '50%', background: '#fff', display: 'flex' as const,
    alignItems: 'center', justifyContent: 'center', padding: '64px 48px'
  },
  form: { width: '100%', maxWidth: '400px' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: '#94a3b8', letterSpacing: '0.08em',
    textTransform: 'uppercase' as const, marginBottom: '8px'
  },
  input: {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: '8px', fontSize: '14px', color: '#0f172a',
    background: '#fff', outline: 'none', transition: 'border-color 0.15s',
    display: 'block'
  },
  btn: {
    width: '100%', padding: '12px', background: '#6366f1',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    letterSpacing: '0.01em', transition: 'background 0.15s'
  },
}

export default function LoginPage() {
  const [email, setEmail] = useState('admin@devsim.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(email, password)
      login(res.data.access_token, res.data.user)
      toast.success(`Welcome, ${res.data.user.name}!`)
      navigate('/')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={S.page}>
      {/* LEFT */}
      <div style={S.left}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice">
          {[50, 110, 170, 230, 290, 350, 410, 470].map((r, i) => (
            <circle key={i} cx="100" cy="160" r={r} fill="none" stroke="white" strokeWidth="1" />
          ))}
        </svg>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: '#6366f1', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.2px' }}>DevSim</span>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '48px', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Practice the SDLC<br />before your<br />first job.
          </h1>
          <p style={{ color: '#52525b', fontSize: '15px', lineHeight: 1.7, maxWidth: '380px' }}>
            A simulated JIRA-style environment for freshers and junior developers —
            sprints, kanban, QA cycles, all in one place.
          </p>
        </div>

        <p style={{ position: 'relative', zIndex: 1, color: '#3f3f46', fontSize: '12px' }}>
          © 2026 DevSim · Built with Project Gita 🙏
        </p>
      </div>

      {/* RIGHT */}
      <div style={S.right}>
        <div style={S.form}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.5px' }}>Sign in</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '36px' }}>Continue to your DevSim workspace.</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Email</label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={{ ...S.input, borderColor: focused === 'email' ? '#6366f1' : '#e2e8f0' }}
                required
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={S.label}>Password</label>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={{ ...S.input, borderColor: focused === 'password' ? '#6366f1' : '#e2e8f0' }}
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit" disabled={loading}
              style={{ ...S.btn, background: loading ? '#a5b4fc' : '#6366f1', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ margin: '28px 0', borderTop: '1px solid #f1f5f9' }} />

          {/* Quick accounts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { role: 'Admin', color: '#6366f1', email: 'admin@devsim.com', pass: 'admin123' },
              { role: 'Developer', color: '#3b82f6', email: 'dev@devsim.com', pass: 'dev123' },
            ].map(acc => (
              <button key={acc.role} onClick={() => { setEmail(acc.email); setPassword(acc.pass) }}
                style={{
                  padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                  background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#c7d2fe')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: acc.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{acc.role}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}