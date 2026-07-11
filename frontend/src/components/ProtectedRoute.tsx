import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Layout route guarding everything that requires a login.
 * While the stored token is being verified we show a splash instead of
 * flashing the login page; unauthenticated visitors are redirected to
 * /login and returned to their original destination after signing in.
 */
export default function ProtectedRoute() {
  const { user, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-400 text-sm">Loading HRFlow…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
