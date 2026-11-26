# API Usuarios: frontend

SPA en React que consume la API REST de usuarios ([api-usuarios](../api-usuarios), NestJS).

## Demo

_Pendiente: enlace al despliegue en Vercel._

## Funcionalidades

_Pendiente: se irán listando conforme se implementen._

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

| Variable       | Descripción              | Desarrollo                  | Producción                                   |
| -------------- | ------------------------ | --------------------------- | -------------------------------------------- |
| `VITE_API_URL` | URL base de la API       | `http://localhost:3000/api` | `https://api-usuarios-q70b.onrender.com/api` |

Para sobrescribirla en tu máquina, crea `.env.local` (ignorado por git). Ver `.env.example`.

## Despliegue

Vercel, con `vercel.json` que redirige todas las rutas a `index.html` (SPA).
