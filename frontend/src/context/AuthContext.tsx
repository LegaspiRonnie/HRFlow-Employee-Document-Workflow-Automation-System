import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { clearToken, getToken, setToken } from '../lib/api'
import * as authService from '../services/auth'
import type { User } from '../types/auth'

interface AuthContextValue {
  /** The logged-in user, or null when logged out. */
  user: User | null
  /** True while we're restoring the session from a stored token on load. */
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  // On first load: if a token survives in localStorage, ask the API who we
  // are. A dead token gets cleared so the app lands cleanly on /login.
  useEffect(() => {
    if (!getToken()) {
      setInitializing(false)
      return
    }
    authService
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setInitializing(false))
  }, [])

  const login = async (email: string, password: string) => {
    const { token, user: loggedIn } = await authService.login(email, password)
    setToken(token)
    setUser(loggedIn)
  }

  const logout = async () => {
    // Best effort — even if the API call fails, the local session ends.
    try {
      await authService.logout()
    } catch {
      /* token already dead server-side — nothing to do */
    }
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** The only way components read auth state. Throws outside the provider. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
