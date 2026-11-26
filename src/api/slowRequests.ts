// Cuenta las peticiones "lentas" (> 3 s) para mostrar el aviso de cold start.
// Es un store mínimo compatible con useSyncExternalStore.
export const SLOW_AFTER_MS = 3000

let slowCount = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

/** Empieza a vigilar una petición. Devuelve la función que hay que llamar al terminar. */
export function trackSlowRequest(): () => void {
  let counted = false
  const timer = setTimeout(() => {
    counted = true
    slowCount++
    emit()
  }, SLOW_AFTER_MS)

  return () => {
    clearTimeout(timer)
    if (counted) {
      slowCount--
      emit()
    }
  }
}

export function subscribeSlow(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function hasSlowRequests(): boolean {
  return slowCount > 0
}
