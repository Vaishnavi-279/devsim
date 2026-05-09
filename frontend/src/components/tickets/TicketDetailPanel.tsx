import { useState, useEffect } from 'react'
import { ticketsAPI, usersAPI } from '../../api'
import type { Ticket, User } from '../../types'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  ticketId: string
  onClose: () => void
  onUpdated: (ticket: Ticket) => void
  onDeleted: (ticketId: string) => void
}

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

const label: React.CSSProperties = {
  fontSize: '11px', fontWeight: 600, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', display: 'block'
}

const section: React.CSSProperties = {
  padding: '20px 24px', borderBottom: '1px solid #f8fafc'
}

export default function TicketDetailPanel({ ticketId, onClose, onUpdated, onDeleted }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [comment, setComment] = useState('')
  const [newCriteria, setNewCriteria] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { canCreateTicket } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: ticket?.title || '',
    priority: ticket?.priority || '',
    phase: ticket?.phase || '',
  })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    ticketsAPI.getOne(ticketId).then(r => {
      setTicket(r.data)
      setEditForm({ title: r.data.title, priority: r.data.priority, phase: r.data.phase })
    })
    usersAPI.getAll().then(r => setUsers(r.data))
  }, [ticketId])

  const handleEdit = async () => {
  if (!ticket) return
  try {
    const res = await ticketsAPI.update(ticket.id, editForm)
    setTicket(res.data)
    onUpdated(res.data)
    setEditing(false)
    toast.success('Ticket updated!')
  } catch {
    toast.error('Failed to update ticket')
  }
}

