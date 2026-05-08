import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '../../../features/auth/Login'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Login', () => {
  it('renders login form without demo credentials', () => {
    render(<Wrapper><Login /></Wrapper>)

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()

    // Ensure demo credentials are NOT shown
    expect(screen.queryByText(/candidate@test.com/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/recruiter@test.com/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/admin@jobportal.com/i)).not.toBeInTheDocument()
  })

  it('has password input with minLength', () => {
    render(<Wrapper><Login /></Wrapper>)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('minLength', '8')
  })
})
