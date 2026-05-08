import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import JobCard from '../../../features/jobs/JobCard'

describe('JobCard', () => {
  const mockJob = {
    id: 'job-1',
    title: 'Senior Software Engineer',
    description: 'Build scalable systems',
    location: 'San Francisco, CA',
    company: { name: 'Tech Giants Inc' },
    companyName: 'Tech Giants Inc',
    jobType: 'FULLTIME',
    level: 'SENIOR',
    salaryMin: 150000,
    salaryMax: 220000,
    currency: 'USD',
    remote: true,
    hybrid: false,
    applicationCount: 42,
    createdAt: '2024-01-15T10:00:00Z',
  }

  it('renders job title and company', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    )

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Tech Giants Inc')).toBeInTheDocument()
  })

  it('renders location and salary', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    )

    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
    expect(screen.getByText(/USD/)).toBeInTheDocument()
  })

  it('renders application count', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    )

    expect(screen.getByText(/42 applications/i)).toBeInTheDocument()
  })

  it('renders posted date', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    )

    // toLocaleDateString returns locale-dependent format like "1/15/2024" or "15/01/2024"
    const dateElement = screen.getByText(/\d{1,2}[\/\.]\d{1,2}[\/\.]\d{2,4}/)
    expect(dateElement).toBeInTheDocument()
  })

  it('links to job detail page', () => {
    render(
      <MemoryRouter>
        <JobCard job={mockJob} />
      </MemoryRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/jobs/job-1')
  })
})
