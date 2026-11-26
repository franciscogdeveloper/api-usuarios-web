import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { FormField } from '@/components/FormField'
import { ServerError, SubmitButton } from '@/components/SubmitButton'
import { useSubmitError } from '@/hooks/useSubmitError'
import { loginSchema, type LoginValues } from '@/lib/schemas'

export function LoginPage() {
  const { login } = useAuth()
  const submitError = useSubmitError()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = handleSubmit(async (values) => {
    submitError.reset()
    try {
      // Al autenticarse, PublicOnly redirige solo a /perfil.
      await login(values.email, values.password)
    } catch (e) {
      submitError.handle(e)
    }
  })

  return (
    <div className="card mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-semibold">Iniciar sesión</h1>
      <ServerError message={submitError.message} />
      <form onSubmit={onSubmit} noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <SubmitButton loading={isSubmitting} disabled={submitError.blocked}>
          Entrar
        </SubmitButton>
      </form>
      <p className="mt-4 text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="text-indigo-600 hover:underline dark:text-indigo-400">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
