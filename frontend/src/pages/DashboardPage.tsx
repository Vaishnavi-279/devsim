import { useEffect, useState } from 'react'
import { ticketsAPI } from '../api'
import type { Ticket } from '../types'
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
  in_development: { bg: '#eff6ff', color: '#2563eb', label: 'In Dev' },
  dev_testing:    { bg: '#faf5ff', color: '#9333ea', label: 'Dev Testing' },
  qa_testing:     { bg: '#fdf2f8', color: '#db2777', label: 'QA Testing' },
  done:           { bg: '#f0fdf4', color: '#16a34a', label: 'Done' },
}

const TYPE_ICON: Record<string, string> = {
  bug: '🐛', feature: '✨', story: '📖', epic: '🚀'
}

const STAT_CARDS = [
  { key: 'total',    label: 'TOTAL',       dot: '#6366f1' },
  { key: 'todo',     label: 'TO DO',       dot: '#94a3b8' },
  { key: 'progress', label: 'IN PROGRESS', dot: '#3b82f6' },
  { key: 'qa',       label: 'IN QA',       dot: '#db2777' },
  { key: 'done',     label: 'DONE',        dot: '#16a34a' },
  { key: 'hold',     label: 'ON HOLD',     dot: '#f59e0b' },
]

export default function DashboardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)

  useEffect(() => { ticketsAPI.getAll().then(r => setTickets(r.data)) }, [])

  const stats: Record<string, number> = {
    total:    tickets.length,
    todo:     tickets.filter(t => t.phase === 'todo').length,
    progress: tickets.filter(t => t.phase === 'in_development').length,
    qa:       tickets.filter(t => t.phase === 'qa_testing').length,
    done:     tickets.filter(t => t.phase === 'done').length,
    hold:     tickets.filter(t => t.phase === 'on_hold').length,
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: "'DM Sans', system-ui, sans-serif", maxWidth: '1200px' }}>

      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Workspace · DevSim
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Real-time overview of your team's tickets, sprints and progress.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '32px' }}>
        {STAT_CARDS.map(card => (
          <div key={card.key} style={{
            background: '#fff', border: '1px solid #f1f5f9',
            borderRadius: '12px', padding: '20px 20px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: card.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {card.label}
              </span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {stats[card.key]}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tickets Table */}
      <div style={{
        background: '#fff', border: '1px solid #f1f5f9',
        borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Recent Tickets</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>{tickets.length} total</span>
        </div>

        {/* Column Headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '100px 1fr 90px 100px 130px',
          padding: '10px 24px', background: '#fafafa',
          borderBottom: '1px solid #f1f5f9'
        }}>
          {['NUMBER', 'TITLE', 'TYPE', 'PRIORITY', 'PHASE'].map(h => (
            <span key={h} style={{ fontSize: '10.5px', fontWeight: 600, color: '#cbd5e1', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {tickets.map((ticket, i) => (
          <div key={ticket.id}
          onClick={() => setSelectedTicketId(ticket.id)}
            style={{
              display: 'grid', gridTemplateColumns: '100px 1fr 90px 100px 130px',
              padding: '14px 24px', alignItems: 'center',
              borderBottom: i < tickets.length - 1 ? '1px solid #f8fafc' : 'none',
              transition: 'background 0.1s', cursor: 'pointer'
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
              {TYPE_ICON[ticket.ticket_type]} <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{ticket.ticket_type}</span>
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              background: PRIORITY_STYLE[ticket.priority]?.bg,
              color: PRIORITY_STYLE[ticket.priority]?.color,
              width: 'fit-content'
            }}>
              {ticket.priority}
            </span>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              background: PHASE_STYLE[ticket.phase]?.bg,
              color: PHASE_STYLE[ticket.phase]?.color,
              width: 'fit-content'
            }}>
              {PHASE_STYLE[ticket.phase]?.label}
            </span>
          </div>
        ))}

        {tickets.length === 0 && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#cbd5e1' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>No tickets yet</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>Create your first ticket to get started</div>
          </div>
        )}
      </div>
      {selectedTicketId && (
  <TicketDetailPanel
    ticketId={selectedTicketId}
    onClose={() => setSelectedTicketId(null)}
    onUpdated={updated => setTickets(ts => ts.map(t => t.id === updated.id ? updated : t))}
    onDeleted={id => {
      setTickets(ts => ts.filter(t => t.id !== id))
      setSelectedTicketId(null)
    }}
  />
)}
    </div>
  )
}