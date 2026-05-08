import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api from '../../lib/api'
import JobCard from './JobCard'
import { JobFeedSkeleton } from '../../components/LoadingSpinner'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

export default function JobFeed() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const initialLoadRef = useRef(true)

  const debouncedSearch = useDebounce(searchInput, 300)

  const filters = {
    q: debouncedSearch || undefined,
    jobType: searchParams.get('jobType') || undefined,
    level: searchParams.get('level') || undefined,
    remoteOnly: searchParams.get('remoteOnly') === 'true',
    page: parseInt(searchParams.get('page') || '1', 10),
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => api.get('/jobs', { params: filters }).then((res) => res.data),
    keepPreviousData: true,
  })

  const jobs = data?.jobs || []
  const totalPages = data?.totalPages || 1
  const totalJobs = data?.total || 0

  const updateFilter = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value === undefined || value === false || value === '') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'page') newParams.delete('page')
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    updateFilter('q', searchInput)
  }

  const clearFilters = () => {
    setSearchInput('')
    setSearchParams({})
  }

  const activeFilterCount = [
    searchParams.get('jobType'),
    searchParams.get('level'),
    searchParams.get('remoteOnly') === 'true' ? 'remote' : null,
  ].filter(Boolean).length

  useEffect(() => {
    if (!isFetching) {
      initialLoadRef.current = false
    }
  }, [isFetching])

  const isFiltering = isFetching && !isLoading

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Encontre sua vaga ideal</h1>
        <p className="mt-2 text-gray-600">Busque entre milhares de oportunidades e encontre o emprego perfeito para você</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cargo, tecnologia ou empresa..."
            className="input-field w-full pl-10"
          />
        </div>
      </form>

      <div className="mb-6 hidden items-center gap-3 md:flex">
        <select
          value={searchParams.get('jobType') || ''}
          onChange={(e) => updateFilter('jobType', e.target.value || undefined)}
          className="input-field"
        >
          <option value="">Tipo de vaga</option>
          <option value="full-time">Tempo integral</option>
          <option value="part-time">Meio período</option>
          <option value="contract">Contrato</option>
          <option value="freelance">Freelancer</option>
          <option value="internship">Estágio</option>
        </select>

        <select
          value={searchParams.get('level') || ''}
          onChange={(e) => updateFilter('level', e.target.value || undefined)}
          className="input-field"
        >
          <option value="">Nível</option>
          <option value="junior">Júnior</option>
          <option value="mid">Pleno</option>
          <option value="senior">Sênior</option>
          <option value="lead">Lead</option>
        </select>

        <button
          type="button"
          onClick={() => updateFilter('remoteOnly', !filters.remoteOnly)}
          className={`btn-secondary ${filters.remoteOnly ? 'border-primary-500 bg-primary-50 text-primary-700' : ''}`}
        >
          Remoto apenas
        </button>

        {activeFilterCount > 0 && (
          <button type="button" onClick={clearFilters} className="btn-secondary flex items-center gap-1">
            <XMarkIcon className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">{totalJobs} vagas encontradas</p>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="btn-secondary relative flex items-center gap-2 md:hidden"
        >
          <FunnelIcon className="h-5 w-5" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {isLoading ? (
        <JobFeedSkeleton />
      ) : (
        <>
          <div className={`grid-cards transition-opacity duration-200 ${isFiltering ? 'opacity-50' : ''}`}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-medium text-gray-900">Nenhuma vaga encontrada</p>
              <p className="mt-2 text-gray-600">Tente ajustar seus filtros ou termos de busca</p>
              <button type="button" onClick={clearFilters} className="btn-primary mt-4">
                Limpar filtros
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => updateFilter('page', filters.page - 1)}
                disabled={filters.page <= 1}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {filters.page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => updateFilter('page', filters.page + 1)}
                disabled={filters.page >= totalPages}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              <button type="button" onClick={() => setMobileFiltersOpen(false)} className="rounded-full p-2 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tipo de vaga</label>
                <select
                  value={searchParams.get('jobType') || ''}
                  onChange={(e) => updateFilter('jobType', e.target.value || undefined)}
                  className="input-field w-full"
                >
                  <option value="">Todos</option>
                  <option value="full-time">Tempo integral</option>
                  <option value="part-time">Meio período</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelancer</option>
                  <option value="internship">Estágio</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nível</label>
                <select
                  value={searchParams.get('level') || ''}
                  onChange={(e) => updateFilter('level', e.target.value || undefined)}
                  className="input-field w-full"
                >
                  <option value="">Todos</option>
                  <option value="junior">Júnior</option>
                  <option value="mid">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => updateFilter('remoteOnly', !filters.remoteOnly)}
                className={`btn-secondary w-full ${filters.remoteOnly ? 'border-primary-500 bg-primary-50 text-primary-700' : ''}`}
              >
                {filters.remoteOnly ? '✓ Remoto apenas' : 'Remoto apenas'}
              </button>

              {activeFilterCount > 0 && (
                <button type="button" onClick={clearFilters} className="btn-secondary w-full">
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
