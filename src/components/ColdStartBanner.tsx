import { useSyncExternalStore } from 'react'
import { hasSlowRequests, subscribeSlow } from '@/api/slowRequests'

/** Aviso global cuando alguna petición lleva más de 3 s (cold start de Render). */
export function ColdStartBanner() {
  const slow = useSyncExternalStore(subscribeSlow, hasSlowRequests)
  if (!slow) return null

  return (
    <div
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
    >
      Despertando el servidor… (plan gratuito, puede tardar hasta 1 min)
    </div>
  )
}
