import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import {
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PlusIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { StatusBadge } from '../../components/StatusBadge'
import { DashboardStatsSkeleton, TableSkeleton } from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/format'

function AnimatedNumber({ value, delay = 0 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasAnimated.current) return
      hasAnimated.current = true
      const duration = 600
      const steps = 30
      const increment = value / steps
      let current = 0
      let step = 0
      const interval = setInterval(() => {
        step++
        current = Math.min(Math.round(increment * step), value)
        setCount(current)
        if (step >= steps) {
          setCount(value)
          clearInterval(interval)
        }
      }, duration / steps)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return <span ref={ref}>{count}</span>
}

const stages = [
  { key: 'APPLIED', label: 'Inscrito', color: 'bg-blue-100 text-blue-700' },
  { key: 'SCREENING', label: 'Em triagem', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'INTERVIEW', label: 'Entrevista', color: 'bg-purple-100 text-purple-700' },
  { key: 'OFFER', label: 'Oferta', color: 'bg-green-100 text-green-700' },
  { key: 'HIRED', label: 'Contratado', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'REJECTED', label: 'Não selecionado', color: 'bg-red-100 text-red-700' },
]

export default function RecruiterDashboard() {
  const { data: jobs, isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get('/jobs?page=0&size=50').then((r) => r.data),
  })

  const { data: applications, isLoading: appsLoading, error: appsError, refetch: refetchApps } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications?page=0&size=100').then((r) => r.data),
  })

  const isLoading = jobsLoading || appsLoading
  const error = jobsError || appsError
  const refetch = () => {
    refetchJobs()
    refetchApps()
  }

  const stats = useMemo(() => {
    const jobList = jobs?.content || jobs || []
    const appList = applications?.content || applications || []
    const activeJobs = jobList.filter((j) => j.status === 'ACTIVE' || j.status === 'OPEN')
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const interviewsThisWeek = appList.filter((a) => {
      if (a.status !== 'INTERVIEW') return false
      const d = new Date(a.updatedAt || a.appliedAt)
      return d >= weekStart
    }).length
    const hired = appList.filter((a) => a.status === 'HIRED').length
    const total = appList.length
    const hireRate = total > 0 ? Math.round((hired / total) * 100) : 0
    return {
      activeCount: activeJobs.length,
      totalCandidates: appList.length,
      interviewsThisWeek,
      hireRate,
    }
  }, [jobs, applications])

  const topJobs = useMemo(() => {
    const jobList = jobs?.content || jobs || []
    return jobList
      .filter((j) => j.applicationCount > 0)
      .sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0))
      .slice(0, 5)
  }, [jobs])

  const maxApplications = useMemo(() => {
    if (topJobs.length === 0) return 1
    return Math.max(...topJobs.map((j) => j.applicationCount || 0))
  }, [topJobs])

  const stageCounts = useMemo(() => {
    const appList = applications?.content || applications || []
    const counts = {}
    stages.forEach((s) => {
      counts[s.key] = appList.filter((a) => a.status === s.key).length
    })
    return counts
  }, [applications])

  const recentApplications = useMemo(() => {
    const appList = applications?.content || applications || []
    return appList
      .sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0))
      .slice(0, 10)
  }, [applications])

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="skeleton skeleton-title h-8 w-48 mb-2 rounded"></div>
          <div className="skeleton skeleton-text h-4 w-32 rounded"></div>
        </div>
        <DashboardStatsSkeleton count={4} />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="skeleton skeleton-title h-6 w-48 mb-4 rounded"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton skeleton-text h-4 w-full rounded"></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="skeleton skeleton-title h-6 w-48 mb-4 rounded"></div>
            <div className="flex gap-3 flex-wrap">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton skeleton-badge h-10 w-24 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>
        <TableSkeleton rows={5} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Erro ao carregar dados do painel</p>
        <button onClick={refetch} className="btn-primary">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Painel do Recrutador</h1>
          <p className="text-gray-500 mt-1">Gerencie suas vagas e candidaturas</p>
        </div>
        <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nova Vaga
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vagas ativas</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedNumber value={stats.activeCount} delay={0} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <BriefcaseIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de candidatos</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedNumber value={stats.totalCandidates} delay={75} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Entrevistas esta semana</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedNumber value={stats.interviewsThisWeek} delay={150} />
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taxa de contratação</p>
              <p className="text-2xl font-bold mt-1">
                <AnimatedNumber value={stats.hireRate} delay={225} />%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <ChartBarIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Vagas com mais candidatos</h2>
          {topJobs.length > 0 ? (
            <div className="space-y-4">
              {topJobs.map((job, i) => (
                <div key={job.id}>
                  <div className="flex justify-between items-center mb-1">
                    <Link to={`/jobs/${job.id}`} className="font-medium text-sm text-primary-600 hover:underline truncate">
                      {job.title}
                    </Link>
                    <span className="text-sm text-gray-500 ml-2 shrink-0">{job.applicationCount} candidatos</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.round(((job.applicationCount || 0) / maxApplications) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Nenhuma vaga com candidatos ainda</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Candidatos por etapa</h2>
          <div className="flex gap-3 flex-wrap">
            {stages.map((stage) => (
              <div key={stage.key} className={`px-4 py-3 rounded-lg ${stage.color} min-w-[100px] text-center`}>
                <p className="text-xs font-medium opacity-75">{stage.label}</p>
                <p className="text-xl font-bold">{stageCounts[stage.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card table-wrapper">
        <h2 className="text-lg font-semibold mb-4">Últimas candidaturas</h2>
        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="text-left">Candidato</th>
                  <th className="text-left">Vaga</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td className="font-medium">
                      <Link to={`/candidates/${app.candidateId || app.id}`} className="text-primary-600 hover:underline">
                        {app.candidateName || app.userName || 'N/A'}
                      </Link>
                    </td>
                    <td>
                      <Link to={`/jobs/${app.jobId}`} className="text-primary-600 hover:underline">
                        {app.jobTitle}
                      </Link>
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td className="text-gray-500 text-sm">{formatDate(app.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <UserGroupIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Nenhuma candidatura recebida ainda</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <Link to="/jobs/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nova vaga
        </Link>
        <Link to="/applications" className="btn-secondary flex items-center gap-2">
          <UsersIcon className="w-5 h-5" />
          Ver todos candidatos
        </Link>
      </div>
    </div>
  )
}