const handleDelete = async () => {
  if (!ticket || !confirm(`Delete ${ticket.ticket_number}? This cannot be undone.`)) return
  setDeleting(true)
  try {
    await ticketsAPI.delete(ticket.id)
    toast.success('Ticket deleted!')
    onDeleted(ticket.id)
    onClose()
  } catch {
    toast.error('Failed to delete ticket')
  } finally {
    setDeleting(false)
  }
}

  const getUserName = (id?: string) => {
    if (!id) return 'Unassigned'
    return users.find(u => u.id === id)?.name || 'Unknown'
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !ticket) return
    setSubmitting(true)
    try {
      const res = await ticketsAPI.update(ticket.id, { comment })
      setTicket(res.data)
      onUpdated(res.data)
      setComment('')
      toast.success('Comment added!')
    } catch {
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleCriteria = async (criteriaId: string, completed: boolean) => {
    if (!ticket) return
    const updated = ticket.acceptance_criteria.map(c =>
      c.id === criteriaId ? { ...c, completed } : c
    )
    const res = await ticketsAPI.update(ticket.id, { acceptance_criteria: updated })
    setTicket(res.data)
    onUpdated(res.data)
  }

  const handleAddCriteria = async () => {
    if (!newCriteria.trim() || !ticket) return
    const updated = [
      ...ticket.acceptance_criteria,
      { id: Date.now().toString(), text: newCriteria, completed: false }
    ]
    const res = await ticketsAPI.update(ticket.id, { acceptance_criteria: updated })
    setTicket(res.data)
    onUpdated(res.data)
    setNewCriteria('')
    toast.success('Criteria added!')
  }

  if (!ticket) return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: '520px',
      background: '#fff', borderLeft: '1px solid #f1f5f9', zIndex: 900,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.08)'
    }}>
      <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 899
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: '540px',
        background: '#fff', borderLeft: '1px solid #f1f5f9', zIndex: 900,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.1)',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        animation: 'slideIn 0.2s ease'
      }}>

        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', fontWeight: 500 }}>{ticket.ticket_number}</span>
              <span style={{ fontSize: '18px' }}>{TYPE_ICON[ticket.ticket_type]}</span>
              <span style={{
                padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', background: PRIORITY_STYLE[ticket.priority]?.bg,
                color: PRIORITY_STYLE[ticket.priority]?.color
              }}>{ticket.priority}</span>
              <span style={{
                padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', background: PHASE_STYLE[ticket.phase]?.bg,
                color: PHASE_STYLE[ticket.phase]?.color
              }}>{PHASE_STYLE[ticket.phase]?.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {canCreateTicket && !editing && (
                <>
                  <button onClick={() => setEditing(true)}
                    style={{
                      padding: '5px 12px', border: '1.5px solid #e2e8f0', borderRadius: '6px',
                      background: '#fff', fontSize: '12px', fontWeight: 600,
                      color: '#64748b', cursor: 'pointer'
                    }}>
                    Edit
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    style={{
                      padding: '5px 12px', border: '1.5px solid #fee2e2', borderRadius: '6px',
                      background: '#fff', fontSize: '12px', fontWeight: 600,
                      color: '#ef4444', cursor: 'pointer'
                    }}>
                    {deleting ? '...' : 'Delete'}
                  </button>
                </>
              )}
              <button onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '22px', lineHeight: 1 }}>
                ×
              </button>
            </div>
          </div>

          {/* Title — View or Edit mode */}
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px', border: '1.5px solid #6366f1',
                  borderRadius: '7px', fontSize: '15px', fontWeight: 600, color: '#0f172a',
                  outline: 'none', fontFamily: "'DM Sans', system-ui, sans-serif"
                }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                  style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select value={editForm.phase} onChange={e => setEditForm(f => ({ ...f, phase: e.target.value }))}
                  style={{ padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                  <option value="analysis">Analysis</option>
                  <option value="todo">To Do</option>
                  <option value="on_hold">On Hold</option>
                  <option value="in_development">In Development</option>
                  <option value="dev_testing">Dev Testing</option>
                  <option value="qa_testing">QA Testing</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleEdit}
                  style={{ padding: '8px 16px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Save Changes
                </button>
                <button onClick={() => setEditing(false)}
                  style={{ padding: '8px 16px', border: '1.5px solid #e2e8f0', borderRadius: '7px', background: '#fff', fontSize: '13px', fontWeight: 500, color: '#64748b', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
              {ticket.title}
            </h2>
          )}
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>

          {/* Meta Info Grid */}
          <div style={{ ...section, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Developer', value: getUserName(ticket.developer_id) },
              { label: 'Assignee',  value: getUserName(ticket.assignee_id) },
              { label: 'Sprint',    value: ticket.sprint || '—' },
              { label: 'Fix Version', value: ticket.fix_version || '—' },
              { label: 'Time Taken', value: ticket.time_taken ? `${ticket.time_taken} ${ticket.time_unit}` : '—' },
              { label: 'QA Required', value: ticket.qa_required ? `Yes — ${getUserName(ticket.qa_tester_id)}` : 'No' },
            ].map(item => (
              <div key={item.label}>
                <span style={label}>{item.label}</span>
                <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 500 }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* User Story */}
          {ticket.user_story && (
            <div style={section}>
              <span style={label}>User Story</span>
              <div style={{
                background: '#f8fafc', borderRadius: '8px', padding: '14px 16px',
                fontSize: '13.5px', color: '#334155', lineHeight: 1.6,
                borderLeft: '3px solid #6366f1'
              }}>
                {ticket.user_story}
              </div>
            </div>
          )}

          {/* Acceptance Criteria */}
          <div style={section}>
            <span style={label}>Acceptance Criteria</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {ticket.acceptance_criteria.length === 0 && (
                <p style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>No criteria added yet</p>
              )}
              {ticket.acceptance_criteria.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', background: c.completed ? '#f0fdf4' : '#fafafa',
                  borderRadius: '8px', border: `1px solid ${c.completed ? '#bbf7d0' : '#f1f5f9'}`
                }}>
                  <div onClick={() => handleToggleCriteria(c.id, !c.completed)}
                    style={{
                      width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, marginTop: '1px',
                      border: `2px solid ${c.completed ? '#16a34a' : '#cbd5e1'}`,
                      background: c.completed ? '#16a34a' : '#fff',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}>
                    {c.completed && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                  </div>
                  <span style={{
                    fontSize: '13px', color: c.completed ? '#86efac' : '#334155',
                    textDecoration: c.completed ? 'line-through' : 'none', lineHeight: 1.5
                  }}>{c.text}</span>
                </div>
              ))}
            </div>

            {/* Add Criteria */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={newCriteria} onChange={e => setNewCriteria(e.target.value)}
                placeholder="Add acceptance criteria..."
                onKeyDown={e => e.key === 'Enter' && handleAddCriteria()}
                style={{
                  flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0',
                  borderRadius: '7px', fontSize: '13px', outline: 'none',
                  fontFamily: "'DM Sans', system-ui, sans-serif"
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button onClick={handleAddCriteria}
                style={{
                  padding: '8px 14px', background: '#6366f1', color: '#fff',
                  border: 'none', borderRadius: '7px', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer'
                }}>
                Add
              </button>
            </div>
          </div>

          {/* Comments */}
          <div style={section}>
            <span style={label}>Comments ({ticket.comments.length})</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {ticket.comments.length === 0 && (
                <p style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>No comments yet</p>
              )}
              {ticket.comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '50%', background: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0
                  }}>
                    {c.author_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{c.author_name}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{
                      background: '#f8fafc', borderRadius: '8px', padding: '10px 14px',
                      fontSize: '13px', color: '#334155', lineHeight: 1.5
                    }}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3} style={{
                  width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '13px', resize: 'vertical',
                  outline: 'none', fontFamily: "'DM Sans', system-ui, sans-serif",
                  color: '#0f172a', lineHeight: 1.5
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button onClick={handleAddComment} disabled={submitting || !comment.trim()}
                style={{
                  alignSelf: 'flex-end', padding: '8px 18px',
                  background: comment.trim() ? '#6366f1' : '#e2e8f0',
                  color: comment.trim() ? '#fff' : '#94a3b8',
                  border: 'none', borderRadius: '7px', fontSize: '13px',
                  fontWeight: 600, cursor: comment.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s'
                }}>
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </div>
          </div>

          {/* Activity Log */}
          <div style={{ ...section, borderBottom: 'none' }}>
            <span style={label}>Activity Log</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ticket.activity_log.length === 0 && (
                <p style={{ fontSize: '13px', color: '#cbd5e1', fontStyle: 'italic' }}>No activity yet</p>
              )}
              {[...ticket.activity_log].reverse().map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1',
                    flexShrink: 0, marginTop: '6px'
                  }} />
                  <div>
                    <span style={{ fontSize: '12.5px', color: '#334155' }}>
                      <strong>{a.user_name}</strong> {a.action}
                    </span>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  )
}