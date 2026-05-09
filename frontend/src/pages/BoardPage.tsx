import { useEffect, useState } from 'react'
import { ticketsAPI, usersAPI } from '../api'
import type { Ticket, User } from '../types'
import toast from 'react-hot-toast'
import TicketDetailPanel from '../components/tickets/TicketDetailPanel'

const COLUMNS = [
  { key: 'analysis',       label: 'Analysis Phase', color: '#6366f1' },
  { key: 'todo',           label: 'To Do',          color: '#94a3b8' },
  { key: 'on_hold',        label: 'On Hold',        color: '#f59e0b' },
  { key: 'in_development', label: 'In Development', color: '#3b82f6' },
  { key: 'dev_testing',    label: 'Dev Testing',    color: '#8b5cf6' },
  { key: 'qa_testing',     label: 'QA Testing',     color: '#ec4899' },
  { key: 'done',           label: 'Done',           color: '#10b981' },
]

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  low:      { bg: '#f0fdf4', color: '#16a34a' },
  medium:   { bg: '#fefce8', color: '#ca8a04' },
  high:     { bg: '#fff7ed', color: '#ea580c' },
  critical: { bg: '#fef2f2', color: '#dc2626' },
}

const TYPE_ICON: Record<string, string> = {
  bug: '🐛', feature: '✨', story: '📖', epic: '🚀'
}

interface MoveModal {
  ticket: Ticket
  targetPhase: string
}

