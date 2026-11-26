import { useId, type ComponentProps } from 'react'

interface FormFieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
}

/** Input con label asociado y mensaje de error accesible. */
export function FormField({ label, error, ...inputProps }: FormFieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {/* aria-live siempre presente para que el lector anuncie el error al aparecer */}
      <p id={errorId} aria-live="polite" className="mt-1 min-h-5 text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    </div>
  )
}
