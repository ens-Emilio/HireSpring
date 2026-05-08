export function formatSalary(min, max, currency) {
  if (!min && !max) return 'Salary not disclosed'
  const cur = currency || 'USD'
  const minStr = min?.toLocaleString() || ''
  const maxStr = max?.toLocaleString() || ''
  if (minStr && maxStr) return `${cur} ${minStr} - ${maxStr}`
  if (minStr) return `${cur} from ${minStr}`
  return `${cur} up to ${maxStr}`
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}

export function getStatusColor(status) {
  const colors = {
    APPLIED: 'bg-blue-100 text-blue-700',
    SCREENING: 'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    OFFER: 'bg-green-100 text-green-700',
    HIRED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}
