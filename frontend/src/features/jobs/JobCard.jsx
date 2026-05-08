import { Link } from 'react-router-dom'
import { MapPinIcon, BuildingOfficeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { formatSalary, formatDate } from '../../utils/format'
import JobBadges from '../../components/JobBadges'

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card hover:shadow-md transition-shadow block">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600">
            {job.title}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <BuildingOfficeIcon className="w-4 h-4" />
              {job.company?.name}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <CurrencyDollarIcon className="w-4 h-4" />
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <JobBadges job={job} />
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>{formatDate(job.createdAt)}</div>
          <div className="mt-1">{job.applicationCount} applications</div>
        </div>
      </div>
    </Link>
  )
}
