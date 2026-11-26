import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-5xl font-bold text-slate-300 dark:text-slate-700">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Página no encontrada</h1>
      <Link to="/" className="btn-primary mt-6">
        Ir al inicio
      </Link>
    </div>
  )
}
