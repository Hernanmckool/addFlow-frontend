import api, { getCsrfCookie } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: string
  tenant_id: string
  tenant?: { id: string; name: string; currency: string; timezone: string }
}

export async function login(email: string, password: string): Promise<User> {
  await getCsrfCookie()
  const response = await api.post('/api/login', { email, password })
  return response.data.user
}

export async function logout(): Promise<void> {
  await api.post('/api/logout')
}

export async function getUser(): Promise<User> {
  const response = await api.get('/api/user')
  return response.data.user
}
