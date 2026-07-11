import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

/**
 * Central route table. Structure:
 *   /login                          public
 *   ProtectedRoute (needs session)
 *     AppLayout (sidebar shell)
 *       shared pages               all roles
 *       RoleRoute manager,hr_admin manager pages
 *       RoleRoute hr_admin         HR pages
 */
function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Signed-in app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Manager area (HR admins may also review team requests) */}
          <Route element={<RoleRoute roles={['manager', 'hr_admin']} />}>
            {/* /manager/* pages register here in Feature 7 */}
          </Route>

          {/* HR-only area */}
          <Route element={<RoleRoute roles={['hr_admin']} />}>
            {/* /hr/* pages register here in Features 3-5, 8, 11-12 */}
          </Route>
        </Route>
      </Route>

      {/* Everything else funnels into the app (or /login via the guard) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
