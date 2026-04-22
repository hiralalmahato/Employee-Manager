import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, ChevronDown, Clock3 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { dashboardService } from '../services/dashboardService'
import { leaveService } from '../services/leaveService'
import { useTheme } from '../hooks/useTheme'

const ADMIN_LAST_SEEN_KEY = 'ems-notifications-last-seen'
const EMPLOYEE_LAST_SEEN_PREFIX = 'ems-employee-notifications-last-seen'

const formatNotificationTime = (value) => {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const toTimestamp = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export default function Topbar() {
  const { user, logout } = useAuth()
  const { isLight } = useTheme()
  const navigate = useNavigate()
  const [openProfileMenu, setOpenProfileMenu] = useState(false)
  const [openNotifications, setOpenNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationError, setNotificationError] = useState('')
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const isPrivileged = user?.role === 'ADMIN' || user?.role === 'HR'
  const isEmployee = user?.role === 'EMPLOYEE'
  const employeeLastSeenKey = `${EMPLOYEE_LAST_SEEN_PREFIX}:${user?.email || 'employee'}`
  const [adminLastSeenAt, setAdminLastSeenAt] = useState(() => Number(window.localStorage.getItem(ADMIN_LAST_SEEN_KEY) || 0))
  const [employeeLastSeenAt, setEmployeeLastSeenAt] = useState(() => Number(window.localStorage.getItem(employeeLastSeenKey) || 0))

  const latestTimestamp = useMemo(() => {
    if (notifications.length === 0) {
      return 0
    }

    return Math.max(...notifications.map((item) => toTimestamp(item.timestamp)))
  }, [notifications])

  const unreadCount = useMemo(
    () => notifications.filter((item) => toTimestamp(item.timestamp) > adminLastSeenAt).length,
    [adminLastSeenAt, notifications],
  )

  const employeeUnreadCount = useMemo(
    () => notifications.filter((item) => toTimestamp(item.timestamp) > employeeLastSeenAt).length,
    [employeeLastSeenAt, notifications],
  )

  useEffect(() => {
    let active = true

    const loadNotifications = async () => {
      if (!isPrivileged && !isEmployee) {
        setNotifications([])
        setNotificationError('')
        setLoadingNotifications(false)
        return
      }

      setLoadingNotifications(true)
      setNotificationError('')

      try {
        if (isPrivileged) {
          const overview = await dashboardService.getOverview()
          if (!active) {
            return
          }

          setNotifications(Array.isArray(overview?.recentActivities) ? overview.recentActivities : [])
          return
        }

        const leaves = await leaveService.getMine()
        if (!active) {
          return
        }

        const entries = (Array.isArray(leaves) ? leaves : [])
          .filter((item) => item.status === 'APPROVED')
          .map((item) => ({
            category: 'Leave',
            title: 'Leave approved',
            details: `Your leave from ${item.fromDate} to ${item.toDate} was approved${item.approvedBy ? ` by ${item.approvedBy}` : ''}.`,
            timestamp: item.updatedAt || item.createdAt || new Date().toISOString(),
          }))
          .sort((left, right) => toTimestamp(right.timestamp) - toTimestamp(left.timestamp))

        setNotifications(entries)
      } catch (error) {
        if (!active) {
          return
        }

        setNotificationError(error?.response?.status === 403 ? 'Notifications are available for admin and HR users only.' : 'Unable to load notifications.')
      } finally {
        if (active) {
          setLoadingNotifications(false)
        }
      }
    }

    loadNotifications()
    const intervalId = window.setInterval(loadNotifications, 15000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [employeeLastSeenKey, isEmployee, isPrivileged])

  useEffect(() => {
    const onClickOutside = (event) => {
      if (!event.target.closest?.('[data-notification-menu]')) {
        setOpenNotifications(false)
      }

      if (!event.target.closest?.('[data-profile-menu]')) {
        setOpenProfileMenu(false)
      }
    }

    document.addEventListener('click', onClickOutside)
    return () => document.removeEventListener('click', onClickOutside)
  }, [])

  const handleOpenNotifications = () => {
    setOpenNotifications((value) => !value)

    if (notifications.length === 0) {
      return
    }

    const newest = latestTimestamp || Date.now()

    if (isPrivileged) {
      setAdminLastSeenAt(newest)
      window.localStorage.setItem(ADMIN_LAST_SEEN_KEY, String(newest))
    }

    if (isEmployee) {
      setEmployeeLastSeenAt(newest)
      window.localStorage.setItem(employeeLastSeenKey, String(newest))
    }
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()

    const trimmedQuery = searchValue.trim()
    if (!trimmedQuery || !isPrivileged) {
      return
    }

    const normalizedQuery = trimmedQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
    const [firstToken = ''] = normalizedQuery.split(' ')

    const routeMatchers = [
      { aliases: ['employee', 'employees', 'staff', 'worker', 'emp'], path: '/employees', preserveQuery: true },
      { aliases: ['attendance', 'present', 'absent', 'clock', 'checkin', 'checkout', 'att', 'at'], path: '/attendance' },
      { aliases: ['department', 'departments', 'team', 'division', 'dept', 'de'], path: '/departments' },
      { aliases: ['leave', 'leaves', 'holiday', 'timeoff', 'time off', 'lv', 'le'], path: '/leaves' },
      { aliases: ['payroll', 'salary', 'pay', 'payslip', 'compensation', 'payrolls', 'payr', 'pa'], path: '/payroll' },
      { aliases: ['setting', 'settings', 'profile', 'preferences', 'sett', 'se'], path: '/settings' },
    ]

    const matchedRoute = routeMatchers.find((entry) => entry.aliases.some((alias) => alias.startsWith(firstToken) || firstToken.startsWith(alias)))

    if (matchedRoute?.preserveQuery) {
      const employeeQuery = normalizedQuery.replace(new RegExp(`^(?:${matchedRoute.aliases.join('|')})\\s*`, 'i'), '').trim()
      navigate(employeeQuery ? `/employees?query=${encodeURIComponent(employeeQuery)}` : matchedRoute.path)
      return
    }

    if (matchedRoute) {
      navigate(matchedRoute.path)
      return
    }

    navigate(`/employees?query=${encodeURIComponent(trimmedQuery)}`)
  }

  return (
    <header className={[
      'relative z-40 flex items-center justify-between gap-4 px-6 py-4 backdrop-blur',
      isLight ? 'border-b border-slate-200 bg-white/85' : 'border-b border-white/10 bg-slate-900/80',
    ].join(' ')}>
      <div>
        <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Welcome back</p>
        <h2 className={`text-xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'Administrator'}</h2>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center justify-center gap-3 px-6">
        <div className={[
          'flex w-full max-w-xl items-center gap-3 rounded-2xl px-4 py-3',
          isLight ? 'border border-slate-200 bg-white text-slate-700 shadow-sm' : 'border border-white/10 bg-white/5 text-slate-300',
        ].join(' ')}>
          <Search size={18} />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={isPrivileged ? 'Search employees, departments, attendance...' : 'Search is available for admin and HR only'}
            className={`w-full bg-transparent text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed ${isLight ? 'text-slate-900 placeholder:text-slate-400' : ''}`}
            disabled={!isPrivileged}
          />
        </div>
      </form>

      <div className="flex items-center gap-3">
        <div className="relative" data-notification-menu>
          <button
            type="button"
            onClick={handleOpenNotifications}
            className={[
              'relative rounded-2xl p-3 transition',
              isLight ? 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50' : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
            ].join(' ')}
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {isPrivileged && unreadCount > 0 ? (
              <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-400 px-1 text-[10px] font-semibold text-slate-950">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            ) : null}
            {isEmployee && employeeUnreadCount > 0 ? (
              <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-400 px-1 text-[10px] font-semibold text-slate-950">
                {employeeUnreadCount > 9 ? '9+' : employeeUnreadCount}
              </span>
            ) : null}
          </button>

          {openNotifications ? (
            <div className={[
              'absolute right-0 top-full z-50 mt-3 w-[24rem] overflow-hidden rounded-3xl shadow-2xl backdrop-blur',
              isLight ? 'border border-slate-200 bg-white text-slate-900 shadow-slate-200/60' : 'border border-white/10 bg-slate-950/95 shadow-cyan-950/30',
            ].join(' ')}>
              <div className={[
                'flex items-center justify-between border-b px-4 py-3',
                isLight ? 'border-slate-200' : 'border-white/10',
              ].join(' ')}>
                <div>
                  <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{isEmployee ? 'Leave notifications' : 'Notifications'}</p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {isEmployee ? 'Approved leave updates for your account' : 'Live updates from dashboard activity'}
                  </p>
                </div>
                {loadingNotifications ? <span className="text-xs text-cyan-300">Syncing...</span> : null}
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {notificationError ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-5 text-sm text-rose-200">
                    {notificationError}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className={isLight ? 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-700' : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300'}>
                    {isEmployee ? 'No leave approvals yet.' : 'No recent notifications yet.'}
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={`${item.category}-${item.title}-${item.timestamp}`} className={[
                      'mb-2 rounded-2xl px-4 py-3 text-sm last:mb-0',
                      isLight ? 'border border-slate-200 bg-slate-50 text-slate-800' : 'border border-white/10 bg-white/5 text-slate-200',
                    ].join(' ')}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.25em] text-cyan-300">{item.category}</div>
                          <div className={`mt-1 font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</div>
                          <div className={`mt-1 text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{item.details}</div>
                        </div>
                        <div className={`flex items-center gap-1 text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          <Clock3 size={12} />
                          <span>{formatNotificationTime(item.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative" data-profile-menu>
          <button
            onClick={() => setOpenProfileMenu((value) => !value)}
            className={[
              'flex items-center gap-3 rounded-2xl px-4 py-2 text-sm transition',
              isLight ? 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50' : 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
            ].join(' ')}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-cyan-400 to-blue-600 font-semibold text-slate-950">
              {user?.name?.slice(0, 1)?.toUpperCase() || 'A'}
            </span>
            <span className="hidden text-left md:block">
              <span className={`block font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'Admin'}</span>
              <span className={`block text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{user?.role || 'ADMIN'}</span>
            </span>
            <ChevronDown size={16} />
          </button>

          {openProfileMenu ? (
            <div className={[
              'absolute right-0 top-full z-50 mt-3 w-44 rounded-2xl p-2 shadow-2xl',
              isLight ? 'border border-slate-200 bg-white shadow-slate-200/60' : 'border border-white/10 bg-slate-950 shadow-cyan-950/30',
            ].join(' ')}>
              <button className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/5'}`}>Profile</button>
              <button className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/5'}`}>Settings</button>
              <button
                onClick={logout}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${isLight ? 'text-rose-600 hover:bg-rose-50' : 'text-rose-300 hover:bg-rose-500/10'}`}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
