import { useEffect, useState } from 'react'
import type { Paginated, Role, User } from '@/api/types'
import { deleteUser, listUsers, unlockUser, updateUser } from '@/api/users'
import { useAuth } from '@/auth/useAuth'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/toastContext'
import { formatDate } from '@/lib/format'

const PAGE_SIZE = 10
const SELF_HINT = 'No puedes hacer esto sobre tu propia cuenta'

function errorMessage(e: unknown) {
  return e instanceof Error ? e.message : 'Ocurrió un error inesperado'
}

export function AdminPage() {
  const { user: me } = useAuth()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<Paginated<User> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<User | null>(null)

  // Subir reloadKey fuerza una nueva carga de la página actual.
  const [reloadKey, setReloadKey] = useState(0)
  const reload = () => setReloadKey((k) => k + 1)

  useEffect(() => {
    let ignore = false
    listUsers(page, PAGE_SIZE)
      .then((data) => {
        if (ignore) return
        setResult(data)
        setLoadError(null)
      })
      .catch((e: unknown) => {
        if (!ignore) setLoadError(errorMessage(e))
      })
    return () => {
      ignore = true
    }
  }, [page, reloadKey])

  // Ejecuta una acción sobre un usuario, con toast de éxito/error y recarga.
  async function runAction(id: string, action: () => Promise<unknown>, okMessage: string) {
    setBusyId(id)
    try {
      await action()
      toast.success(okMessage)
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete || !result) return
    const target = toDelete
    await runAction(target.id, () => deleteUser(target.id), `Usuario ${target.email} eliminado`)
    setToDelete(null)
    // Si era el último de la página, volvemos a la anterior.
    if (result.data.length === 1 && page > 1) setPage(page - 1)
  }

  const totalPages = result ? Math.max(1, Math.ceil(result.total / result.limit)) : 1

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Administración de usuarios</h1>

      <div aria-live="polite">
        {loadError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {loadError}
          </p>
        )}
      </div>

      {!result && !loadError && <p role="status">Cargando usuarios…</p>}

      {result && (
        <>
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Lista de usuarios</caption>
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Email</th>
                  <th scope="col" className="px-4 py-3">Nombre</th>
                  <th scope="col" className="px-4 py-3">Rol</th>
                  <th scope="col" className="px-4 py-3">Creado</th>
                  <th scope="col" className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((u) => {
                  const isSelf = u.id === me?.id
                  const busy = busyId === u.id
                  return (
                    <tr key={u.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{u.name}</td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Rol de ${u.email}`}
                          className="input w-auto"
                          value={u.role}
                          disabled={isSelf || busy}
                          title={isSelf ? SELF_HINT : undefined}
                          onChange={(e) =>
                            void runAction(
                              u.id,
                              () => updateUser(u.id, { role: e.target.value as Role }),
                              `Rol de ${u.email} actualizado`,
                            )
                          }
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-secondary"
                            disabled={isSelf || busy}
                            title={isSelf ? SELF_HINT : undefined}
                            aria-label={`Desbloquear ${u.email}`}
                            onClick={() =>
                              void runAction(u.id, () => unlockUser(u.id), `${u.email} desbloqueado`)
                            }
                          >
                            Desbloquear
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            disabled={isSelf || busy}
                            title={isSelf ? SELF_HINT : undefined}
                            aria-label={`Eliminar ${u.email}`}
                            onClick={() => setToDelete(u)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <nav aria-label="Paginación" className="mt-4 flex items-center justify-between text-sm">
            <button
              type="button"
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages} ({result.total} usuarios)
            </span>
            <button
              type="button"
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </nav>
        </>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Eliminar usuario"
          message={`¿Seguro que quieres eliminar a ${toDelete.email}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          busy={busyId === toDelete.id}
          onConfirm={() => void confirmDelete()}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
