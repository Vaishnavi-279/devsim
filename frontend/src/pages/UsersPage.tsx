import { useEffect, useState } from 'react'
import { usersAPI } from '../api'
import type { User } from '../types'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:     { bg: '#eef2ff', color: '#6366f1' },
  manager:   { bg: '#faf5ff', color: '#9333ea' },
  developer: { bg: '#eff6ff', color: '#2563eb' },
  qa_tester: { bg: '#f0fdf4', color: '#16a34a' },
  viewer:    { bg: '#f8fafc', color: '#64748b' },
}

const ROLE_INITIAL: Record<string, string> = {
  admin: 'AD', manager: 'MG', developer: 'DV', qa_tester: 'QA', viewer: 'VW'
}

const AVATAR_COLOR: Record<string, string> = {
  admin: '#6366f1', manager: '#9333ea', developer: '#2563eb', qa_tester: '#16a34a', viewer: '#94a3b8'
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, user: currentUser } = useAuth()

  useEffect(() => {
    usersAPI.getAll()
      .then(r => setUsers(r.data))
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from DevSim?`)) return
    try {
      await usersAPI.delete(id)
      setUsers(u => u.filter(x => x.id !== id))
      toast.success(`${name} removed`)
    } catch {
      toast.error('Failed to remove user')
    }
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Team Members
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            {users.length} members in your DevSim workspace
          </p>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px',
              padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.15s, border-color 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#f1f5f9' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: AVATAR_COLOR[user.role] || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0
                  }}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span style={{ fontSize: '10px', background: '#f0fdf4', color: '#16a34a', padding: '1px 6px', borderRadius: '99px', fontWeight: 600 }}>You</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{user.email}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '99px', fontSize: '11px',
                  fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: ROLE_STYLE[user.role]?.bg,
                  color: ROLE_STYLE[user.role]?.color
                }}>
                  {user.role.replace('_', ' ')}
                </span>

                {isAdmin && user.id !== currentUser?.id && (
                  <button onClick={() => handleDelete(user.id, user.name)}
                    style={{
                      background: 'none', border: '1px solid #fee2e2', borderRadius: '6px',
                      color: '#ef4444', fontSize: '12px', fontWeight: 500,
                      padding: '4px 10px', cursor: 'pointer', transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}