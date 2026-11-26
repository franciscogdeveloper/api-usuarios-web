import type { ComponentProps } from 'react'

interface SubmitButtonProps extends ComponentProps<'button'> {
  loading?: boolean
}

export function SubmitButton({ loading, disabled, children, ...props }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      className="btn-primary w-full"
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {children}
    </button>
  )
}

/** Mensaje de error del servidor, en una región aria-live. */
export function ServerError({ message }: { message: string | null }) {
  return (
    <div aria-live="assertive" className="mb-4 empty:hidden">
      {message && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {message}
        </p>
      )}
    </div>
  )
}
