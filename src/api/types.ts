// Tipos compartidos con la API (ver contrato de api-usuarios).
export type Role = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends TokenPair {
  user: User
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface RegisterInput {
  email: string
  name: string
  password: string
}

export interface UpdateMeInput {
  name?: string
  password?: string
}

export interface AdminUpdateUserInput {
  name?: string
  email?: string
  role?: Role
  password?: string
}
