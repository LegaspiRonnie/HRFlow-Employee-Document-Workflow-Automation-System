import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROLE_LABELS } from '../types/auth'

/**
 * Minimal signed-in landing page proving the full auth loop works.
 * Feature 2 replaces this with the real role-aware app shell + sidebar.
 */
export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // ProtectedRoute guarantees user is set, but guard for type safety.
  if (!user) return null

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name}</h1>

        <span className="mt-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
          {ROLE_LABELS[user.role]}
        </span>

        <p className="mt-3 text-sm text-slate-500">{user.email}</p>

        <p className="mt-6 text-xs text-slate-400">
          The full dashboard arrives in Feature 2 — this page just proves
          login, session restore, and role data all work end to end.
        </p>

        <button
          onClick={handleLogout}
          className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
