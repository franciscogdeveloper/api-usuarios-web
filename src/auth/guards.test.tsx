import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi, normalUser, renderApp, sessionHandlers } from '@/test/utils'

describe('guards', () => {
  it('un anónimo que entra a /perfil va a /login', async () => {
    mockApi({})
    renderApp('/perfil')
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
  })

  it('un USER en /admin ve la página 403', async () => {
    mockApi(sessionHandlers(normalUser))
    renderApp('/admin')
    expect(await screen.findByText('403')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /No tienes permiso/ })).toBeInTheDocument()
  })
})
