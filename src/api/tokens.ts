// Almacén de tokens.
// - accessToken: solo en memoria (se pierde al recargar, y es lo que queremos).
// - refreshToken: en localStorage para mantener la sesión al recargar.
//   Ver README para el tradeoff frente a una cookie httpOnly.
import type { TokenPair } from './types'

const REFRESH_KEY = 'refreshToken'

let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY)
  } catch {
    return null
  }
}

export function setTokens(tokens: TokenPair): void {
  accessToken = tokens.accessToken
  try {
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken)
  } catch {
    // Sin localStorage la sesión solo dura hasta recargar.
  }
}

export function clearTokens(): void {
  accessToken = null
  try {
    localStorage.removeItem(REFRESH_KEY)
  } catch {
    // ignorado
  }
}
