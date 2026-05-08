import axios from 'axios'
import { USE_MOCKS } from '../mocks/config'
import mockApi from '../mocks/handlers'

let api

if (USE_MOCKS) {
  console.log('[MOCK] Using mock API handlers')
  api = mockApi()
} else {
  api = axios.create({
    baseURL: '/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  let isRefreshing = false
  let refreshSubscribers = []

  function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback)
  }

  function onTokenRefreshed(token) {
    refreshSubscribers.forEach((callback) => callback(token))
    refreshSubscribers = []
  }

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(api(originalRequest))
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        localStorage.removeItem('token')
        window.location.href = '/login'
        isRefreshing = false
        return Promise.reject(error)
      }

      if (error.response?.status === 403) {
        console.warn('Access forbidden:', error.response?.data?.message || error.response?.data?.error)
      }

      if (error.response?.status === 429) {
        console.warn('Rate limited. Please try again later.')
      }

      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timed out. Please try again.'
      }

      if (!error.response) {
        error.message = 'Network error. Please check your connection.'
      }

      if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'string' && data.includes('<')) {
          error.response.data = { error: 'An unexpected error occurred' }
        }
      }

      return Promise.reject(error)
    }
  )
}

export default api
