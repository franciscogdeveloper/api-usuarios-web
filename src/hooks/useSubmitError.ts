import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/api/client'
import { formatDuration } from '@/lib/format'

const DEFAULT_WAIT_SECONDS = 60

/**
 * Gestiona el error de un formulario: mensaje del servidor y, ante un 429,
 * una cuenta atrás (Retry-After) durante la que el botón debe estar deshabilitado.
 */
export function useSubmitError() {
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(0)

  // Cuenta atrás de 1 s mientras queden segundos.
  const counting = remaining > 0
  useEffect(() => {
    if (!counting) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [counting])

  const handle = useCallback((e: unknown) => {
    if (e instanceof ApiError && e.status === 429) {
      setError(null)
      setRemaining(e.retryAfter ?? DEFAULT_WAIT_SECONDS)
    } else {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado')
    }
  }, [])

  const reset = useCallback(() => setError(null), [])

  const message = counting
    ? `Demasiados intentos. Intenta de nuevo en ${formatDuration(remaining)}`
    : error

  return { message, blocked: counting, handle, reset }
}
