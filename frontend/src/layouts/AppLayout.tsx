import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sectionsForRole } from '../lib/navigation'
import * as notificationsApi from '../services/notifications'
import { ROLE_LABELS } from '../types/auth'

/**
 * The signed-in application shell: fixed dark sidebar with a role-filtered
 * menu, a light topbar with the current user + logout, and the page area.
 * Every protected page renders inside this layout via <Outlet />.
 */
export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)

  // refresh the bell badge on every navigation + every 60s
  useEffect(() => {
    let cancelled = false
    const refresh = () =>
      notificationsApi
        .listNotifications()
        .then((feed) => {
          if (!cancelled) setUnread(feed.unread_count)
        })
        .catch(() => undefined)
    refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [location.pathname])

  if (!user) return null // guarded upstream by ProtectedRoute

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <span className="text-xl font-bold text-white">HRFlow</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Document &amp; Workflow Automation</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sectionsForRole(user.role).map((section) => (
            <div key={section.title}>
              <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/requests'} /* keep /requests/new from double-highlighting */
                      className={({ isActive }) =>
                        `block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'hover:bg-slate-800 hover:text-white'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-end gap-4 px-6">
          {/* notification bell with unread badge */}
          <Link
            to="/notifications"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label={`Notifications (${unread} unread)`}
            title="Notifications"
          >
            <span className="text-lg leading-none">🔔</span>
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[11px] text-slate-500">{ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
