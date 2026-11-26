import { Link, Outlet } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { ColdStartBanner } from './ColdStartBanner'

/** Estructura común: banner de cold start, navbar y contenido. */
export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <ColdStartBanner />
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <nav
          aria-label="Principal"
          className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <Link to="/" className="font-semibold">
            API Usuarios
          </Link>
          {user && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/perfil" className="hover:underline">
                {user.name}
              </Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <button type="button" className="btn-secondary" onClick={() => void logout()}>
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
