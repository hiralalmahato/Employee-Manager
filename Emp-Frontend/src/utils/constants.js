export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  EMPLOYEE: 'EMPLOYEE',
}

export const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Employees', path: '/employees', roles: [ROLES.ADMIN, ROLES.HR] },
  { label: 'Departments', path: '/departments', roles: [ROLES.ADMIN, ROLES.HR] },
  { label: 'Attendance', path: '/attendance' },
  { label: 'Leaves', path: '/leaves' },
  { label: 'Payroll', path: '/payroll', roles: [ROLES.ADMIN, ROLES.HR] },
  { label: 'Settings', path: '/settings' },
]

export const dashboardStats = [
  { label: 'Total Employees', value: '128', tone: 'from-cyan-500 to-sky-600' },
  { label: 'Present Today', value: '112', tone: 'from-emerald-500 to-teal-600' },
  { label: 'Absent Today', value: '16', tone: 'from-rose-500 to-red-600' },
  { label: 'Pending Leaves', value: '9', tone: 'from-amber-500 to-orange-600' },
]
