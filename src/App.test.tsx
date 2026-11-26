import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('muestra el mensaje de construcción', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /frontend en construcción/i }),
    ).toBeInTheDocument()
  })
})
