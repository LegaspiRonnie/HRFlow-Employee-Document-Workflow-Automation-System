import api from '../lib/api'
import type { LoginResponse, User } from '../types/auth'

/**
 * Typed wrappers around the auth endpoints. Components never call the
 * Axios instance directly — they go through service functions like these.
 */

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password })
  return data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

/** GET /auth/me wraps the user in { data } (Laravel API Resource default). */
export async function me(): Promise<User> {
  const { data } = await api.get<{ data: User }>('/auth/me')
  return data.data
}
