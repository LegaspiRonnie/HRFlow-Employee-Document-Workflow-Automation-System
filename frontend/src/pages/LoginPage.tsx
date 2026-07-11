import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Sign-in screen. On success the user lands on the page they originally
 * asked for (stored in location.state by ProtectedRoute) or /dashboard.
 * Already-logged-in visitors are bounced straight to the app.
 */
export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/dashboard', { replace: true })
    } catch (err) {
      // 422 = bad credentials (Laravel validation error), 429 = throttled.
      if (isAxiosError(err) && err.response) {
        setError(
          err.response.status === 429
            ? 'Too many attempts — please wait a minute and try again.'
            : (err.response.data?.message ?? 'Login failed.'),
        )
      } else {
        setError('Cannot reach the server — is the API running?')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white shadow-md p-8">
          <h1 className="text-3xl font-bold text-slate-800 text-center">HRFlow</h1>
          <p className="mt-1 text-sm text-slate-500 text-center">
            Employee Document &amp; Workflow Automation
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="you@hrflow.test"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Dev convenience — remove before production (Feature 13). */}
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Demo accounts (password: password)</p>
          <p>employee@hrflow.test · manager@hrflow.test · hradmin@hrflow.test</p>
        </div>
      </div>
    </div>
  )
}
