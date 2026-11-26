# API Usuarios: frontend

SPA en React que consume la API REST de usuarios ([api-usuarios](../api-usuarios), NestJS).

## Demo

- **App:** https://api-usuarios-web.vercel.app
- **API (backend):** https://api-usuarios-q70b.onrender.com/docs · [repositorio](https://github.com/franciscogdeveloper/api-usuarios)

> La API está en el plan gratuito de Render: si lleva un rato sin uso, la primera petición puede tardar 30-60 s (la app muestra un aviso mientras el servidor despierta).

## Funcionalidades

- Registro e inicio de sesión, con las mismas reglas de validación que el backend (zod).
- Sesión persistente: al recargar se restaura con el refresh token.
- Renovación automática del access token ante un 401.
- Perfil: ver datos, editar el nombre y cambiar la contraseña (obliga a volver a iniciar sesión).
- Panel de administración (solo ADMIN): tabla paginada, cambio de rol, desbloqueo de cuentas y borrado con modal de confirmación.
- Rutas protegidas por sesión y por rol (403 y 404 amigables).
- Gestión de límites de intentos (429): cuenta atrás con `Retry-After` y botón deshabilitado.
- Aviso de "cold start" cuando la API gratuita de Render está despertando.
- Modo oscuro automático (`prefers-color-scheme`) y accesibilidad básica (labels, `aria-live`, foco visible).

## Stack

- React 19 + Vite + TypeScript (modo estricto)
- React Router (modo librería, SPA)
- React Hook Form + Zod
- Tailwind CSS v4
- Vitest + Testing Library
- Lint con oxlint (el que trae el template de Vite)

## Requisitos

- Node 24 y npm
- La API corriendo en local en `http://localhost:3000/api` (o usar la desplegada en producción)
- Para que el navegador pueda llamar a la API local, esta debe arrancar con `CORS_ORIGINS=http://localhost:5173`

## Setup

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`. En desarrollo usa `.env.development`, que apunta a la API local en el puerto 3000.

## Scripts

| Script               | Descripción                         |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Servidor de desarrollo              |
| `npm run build`      | Typecheck + build de producción     |
| `npm run preview`    | Sirve el build localmente           |
| `npm run lint`       | Lint con oxlint                     |
| `npm run typecheck`  | Comprobación de tipos               |
| `npm test`           | Tests una sola vez                  |
| `npm run test:watch` | Tests en modo watch                 |

## Variables de entorno

| Variable       | Descripción        | Desarrollo                  | Producción                                   |
| -------------- | ------------------ | --------------------------- | -------------------------------------------- |
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` | `https://api-usuarios-q70b.onrender.com/api` |

Para sobrescribirla en tu máquina, crea `.env.local` (ignorado por git). Ver `.env.example`.

## Estructura

```
src/
  api/         cliente HTTP (client.ts), módulos auth/users, tipos y tokens
  auth/        AuthProvider, useAuth y guards de rutas
  components/  Layout, FormField, toasts, modal de confirmación, banner de cold start
  hooks/       useSubmitError (errores de formulario y cuenta atrás del 429)
  lib/         schemas zod y formateo
  pages/       Login, Registro, Perfil, Admin, 403 y 404
  test/        setup de Vitest y utilidades (mock de fetch)
```

## Decisiones de diseño

### Tokens y sesión

- El **access token vive solo en memoria**: no sobrevive a una recarga y no es accesible desde otras pestañas.
- El **refresh token se guarda en `localStorage`** para mantener la sesión al recargar. Al arrancar, si existe, la app llama a `/auth/refresh` y luego a `/users/me`, mostrando un estado de carga mientras tanto.
- **Tradeoff frente a una cookie httpOnly:** una cookie httpOnly no es legible desde JavaScript, así que un XSS no podría robar el refresh token, y es la opción más segura. Aquí no es viable de forma sencilla porque la API usa tokens Bearer en el body/headers (no emite cookies) y vive en otro dominio (Render frente a Vercel), lo que obligaría a cookies de terceros con `SameSite=None`, bloqueadas por varios navegadores, y a proteger contra CSRF. Con `localStorage` el riesgo es que un XSS pueda leer el token; se mitiga con tokens de corta vida, **rotación del refresh token** (cada uso invalida el anterior) y evitando `dangerouslySetInnerHTML` (React escapa por defecto).

### Refresh con promesa compartida

El cliente (`src/api/client.ts`) añade el Bearer y, ante un 401 en una ruta protegida, hace **un único refresh** y repite la petición. Como el refresh token rota, si varias peticiones reciben 401 a la vez deben compartir la misma promesa de refresh: usarlo dos veces haría fallar la segunda y cerraría la sesión por error. Además, si otra petición ya renovó el token mientras esperábamos, simplemente se reintenta. Si el refresh falla (401/403), se descartan los tokens, se hace logout local y los guards redirigen a `/login`. Si falla por red o por un 5xx, el refresh token se conserva para reintentar al recargar.

### Cold start de Render

El plan gratuito de Render duerme la API tras un rato sin tráfico y despertarla puede tardar cerca de un minuto. Cada petición se vigila: si pasa de **3 s** sin respuesta se muestra un banner global ("Despertando el servidor…") que desaparece al responder. Las peticiones tienen un `AbortController` con **timeout de 90 s**.

### Otras decisiones

- **Errores de la API:** `ApiError` normaliza el mensaje de Nest (si es un array, se une en un string) y expone `status` y `retryAfter`.
- **429:** el formulario muestra "Demasiados intentos. Intenta de nuevo en X min/s", con cuenta atrás, y deshabilita el botón mientras dure.
- **Guards como rutas de layout** (`RequireAuth`, `RequireRole`, `PublicOnly`): la protección vive en un solo sitio.
- **Sin librerías de componentes:** toasts y modal de confirmación hechos a mano (el modal sustituye a `window.confirm`).
- **Acciones del admin sobre sí mismo deshabilitadas** (el backend también las rechaza).

## Despliegue

Vercel, con `vercel.json` que redirige todas las rutas a `index.html` (SPA).
