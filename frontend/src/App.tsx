import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ManagerQueuePage from './pages/manager/ManagerQueuePage'
import TeamHistoryPage from './pages/manager/TeamHistoryPage'
import MyRequestsPage from './pages/requests/MyRequestsPage'
import RequestFormPage from './pages/requests/RequestFormPage'
import DepartmentsPage from './pages/hr/DepartmentsPage'
import EmployeesPage from './pages/hr/EmployeesPage'
import HrVerificationsPage from './pages/hr/HrVerificationsPage'
import PositionsPage from './pages/hr/PositionsPage'
import TemplatesPage from './pages/hr/TemplatesPage'

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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/requests" element={<MyRequestsPage />} />
          <Route path="/requests/new" element={<RequestFormPage />} />

          {/* Manager area (HR admins may also review team requests) */}
          <Route element={<RoleRoute roles={['manager', 'hr_admin']} />}>
            <Route path="/manager/queue" element={<ManagerQueuePage />} />
            <Route path="/manager/history" element={<TeamHistoryPage />} />
          </Route>

          {/* HR-only area */}
          <Route element={<RoleRoute roles={['hr_admin']} />}>
            <Route path="/hr/verifications" element={<HrVerificationsPage />} />
            <Route path="/hr/employees" element={<EmployeesPage />} />
            <Route path="/hr/departments" element={<DepartmentsPage />} />
            <Route path="/hr/positions" element={<PositionsPage />} />
            <Route path="/hr/templates" element={<TemplatesPage />} />
          </Route>
        </Route>
      </Route>

      {/* Everything else funnels into the app (or /login via the guard) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
