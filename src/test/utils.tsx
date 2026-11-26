import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { config } from '@/config'
import type { User } from '@/api/types'
import App from '@/App'

export function json(status: number, body?: unknown, headers?: Record<string, string>) {
  if (status === 204 || body === undefined) return new Response(null, { status, headers })
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

export interface MockRequest {
  path: string
  init: RequestInit
  body: unknown
  authorization: string | null
}
type Handler = (req: MockRequest) => Response | Promise<Response>

/** Sustituye fetch. Las rutas se indican como "METODO /ruta" (sin query). */
export function mockApi(handlers: Record<string, Handler>) {
  const fn = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const path = String(input).replace(config.apiUrl, '')
    const key = `${init.method ?? 'GET'} ${path.split('?')[0]}`
    const handler = handlers[key]
    if (!handler) return json(404, { statusCode: 404, message: `Sin mock para ${key}` })
    const headers = (init.headers ?? {}) as Record<string, string>
    return handler({
      path,
      init,
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
      authorization: headers.Authorization ?? null,
    })
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

export const adminUser: User = {
  id: 'u1',
  email: 'admin@example.com',
  name: 'Admin',
  role: 'ADMIN',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
}

export const normalUser: User = {
  id: 'u2',
  email: 'ana@example.com',
  name: 'Ana',
  role: 'USER',
  createdAt: '2025-02-01T00:00:00.000Z',
  updatedAt: '2025-02-01T00:00:00.000Z',
}

/** Handlers para simular una sesión restaurable de `user`. */
export function sessionHandlers(user: User) {
  localStorage.setItem('refreshToken', 'old-refresh')
  return {
    'POST /auth/refresh': () => json(200, { accessToken: 'access-1', refreshToken: 'refresh-1' }),
    'GET /users/me': () => json(200, user),
  }
}

export function renderApp(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}
