import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = '/login'
      },

      loadUser: async () => {
        const token = localStorage.getItem('token')
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data, token, isAuthenticated: true })
        } catch (error) {
          if (error.response?.status === 401) {
            localStorage.removeItem('token')
          }
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
