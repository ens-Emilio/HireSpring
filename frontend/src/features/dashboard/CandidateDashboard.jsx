import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import {
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { StatusBadge } from '../../components/StatusBadge'
import { DashboardStatsSkeleton, TableSkeleton } from '../../components/LoadingSpinner'
import JobCard from '../jobs/JobCard'
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

export default function CandidateDashboard() {
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] || 'Candidato'

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me').then((r) => r.data),
  })

  const { data: savedJobs, isLoading: savedLoading } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get('/jobs/saved').then((r) => r.data),
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/profile/me').then((r) => r.data),
  })

  const { data: recommendedJobs, isLoading: recommendedLoading } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: () => api.get('/jobs/recommended?size=3').then((r) => r.data),
  })

  const { data: profileViews, isLoading: viewsLoading } = useQuery({
    queryKey: ['profile-views'],
    queryFn: () => api.get('/profile/views/count').then((r) => r.data),
  })

  const stats = useMemo(() => {
    const appList = applications?.content || applications || []
    const savedList = savedJobs?.content || savedJobs || []
    const inProgress = appList.filter(
      (a) => a.status === 'APPLIED' || a.status === 'SCREENING' || a.status === 'INTERVIEW'
    ).length
    return {
      appCount: appList.length,
      inProgress,
      savedCount: savedList.length,
      profileViews: profileViews?.count || profileViews || 0,
    }
  }, [applications, savedJobs, profileViews])

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    const fields = ['name', 'email', 'phone', 'bio', 'resume', 'skills', 'experience', 'education']
    const filled = fields.filter((f) => profile[f] && (Array.isArray(profile[f]) ? profile[f].length > 0 : true)).length
    return Math.round((filled / fields.length) * 100)
  }, [profile])

  const recentApplications = useMemo(() => {
    const appList = applications?.content || applications || []
    return appList.slice(0, 5)
  }, [applications])

  const activityFeed = useMemo(() => {
    const appList = applications?.content || applications || []
    const events = []
    appList.slice(0, 6).forEach((app) => {
      events.push({
        id: `app-${app.id}`,
        type: 'application',
        title: `Candidatura enviada`,
        description: app.jobTitle,
        date: app.appliedAt,
        icon: PaperAirplaneIcon,
      })
      if (app.status === 'INTERVIEW' || app.status === 'OFFER') {
        events.push({
          id: `status-${app.id}`,
          type: 'status',
          title: `Status atualizado`,
          description: `${app.jobTitle} – ${app.status === 'INTERVIEW' ? 'Entrevista' : 'Oferta'}`,
          date: app.updatedAt || app.appliedAt,
          icon: CheckCircleIcon,
        })
      }
    })
    return events.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)
  }, [applications])

  if (appsLoading || savedLoading || profileLoading) {
    return (
      <div>
        <div className="skeleton skeleton-title h-8 w-48 mb-2 rounded"></div>
        <div className="skeleton skeleton-text h-4 w-64 mb-6 rounded"></div>
        <DashboardStatsSkeleton count={4} />
        <div className="mt-8">
          <TableSkeleton rows={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Olá, {firstName}!</h1>
        <p className="text-gray-500 mt-1">Confira suas candidaturas e oportunidades recomendadas</p>
      </div>

      {profileCompletion < 80 && (
        <div className="card border-l-4 border-yellow-400">
          <div className="flex items-start gap-4">
            <UserIcon className="w-6 h-6 text-yellow-500 shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Complete seu perfil</h3>
              <p className="text-sm text-gray-500 mt-1">
                Seu perfil está {profileCompletion}% completo. Perfis completos recebem mais visitas.
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <Link to="/profile/edit" className="btn-primary inline-block mt-3 text-sm">
                Complete seu perfil
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Candidaturas"
          value={stats.appCount}
          delay={0}
          color="text-blue-500"
        />
        <StatCard
          icon={ClockIcon}
          label="Em andamento"
          value={stats.inProgress}
          delay={75}
          color="text-yellow-500"
        />
        <StatCard
          icon={HeartIcon}
          label="Salvas"
          value={stats.savedCount}
          delay={150}
          color="text-red-500"
        />
        <StatCard
          icon={EyeIcon}
          label="Visualizações do perfil"
          value={stats.profileViews}
          delay={225}
          color="text-green-500"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Candidaturas recentes</h2>
        <div className="card table-wrapper">
          {recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-left">Vaga</th>
                    <th className="text-left">Empresa</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <Link to={`/jobs/${app.jobId}`} className="text-primary-600 hover:underline font-medium">
                          {app.jobTitle}
                        </Link>
                      </td>
                      <td className="text-gray-600">{app.companyName || '-'}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="text-gray-500 text-sm">{formatDate(app.appliedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="mb-2">Nenhuma candidatura ainda</p>
              <Link to="/jobs" className="text-primary-600 hover:underline">
                Explorar vagas
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Feed de atividade</h2>
        <div className="card">
          {activityFeed.length > 0 ? (
            <div className="space-y-4">
              {activityFeed.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center">
                    <event.icon className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500 truncate">{event.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <SparklesIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="mb-2">Nenhuma atividade recente</p>
              <Link to="/jobs" className="text-primary-600 hover:underline">
                Explorar vagas
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Vagas recomendadas</h2>
        {recommendedLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(recommendedJobs?.content || recommendedJobs || []).slice(0, 3).map((job, i) => (
              <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 75}ms` }}>
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
        {(!recommendedJobs?.content || recommendedJobs.content.length === 0) && !recommendedLoading && (
          <div className="text-center py-8 text-gray-500 card">
            <BriefcaseIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="mb-2">Nenhuma vaga recomendada no momento</p>
            <Link to="/jobs" className="text-primary-600 hover:underline">
              Explorar vagas
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, delay, color }) {
  return (
    <div className="card stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold mt-1">
            <AnimatedNumber value={value} delay={delay} />
          </p>
        </div>
        <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
