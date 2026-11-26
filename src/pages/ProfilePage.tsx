import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { updateMe } from '@/api/users'
import { useAuth } from '@/auth/useAuth'
import { useToast } from '@/components/toastContext'
import { FormField } from '@/components/FormField'
import { ServerError, SubmitButton } from '@/components/SubmitButton'
import { useSubmitError } from '@/hooks/useSubmitError'
import { formatDate } from '@/lib/format'
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from '@/lib/schemas'

export function ProfilePage() {
  const { user } = useAuth()
  if (!user) return null // RequireAuth garantiza que existe

  return (
    <div className="mx-auto max-w-md space-y-6">
      <section className="card">
        <h1 className="mb-4 text-2xl font-semibold">Mi perfil</h1>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500">Email</dt>
          <dd>{user.email}</dd>
          <dt className="text-slate-500">Rol</dt>
          <dd>{user.role}</dd>
          <dt className="text-slate-500">Miembro desde</dt>
          <dd>{formatDate(user.createdAt)}</dd>
        </dl>
      </section>
      <NameForm currentName={user.name} />
      <PasswordForm />
    </div>
  )
}

function NameForm({ currentName }: { currentName: string }) {
  const { refreshUser } = useAuth()
  const toast = useToast()
  const submitError = useSubmitError()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: currentName },
  })

  const onSubmit = handleSubmit(async ({ name }) => {
    submitError.reset()
    try {
      await updateMe({ name })
      await refreshUser()
      toast.success('Nombre actualizado')
    } catch (e) {
      submitError.handle(e)
    }
  })

  return (
    <section className="card">
      <h2 className="mb-4 text-lg font-semibold">Editar nombre</h2>
      <ServerError message={submitError.message} />
      <form onSubmit={onSubmit} noValidate>
        <FormField label="Nombre" error={errors.name?.message} {...register('name')} />
        <SubmitButton loading={isSubmitting} disabled={submitError.blocked}>
          Guardar nombre
        </SubmitButton>
      </form>
    </section>
  )
}

function PasswordForm() {
  const { logout } = useAuth()
  const toast = useToast()
  const submitError = useSubmitError()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = handleSubmit(async ({ password }) => {
    submitError.reset()
    try {
      await updateMe({ password })
      // La API invalida el refresh token al cambiar la contraseña.
      toast.success('Contraseña cambiada. Vuelve a iniciar sesión.')
      await logout()
    } catch (e) {
      submitError.handle(e)
    }
  })

  return (
    <section className="card">
      <h2 className="mb-1 text-lg font-semibold">Cambiar contraseña</h2>
      <p className="mb-4 text-sm text-slate-500">
        Al cambiarla tendrás que volver a iniciar sesión.
      </p>
      <ServerError message={submitError.message} />
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <FormField
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.confirm?.message}
          {...register('confirm')}
        />
        <SubmitButton loading={isSubmitting} disabled={submitError.blocked}>
          Cambiar contraseña
        </SubmitButton>
      </form>
    </section>
  )
}
