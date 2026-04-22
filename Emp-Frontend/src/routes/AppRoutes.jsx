import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import DashboardLayout from '../layouts/DashboardLayout'
import LoginPage from '../pages/LoginPage'
import DashboardPage from '../pages/DashboardPage'
import EmployeesPage from '../pages/EmployeesPage'
import DepartmentsPage from '../pages/DepartmentsPage'
import AttendancePage from '../pages/AttendancePage'
import LeavesPage from '../pages/LeavesPage'
import PayrollPage from '../pages/PayrollPage'
import SettingsPage from '../pages/SettingsPage'
import NotFoundPage from '../pages/NotFoundPage'
import { ROLES } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'

function AttendanceRoute() {
  const { user } = useAuth()

  if (user?.role === ROLES.EMPLOYEE) {
    return <Navigate to="/?section=attendance" replace />
  }

  return <AttendancePage />
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="attendance" element={<AttendanceRoute />} />
            <Route path="leaves" element={<LeavesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.HR]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="payroll" element={<PayrollPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
