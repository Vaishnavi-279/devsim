export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export type UserRole = 'admin' | 'manager' | 'developer' | 'qa_tester' | 'viewer'

export type TicketType = 'bug' | 'feature' | 'story' | 'epic'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type Phase =
  | 'analysis'
  | 'todo'
  | 'on_hold'
  | 'in_development'
  | 'dev_testing'
  | 'qa_testing'
  | 'done'

export interface AcceptanceCriteria {
  id: string
  text: string
  completed: boolean
}

export interface Comment {
  id: string
  author_id: string
  author_name: string
  content: string
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  user_name: string
  action: string
  created_at: string
}

export interface Ticket {
  id: string
  ticket_number: string
  title: string
  ticket_type: TicketType
  priority: Priority
  phase: Phase
  user_story?: string
  acceptance_criteria: AcceptanceCriteria[]
  developer_id?: string
  assignee_id?: string
  qa_required: boolean
  qa_tester_id?: string
  time_taken?: number
  time_unit?: string
  sprint?: string
  fix_version?: string
  comments: Comment[]
  activity_log: ActivityLog[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}