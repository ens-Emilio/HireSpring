import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  ShareIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../contexts/ToastContext'
import { formatSalary, formatDate } from '../../utils/format'
import { JobBadges } from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import JobCard from './JobCard'

function useShareJob(jobId) {
  const toast = useToast()
  return () => {
    const url = `${window.location.origin}/jobs/${jobId}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado!', 'O link da vaga foi copiado para a área de transferência')
    }).catch(() => {
      toast.error('Erro', 'Não foi possível copiar o link')
    })
  }
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const { isAuthenticated, user } = useAuthStore()
  const [saved, setSaved] = useState(false)

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then((r) => r.data),
    enabled: !!id,
  })

  const { data: applicationStatus } = useQuery({
    queryKey: ['application-status', id],
    queryFn: () => api.get(`/applications/jobs/${id}/status`).then((r) => r.data),
    enabled: isAuthenticated && user?.role === 'CANDIDATE',
  })

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/applications/jobs/${id}/apply`),
    onSuccess: () => {
      queryClient.invalidateQueries(['application-status', id])
      toast.success('Candidatura enviada!', 'Boa sorte! Você será notificado sobre o andamento.')
    },
    onError: () => {
      toast.error('Erro', 'Não foi possível enviar a candidatura. Tente novamente.')
    },
  })

  const saveMutation = useMutation({
    mutationFn: () => saved ? api.delete(`/jobs/${id}/save`) : api.post(`/jobs/${id}/save`),
    onMutate: () => {
      setSaved((prev) => !prev)
    },
    onError: () => {
      setSaved((prev) => !prev)
      toast.error('Erro', 'Não foi possível salvar a vaga.')
    },
    onSuccess: (_, __, variables) => {
      if (!saved) {
        toast.success('Vaga salva', 'Você poderá encontrá-la nos seus salvos')
      }
    },
  })

  const handleShare = useShareJob(id)

  const isCandidate = isAuthenticated && user?.role === 'CANDIDATE'
  const hasApplied = applicationStatus?.applied || false

  const handleApply = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    if (!isCandidate) {
      toast.info('Apenas candidatos', 'Faça login como candidato para se candidatar')
      return
    }
    applyMutation.mutate()
  }

  const handleSave = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    saveMutation.mutate()
  }

  const { data: relatedJobs } = useQuery({
    queryKey: ['related-jobs', id],
    queryFn: () => api.get(`/jobs/${id}/related`).then((r) => r.data),
    enabled: !!job,
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="card animate-pulse">
              <div className="h-8 w-3/4 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-6" />
              <div className="h-40 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="card animate-pulse">
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900">Vaga não encontrada</h2>
        <p className="mt-2 text-gray-600">A vaga que você procura não existe ou foi removida.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          ← Voltar às vagas
        </Link>
      </div>
    )
  }

  const dateDisplay = job.createdAt ? formatDate(job.createdAt) : 'Data não informada'
  const applicationsCount = job.applicationCount || 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="text-primary-600 hover:text-primary-700 hover:underline mb-6 inline-flex items-center gap-1 text-sm font-medium">
        <ArrowLeftIcon className="h-4 w-4" />
        Voltar às vagas
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{job.title}</h1>
                  <div className="mt-2 flex items-center gap-2 text-gray-600">
                    <BuildingOfficeIcon className="h-5 w-5 shrink-0" />
                    <span className="text-lg font-medium">{job.company?.name || job.companyName}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={handleShare}
                    className="btn-secondary inline-flex items-center gap-2"
                    aria-label="Compartilhar vaga"
                  >
                    <ShareIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">Compartilhar</span>
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn-secondary inline-flex items-center gap-2"
                    aria-label={saved ? 'Remover dos salvos' : 'Salvar vaga'}
                  >
                    {saved ? (
                      <HeartSolidIcon className="h-5 w-5 text-red-500" />
                    ) : (
                      <HeartIcon className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline">{saved ? 'Salva' : 'Salvar'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <JobBadges job={job} />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Localização</div>
                    <div className="text-sm font-medium">{job.location || 'Remoto'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Salário</div>
                    <div className="text-sm font-medium">
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Publicada em</div>
                    <div className="text-sm font-medium">{dateDisplay}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Candidaturas</div>
                    <div className="text-sm font-medium">{applicationsCount}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre a vaga</h2>
              <p className="whitespace-pre-line text-gray-700">{job.description}</p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {job.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {job.company && (
              <div className="mb-6 rounded-lg bg-gray-50 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Sobre a empresa</h2>
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-2xl font-bold text-gray-500">
                    {job.company.logo ? (
                      <img src={job.company.logo} alt={job.company.name} className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      (job.company.name || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.company.name}</h3>
                    {job.company.description && (
                      <p className="mt-2 text-gray-600 whitespace-pre-line">{job.company.description}</p>
                    )}
                    {job.company.website && (
                      <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary-600 hover:underline">
                        Visitar site
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="rounded-lg bg-primary-50 p-6 text-center">
                <p className="text-lg font-medium text-primary-800 mb-3">Interessado nesta vaga?</p>
                <p className="text-primary-700 mb-4">Faça login para se candidatar</p>
                <Link to="/login" state={{ from: `/jobs/${id}` }} className="btn-primary">
                  Fazer login
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="card">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <CurrencyDollarIcon className="h-5 w-5" />
                  <span className="text-sm">Salário</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </p>
              </div>

              <div className="mb-4">
                <JobBadges job={job} />
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{job.location || 'Remoto'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  <span>Publicada em {dateDisplay}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>{applicationsCount} candidaturas</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {isCandidate ? (
                  hasApplied ? (
                    <button
                      disabled
                      className="btn-primary w-full inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-600 cursor-default"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Candidatura enviada
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applyMutation.isPending}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2"
                    >
                      {applyMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Enviando...
                        </>
                      ) : (
                        'Candidatar-se agora'
                      )}
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleApply}
                    className="btn-primary w-full"
                  >
                    Candidatar-se agora
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="btn-secondary w-full inline-flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                  ) : (
                    <HeartIcon className="h-5 w-5" />
                  )}
                  {saved ? 'Vaga salva' : 'Salvar vaga'}
                </button>

                <button
                  onClick={handleShare}
                  className="btn-secondary w-full inline-flex items-center justify-center gap-2"
                >
                  <ShareIcon className="h-5 w-5" />
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedJobs && relatedJobs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vagas relacionadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedJobs.slice(0, 3).map((relatedJob) => (
              <JobCard key={relatedJob.id} job={relatedJob} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
