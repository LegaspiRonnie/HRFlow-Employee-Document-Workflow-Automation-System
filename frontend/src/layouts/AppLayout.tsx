import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sectionsForRole } from '../lib/navigation'
import * as notificationsApi from '../services/notifications'
import { ROLE_LABELS } from '../types/auth'
import { Icon, LogoMark } from '../components/icons'

/**
 * The signed-in application shell: fixed dark sidebar with a role-filtered
 * icon menu, a light topbar with the current page title, notifications and
 * the user chip, and the page area. Every protected page renders inside
 * this layout via <Outlet />.
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

  const sections = sectionsForRole(user.role)

  // Topbar title = the nav item matching the current URL (longest wins,
  // so /requests/new resolves to "Request Document", not "My Requests").
  const currentLabel = sections
    .flatMap((s) => s.items)
    .filter((i) => location.pathname === i.to || location.pathname.startsWith(`${i.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]?.label

  const initials = user.name
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-slate-950 text-slate-300 flex flex-col">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800/70">
          <LogoMark className="h-8 w-8" />
          <div>
            <span className="text-base font-bold text-white leading-tight">HRFlow</span>
            <p className="text-[10px] text-slate-500">Document &amp; Workflow Automation</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => (
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
                        `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-indigo-600 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800/70 hover:text-white'
                        }`
                      }
                    >
                      <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800/70 px-5 py-3">
          <p className="text-[10px] text-slate-600">© {new Date().getFullYear()} HRFlow Corporation</p>
        </div>
      </aside>

      {/* ── Main column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6">
          <p className="flex-1 truncate text-sm font-semibold text-slate-700">{currentLabel}</p>

          {/* notification bell with unread badge */}
          <Link
            to="/notifications"
            className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Notifications (${unread} unread)`}
            title="Notifications"
          >
            <Icon name="bell" className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              {initials}
            </span>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[11px] text-slate-500">{ROLE_LABELS[user.role]}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            title="Log out"
          >
            <Icon name="logout" className="h-3.5 w-3.5" />
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
