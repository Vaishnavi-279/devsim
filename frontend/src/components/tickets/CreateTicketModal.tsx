import { useState, useEffect } from 'react'
import { ticketsAPI, usersAPI } from '../../api'
import type { User } from '../../types'
import toast from 'react-hot-toast'

interface Props { onClose: () => void; onCreated: () => void }

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, padding: '24px'
}
const modal: React.CSSProperties = {
  background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '540px',
  maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0',
  borderRadius: '7px', fontSize: '13.5px', color: '#0f172a',
  outline: 'none', background: '#fff', transition: 'border-color 0.15s'
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 600,
  color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px'
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

export default function CreateTicketModal({ onClose, onCreated }: Props) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', ticket_type: 'feature', priority: 'medium',
    phase: 'analysis', user_story: '', developer_id: '',
    assignee_id: '', qa_required: false, qa_tester_id: '',
    sprint: 'Sprint 1', fix_version: 'v1.0', time_taken: '', time_unit: 'hours'
  })

  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data)) }, [])

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    setLoading(true)
    try {
      await ticketsAPI.create({
        ...form,
        time_taken: form.time_taken ? parseFloat(form.time_taken) : null,
        acceptance_criteria: []
      })
      toast.success('Ticket created! 🎉')
      onCreated()
    } catch {
      toast.error('Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={modal}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Create Ticket</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="What needs to be done?" style={inputStyle} required
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          {/* Type + Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.ticket_type} onChange={e => set('ticket_type', e.target.value)} style={selectStyle}>
                <option value="bug">🐛 Bug</option>
                <option value="feature">✨ Feature</option>
                <option value="story">📖 Story</option>
                <option value="epic">🚀 Epic</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} style={selectStyle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Phase + Sprint */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Phase</label>
              <select value={form.phase} onChange={e => set('phase', e.target.value)} style={selectStyle}>
                <option value="analysis">Analysis</option>
                <option value="todo">To Do</option>
                <option value="on_hold">On Hold</option>
                <option value="in_development">In Development</option>
                <option value="dev_testing">Dev Testing</option>
                <option value="qa_testing">QA Testing</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sprint</label>
              <select value={form.sprint} onChange={e => set('sprint', e.target.value)} style={selectStyle}>
                {['Sprint 1','Sprint 2','Sprint 3','Sprint 4'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Developer + Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Developer</label>
              <select value={form.developer_id} onChange={e => set('developer_id', e.target.value)} style={selectStyle}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Assignee</label>
              <select value={form.assignee_id} onChange={e => set('assignee_id', e.target.value)} style={selectStyle}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>

          {/* QA */}
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
                  left: form.qa_required ? '23px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
              </button>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{form.qa_required ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {form.qa_required && (
            <div>
              <label style={labelStyle}>QA Tester</label>
              <select value={form.qa_tester_id} onChange={e => set('qa_tester_id', e.target.value)} style={selectStyle}>
                <option value="">Select tester</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          )}

          {/* Time + Fix Version */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Time Taken</label>
              <input type="number" value={form.time_taken} onChange={e => set('time_taken', e.target.value)}
                placeholder="0" style={inputStyle} min="0"
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={labelStyle}>Unit</label>
              <select value={form.time_unit} onChange={e => set('time_unit', e.target.value)} style={selectStyle}>
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

          {/* User Story */}
          <div>
            <label style={labelStyle}>User Story</label>
            <textarea value={form.user_story} onChange={e => set('user_story', e.target.value)}
              placeholder="As a [user] I want [goal] so that [reason]"
              rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '9px 18px', border: '1.5px solid #e2e8f0', borderRadius: '7px', background: '#fff', fontSize: '13.5px', fontWeight: 500, cursor: 'pointer', color: '#64748b' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '9px 20px', background: loading ? '#a5b4fc' : '#6366f1', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13.5px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}