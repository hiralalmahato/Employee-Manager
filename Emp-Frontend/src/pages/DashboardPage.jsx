import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import StatCard from '../components/StatCard'
import EmployeeDashboard from '../components/EmployeeDashboard'
import { dashboardService } from '../services/dashboardService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { employeeService } from '../services/employeeService'
import { departmentService } from '../services/departmentService'
import { attendanceService } from '../services/attendanceService'
import { leaveService } from '../services/leaveService'
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

const departmentColors = ['#22d3ee', '#38bdf8', '#60a5fa', '#f59e0b', '#34d399', '#f97316']

const activityTone = {
  Employee: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-100',
  Attendance: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  Leave: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  Payroll: 'border-violet-500/30 bg-violet-500/10 text-violet-100',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { isLight } = useTheme()
  const [searchParams] = useSearchParams()
  const [employee, setEmployee] = useState(null)
  const [departmentName, setDepartmentName] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [leaveRecords, setLeaveRecords] = useState([])
  const [overview, setOverview] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isEmployee = user?.role === 'EMPLOYEE'
  const requestedSection = searchParams.get('section')

  useEffect(() => {
    let mounted = true

    const loadEmployeeWorkspace = async () => {
      setLoading(true)
      setError('')

      try {
        const profile = await employeeService.getMe()
        if (!mounted) {
          return
        }

        const [attendanceData, leaveData] = await Promise.all([
          attendanceService.getByEmployee(profile.id),
          leaveService.getMine(),
        ])

        const departments = await departmentService.getAll()

        if (!mounted) {
          return
        }

        setEmployee(profile)
        setDepartmentName(
          (Array.isArray(departments) ? departments : []).find((department) => department.id === profile.departmentId)?.name || profile.departmentId || 'Not assigned',
        )
        setAttendanceRecords(Array.isArray(attendanceData) ? attendanceData : [])
        setLeaveRecords(Array.isArray(leaveData) ? leaveData : [])
      } catch (exception) {
        if (mounted) {
          setError(exception?.response?.data?.message || 'Unable to load your employee dashboard.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const loadOverview = async () => {
      if (isEmployee) {
        await loadEmployeeWorkspace()
        return
      }

      setLoading(true)
      setError('')

      try {
        const data = await dashboardService.getOverview()
        if (mounted) {
          setOverview(data)
        }
      } catch (exception) {
        if (mounted) {
          setError(exception?.response?.data?.message || 'Unable to load dashboard overview.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadOverview()

    return () => {
      mounted = false
    }
  }, [isEmployee])

  useEffect(() => {
    if (!isEmployee || loading || requestedSection !== 'attendance') {
      return
    }

    const target = window.document.getElementById('attendance-section')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [isEmployee, loading, requestedSection])

  const stats = [
    { label: 'Total Employees', value: overview.totalEmployees ?? 0, tone: 'from-cyan-500 to-sky-600' },
    { label: 'Present Today', value: overview.presentToday ?? 0, tone: 'from-emerald-500 to-teal-600' },
    { label: 'Absent Today', value: overview.absentToday ?? 0, tone: 'from-rose-500 to-red-600' },
    { label: 'Pending Leaves', value: overview.pendingLeaves ?? 0, tone: 'from-amber-500 to-orange-600' },
  ]

  const attendanceTrend = overview.attendanceTrend ?? []
  const leaveTrend = overview.leaveTrend ?? []
  const departmentMix = overview.departmentMix ?? []
  const recentActivities = overview.recentActivities ?? []

  if (isEmployee) {
    return (
      <EmployeeDashboard
        employee={employee}
        departmentName={departmentName}
        attendanceRecords={attendanceRecords}
        leaveRecords={leaveRecords}
        isLight={isLight}
        loading={loading}
        error={error}
      />
    )
  }

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} caption={loading ? 'Loading live data...' : isEmployee ? 'Employee view' : 'Synced from backend'} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Attendance Trend</h3>
              <p className="text-sm text-slate-400">Live attendance counts for the last 7 days.</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                {!isLight ? <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /> : null}
                <XAxis dataKey="name" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip />
                <Bar dataKey="present" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">Leave Load</h3>
          <p className="text-sm text-slate-400">Line chart for monthly leave requests.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leaveTrend}>
                {!isLight ? <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /> : null}
                <XAxis dataKey="month" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip />
                <Line type="monotone" dataKey="leaves" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">Department Mix</h3>
          <p className="text-sm text-slate-400">Employee distribution by department.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {departmentMix.map((entry, index) => (
                    <Cell key={entry.name} fill={departmentColors[index % departmentColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
            {departmentMix.map((entry, index) => (
              <div
                key={entry.name}
                className="flex aspect-square w-full min-h-[140px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 px-2 py-2 text-center shadow-inner shadow-black/10"
              >
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: departmentColors[index % departmentColors.length] }} />
                <div className="max-w-full px-1 text-xs font-medium leading-tight text-white break-words">
                  {entry.name}
                </div>
                <div className="text-2xl font-semibold leading-none tracking-tight text-white">
                  {entry.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <p className="text-sm text-slate-400">Latest employee, attendance, leave, and payroll events.</p>
          <div className="mt-4 space-y-3">
            {recentActivities.map((item) => (
              <div
                key={`${item.category}-${item.title}-${item.timestamp}`}
                className={`rounded-2xl border px-4 py-3 text-sm backdrop-blur-sm ${activityTone[item.category] ?? 'border-white/10 bg-slate-950/40 text-slate-300'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.category}</div>
                    <div className="mt-1 font-medium text-white">{item.title}</div>
                    <div className="mt-1 text-slate-300">{item.details}</div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-slate-400">
                    {new Date(item.timestamp).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
