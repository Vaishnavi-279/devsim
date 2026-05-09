import { useEffect, useState } from 'react'
import { ticketsAPI, usersAPI } from '../api'
import type { Ticket, User } from '../types'
import TicketDetailPanel from '../components/tickets/TicketDetailPanel'

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  low:      { bg: '#f0fdf4', color: '#16a34a' },
  medium:   { bg: '#fefce8', color: '#ca8a04' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  critical: { bg: '#fef2f2', color: '#dc2626' },
}

const PHASE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  analysis:       { bg: '#eef2ff', color: '#6366f1', label: 'Analysis' },
  todo:           { bg: '#f8fafc', color: '#64748b', label: 'To Do' },
  on_hold:        { bg: '#fffbeb', color: '#d97706', label: 'On Hold' },
  in_development: { bg: '#eff6ff', color: '#2563eb', label: 'In Development' },
  dev_testing:    { bg: '#faf5ff', color: '#9333ea', label: 'Dev Testing' },
  qa_testing:     { bg: '#fdf2f8', color: '#db2777', label: 'QA Testing' },
  done:           { bg: '#f0fdf4', color: '#16a34a', label: 'Done' },
}

const TYPE_ICON: Record<string, string> = {
  bug: '🐛', feature: '✨', story: '📖', epic: '🚀'
}

export default function ListView() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('all')
  const [phase, setPhase] = useState('all')
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [filterUser, setFilterUser] = useState('all')

  useEffect(() => {
  ticketsAPI.getAll().then(r => setTickets(r.data))
  usersAPI.getAll().then(r => setUsers(r.data))
}, [])

  const filtered = tickets.filter(t => {
  const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticket_number.toLowerCase().includes(search.toLowerCase())
  const matchPriority = priority === 'all' || t.priority === priority
  const matchPhase = phase === 'all' || t.phase === phase
  const matchUser = filterUser === 'all' || t.assignee_id === filterUser
  return matchSearch && matchPriority && matchPhase && matchUser
})

  const selectStyle: React.CSSProperties = {
    padding: '9px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '13px', color: '#0f172a', background: '#fff', outline: 'none',
    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif"
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Tickets
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>All tickets in a sortable list view.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder="Search by title or ticket number..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...selectStyle, width: '100%', paddingLeft: '36px' }}
          />
        </div>
        <select value={priority} onChange={e => setPriority(e.target.value)} style={selectStyle}>
          <option value="all">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={phase} onChange={e => setPhase(e.target.value)} style={selectStyle}>
          <option value="all">All phases</option>
          <option value="analysis">Analysis</option>
          <option value="todo">To Do</option>
          <option value="on_hold">On Hold</option>
          <option value="in_development">In Development</option>
          <option value="dev_testing">Dev Testing</option>
          <option value="qa_testing">QA Testing</option>
          <option value="done">Done</option>
        </select>

        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={selectStyle}>
  <option value="all">All Assignees</option>
  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
</select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>

        {/* Column Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 110px 110px 150px 130px', padding: '12px 24px', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
          {['NUMBER', 'TITLE', 'TYPE', 'PRIORITY', 'PHASE', 'ASSIGNEE'].map(h => (
            <span key={h} style={{ fontSize: '10.5px', fontWeight: 600, color: '#cbd5e1', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((ticket, i) => (
          <div key={ticket.id}
          onClick={() => setSelectedTicketId(ticket.id)}
            style={{
              display: 'grid', gridTemplateColumns: '110px 1fr 110px 110px 150px 130px',
              padding: '14px 24px', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none',
              cursor: 'pointer', transition: 'background 0.1s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', fontWeight: 500 }}>
              {ticket.ticket_number}
            </span>
            <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#0f172a', paddingRight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ticket.title}
            </span>
            <span style={{ fontSize: '13px' }}>
              {TYPE_ICON[ticket.ticket_type]}{' '}
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{ticket.ticket_type}</span>
            </span>
            <span style={{
              display: 'inline-flex', padding: '3px 10px', borderRadius: '99px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              background: PRIORITY_STYLE[ticket.priority]?.bg,
              color: PRIORITY_STYLE[ticket.priority]?.color, width: 'fit-content'
            }}>
              {ticket.priority}
            </span>
            <span style={{
              display: 'inline-flex', padding: '3px 10px', borderRadius: '99px',
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              background: PHASE_STYLE[ticket.phase]?.bg,
              color: PHASE_STYLE[ticket.phase]?.color, width: 'fit-content'
            }}>
              {PHASE_STYLE[ticket.phase]?.label}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {ticket.assignee_id ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                    DU
                  </div>
                  <span style={{ fontSize: '12px' }}>Dev User</span>
                </div>
              ) : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Unassigned</span>}
            </span>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔍</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>No tickets found</div>
            <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Try adjusting your search or filters</div>
          </div>
        )}
      </div>

      {/* Footer count */}
      <div style={{ marginTop: '14px', fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
        Showing {filtered.length} of {tickets.length} tickets
      </div>
      {selectedTicketId && (
  <TicketDetailPanel
    ticketId={selectedTicketId}
    onClose={() => setSelectedTicketId(null)}
    onUpdated={updated => setTickets(ts => ts.map(t => t.id === updated.id ? updated : t))}
  />
)}
    </div>
  )
}