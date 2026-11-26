import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '@/api/auth'
import { refreshSession, setSessionExpiredHandler } from '@/api/client'
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/api/tokens'
import type { AuthResponse, RegisterInput, User } from '@/api/types'
import { getMe } from '@/api/users'
import { AuthContext, type AuthContextValue, type AuthStatus } from './authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Si hay refresh token, arrancamos en "loading" hasta restaurar la sesión.
  const [status, setStatus] = useState<AuthStatus>(() =>
    getRefreshToken() ? 'loading' : 'anonymous',
  )

  const clearSession = useCallback(() => {
    setUser(null)
    setStatus('anonymous')
  }, [])

  // El cliente HTTP avisa aquí cuando el refresh falla: logout local.
  // Los guards redirigen a /login al pasar a "anonymous".
  useEffect(() => {
    setSessionExpiredHandler(clearSession)
    return () => setSessionExpiredHandler(null)
  }, [clearSession])

  // Restaurar sesión al arrancar: refresh -> /users/me.
  useEffect(() => {
    if (!getRefreshToken()) return
    let cancelled = false

    async function restore() {
      try {
        await refreshSession() // promesa compartida: StrictMode no duplica la llamada
        const me = await getMe()
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        if (!cancelled) clearSession()
      }
    }
    void restore()

    return () => {
      cancelled = true
    }
  }, [clearSession])

  const startSession = useCallback((res: AuthResponse) => {
    setTokens(res)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const login = useCallback(
    async (email: string, password: string) => startSession(await authApi.login(email, password)),
    [startSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => startSession(await authApi.register(input)),
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      if (getAccessToken()) await authApi.logout()
    } catch {
      // Aunque falle en el servidor, cerramos la sesión local.
    }
    clearTokens()
    clearSession()
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    setUser(await getMe())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
