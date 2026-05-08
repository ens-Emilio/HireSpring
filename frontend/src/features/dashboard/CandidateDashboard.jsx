import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { BriefcaseIcon, ClipboardDocumentListIcon, HeartIcon } from '@heroicons/react/24/outline'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/format'

export default function CandidateDashboard() {
  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me').then((r) => r.data),
  })

  const { data: savedJobs } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get('/jobs/saved').then((r) => r.data),
  })

  const stats = useMemo(() => {
    const appList = applications?.content || applications || []
    const savedList = savedJobs?.content || savedJobs || []
    const interviewOrOffer = appList.filter((a) => a.status === 'INTERVIEW' || a.status === 'OFFER').length
    return { appCount: appList.length, savedCount: savedList.length, interviewOrOffer }
  }, [applications, savedJobs])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <Link to="/profile" className="btn-primary">
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <ClipboardDocumentListIcon className="w-8 h-8 text-primary-500" />
            <div>
              <div className="text-2xl font-bold">{stats.appCount}</div>
              <div className="text-sm text-gray-500">Applications</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <HeartIcon className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{stats.savedCount}</div>
              <div className="text-sm text-gray-500">Saved Jobs</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{stats.interviewOrOffer}</div>
              <div className="text-sm text-gray-500">Interviews/Offers</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">My Applications</h2>
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Job</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applied</th>
            </tr>
          </thead>
          <tbody>
            {(applications?.content || applications || []).map((app) => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Link to={`/jobs/${app.jobId}`} className="text-primary-600 hover:underline">
                    {app.jobTitle}
                  </Link>
                </td>
                <td className="py-3 px-4">{app.candidateName || '-'}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {formatDate(app.appliedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!applications?.content && !applications?.length) && (
          <div className="text-center py-8 text-gray-500">
            No applications yet. <Link to="/" className="text-primary-600 hover:underline">Browse jobs</Link>
          </div>
        )}
      </div>
    </div>
  )
}
