import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { formatSalary, formatDate } from '../../utils/format'
import { JobBadges } from '../../components/StatusBadge'
import api from '../../lib/api'
import { useToast } from '../../contexts/ToastContext'

export default function JobCard({ job }) {
  const [saved, setSaved] = useState(job.saved || false)
  const toast = useToast()

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const previous = saved
    setSaved(!previous)

    try {
      if (!previous) {
        await api.post(`/jobs/${job.id}/save`)
        toast.success('Vaga salva', 'Você poderá encontrá-la nos seus salvos')
      } else {
        await api.delete(`/jobs/${job.id}/save`)
        toast.info('Vaga removida', 'A vaga foi removida dos seus salvos')
      }
    } catch {
      setSaved(previous)
      toast.error('Erro', 'Não foi possível salvar a vaga. Tente novamente.')
    }
  }

  const formatSalaryDisplay = () => {
    if (!job.salaryMin && !job.salaryMax) return 'A combinar'
    const min = job.salaryMin ? `${Math.floor(job.salaryMin / 1000)}k` : ''
    const max = job.salaryMax ? `${Math.floor(job.salaryMax / 1000)}k` : ''
    if (min && max) return `R$ ${min} – ${max}`
    if (min) return `R$ a partir de ${min}`
    return `R$ até ${max}`
  }

  const dateDisplay = job.createdAt ? `há ${formatDate(job.createdAt)}` : ''

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="card-interactive block relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-lg"
      aria-label={`Vaga: ${job.title} na ${job.company?.name}`}
    >
      {job.featured && (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
      )}

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-500">
          {job.company?.logo ? (
            <img src={job.company.logo} alt={job.company.name} className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            (job.company?.name || '?').charAt(0).toUpperCase()
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-gray-900">{job.title}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                <BuildingOfficeIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.company?.name}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
              aria-pressed={saved}
              aria-label={saved ? 'Remover dos salvos' : 'Salvar vaga'}
            >
              {saved ? (
                <HeartSolidIcon className="h-5 w-5 text-red-500" />
              ) : (
                <HeartOutlineIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4 shrink-0" />
              {job.location || 'Remoto'}
            </span>
            <span className="flex items-center gap-1">
              <CurrencyDollarIcon className="h-4 w-4 shrink-0" />
              {formatSalaryDisplay()}
            </span>
          </div>

          <div className="mt-3">
            <JobBadges job={job} />
          </div>
        </div>
      </div>

      {dateDisplay && (
        <div className="mt-3 border-t border-gray-100 pt-3 text-right text-xs text-gray-400">
          {dateDisplay}
        </div>
      )}
    </Link>
  )
}
