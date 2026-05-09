import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import CreateTicketModal from '../tickets/CreateTicketModal'

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  )},
  { to: '/board', label: 'Kanban Board', end: false, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="5" height="18"/><rect x="10" y="3" width="5" height="12"/><rect x="17" y="3" width="5" height="15"/></svg>
  )},
  { to: '/list', label: 'List View', end: false, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg>
  )},
  { to: '/users', label: 'Users', end: false, icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.85"/></svg>
  )},
]

export default function Layout() {
  const { user, logout, canCreateTicket } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{
        width: '232px', minWidth: '232px', background: '#0f0f12',
        display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e1e24'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #1e1e24', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: '#6366f1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.2px' }}>DevSim</div>
            <div style={{ color: '#52525b', fontSize: '11px' }}>DEVSIM</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ to, label, end, icon }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '7px', textDecoration: 'none',
              fontSize: '13.5px', fontWeight: 500, transition: 'all 0.12s',
              background: isActive ? '#1e1e2e' : 'transparent',
              color: isActive ? '#fff' : '#71717a',
            })}
              onMouseEnter={e => { if (!(e.currentTarget as any).classList.contains('active')) { e.currentTarget.style.background = '#18181b'; e.currentTarget.style.color = '#d4d4d8' } }}
              onMouseLeave={e => { if (!(e.currentTarget as any).classList.contains('active')) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#71717a' } }}
            >
              {icon}{label}
            </NavLink>
          ))}
        </nav>

        {/* Create Button */}
        {canCreateTicket && (
          <div style={{ padding: '8px', borderTop: '1px solid #1e1e24' }}>
            <button onClick={() => setShowCreate(true)} style={{
              width: '100%', padding: '9px 12px', background: '#6366f1',
              color: '#fff', border: 'none', borderRadius: '7px',
              fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
              onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Ticket
            </button>
          </div>
        )}

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #1e1e24', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%', background: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0
            }}>
              {user?.name.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: '#e4e4e7', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#52525b', fontSize: '11px', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login') }} title="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', padding: '4px', borderRadius: '4px', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e4e4e7'}
            onMouseLeave={e => e.currentTarget.style.color = '#52525b'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', background: '#f8fafc' }}>
        <Outlet />
      </main>

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); navigate('/board') }} />}
    </div>
  )
}