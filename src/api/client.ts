import { config } from '@/config'
import { trackSlowRequest } from './slowRequests'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from './tokens'
import type { TokenPair } from './types'

// El plan free de Render puede tardar hasta ~1 min en despertar.
export const REQUEST_TIMEOUT_MS = 90_000

/** Error de la API con el mensaje ya normalizado a string. */
export class ApiError extends Error {
  readonly status: number
  /** Segundos de espera (header Retry-After), normalmente en un 429. */
  readonly retryAfter?: number

  constructor(status: number, message: string, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  /** false = no añade Bearer ni intenta refresh (login, register, refresh). */
  auth?: boolean
}

// --- Aviso al resto de la app cuando la sesión se pierde ---
let sessionExpiredHandler: (() => void) | null = null
export function setSessionExpiredHandler(handler: (() => void) | null): void {
  sessionExpiredHandler = handler
}

/** Hace un fetch con Bearer, timeout de 90 s y seguimiento de lentitud. */
async function send(path: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body, auth = true } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const stopTracking = trackSlowRequest()

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getAccessToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  try {
    return await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new ApiError(
      0,
      controller.signal.aborted
        ? 'El servidor tardó demasiado en responder. Inténtalo de nuevo.'
        : 'No se pudo conectar con el servidor.',
    )
  } finally {
    clearTimeout(timeout)
    stopTracking()
  }
}

/** Convierte una respuesta no-OK de Nest en ApiError. */
async function toApiError(res: Response): Promise<ApiError> {
  let message = res.statusText || 'Error inesperado'
  try {
    const data = (await res.json()) as { message?: string | string[] }
    if (Array.isArray(data.message)) message = data.message.join('. ')
    else if (typeof data.message === 'string') message = data.message
  } catch {
    // cuerpo no JSON: nos quedamos con statusText
  }
  const retry = Number(res.headers.get('Retry-After'))
  return new ApiError(res.status, message, retry > 0 ? retry : undefined)
}

// --- Refresh con promesa compartida ---
let refreshPromise: Promise<void> | null = null

/**
 * Renueva los tokens. Si ya hay un refresh en curso, todos los llamantes
 * esperan a la misma promesa (el refresh token rota: usarlo dos veces fallaría).
 */
export function refreshSession(): Promise<void> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

async function doRefresh(): Promise<void> {
  const refreshToken = getRefreshToken()
  try {
    if (!refreshToken) throw new ApiError(401, 'No hay sesión activa.')
    const res = await send('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
    if (!res.ok) throw await toApiError(res)
    setTokens((await res.json()) as TokenPair)
  } catch (error) {
    // Token inválido (4xx): se descarta. Si fue un fallo de red o 5xx lo
    // conservamos para poder reintentar al recargar.
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      clearTokens()
    }
    sessionExpiredHandler?.()
    throw error
  }
}

/** Petición tipada. Ante un 401 en ruta protegida intenta UN refresh y repite. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const tokenUsed = getAccessToken()
  let res = await send(path, options)

  if (res.status === 401 && options.auth !== false && getRefreshToken()) {
    // Si otra petición ya renovó el token mientras esperábamos, basta con reintentar.
    if (getAccessToken() === tokenUsed) await refreshSession()
    res = await send(path, options)
  }

  if (!res.ok) throw await toApiError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
