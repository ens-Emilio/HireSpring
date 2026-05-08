import { useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '../../lib/api'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { DashboardStatsSkeleton, TableSkeleton } from '../../components/LoadingSpinner'
import StatusBadge from '../../components/StatusBadge'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then((r) => r.data),
  })

  const { data: pendingJobs, isLoading: pendingJobsLoading, error: pendingJobsError, refetch: refetchJobs } = useQuery({
    queryKey: ['admin-jobs-pending'],
    queryFn: () => api.get('/admin/jobs?status=PENDING&page=0&size=20').then((r) => r.data),
  })

  const { data: topCompanies, isLoading: topCompaniesLoading } = useQuery({
    queryKey: ['admin-top-companies'],
    queryFn: () => api.get('/admin/companies/top?limit=10').then((r) => r.data),
  })

  const { data: recentUsers, isLoading: recentUsersLoading } = useQuery({
    queryKey: ['admin-recent-users'],
    queryFn: () => api.get('/admin/users/recent?limit=5').then((r) => r.data),
  })

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: () => api.get('/admin/stats/user-growth?days=30').then((r) => r.data),
  })

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/jobs/${id}/moderate`, { status }),
    onSuccess: () => {
      toast.success('Status da vaga atualizado')
      refetchJobs()
      refetchStats()
    },
  })

  const seedMutation = useMutation({
    mutationFn: () => api.post('/admin/seed'),
    onSuccess: () => {
      toast.success('Dados demo regenerados com sucesso!')
      refetchStats()
      refetchJobs()
    },
  })

  const growthChartData = useMemo(() => {
    if (!userGrowth) return null
    return {
      labels: userGrowth.labels || [],
      datasets: [{
        label: 'Novos usuários',
        data: userGrowth.data || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      }],
    }
  }, [userGrowth])

  const growthChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Administrador</h1>
        <button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="btn-secondary"
        >
          {seedMutation.isPending ? 'Regenerando...' : 'Regenerar Dados Demo'}
        </button>
      </div>

      {statsLoading ? (
        <DashboardStatsSkeleton count={6} />
      ) : statsError ? (
        <div className="card text-center py-12 mb-8">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Falha ao carregar estatísticas</p>
          <button onClick={() => refetchStats()} className="btn-primary">Tentar novamente</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.totalUsers || 0}</div>
            <div className="text-sm text-gray-500">Usuários totais</div>
          </div>
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.newUsersThisWeek || 0}</div>
            <div className="text-sm text-gray-500">
              Novos usuários (esta semana)
              {stats?.newUsersLastWeek !== undefined && (
                <span className={`ml-2 font-semibold ${stats.newUsersThisWeek >= stats.newUsersLastWeek ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.newUsersLastWeek > 0
                    ? `(${stats.newUsersThisWeek >= stats.newUsersLastWeek ? '+' : ''}${Math.round(((stats.newUsersThisWeek - stats.newUsersLastWeek) / stats.newUsersLastWeek) * 100)}% vs semana passada)`
                    : '(vs semana passada)'}
                </span>
              )}
            </div>
          </div>
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.publishedJobs || 0}</div>
            <div className="text-sm text-gray-500">Vagas publicadas</div>
          </div>
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.totalApplications || 0}</div>
            <div className="text-sm text-gray-500">Candidaturas totais</div>
          </div>
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.matchRate ? `${stats.matchRate}%` : '0%'}</div>
            <div className="text-sm text-gray-500">Taxa de match (&gt; 70%)</div>
          </div>
          <div className="card stat-card">
            <div className="text-3xl font-bold">{stats?.activeCompanies || 0}</div>
            <div className="text-sm text-gray-500">Empresas ativas</div>
          </div>
        </div>
      )}

      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Crescimento de usuários</h2>
        {growthLoading ? (
          <div className="flex justify-center py-8"><div className="animate-pulse h-64 bg-gray-200 rounded w-full" /></div>
        ) : growthChartData ? (
          <Bar data={growthChartData} options={growthChartOptions} />
        ) : (
          <p className="text-gray-500 text-center py-8">Dados de crescimento indisponíveis</p>
        )}
      </div>

      <div className="card mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Top empresas por vagas publicadas</h2>
        {topCompaniesLoading ? (
          <TableSkeleton rows={5} />
        ) : topCompanies && topCompanies.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Empresa</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vagas publicadas</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vagas ativas</th>
              </tr>
            </thead>
            <tbody>
              {topCompanies.map((company, index) => (
                <tr key={company.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{company.name}</td>
                  <td className="py-3 px-4">{company.totalJobs}</td>
                  <td className="py-3 px-4">{company.activeJobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma empresa encontrada</p>
        )}
      </div>

      <div className="card mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Últimos usuários registrados</h2>
        {recentUsersLoading ? (
          <TableSkeleton rows={5} />
        ) : recentUsers && recentUsers.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usuário</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Data de registro</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          user.name?.charAt(0)?.toUpperCase() || '?'
                        )}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={user.role === 'ADMIN' ? 'HIRED' : user.role === 'COMPANY' ? 'OFFER' : 'APPLIED'} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>
        )}
      </div>

      <div className="card mb-8 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Vagas para aprovação</h2>
        {pendingJobsLoading ? (
          <TableSkeleton rows={5} />
        ) : pendingJobsError ? (
          <div className="text-center py-8">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Falha ao carregar vagas pendentes</p>
            <button onClick={() => refetchJobs()} className="btn-primary">Tentar novamente</button>
          </div>
        ) : pendingJobs && pendingJobs.content && pendingJobs.content.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Título</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Empresa</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pendingJobs.content.map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{job.title}</td>
                  <td className="py-3 px-4">{job.companyName || job.company?.name}</td>
                  <td className="py-3 px-4"><StatusBadge status={job.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => moderateMutation.mutate({ id: job.id, status: 'ACTIVE' })}
                        disabled={moderateMutation.isPending}
                        className="btn-primary text-sm"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => moderateMutation.mutate({ id: job.id, status: 'PAUSED' })}
                        disabled={moderateMutation.isPending}
                        className="btn-secondary text-sm"
                      >
                        Pausar
                      </button>
                      <button
                        onClick={() => moderateMutation.mutate({ id: job.id, status: 'CLOSED' })}
                        disabled={moderateMutation.isPending}
                        className="btn-secondary text-sm text-red-600 hover:text-red-700"
                      >
                        Fechar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhuma vaga pendente de aprovação</p>
        )}
      </div>
    </div>
  )
}
