import { createContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { storage } from '../utils/storage'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser())
  const [token, setToken] = useState(() => storage.getToken())
  const [loading, setLoading] = useState(false)

  const isAuthenticated = Boolean(token)

  useEffect(() => {
    if (token && user) {
      storage.setSession(token, user)
    }
  }, [token, user])

  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authService.login(credentials)
      const sessionToken = response.token || response.accessToken
      const sessionUser = response.user || response.profile || {
        id: response.userId,
        name: response.fullName || credentials.email,
        fullName: response.fullName || credentials.email,
        email: response.email || credentials.email,
        role: response.role || 'EMPLOYEE',
      }

      setToken(sessionToken)
      setUser(sessionUser)
      storage.setSession(sessionToken, sessionUser)
      return response
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    setLoading(true)
    try {
      return await authService.register(payload)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    storage.clearSession()
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, token, loading, isAuthenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
