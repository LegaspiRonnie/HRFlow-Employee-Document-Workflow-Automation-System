import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/auth'

/**
 * Second-level guard used INSIDE ProtectedRoute: the user is logged in,
 * but this branch of the route tree is restricted to certain roles.
 * Mirrors the backend 'role:' middleware — the API would reject the
 * request anyway (403); this just keeps the UI honest.
 */
export default function RoleRoute({ roles }: { roles: Role[] }) {
  const { user } = useAuth()

  if (!user) return null // ProtectedRoute already handles this case

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
