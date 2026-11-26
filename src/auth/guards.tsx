import { Navigate, Outlet, useLocation } from 'react-router'
import type { Role } from '@/api/types'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { useAuth } from './useAuth'

function FullLoader() {
  return (
    <p role="status" className="py-20 text-center text-slate-500">
      Cargando sesión…
    </p>
  )
}

/** Solo con sesión; si no, a /login (recordando a dónde quería ir). */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullLoader />
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Solo para un rol concreto; si no lo tiene, página 403. Va dentro de RequireAuth. */
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()
  if (user?.role !== role) return <ForbiddenPage />
  return <Outlet />
}

/** Para /login y /registro: con sesión activa redirige fuera. */
export function PublicOnly() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <FullLoader />
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from
    return <Navigate to={from ?? '/perfil'} replace />
  }
  return <Outlet />
}

/** "/" redirige según haya sesión o no. */
export function HomeRedirect() {
  const { status } = useAuth()
  if (status === 'loading') return <FullLoader />
  return <Navigate to={status === 'authenticated' ? '/perfil' : '/login'} replace />
}
