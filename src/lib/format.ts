/** 45 -> "45 s", 90 -> "2 min" (redondea hacia arriba). */
export function formatDuration(seconds: number): string {
  return seconds < 60 ? `${seconds} s` : `${Math.ceil(seconds / 60)} min`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' })
}
