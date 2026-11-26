import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { json, mockApi, renderApp } from '@/test/utils'

async function fillLogin(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Email'), 'ana@example.com')
  await user.type(screen.getByLabelText('Contraseña'), 'Password1')
  await user.click(screen.getByRole('button', { name: 'Entrar' }))
}

describe('Login', () => {
  it('muestra el error del servidor ante un 401', async () => {
    mockApi({
      'POST /auth/login': () => json(401, { statusCode: 401, message: 'Credenciales inválidas' }),
    })
    const user = userEvent.setup()
    renderApp('/login')
    await fillLogin(user)
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas')
  })

  it('con un 429 muestra la espera y deshabilita el botón', async () => {
    mockApi({
      'POST /auth/login': () =>
        json(429, { statusCode: 429, message: 'Too Many Requests' }, { 'Retry-After': '120' }),
    })
    const user = userEvent.setup()
    renderApp('/login')
    await fillLogin(user)
    expect(await screen.findByText(/Demasiados intentos. Intenta de nuevo en 2 min/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })
})

describe('Registro', () => {
  it('valida el password en el cliente sin llamar a la API', async () => {
    const fetchMock = mockApi({})
    const user = userEvent.setup()
    renderApp('/registro')
    await user.type(screen.getByLabelText('Nombre'), 'Ana')
    await user.type(screen.getByLabelText('Email'), 'ana@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'abcdefgh')
    await user.click(screen.getByRole('button', { name: 'Registrarme' }))

    expect(await screen.findByText(/al menos una mayúscula/)).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled())
  })
})
