import { lazy, Suspense, Component } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import LoadingSpinner from './components/LoadingSpinner'

const Login = lazy(() => import('./features/auth/Login'))
const Register = lazy(() => import('./features/auth/Register'))
const JobFeed = lazy(() => import('./features/jobs/JobFeed'))
const JobDetail = lazy(() => import('./features/jobs/JobDetail'))
const CandidateDashboard = lazy(() => import('./features/dashboard/CandidateDashboard'))
const CandidateProfile = lazy(() => import('./features/candidate/ProfileWizard'))
const RecruiterDashboard = lazy(() => import('./features/dashboard/RecruiterDashboard'))
const AdminDashboard = lazy(() => import('./features/dashboard/AdminDashboard'))
const JobApplications = lazy(() => import('./features/recruiter/JobApplications'))
const NotFound = lazy(() => import('./components/NotFound'))

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="card max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppInitializer({ children }) {
  const { loadUser, isLoading } = useAuthStore()

  useEffect(() => {
    loadUser()
  }, [loadUser])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppInitializer>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Suspense
              fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              }
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<JobFeed />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route
                  path="/jobs/:jobId/applications"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER', 'ADMIN']}>
                      <JobApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/candidate"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['CANDIDATE']}>
                      <CandidateProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/recruiter"
                  element={
                    <ProtectedRoute allowedRoles={['RECRUITER']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </AppInitializer>
    </ErrorBoundary>
  )
}
