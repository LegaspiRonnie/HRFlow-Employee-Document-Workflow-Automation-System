import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Icon, LogoMark } from '../components/icons'

/**
 * Sign-in screen: corporate split layout — branded product panel on the
 * left (hidden on small screens), the sign-in form on the right. On
 * success the user lands on the page they originally asked for (stored
 * in location.state by ProtectedRoute) or /dashboard. Already-logged-in
 * visitors are bounced straight to the app.
 */

const HIGHLIGHTS = [
  {
    icon: 'check-badge',
    title: 'Two-stage approval',
    text: 'Manager review, then HR verification — nothing slips through.',
  },
  {
    icon: 'qr-code',
    title: 'QR-verifiable documents',
    text: 'Every PDF is digitally signed and instantly verifiable by scanning its code.',
  },
  {
    icon: 'shield-check',
    title: 'Complete audit trail',
    text: 'Every action is recorded in an append-only log, visible to HR.',
  },
] as const

/** Demo workspace shortcuts — one click fills the form for that role. */
const DEMO_ACCOUNTS = [
  { label: 'Employee', email: 'employee@hrflow.test' },
  { label: 'Manager', email: 'manager@hrflow.test' },
  { label: 'HR Admin', email: 'hradmin@hrflow.test' },
] as const

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password')
    setError(null)
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ── Brand panel (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white">
        {/* soft glow accents */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <LogoMark className="h-10 w-10" />
          <div>
            <p className="text-lg font-bold leading-tight">HRFlow</p>
            <p className="text-xs text-slate-400">Employee Document &amp; Workflow Automation</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight">
            HR documents,
            <br />
            minus the paperwork.
          </h1>
          <p className="mt-4 text-slate-300">
            Employees request official documents online, approvals flow through
            manager and HR, and signed PDFs are issued automatically.
          </p>

          <ul className="mt-10 space-y-6">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-indigo-300">
                  <Icon name={h.icon} />
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} HRFlow Corporation. Internal use only.
        </p>
      </div>

      {/* ── Sign-in panel ── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm">
          {/* compact brand header for small screens */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <LogoMark className="h-10 w-10" />
            <div>
              <p className="text-lg font-bold leading-tight text-slate-900">HRFlow</p>
              <p className="text-xs text-slate-500">Employee Document &amp; Workflow Automation</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your HRFlow workspace.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Work email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo workspace — lets reviewers try each role in one click. */}
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Try the demo workspace
              </span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemo(account.email)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700"
                >
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Click a role to fill the form, then sign in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
