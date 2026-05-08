import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import JobCard from './JobCard'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function JobFeed() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    remote: null,
    jobType: null,
    level: null,
    page: 0,
  })

  const debouncedSearch = useDebounce(search, 300)

  const queryKey = useMemo(() => ['jobs', { ...filters, search: debouncedSearch }], [filters, debouncedSearch])

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (filters.remote !== null) params.set('remote', filters.remote)
      if (filters.jobType) params.set('jobType', filters.jobType)
      if (filters.level) params.set('level', filters.level)
      params.set('page', filters.page)
      params.set('size', 20)
      return api.get(`/jobs?${params}`).then((r) => r.data)
    },
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Dream Job</h1>
        <p className="text-gray-600">Browse thousands of job opportunities from top companies</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search jobs by title, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filters.jobType || ''}
          onChange={(e) => setFilters({ ...filters, jobType: e.target.value || null, page: 0 })}
          className="input-field md:w-48"
        >
          <option value="">All Types</option>
          <option value="FULLTIME">Full-time</option>
          <option value="PARTTIME">Part-time</option>
          <option value="CONTRACT">Contract</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="FREELANCE">Freelance</option>
        </select>
        <select
          value={filters.level || ''}
          onChange={(e) => setFilters({ ...filters, level: e.target.value || null, page: 0 })}
          className="input-field md:w-48"
        >
          <option value="">All Levels</option>
          <option value="JUNIOR">Junior</option>
          <option value="MID">Mid</option>
          <option value="SENIOR">Senior</option>
          <option value="LEAD">Lead</option>
          <option value="EXECUTIVE">Executive</option>
        </select>
        <button
          onClick={() => setFilters({ ...filters, remote: !filters.remote, page: 0 })}
          className={`btn-secondary ${filters.remote ? 'bg-primary-50 border-primary-500' : ''}`}
        >
          Remote Only
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {data?.content?.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          {data?.content?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No jobs found matching your criteria
            </div>
          )}
          <div className="flex justify-center mt-6 gap-2">
            <button
              disabled={filters.page === 0}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              className="btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {filters.page + 1} of {data?.totalPages || 1}
            </span>
            <button
              disabled={filters.page >= (data?.totalPages || 1) - 1}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              className="btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
