import { useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { formatSalary, formatDate } from '../../utils/format'
import JobBadges from '../../components/JobBadges'

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const [coverLetter, setCoverLetter] = useState('')

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => api.get(`/jobs/${id}`).then((r) => r.data),
  })

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/applications/jobs/${id}/apply`, { coverLetter }),
    onSuccess: () => {
      toast.success('Application submitted successfully!')
      navigate('/dashboard/candidate')
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to apply')
    },
  })

  if (isLoading) return <div className="card animate-pulse">Loading...</div>
  if (!job) return <div className="card">Job not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Jobs
      </Link>

      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span className="flex items-center gap-1">
                <BuildingOfficeIcon className="w-4 h-4" />
                {job.companyName}
              </span>
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {job.location}
              </span>
            </div>
          </div>
          {isAuthenticated && user?.role === 'CANDIDATE' && (
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="btn-primary"
            >
              {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <JobBadges job={job} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Salary</div>
              <div className="text-sm font-medium">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Posted</div>
              <div className="text-sm font-medium">{formatDate(job.createdAt)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Applications</div>
              <div className="text-sm font-medium">{job.applicationCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-xs text-gray-500">Location</div>
              <div className="text-sm font-medium">{job.location}</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Requirements</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Benefits</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {job.benefits.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </div>
        )}

        {!isAuthenticated && (
          <div className="p-4 bg-primary-50 rounded-lg text-center">
            <p className="text-primary-700 mb-2">Interested in this position?</p>
            <Link to="/login" className="btn-primary">
              Sign in to apply
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
