import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../contexts/ToastContext'
import api from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import {
  UserIcon,
  MagnifyingGlassIcon,
  InboxIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const STAGES = [
  { id: 0, name: 'Applied', description: 'New applications', color: '--kanban-applied', bg: 'bg-blue-50/80 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300' },
  { id: 1, name: 'Screening', description: 'Under review', color: '--kanban-screening', bg: 'bg-amber-50/80 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', textColor: 'text-amber-700 dark:text-amber-300' },
  { id: 2, name: 'Interview', description: 'Scheduled', color: '--kanban-interview', bg: 'bg-purple-50/80 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500', textColor: 'text-purple-700 dark:text-purple-300' },
  { id: 3, name: 'Offer', description: 'Sent to candidate', color: '--kanban-offer', bg: 'bg-green-50/80 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300' },
  { id: 4, name: 'Hired', description: 'Accepted', color: '--kanban-hired', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500', textColor: 'text-emerald-700 dark:text-emerald-300' },
]

const EMPTY_ICONS = {
  0: InboxIcon,
  1: MagnifyingGlassIcon,
  2: ClockIcon,
  3: ArrowPathIcon,
  4: CheckCircleIcon,
}

function getMatchScoreColor(score) {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-amber-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

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

export default function KanbanBoard({ jobId }) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [draggedApp, setDraggedApp] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => api.get(`/applications/job/${jobId}`).then((r) => r.data),
  })

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, notes }) => api.put(`/applications/${id}/stage`, { stage, notes }),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['job-applications', jobId] })
      const previous = queryClient.getQueryData(['job-applications', jobId])
      queryClient.setQueryData(['job-applications', jobId], (old) => {
        const list = old?.content || old || []
        return list.map((app) => app.id === id ? { ...app, pipelineStage: stage } : app)
      })
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['job-applications', jobId], context.previous)
      }
      toast.error('Update failed', 'Could not update application stage')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
    },
    onSuccess: () => {
      toast.success('Stage updated', 'Application moved successfully')
    },
  })

  const handleDragStart = (e, app) => {
    setDraggedApp(app)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', app.id)
  }

  const handleDragEnd = () => {
    setDraggedApp(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(stageId)
  }

  const handleDragLeave = (e, stageId) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn((prev) => (prev === stageId ? null : prev))
    }
  }

  const handleDrop = (e, stageId) => {
    e.preventDefault()
    setDragOverColumn(null)
    if (draggedApp && draggedApp.pipelineStage !== stageId) {
      const previousStage = draggedApp.pipelineStage
      updateStageMutation.mutate({ id: draggedApp.id, stage: stageId, notes: draggedApp.notes }, {
        onError: () => {
          toast.error('Rollback', 'Failed to move application. Reverted to previous stage.')
        },
      })
    }
    setDraggedApp(null)
  }

  const handleKeyDown = (e, app, currentStageId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      const nextStage = currentStageId + 1
      if (nextStage <= 4 && app.pipelineStage !== nextStage) {
        updateStageMutation.mutate({ id: app.id, stage: nextStage, notes: app.notes })
      }
    }
  }

  const filteredApplications = useMemo(() => {
    const appList = applications?.content || applications || []
    if (!searchQuery.trim()) return appList
    const query = searchQuery.toLowerCase()
    return appList.filter((app) => {
      const name = (app.candidateName || app.candidateEmail || '').toLowerCase()
      const title = (app.jobTitle || '').toLowerCase()
      const skills = (app.skills || []).join(' ').toLowerCase()
      return name.includes(query) || title.includes(query) || skills.includes(query)
    })
  }, [applications, searchQuery])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="search-input-wrapper max-w-md">
        <MagnifyingGlassIcon className="search-input-icon w-5 h-5" />
        <input
          type="text"
          className="search-input"
          placeholder="Search candidates, jobs, or skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search applications"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" role="list" aria-label="Application pipeline">
        {STAGES.map((stage) => {
          const stageApps = filteredApplications.filter((a) => a.pipelineStage === stage.id)
          const isDragOver = dragOverColumn === stage.id
          const EmptyIcon = EMPTY_ICONS[stage.id]

          return (
            <div
              key={stage.id}
              className={`kanban-column flex-1 min-w-[280px] max-w-[320px] ${stage.bg} border-2 ${stage.border} rounded-xl transition-all duration-200 ${isDragOver ? 'scale-[1.02] border-primary-400 dark:border-primary-500 shadow-lg' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={(e) => handleDragLeave(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
              role="listitem"
              aria-label={`${stage.name}: ${stageApps.length} applications`}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <div>
                    <h3 className={`font-semibold text-sm ${stage.textColor}`}>{stage.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stage.description}</p>
                  </div>
                </div>
                <span className={`badge ${stage.bg} ${stage.textColor} border ${stage.border}`}>
                  {stageApps.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 min-h-[200px]">
                {stageApps.map((app) => {
                  const isDragging = draggedApp?.id === app.id
                  const skills = app.skills || []
                  const displayedSkills = skills.slice(0, 3)
                  const remainingSkills = skills.length - 3
                  const matchScore = app.matchScore || 0

                  return (
                    <div
                      key={app.id}
                      draggable
                      tabIndex={0}
                      role="button"
                      aria-label={`${app.candidateName || 'Candidate'} - ${app.jobTitle || 'Job'}. Press Enter to move to next stage.`}
                      onDragStart={(e) => handleDragStart(e, app)}
                      onDragEnd={handleDragEnd}
                      onKeyDown={(e) => handleKeyDown(e, app, stage.id)}
                      className={`kanban-card ${isDragging ? 'opacity-50 scale-95 rotate-1' : 'hover:shadow-md hover:-translate-y-0.5'} transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="avatar avatar-md flex-shrink-0 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-semibold">
                          {getInitial(app.candidateName || app.candidateEmail)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {app.candidateName || app.candidateEmail || 'Candidate'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {app.jobTitle || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {matchScore > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Match</span>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{matchScore}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${getMatchScoreColor(matchScore)}`}
                              style={{ width: `${matchScore}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {displayedSkills.map((skill, idx) => (
                            <span key={idx} className="badge badge-neutral text-[10px] px-2 py-0.5">
                              {skill}
                            </span>
                          ))}
                          {remainingSkills > 0 && (
                            <span className="badge badge-neutral text-[10px] px-2 py-0.5">
                              +{remainingSkills}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {timeAgo(app.appliedAt || app.createdAt)}
                        </span>
                        {stage.id < 4 && (
                          <button
                            type="button"
                            className="btn-ghost px-2 py-1 text-xs gap-1 h-auto"
                            onClick={(e) => {
                              e.stopPropagation()
                              updateStageMutation.mutate({ id: app.id, stage: stage.id + 1, notes: app.notes })
                            }}
                            disabled={updateStageMutation.isPending}
                            aria-label={`Move to ${STAGES[stage.id + 1]?.name}`}
                          >
                            <SparklesIcon className="w-3 h-3" />
                            Advance
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}

                {stageApps.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-gray-500">
                    <EmptyIcon className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm font-medium">No applications</p>
                    <p className="text-xs mt-1">{searchQuery ? 'Try a different search' : stage.description}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
