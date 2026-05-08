import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
