export function formatSalary(min, max, currency) {
  if (!min && !max) return 'A combinar'
  const cur = currency || 'USD'
  const formatNum = (n) => {
    if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
    return n.toString()
  }
  const minStr = min ? formatNum(min) : ''
  const maxStr = max ? formatNum(max) : ''
  if (minStr && maxStr) return `${cur} ${minStr}k – ${maxStr}k`
  if (minStr) return `${cur} a partir de ${minStr}`
  return `${cur} até ${maxStr}`
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

export function formatRelativeTime(dateString) {
  const now = new Date()
  const then = new Date(dateString)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'agora mesmo'
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600)
    return `há ${hours} hora${hours > 1 ? 's' : ''}`
  }
  if (seconds < 604800) {
    const days = Math.floor(seconds / 86400)
    return `há ${days} dia${days > 1 ? 's' : ''}`
  }
  return then.toLocaleDateString('pt-BR')
}

export function getStatusColor(status) {
  const colors = {
    APPLIED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    SCREENING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    INTERVIEW: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    OFFER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    HIRED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
}

export function getStatusLabel(status) {
  const labels = {
    APPLIED: 'Inscrito',
    SCREENING: 'Em triagem',
    INTERVIEW: 'Entrevista',
    OFFER: 'Oferta',
    HIRED: 'Contratado',
    REJECTED: 'Não selecionado',
  }
  return labels[status] || status
}

export function formatJobType(type) {
  const labels = {
    FULLTIME: 'Tempo integral',
    PARTTIME: 'Meio período',
    CONTRACT: 'Contrato',
    FREELANCE: 'Freelance',
    INTERNSHIP: 'Estágio',
  }
  return labels[type] || type
}

export function formatJobLevel(level) {
  const labels = {
    JUNIOR: 'Júnior',
    MID: 'Pleno',
    SENIOR: 'Sênior',
    LEAD: 'Líder',
    EXECUTIVE: 'Executivo',
  }
  return labels[level] || level
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
