import {
  mockJobs,
  mockJobDetail,
  mockUser,
  mockCandidateProfile,
  mockApplications,
  mockSavedJobs,
  mockNotifications,
  mockRecruiterJobs,
  mockKanbanApplications,
  mockAdminStats,
  mockCompanies,
} from './data'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function mockApi() {
  const handlers = {
    'GET /auth/me': async () => ({
      data: mockUser,
      status: 200,
    }),

    'POST /auth/login': async (data) => {
      if (data.email === 'admin@jobportal.com') {
        return {
          data: {
            email: 'admin@jobportal.com',
            role: 'ADMIN',
            token: 'mock-jwt-token-admin',
            firstName: 'Admin',
          },
          status: 200,
        }
      }
      if (data.email.includes('recruiter')) {
        return {
          data: {
            email: data.email,
            role: 'RECRUITER',
            token: 'mock-jwt-token-recruiter',
            firstName: 'Recruiter',
          },
          status: 200,
        }
      }
      return {
        data: {
          email: data.email,
          role: 'CANDIDATE',
          token: 'mock-jwt-token-candidate',
          firstName: 'John',
        },
        status: 200,
      }
    },

    'POST /auth/register': async (data) => ({
      data: {
        email: data.email,
        role: data.role || 'CANDIDATE',
        token: 'mock-jwt-token-new',
        firstName: data.fullName?.split(' ')[0] || 'User',
      },
      status: 200,
    }),

    'GET /jobs': async (params) => {
      let jobs = mockJobs.content
      if (params.search) {
        const search = params.search.toLowerCase()
        jobs = jobs.filter(
          (j) =>
            j.title.toLowerCase().includes(search) ||
            j.description.toLowerCase().includes(search) ||
            j.companyName.toLowerCase().includes(search)
        )
      }
      if (params.remote === 'true') {
        jobs = jobs.filter((j) => j.remote)
      }
      if (params.jobType) {
        jobs = jobs.filter((j) => j.jobType === params.jobType)
      }
      if (params.level) {
        jobs = jobs.filter((j) => j.level === params.level)
      }
      const page = parseInt(params.page) || 0
      const size = parseInt(params.size) || 20
      const start = page * size
      const end = start + size
      return {
        data: {
          content: jobs.slice(start, end),
          totalPages: Math.ceil(jobs.length / size),
          totalElements: jobs.length,
          size,
          number: page,
        },
        status: 200,
      }
    },

    'GET /jobs/saved': async () => ({
      data: mockSavedJobs,
      status: 200,
    }),

    'GET /jobs/:id': async (params) => ({
      data: { ...mockJobDetail, id: parseInt(params.id) || 1 },
      status: 200,
    }),

    'POST /jobs': async (data) => ({
      data: { ...data, id: Date.now(), status: 'ACTIVE', createdAt: new Date().toISOString() },
      status: 201,
    }),

    'GET /applications/me': async () => ({
      data: mockApplications,
      status: 200,
    }),

    'GET /applications/candidate': async () => ({
      data: mockApplications,
      status: 200,
    }),

    'POST /applications': async (data) => ({
      data: { ...data, id: Date.now(), status: 'APPLIED', stage: 'APPLIED', appliedAt: new Date().toISOString() },
      status: 201,
    }),

    'POST /applications/jobs/:id/apply': async (data) => ({
      data: { id: Date.now(), status: 'APPLIED', appliedAt: new Date().toISOString() },
      status: 201,
    }),

    'GET /applications/job/:jobId': async () => ({
      data: mockKanbanApplications,
      status: 200,
    }),

    'PUT /applications/:id/stage': async (data) => ({
      data: { ...data, stage: data.stage },
      status: 200,
    }),

    'GET /saved-jobs': async () => ({
      data: mockSavedJobs,
      status: 200,
    }),

    'POST /saved-jobs': async (data) => ({
      data: { ...data, id: Date.now(), savedAt: new Date().toISOString() },
      status: 201,
    }),

    'DELETE /saved-jobs/:id': async () => ({
      data: { message: 'Job removed' },
      status: 200,
    }),

    'GET /alerts': async () => ({
      data: [],
      status: 200,
    }),

    'POST /alerts': async (data) => ({
      data: { ...data, id: Date.now() },
      status: 201,
    }),

    'GET /candidates/me': async () => ({
      data: mockCandidateProfile,
      status: 200,
    }),

    'GET /candidates/profile': async () => ({
      data: mockCandidateProfile,
      status: 200,
    }),

    'PUT /candidates/me': async (data) => ({
      data: { ...mockCandidateProfile, ...data },
      status: 200,
    }),

    'PUT /candidates/profile': async (data) => ({
      data: { ...mockCandidateProfile, ...data },
      status: 200,
    }),

    'GET /notifications': async () => ({
      data: mockNotifications,
      status: 200,
    }),

    'GET /notifications/count': async () => ({
      data: { count: mockNotifications.filter((n) => !n.read).length },
      status: 200,
    }),

    'GET /notifications/unread-count': async () => ({
      data: { count: mockNotifications.filter((n) => !n.read).length },
      status: 200,
    }),

    'PUT /notifications/:id/read': async () => ({
      data: { message: 'Notification marked as read' },
      status: 200,
    }),

    'GET /companies': async () => ({
      data: mockCompanies,
      status: 200,
    }),

    'GET /companies/:id': async () => ({
      data: mockCompanies[0],
      status: 200,
    }),

    'POST /companies': async (data) => ({
      data: { ...data, id: Date.now() },
      status: 201,
    }),

    'GET /recruiter/jobs': async () => ({
      data: mockRecruiterJobs,
      status: 200,
    }),

    'GET /admin/stats': async () => ({
      data: mockAdminStats,
      status: 200,
    }),

    'GET /admin/jobs': async () => ({
      data: mockJobs,
      status: 200,
    }),

    'PUT /admin/jobs/:id/moderate': async (data) => ({
      data: { ...data, message: 'Job status updated' },
      status: 200,
    }),

    'POST /admin/seed': async () => ({
      data: { message: 'Seed data regenerated' },
      status: 200,
    }),
  }

  async function request(method, url, data) {
    const normalizedUrl = url.replace('/api/v1', '')
    const urlPath = normalizedUrl.split('?')[0]
    const key = `${method} ${urlPath}`

    const handler = handlers[key]
    if (!handler) {
      console.warn(`[MOCK] No handler for ${key}`)
      return { data: null, status: 404 }
    }

    const params = {}
    const queryString = normalizedUrl.split('?')[1]
    if (queryString) {
      new URLSearchParams(queryString).forEach((value, key) => {
        params[key] = value
      })
    }

    const urlParts = urlPath.split('/')
    for (let i = 0; i < urlParts.length; i++) {
      if (urlParts[i] === ':id' && urlParts[i + 1]) {
        params.id = urlParts[i + 1]
      }
      if (urlParts[i] === ':jobId' && urlParts[i + 1]) {
        params.jobId = urlParts[i + 1]
      }
    }

    await delay(300 + Math.random() * 500)

    return handler({ ...params, ...data })
  }

  return {
    get: (url) => request('GET', url),
    post: (url, data) => request('POST', url, data),
    put: (url, data) => request('PUT', url, data),
    delete: (url) => request('DELETE', url),
  }
}

export default mockApi
