import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { FormField } from '@/components/FormField'
import { ServerError, SubmitButton } from '@/components/SubmitButton'
import { useSubmitError } from '@/hooks/useSubmitError'
import { registerSchema, type RegisterValues } from '@/lib/schemas'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const submitError = useSubmitError()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = handleSubmit(async (values) => {
    submitError.reset()
    try {
      await registerUser(values)
    } catch (e) {
      submitError.handle(e)
    }
  })

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Crear cuenta</h1>
      <ServerError message={submitError.message} />
      <form onSubmit={onSubmit} noValidate>
        <FormField
          label="Nombre"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormField
          label="Contraseña"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <p className="-mt-3 mb-4 text-xs text-slate-500">
          Mínimo 8 caracteres, con una mayúscula y un número.
        </p>
        <SubmitButton loading={isSubmitting} disabled={submitError.blocked}>
          Registrarme
        </SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
