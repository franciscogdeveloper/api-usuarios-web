import { Link } from 'react-router'

export function ForbiddenPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-slate-300 dark:text-slate-700">403</p>
      <h1 className="mt-4 text-2xl font-semibold">No tienes permiso para ver esta página</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Esta sección es solo para administradores.
      </p>
      <Link to="/perfil" className="btn-primary mt-6">
        Volver a mi perfil
      </Link>
    </div>
  )
}
