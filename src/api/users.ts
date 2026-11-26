import { request } from './client'
import type { AdminUpdateUserInput, Paginated, UpdateMeInput, User } from './types'

export const getMe = () => request<User>('/users/me')

export const updateMe = (input: UpdateMeInput) =>
  request<User>('/users/me', { method: 'PATCH', body: input })

// --- Solo ADMIN ---
export const listUsers = (page: number, limit: number) =>
  request<Paginated<User>>(`/users?page=${page}&limit=${limit}`)

export const updateUser = (id: string, input: AdminUpdateUserInput) =>
  request<User>(`/users/${id}`, { method: 'PATCH', body: input })

export const deleteUser = (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' })

export const unlockUser = (id: string) =>
  request<void>(`/users/${id}/unlock`, { method: 'POST' })
