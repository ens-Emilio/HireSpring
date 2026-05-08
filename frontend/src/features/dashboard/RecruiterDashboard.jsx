import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { BriefcaseIcon, UserGroupIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'

export default function RecruiterDashboard() {
  const { data: jobs, isLoading, error, refetch } = useQuery({
    queryKey: ['my-jobs'],
    queryFn: () => api.get('/jobs?page=0&size=50').then((r) => r.data),
  })

  const stats = useMemo(() => {
    const jobList = jobs?.content || []
    return {
      activeCount: jobList.length,
      totalApplications: jobList.reduce((sum, j) => sum + (j.applicationCount || 0), 0),
      totalViews: jobList.reduce((sum, j) => sum + (j.viewCount || 0), 0),
    }
  }, [jobs])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <Link to="/jobs/new" className="btn-primary">
          Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3">
            <BriefcaseIcon className="w-8 h-8 text-primary-500" />
            <div>
              <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeCount}</div>
              <div className="text-sm text-gray-500">Active Jobs</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalApplications}</div>
              <div className="text-sm text-gray-500">Total Applications</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <EyeIcon className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalViews}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">My Jobs</h2>

      {isLoading ? (
        <div className="card flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load jobs</p>
          <button onClick={() => refetch()} className="btn-primary">Retry</button>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applications</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Views</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(jobs?.content || []).map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{job.title}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="py-3 px-4">{job.applicationCount}</td>
                  <td className="py-3 px-4">{job.viewCount}</td>
                  <td className="py-3 px-4">
                    <Link to={`/jobs/${job.id}/applications`} className="text-primary-600 hover:underline text-sm">
                      View Applications
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!jobs?.content || jobs.content.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No jobs posted yet.{' '}
              <Link to="/jobs/new" className="text-primary-600 hover:underline">Post your first job</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
