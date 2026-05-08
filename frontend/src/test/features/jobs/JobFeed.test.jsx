import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import JobFeed from '../../../features/jobs/JobFeed'

// Mock api
vi.mock('../../../lib/api', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('/jobs')) {
        return Promise.resolve({
          data: {
            content: [
              {
                id: 'job-1',
                title: 'Software Engineer',
                description: 'Build great software',
                location: 'Remote',
                companyName: 'Tech Corp',
                company: { name: 'Tech Corp' },
                jobType: 'FULLTIME',
                level: 'MID',
                salaryMin: 80000,
                salaryMax: 120000,
                currency: 'USD',
                remote: true,
                hybrid: false,
                applicationCount: 5,
                createdAt: '2024-01-15T10:00:00Z',
              },
              {
                id: 'job-2',
                title: 'Product Manager',
                description: 'Lead product development',
                location: 'New York',
                companyName: 'Product Inc',
                company: { name: 'Product Inc' },
                jobType: 'FULLTIME',
                level: 'SENIOR',
                salaryMin: 120000,
                salaryMax: 180000,
                currency: 'USD',
                remote: false,
                hybrid: true,
                applicationCount: 12,
                createdAt: '2024-01-10T10:00:00Z',
              },
            ],
            totalPages: 1,
            totalElements: 2,
          },
        })
      }
      return Promise.resolve({ data: {} })
    }),
  },
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}

function Wrapper({ children }) {
  return (
    <MemoryRouter>
      <QueryClientProvider client={createQueryClient()}>
        {children}
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('JobFeed', () => {
  it('renders job feed with heading', () => {
    render(<Wrapper><JobFeed /></Wrapper>)

    expect(screen.getByRole('heading', { name: /find your dream job/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/search jobs/i)).toBeInTheDocument()
  })

  it('renders filter controls', () => {
    render(<Wrapper><JobFeed /></Wrapper>)

    expect(screen.getByRole('button', { name: /remote only/i })).toBeInTheDocument()
    expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2)
  })

  it('renders job cards after loading', async () => {
    render(<Wrapper><JobFeed /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })

    expect(screen.getByText('Product Manager')).toBeInTheDocument()
  })

  it('renders pagination controls', async () => {
    render(<Wrapper><JobFeed /></Wrapper>)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument()
  })
})
