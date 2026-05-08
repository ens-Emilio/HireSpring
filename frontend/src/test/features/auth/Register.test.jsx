import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Register from '../../../features/auth/Register'

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

describe('Register', () => {
  it('renders registration form', () => {
    render(<Wrapper><Register /></Wrapper>)

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument()
  })

  it('shows password strength indicator when typing', () => {
    render(<Wrapper><Register /></Wrapper>)

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } })

    expect(screen.getByText(/very weak|weak|fair|good|strong|very strong/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    render(<Wrapper><Register /></Wrapper>)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })

    const submitBtn = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    render(<Wrapper><Register /></Wrapper>)

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.change(passwordInput, { target: { value: 'short' } })

    const submitBtn = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when passwords do not match', async () => {
    render(<Wrapper><Register /></Wrapper>)

    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'Password123' } })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Different123' } })

    const submitBtn = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('has role selector with CANDIDATE and RECRUITER options', () => {
    render(<Wrapper><Register /></Wrapper>)

    const roleSelect = screen.getByLabelText(/i am a/i)
    expect(roleSelect).toHaveValue('CANDIDATE')

    // Check options exist
    expect(screen.getByRole('option', { name: /job seeker/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /recruiter/i })).toBeInTheDocument()
  })

  it('has link to login page', () => {
    render(<Wrapper><Register /></Wrapper>)

    const loginLink = screen.getByRole('link', { name: /sign in/i })
    expect(loginLink).toHaveAttribute('href', '/login')
  })
})
