import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../../store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.removeItem('token')
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  })

  it('should have initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('should set user and token', () => {
    const { setUser } = useAuthStore.getState()
    setUser({ email: 'test@example.com', role: 'CANDIDATE' }, 'mock-token')

    const state = useAuthStore.getState()
    expect(state.user).toEqual({ email: 'test@example.com', role: 'CANDIDATE' })
    expect(state.token).toBe('mock-token')
    expect(state.isAuthenticated).toBe(true)
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token')
  })

  it('should logout and clear state', () => {
    const { setUser, logout } = useAuthStore.getState()
    setUser({ email: 'test@example.com', role: 'CANDIDATE' }, 'mock-token')

    logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    expect(localStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('should persist token to localStorage', () => {
    const { setUser } = useAuthStore.getState()
    setUser({ email: 'test@example.com', role: 'CANDIDATE' }, 'persisted-token')

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'persisted-token')
  })
})
