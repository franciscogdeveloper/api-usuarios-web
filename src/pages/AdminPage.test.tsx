import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { adminUser, json, mockApi, normalUser, renderApp, sessionHandlers } from '@/test/utils'

function adminHandlers() {
  return {
    ...sessionHandlers(adminUser),
    'GET /users': () => json(200, { data: [adminUser, normalUser], total: 2, page: 1, limit: 10 }),
    'DELETE /users/u2': () => json(204),
  }
}

describe('Admin', () => {
  it('renderiza la tabla de usuarios', async () => {
    mockApi(adminHandlers())
    renderApp('/admin')
    const table = await screen.findByRole('table')
    expect(within(table).getByText('ana@example.com')).toBeInTheDocument()
    expect(within(table).getByText('admin@example.com')).toBeInTheDocument()
  })

  it('no permite borrarse a sí mismo', async () => {
    mockApi(adminHandlers())
    renderApp('/admin')
    expect(await screen.findByRole('button', { name: 'Eliminar admin@example.com' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Eliminar ana@example.com' })).toBeEnabled()
  })

  it('pide confirmación en un modal antes de borrar', async () => {
    const fetchMock = mockApi(adminHandlers())
    const user = userEvent.setup()
    renderApp('/admin')
    await user.click(await screen.findByRole('button', { name: 'Eliminar ana@example.com' }))

    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(await screen.findByText('Usuario ana@example.com eliminado')).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true)
  })
})
