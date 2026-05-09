import axios from 'axios'
import type { TicketCreate, TicketUpdate } from '../types'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string, role: string) =>
    api.post('/auth/register', { name, email, password, role }),
  me: () => api.get('/auth/me'),
}

export const ticketsAPI = {
  getAll: () => api.get('/tickets/'),
  getOne: (id: string) => api.get(`/tickets/${id}`),
  create: (data: TicketCreate) => api.post('/tickets/', data),
  update: (id: string, data: TicketUpdate) => api.patch(`/tickets/${id}`, data),
  delete: (id: string) => api.delete(`/tickets/${id}`),
}

export const usersAPI = {
  getAll: () => api.get('/users/'),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export default api