import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, request, setSessionExpiredHandler } from './client'
import { getAccessToken, getRefreshToken, setTokens } from './tokens'
import { json, mockApi } from '@/test/utils'

beforeEach(() => {
  setTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' })
  setSessionExpiredHandler(null)
})

describe('cliente HTTP', () => {
  it('añade el Bearer automáticamente', async () => {
    const fetchMock = mockApi({
      'GET /users/me': ({ authorization }) => json(200, { auth: authorization }),
    })
    const res = await request<{ auth: string }>('/users/me')
    expect(res.auth).toBe('Bearer old-access')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('ante un 401 refresca y repite la petición', async () => {
    mockApi({
      'GET /users/me': ({ authorization }) =>
        authorization === 'Bearer new-access' ? json(200, { ok: true }) : json(401, { message: 'x' }),
      'POST /auth/refresh': () => json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }),
    })
    await expect(request('/users/me')).resolves.toEqual({ ok: true })
    expect(getAccessToken()).toBe('new-access')
    expect(getRefreshToken()).toBe('new-refresh')
  })

  it('con dos 401 simultáneos hace un solo refresh', async () => {
    const refresh = vi.fn(() => json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }))
    mockApi({
      'GET /a': ({ authorization }) =>
        authorization === 'Bearer new-access' ? json(200, { r: 'a' }) : json(401, { message: 'x' }),
      'GET /b': ({ authorization }) =>
        authorization === 'Bearer new-access' ? json(200, { r: 'b' }) : json(401, { message: 'x' }),
      'POST /auth/refresh': refresh,
    })
    const [a, b] = await Promise.all([request('/a'), request('/b')])
    expect(a).toEqual({ r: 'a' })
    expect(b).toEqual({ r: 'b' })
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('si el refresh falla, cierra la sesión local', async () => {
    const expired = vi.fn()
    setSessionExpiredHandler(expired)
    mockApi({
      'GET /users/me': () => json(401, { message: 'Unauthorized' }),
      'POST /auth/refresh': () => json(401, { message: 'Refresh inválido' }),
    })
    await expect(request('/users/me')).rejects.toMatchObject({ status: 401 })
    expect(expired).toHaveBeenCalledTimes(1)
    expect(getRefreshToken()).toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('extrae retryAfter del header y une los mensajes en array', async () => {
    mockApi({
      'POST /auth/login': () =>
        json(429, { statusCode: 429, message: ['Demasiados intentos', 'Espera'] }, { 'Retry-After': '90' }),
    })
    const error = await request('/auth/login', { method: 'POST', body: {}, auth: false }).catch(
      (e: unknown) => e,
    )
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 429,
      retryAfter: 90,
      message: 'Demasiados intentos. Espera',
    })
  })
})
