import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'developer',  label: '👨‍💻 Developer',  desc: 'Write code, update tickets' },
  { value: 'qa_tester',  label: '🧪 QA Tester',   desc: 'Test features, log bugs' },
  { value: 'manager',    label: '📋 Manager',      desc: 'Create tickets, manage team' },
  { value: 'viewer',     label: '👀 Viewer',       desc: 'Read-only access' },
]

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' })
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await authAPI.register(form.name, form.email, form.password, form.role)
      login(res.data.access_token, res.data.user)
      toast.success(`Welcome to DevSim, ${res.data.user.name}! 🎉`)
      navigate('/')
    } catch {
      toast.error('Registration failed. Email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (key: string): React.CSSProperties => ({
    width: '100%', padding: '11px 14px', border: `1.5px solid ${focused === key ? '#6366f1' : '#e2e8f0'}`,
    borderRadius: '8px', fontSize: '14px', color: '#0f172a', background: '#fff',
    outline: 'none', transition: 'border-color 0.15s', fontFamily: "'DM Sans', system-ui, sans-serif"
  })

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600, color: '#94a3b8',
    letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Left Panel */}
      <div style={{
        width: '50%', background: '#09090b', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px', position: 'relative', overflow: 'hidden'
      }}>
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
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>DevSim</span>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ color: '#fff', fontSize: '44px', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Join the<br />future of<br />dev training.
          </h1>
          <p style={{ color: '#52525b', fontSize: '15px', lineHeight: 1.7, maxWidth: '360px' }}>
            Create your account and start practising real SDLC workflows — sprints, kanban, QA cycles and more.
          </p>

          {/* Role previews */}
          <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ROLES.map(r => (
              <div key={r.value} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                <span style={{ color: '#71717a', fontSize: '13px' }}>
                  <span style={{ color: '#a1a1aa', fontWeight: 600 }}>{r.label}</span> — {r.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 1, color: '#3f3f46', fontSize: '12px' }}>
          © 2026 DevSim · Built with Project Gita 🙏
        </p>
      </div>

      {/* Right Panel */}
      <div style={{ width: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Create account
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="John Doe" required style={inputStyle('name')}
                onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="john@example.com" required style={inputStyle('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters" required style={inputStyle('password')}
                onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} />
            </div>

            {/* Role */}
            <div>
              <label style={labelStyle}>Select Your Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {ROLES.map(r => (
                  <div key={r.value} onClick={() => set('role', r.value)}
                    style={{
                      padding: '12px 14px', borderRadius: '9px', cursor: 'pointer',
                      border: `2px solid ${form.role === r.value ? '#6366f1' : '#e2e8f0'}`,
                      background: form.role === r.value ? '#eef2ff' : '#fff',
                      transition: 'all 0.15s'
                    }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: form.role === r.value ? '#6366f1' : '#0f172a', marginBottom: '2px' }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px', background: loading ? '#a5b4fc' : '#6366f1',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s', marginTop: '4px'
              }}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}