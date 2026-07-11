import { useAuth } from '../context/AuthContext'
import PageHeader from '../components/PageHeader'
import { ROLE_LABELS } from '../types/auth'

/**
 * Signed-in landing page inside the app shell. Feature 11 replaces the
 * placeholder body with live analytics widgets per role.
 */
export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle={`You are signed in as ${ROLE_LABELS[user.role]}.`}
      />
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
        Analytics widgets arrive in Feature 11 — use the sidebar to explore your workspace.
      </div>
    </div>
  )
}
