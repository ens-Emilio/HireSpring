export default function JobBadges({ job }) {
  return (
    <>
      <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full">
        {job.jobType}
      </span>
      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
        {job.level}
      </span>
      {job.isRemote && (
        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
          Remote
        </span>
      )}
      {job.isHybrid && (
        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
          Hybrid
        </span>
      )}
    </>
  )
}
