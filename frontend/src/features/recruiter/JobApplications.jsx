import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../lib/api'
import KanbanBoard from './KanbanBoard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function JobApplications() {
  const { jobId } = useParams()

  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => api.get(`/jobs/${jobId}`).then((r) => r.data),
  })

  const { data: applications, isLoading: appsLoading, error, refetch } = useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: () => api.get(`/applications/job/${jobId}`).then((r) => r.data),
  })

  const funnel = useMemo(() => {
    const appList = applications?.content || applications || []
    return [
      { label: 'Applied', count: appList.filter((a) => a.pipelineStage === 0).length },
      { label: 'Screening', count: appList.filter((a) => a.pipelineStage === 1).length },
      { label: 'Interview', count: appList.filter((a) => a.pipelineStage === 2).length },
      { label: 'Offer', count: appList.filter((a) => a.pipelineStage === 3).length },
      { label: 'Hired', count: appList.filter((a) => a.pipelineStage === 4).length },
    ]
  }, [applications])

  const totalApps = (applications?.content || applications || []).length

  return (
    <div>
      <div className="mb-6">
        {jobLoading ? (
          <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
        ) : (
          <>
            <h1 className="text-2xl font-bold">{job?.title}</h1>
            <p className="text-gray-600 mt-1">{totalApps} applications • {job?.viewCount || 0} views</p>
          </>
        )}
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
        <KanbanBoard jobId={jobId} />
      )}
    </div>
  )
}
