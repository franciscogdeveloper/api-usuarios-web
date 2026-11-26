// Lee y valida las variables de entorno una sola vez, al arrancar la app.
const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error(
    'Falta la variable de entorno VITE_API_URL. Copia .env.example a .env.local (o revisa .env.development / .env.production).',
  )
}

export const config = {
  // Sin barra final, para poder concatenar rutas como `${apiUrl}/users`
  apiUrl: apiUrl.replace(/\/+$/, ''),
}