export default function BoardPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [moveModal, setMoveModal] = useState<MoveModal | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [filterUser, setFilterUser] = useState('all')
  const [form, setForm] = useState({
    developer_id: '', assignee_id: '', qa_required: false,
    qa_tester_id: '', time_taken: '', time_unit: 'hours',
    sprint: 'Sprint 1', fix_version: 'v1.0', comment: ''
  })

  useEffect(() => {
    ticketsAPI.getAll().then(r => setTickets(r.data))
    usersAPI.getAll().then(r => setUsers(r.data))
  }, [])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleDragStart = (e: React.DragEvent, ticketId: string) => {
    e.dataTransfer.setData('ticketId', ticketId)
  }

  const handleDrop = (e: React.DragEvent, phase: string) => {
    e.preventDefault()
    setDragOver(null)
    const ticketId = e.dataTransfer.getData('ticketId')
    const ticket = tickets.find(t => t.id === ticketId)
    if (!ticket || ticket.phase === phase) return
    setMoveModal({ ticket, targetPhase: phase })
    setForm({
      developer_id: ticket.developer_id || '',
      assignee_id: ticket.assignee_id || '',
      qa_required: ticket.qa_required || false,
      qa_tester_id: ticket.qa_tester_id || '',
      time_taken: ticket.time_taken?.toString() || '',
      time_unit: ticket.time_unit || 'hours',
      sprint: ticket.sprint || 'Sprint 1',
      fix_version: ticket.fix_version || 'v1.0',
      comment: ''
    })
  }

  const handleConfirmMove = async () => {
    if (!moveModal) return
    try {
      const updated = await ticketsAPI.update(moveModal.ticket.id, {
        phase: moveModal.targetPhase,
        ...form,
        time_taken: form.time_taken ? parseFloat(form.time_taken) : null,
      })
      setTickets(ts => ts.map(t => t.id === updated.data.id ? updated.data : t))
      toast.success(`Moved to ${COLUMNS.find(c => c.key === moveModal.targetPhase)?.label}`)
      setMoveModal(null)
    } catch {
      toast.error('Failed to move ticket')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: '7px', fontSize: '13px', color: '#0f172a',
    outline: 'none', background: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif"
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px'
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', system-ui, sans-serif", height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Kanban Board
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>Drag and drop tickets between phases</p>
      </div>

      {/* Filter Bar */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Filter by:</span>
      </div>
      <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
        style={{
          padding: '7px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px',
          fontSize: '13px', color: '#0f172a', background: '#fff', outline: 'none',
          cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif"
        }}>
        <option value="all">All Assignees</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
      {filterUser !== 'all' && (
        <button onClick={() => setFilterUser('all')}
          style={{
            padding: '6px 12px', border: '1px solid #fee2e2', borderRadius: '7px',
            background: '#fef2f2', color: '#ef4444', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer'
          }}>
          Clear ×
        </button>
      )}
    </div>

      {/* Board */}
      <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', flex: 1, paddingBottom: '16px' }}>
        {COLUMNS.map(col => {
          const colTickets = tickets
            .filter(t => t.phase === col.key)
            .filter(t => filterUser === 'all' || t.assignee_id === filterUser)
          return (
            <div key={col.key}
              style={{ minWidth: '230px', width: '230px', display: 'flex', flexDirection: 'column' }}
              onDragOver={e => { e.preventDefault(); setDragOver(col.key) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.key)}
            >
              {/* Column Header */}
              <div style={{ marginBottom: '10px', padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: col.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {col.label}
                  </span>
                  <span style={{
                    background: col.color + '18', color: col.color,
                    borderRadius: '99px', padding: '1px 8px', fontSize: '11px', fontWeight: 700
                  }}>
                    {colTickets.length}
                  </span>
                </div>
                <div style={{ height: '2px', borderRadius: '2px', background: col.color }} />
              </div>

              {/* Drop Zone */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', gap: '8px',
                minHeight: '80px', padding: '4px', borderRadius: '10px',
                background: dragOver === col.key ? col.color + '08' : 'transparent',
                border: dragOver === col.key ? `2px dashed ${col.color}40` : '2px dashed transparent',
                transition: 'all 0.15s'
              }}>
                {colTickets.map(ticket => (
                  <div key={ticket.id}
                    draggable
                    onClick={() => setSelectedTicketId(ticket.id)}
                    onDragStart={e => handleDragStart(e, ticket.id)}
                    style={{
                      background: '#fff', borderRadius: '9px',
                      padding: '12px 14px', cursor: 'grab',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'none' }}
                  >
                    {/* Ticket Number + Priority */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', fontWeight: 500 }}>
                        {ticket.ticket_number}
                      </span>
                      <span style={{
                        padding: '2px 7px', borderRadius: '99px', fontSize: '10px',
                        fontWeight: 700, textTransform: 'uppercase',
                        background: PRIORITY_STYLE[ticket.priority]?.bg,
                        color: PRIORITY_STYLE[ticket.priority]?.color
                      }}>
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f172a', lineHeight: 1.4, marginBottom: '10px' }}>
                      {TYPE_ICON[ticket.ticket_type]} {ticket.title}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%', background: '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '9px', fontWeight: 700
                      }}>
                        DU
                      </div>
                      {ticket.fix_version && (
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {ticket.fix_version}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {colTickets.length === 0 && (
                  <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#cbd5e1', fontSize: '12px', padding: '20px', textAlign: 'center'
                  }}>
                    Drop tickets here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Move Modal */}
      {moveModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={e => { if (e.target === e.currentTarget) setMoveModal(null) }}>
          <div style={{
            background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '460px',
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.18)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                  Move to <span style={{ color: COLUMNS.find(c => c.key === moveModal.targetPhase)?.color }}>
                    {COLUMNS.find(c => c.key === moveModal.targetPhase)?.label}
                  </span>
                </h3>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {moveModal.ticket.ticket_number} · {moveModal.ticket.title}
                </p>
              </div>
              <button onClick={() => setMoveModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '22px', lineHeight: 1, padding: '4px' }}>
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Developer + Assignee */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Developer</label>
                  <select value={form.developer_id} onChange={e => set('developer_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Assignee</label>
                  <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>

              {/* QA Toggle */}
              <div>
                <label style={labelStyle}>QA Testing Required</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button type="button" onClick={() => set('qa_required', !form.qa_required)}
                    style={{
                      width: '44px', height: '24px', borderRadius: '99px', border: 'none',
                      background: form.qa_required ? '#6366f1' : '#e2e8f0',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s'
                    }}>
                    <div style={{
                      position: 'absolute', top: '3px', width: '18px', height: '18px',
                      borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                      left: form.qa_required ? '23px' : '3px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>{form.qa_required ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {form.qa_required && (
                <div>
                  <label style={labelStyle}>QA Tester</label>
                  <select value={form.qa_tester_id} onChange={e => set('qa_tester_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Select tester</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              )}

              {/* Time + Sprint + Fix Version */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Time Taken</label>
                  <input type="number" value={form.time_taken} onChange={e => set('time_taken', e.target.value)}
                    placeholder="0" style={inputStyle} min="0"
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
                <div>
                  <label style={labelStyle}>Unit</label>
                  <select value={form.time_unit} onChange={e => set('time_unit', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Fix Version</label>
                  <input value={form.fix_version} onChange={e => set('fix_version', e.target.value)}
                    placeholder="v1.0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {/* Sprint */}
              <div>
                <label style={labelStyle}>Sprint</label>
                <select value={form.sprint} onChange={e => set('sprint', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {['Sprint 1','Sprint 2','Sprint 3','Sprint 4'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label style={labelStyle}>Comment</label>
                <textarea value={form.comment} onChange={e => set('comment', e.target.value)}
                  placeholder="Add a note about this move..."
                  rows={3} style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => setMoveModal(null)}
                  style={{
                    padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: '7px',
                    background: '#fff', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', color: '#64748b'
                  }}>
                  Cancel
                </button>
                <button onClick={handleConfirmMove}
                  style={{
                    padding: '9px 20px', background: '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '7px', fontSize: '13.5px',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.background = '#6366f1'}
                >
                  Confirm Move →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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