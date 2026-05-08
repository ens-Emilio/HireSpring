export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  )
}

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse" role="status" aria-label="Loading job card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton skeleton-avatar w-12 h-12 rounded-lg"></div>
          <div className="flex-1">
            <div className="skeleton skeleton-title h-5 w-48 mb-2 rounded"></div>
            <div className="skeleton skeleton-text h-4 w-32 rounded"></div>
          </div>
        </div>
        <div className="skeleton skeleton-badge h-6 w-20 rounded-full"></div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton skeleton-text h-4 w-full rounded"></div>
        <div className="skeleton skeleton-text h-4 w-3/4 rounded"></div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="skeleton skeleton-badge h-6 w-16 rounded-full"></div>
        <div className="skeleton skeleton-badge h-6 w-20 rounded-full"></div>
        <div className="skeleton skeleton-badge h-6 w-14 rounded-full"></div>
      </div>
    </div>
  )
}

export function JobFeedSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading job feed">
      {[...Array(5)].map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse" role="status" aria-label="Loading stat card">
      <div className="flex items-center justify-between">
        <div className="skeleton skeleton-text h-4 w-24 rounded"></div>
        <div className="skeleton skeleton-avatar w-10 h-10 rounded-full"></div>
      </div>
      <div className="mt-3">
        <div className="skeleton skeleton-title h-8 w-16 rounded"></div>
      </div>
      <div className="mt-2">
        <div className="skeleton skeleton-text h-3 w-20 rounded"></div>
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Loading dashboard stats">
      {[...Array(count)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse" role="status" aria-label="Loading table row">
      <td className="px-4 py-3">
        <div className="skeleton skeleton-text h-4 w-32 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="skeleton skeleton-text h-4 w-24 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="skeleton skeleton-badge h-6 w-16 rounded-full"></div>
      </td>
      <td className="px-4 py-3">
        <div className="skeleton skeleton-text h-4 w-20 rounded"></div>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="skeleton skeleton-text h-8 w-16 rounded"></div>
          <div className="skeleton skeleton-text h-8 w-16 rounded"></div>
        </div>
      </td>
    </tr>
  )
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" role="status" aria-label="Loading table">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Name', 'Status', 'Type', 'Date', 'Actions'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...Array(rows)].map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function KanbanCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-3 animate-pulse" role="status" aria-label="Loading kanban card">
      <div className="skeleton skeleton-title h-4 w-full mb-2 rounded"></div>
      <div className="skeleton skeleton-text h-3 w-3/4 mb-3 rounded"></div>
      <div className="flex items-center justify-between">
        <div className="skeleton skeleton-badge h-6 w-16 rounded-full"></div>
        <div className="skeleton skeleton-avatar w-6 h-6 rounded-full"></div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading profile">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="skeleton h-32 bg-gray-300"></div>
        <div className="p-6">
          <div className="flex items-center gap-4 -mt-16">
            <div className="skeleton skeleton-avatar w-24 h-24 rounded-full border-4 border-white"></div>
            <div className="flex-1">
              <div className="skeleton skeleton-title h-6 w-48 mb-2 rounded"></div>
              <div className="skeleton skeleton-text h-4 w-64 rounded"></div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton skeleton-text h-4 w-full rounded"></div>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="skeleton skeleton-text h-4 w-full rounded"></div>
            <div className="skeleton skeleton-text h-4 w-5/6 rounded"></div>
            <div className="skeleton skeleton-text h-4 w-4/6 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-50" role="status" aria-label="Loading page">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  )
}
