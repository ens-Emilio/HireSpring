import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import KanbanBoard from './KanbanBoard'
import { StatusBadge } from '../../components/StatusBadge'
import LoadingSpinner, { TableSkeleton } from '../../components/LoadingSpinner'
import {
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const FUNNEL_STAGES = [
  { label: 'Applied', stage: 0 },
  { label: 'Screening', stage: 1 },
  { label: 'Interview', stage: 2 },
  { label: 'Offer', stage: 3 },
  { label: 'Hired', stage: 4 },
]

function getInitial(name) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function timeAgo(date) {
  const now = new Date()
  const applied = new Date(date)
  const diffMs = now - applied
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return `${diffWeeks}w ago`
}

const statusFromStage = {
  0: 'APPLIED',
  1: 'SCREENING',
  2: 'INTERVIEW',
  3: 'OFFER',
  4: 'HIRED',
}

export default function JobApplications() {
  const { jobId } = useParams()
  const [view, setView] = useState('kanban')
  const [sortField, setSortField] = useState('appliedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [actionOpen, setActionOpen] = useState(null)

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.get(`/jobs/${jobId}`).then((r) => r.data),
  })

  const { data: applications, isLoading: appsLoading, error, refetch } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => api.get(`/applications/job/${jobId}`).then((r) => r.data),
  })

  const appList = applications?.content || applications || []

  const funnel = useMemo(() => {
    const total = appList.length
    return FUNNEL_STAGES.map((s) => ({
      label: s.label,
      count: appList.filter((a) => a.pipelineStage === s.stage).length,
      pct: total > 0 ? Math.round((appList.filter((a) => a.pipelineStage === s.stage).length / total) * 100) : 0,
    }))
  }, [appList])

  const totalApps = appList.length

  const sortedApps = useMemo(() => {
    const copy = [...appList]
    copy.sort((a, b) => {
      let valA, valB
      if (sortField === 'name') {
        valA = (a.candidateName || a.candidateEmail || '').toLowerCase()
        valB = (b.candidateName || b.candidateEmail || '').toLowerCase()
      } else if (sortField === 'compatibility') {
        valA = a.matchScore || 0
        valB = b.matchScore || 0
      } else if (sortField === 'status') {
        valA = a.pipelineStage || 0
        valB = b.pipelineStage || 0
      } else {
        valA = new Date(a.appliedAt || a.createdAt || 0).getTime()
        valB = new Date(b.appliedAt || b.createdAt || 0).getTime()
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [appList, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowsUpDownIcon className="w-4 h-4 opacity-40" />
    return sortDir === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
  }

  const handleExportCSV = () => {
    const headers = ['Candidate', 'Email', 'Title', 'Skills', 'Match Score', 'Stage', 'Applied At']
    const rows = appList.map((a) => [
      a.candidateName || a.candidateEmail || '',
      a.candidateEmail || '',
      a.jobTitle || '',
      (a.skills || []).join('; '),
      a.matchScore || 0,
      statusFromStage[a.pipelineStage] || '',
      a.appliedAt || a.createdAt || '',
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `applications-${jobId}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const loading = jobLoading || appsLoading

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          {jobLoading ? (
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
          ) : (
            <>
              <h1 className="text-2xl font-bold">{job?.title}</h1>
              <p className="text-gray-600 mt-1">{totalApps} applications {job?.viewCount != null ? `• ${job.viewCount} views` : ''}</p>
            </>
          )}
        </div>
        <button type="button" onClick={handleExportCSV} className="btn-secondary flex items-center gap-2" disabled={loading}>
          <DocumentArrowDownIcon className="w-4 h-4" />
          Exportar CSV
        </button>
      </div>

      <div className="mb-6 card">
        <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
        {appsLoading ? (
          <div className="flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
            {funnel.map((stage) => (
              <div key={stage.label} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-sm text-gray-500">{stage.label}</div>
                <div className="text-xs text-gray-400 mt-1">{stage.pct}%</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <div className="card text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load applications</p>
          <button onClick={() => refetch()} className="btn-primary">Retry</button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'kanban' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('lista')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'lista' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Lista
            </button>
          </div>

          {view === 'kanban' ? (
            <KanbanBoard jobId={jobId} />
          ) : appsLoading ? (
            <div className="card table-wrapper">
              <TableSkeleton rows={5} />
            </div>
          ) : sortedApps.length === 0 ? (
            <div className="card text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No applications yet</p>
            </div>
          ) : (
            <div className="card table-wrapper">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-left cursor-pointer select-none" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1">
                          Candidato <SortIcon field="name" />
                        </span>
                      </th>
                      <th className="text-left cursor-pointer select-none" onClick={() => handleSort('compatibility')}>
                        <span className="flex items-center gap-1">
                          Compatibilidade <SortIcon field="compatibility" />
                        </span>
                      </th>
                      <th className="text-left cursor-pointer select-none" onClick={() => handleSort('status')}>
                        <span className="flex items-center gap-1">
                          Status <SortIcon field="status" />
                        </span>
                      </th>
                      <th className="text-left">Skills</th>
                      <th className="text-left cursor-pointer select-none" onClick={() => handleSort('appliedAt')}>
                        <span className="flex items-center gap-1">
                          Candidatura <SortIcon field="appliedAt" />
                        </span>
                      </th>
                      <th className="text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedApps.map((app) => (
                      <tr key={app.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar avatar-sm flex-shrink-0 bg-primary-100 text-primary-700 font-semibold">
                              {getInitial(app.candidateName || app.candidateEmail)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{app.candidateName || app.candidateEmail || 'Candidate'}</p>
                              <p className="text-xs text-gray-500">{app.jobTitle || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {app.matchScore != null ? (
                            <div className="flex items-center gap-2 min-w-[100px]">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${app.matchScore >= 80 ? 'bg-green-500' : app.matchScore >= 60 ? 'bg-amber-500' : app.matchScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}
                                  style={{ width: `${app.matchScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium w-8">{app.matchScore}%</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={statusFromStage[app.pipelineStage] || 'APPLIED'} />
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {(app.skills || []).slice(0, 3).map((s, i) => (
                              <span key={i} className="badge badge-neutral text-xs">{s}</span>
                            ))}
                            {(app.skills || []).length > 3 && (
                              <span className="badge badge-neutral text-xs">+{(app.skills || []).length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5" />
                            {timeAgo(app.appliedAt || app.createdAt)}
                          </span>
                        </td>
                        <td className="relative">
                          <button
                            type="button"
                            onClick={() => setActionOpen(actionOpen === app.id ? null : app.id)}
                            className="p-1 rounded hover:bg-gray-100"
                            aria-label="Actions"
                          >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                          </button>
                          {actionOpen === app.id && (
                            <div className="absolute right-0 top-8 z-10 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => setActionOpen(null)}
                              >
                                <UserIcon className="w-4 h-4" />
                                Ver perfil
                              </button>
                              <button
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                onClick={() => setActionOpen(null)}
                              >
                                <ArrowPathIcon className="w-4 h-4" />
                                Mover status
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
