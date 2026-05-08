import { useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  })

  const { data: jobs, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['admin-jobs'],
    queryFn: () => api.get('/admin/jobs?page=0&size=20').then((r) => r.data),
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/jobs/${id}/moderate`, { status }),
    onSuccess: () => {
      toast.success('Job status updated')
      refetch()
    },
  })

  const seedMutation = useMutation({
    mutationFn: () => api.post('/admin/seed'),
    onSuccess: () => toast.success('Seed data regenerated!'),
  })

  const chartData = useMemo(() => ({
    labels: ['Users', 'Active Jobs', 'Companies'],
    datasets: [{
      label: 'Platform Metrics',
      data: [stats?.totalUsers || 0, stats?.activeJobs || 0, stats?.totalCompanies || 0],
      backgroundColor: 'rgba(14, 165, 233, 0.5)',
      borderColor: 'rgba(14, 165, 233, 1)',
      borderWidth: 1,
    }],
  }), [stats])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => seedMutation.mutate()} className="btn-secondary">
          Regenerate Demo Data
        </button>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : statsError ? (
        <div className="card text-center py-12 mb-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Failed to load stats</p>
          <button onClick={() => refetch()} className="btn-primary">Retry</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="text-sm text-gray-500">Total Users</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold">{stats?.activeJobs || 0}</div>
              <div className="text-sm text-gray-500">Active Jobs</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
              <div className="text-sm text-gray-500">Applications</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
              <div className="text-sm text-gray-500">Companies</div>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">Platform Overview</h2>
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </>
      )}

      <h2 className="text-xl font-semibold mb-4">Job Moderation</h2>

      {jobsLoading ? (
        <div className="card flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : jobsError ? (
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
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(jobs?.content || []).map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{job.title}</td>
                  <td className="py-3 px-4">{job.companyName}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status} /></td>
                  <td className="py-3 px-4 space-x-2">
                    <button onClick={() => moderateMutation.mutate({ id: job.id, status: 'ACTIVE' })} className="text-green-600 hover:underline text-sm">Approve</button>
                    <button onClick={() => moderateMutation.mutate({ id: job.id, status: 'PAUSED' })} className="text-yellow-600 hover:underline text-sm">Pause</button>
                    <button onClick={() => moderateMutation.mutate({ id: job.id, status: 'CLOSED' })} className="text-red-600 hover:underline text-sm">Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!jobs?.content || jobs.content.length === 0) && (
            <div className="text-center py-8 text-gray-500">No jobs to moderate</div>
          )}
        </div>
      )}
    </div>
  )
}
