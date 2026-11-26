import { request } from './client'
import type { AuthResponse, RegisterInput } from './types'

export function login(email: string, password: string): Promise<AuthResponse> {
  return request('/auth/login', { method: 'POST', body: { email, password }, auth: false })
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return request('/auth/register', { method: 'POST', body: input, auth: false })
}

export function logout(): Promise<void> {
  return request('/auth/logout', { method: 'POST' })
}
