import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/LoadingSpinner'

const STAGES = [
  { id: 0, name: 'Applied', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { id: 1, name: 'Screening', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-700' },
  { id: 2, name: 'Interview', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
  { id: 3, name: 'Offer', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { id: 4, name: 'Hired', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
]

export default function KanbanBoard({ jobId }) {
  const queryClient = useQueryClient()
  const [draggedApp, setDraggedApp] = useState(null)

  const { data: applications, isLoading } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => api.get(`/applications/job/${jobId}`).then((r) => r.data),
  })

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, notes }) => api.put(`/applications/${id}/stage`, { stage, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      toast.success('Application stage updated')
    },
  })

  const handleDragStart = (e, app) => {
    setDraggedApp(app)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, stage) => {
    e.preventDefault()
    if (draggedApp && draggedApp.pipelineStage !== stage) {
      updateStageMutation.mutate({ id: draggedApp.id, stage, notes: draggedApp.notes })
    }
    setDraggedApp(null)
  }

  const handleKeyDown = (e, app, targetStage) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (app.pipelineStage !== targetStage) {
        updateStageMutation.mutate({ id: app.id, stage: targetStage, notes: app.notes })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const appList = applications?.content || applications || []

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Application pipeline">
      {STAGES.map((stage) => {
        const stageApps = appList.filter((a) => a.pipelineStage === stage.id)
        return (
          <div
            key={stage.id}
            className={`flex-1 min-w-[260px] ${stage.color} border-2 rounded-xl p-4`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
            role="listitem"
            aria-label={`${stage.name}: ${stageApps.length} applications`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${stage.textColor}`}>{stage.name}</h3>
              <span className="px-2 py-1 bg-white rounded-full text-xs font-medium shadow-sm">
                {stageApps.length}
              </span>
            </div>
            <div className="space-y-3">
              {stageApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  tabIndex={0}
                  role="button"
                  aria-label={`${app.candidateName || 'Candidate'} - ${app.jobTitle || 'Job'}. Press Enter to move to next stage.`}
                  onDragStart={(e) => handleDragStart(e, app)}
                  onKeyDown={(e) => handleKeyDown(e, app, stage.id + 1)}
                  className="bg-white rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span className="font-medium text-gray-900">
                    {app.candidateName || app.candidateEmail || 'Candidate'}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{app.jobTitle || ''}</p>
                  {app.notes && (
                    <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">{app.notes}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {stageApps.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No applications
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
