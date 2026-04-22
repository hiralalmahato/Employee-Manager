import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, BadgeDollarSign, CalendarDays, CheckCircle2, CircleAlert, Clock3, FileText, Mail, Phone, TrendingUp, BriefcaseBusiness } from 'lucide-react'
import { Cell, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const attendanceTone = {
  PRESENT: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  ABSENT: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  HALF_DAY: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  ON_LEAVE: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30',
}

const leaveTone = {
  PENDING: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
}

const dayFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const longDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const currencyFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
})

const parseDate = (value) => {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDate = (value) => {
  const parsed = parseDate(value)
  return parsed ? longDateFormatter.format(parsed) : 'Not available'
}

const formatStatus = (value) => (value ? value.replaceAll('_', ' ') : 'Not available')

const statusClass = (value, scope) => {
  const base = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]'
  if (scope === 'attendance') {
    return `${base} ${attendanceTone[value] || 'bg-slate-500/15 text-slate-600 border-slate-500/20'}`
  }

  return `${base} ${leaveTone[value] || 'bg-slate-500/15 text-slate-600 border-slate-500/20'}`
}

function MiniMetric({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">{label}</p>
          <p className="mt-1 text-lg font-semibold">{value}</p>
        </div>
        <Icon size={16} className="opacity-80" />
      </div>
    </div>
  )
}

function DataRow({ icon: Icon, label, value, isLight }) {
  return (
    <div className={[
      'flex items-center gap-3 rounded-2xl border px-4 py-3',
      isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/40',
    ].join(' ')}>
      <div className={[
        'grid h-10 w-10 place-items-center rounded-2xl',
        isLight ? 'bg-slate-100 text-slate-700' : 'bg-white/5 text-slate-200',
      ].join(' ')}>
        <Icon size={16} />
      </div>
      <div>
        <p className={isLight ? 'text-xs uppercase tracking-[0.18em] text-slate-500' : 'text-xs uppercase tracking-[0.18em] text-slate-400'}>{label}</p>
        <p className={isLight ? 'text-sm font-medium text-slate-900' : 'text-sm font-medium text-white'}>{value}</p>
      </div>
    </div>
  )
}

export default function EmployeeDashboard({ employee, departmentName, attendanceRecords, leaveRecords, isLight, loading, error }) {
  const navigate = useNavigate()

  const sortedAttendance = useMemo(
    () => [...attendanceRecords].filter(Boolean).sort((left, right) => new Date(right.date || right.createdAt || 0) - new Date(left.date || left.createdAt || 0)),
    [attendanceRecords],
  )

  const sortedLeaves = useMemo(
    () => [...leaveRecords].filter(Boolean).sort((left, right) => new Date(right.createdAt || right.fromDate || 0) - new Date(left.createdAt || left.fromDate || 0)),
    [leaveRecords],
  )

  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const currentMonthAttendance = useMemo(
    () => sortedAttendance.filter((record) => {
      const recordDate = parseDate(record.date)
      return recordDate && recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    }),
    [currentMonth, currentYear, sortedAttendance],
  )

  const monthPresent = currentMonthAttendance.filter((record) => record.status === 'PRESENT').length
  const monthAbsent = currentMonthAttendance.filter((record) => record.status === 'ABSENT').length
  const monthHalfDay = currentMonthAttendance.filter((record) => record.status === 'HALF_DAY').length
  const attendanceRate = currentMonthAttendance.length
    ? Math.round(((monthPresent + monthHalfDay * 0.5) / currentMonthAttendance.length) * 100)
    : 0

  const leaveBreakdown = useMemo(
    () =>
      sortedLeaves.reduce(
        (accumulator, record) => {
          const status = record.status || 'PENDING'
          accumulator[status] = (accumulator[status] || 0) + 1
          return accumulator
        },
        { PENDING: 0, APPROVED: 0, REJECTED: 0 },
      ),
    [sortedLeaves],
  )

  const leaveChartData = useMemo(
    () => [
      { name: 'Approved', value: leaveBreakdown.APPROVED || 0 },
      { name: 'Pending', value: leaveBreakdown.PENDING || 0 },
      { name: 'Rejected', value: leaveBreakdown.REJECTED || 0 },
    ].filter((entry) => entry.value > 0),
    [leaveBreakdown],
  )

  const quickFacts = [
    { label: 'Employee code', value: employee?.employeeCode || 'Not assigned' },
    { label: 'Department', value: departmentName || 'Not assigned' },
    { label: 'Joined', value: formatDate(employee?.joiningDate) },
    { label: 'Status', value: formatStatus(employee?.status) },
  ]

  const attendanceTrend = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() - (6 - index))
      date.setHours(0, 0, 0, 0)

      const record = sortedAttendance.find((item) => {
        const recordDate = parseDate(item.date)
        return recordDate && recordDate.toDateString() === date.toDateString()
      })

      const scoreByStatus = {
        PRESENT: 100,
        HALF_DAY: 60,
        ON_LEAVE: 0,
        ABSENT: 0,
      }

      return {
        name: dayFormatter.format(date),
        score: record ? scoreByStatus[record.status] ?? 0 : 0,
      }
    })
  }, [currentDate, sortedAttendance])

  const recentAttendance = sortedAttendance.slice(0, 6)
  const recentLeaves = sortedLeaves.slice(0, 4)
  const salaryLabel = typeof employee?.salary === 'number'
    ? currencyFormatter.format(employee.salary)
    : employee?.salary
      ? String(employee.salary)
      : 'Not shared'

  if (loading && !employee) {
    return (
      <div className={[
        'grid min-h-[50vh] place-items-center rounded-[2rem] border p-8 text-center',
        isLight ? 'border-slate-200 bg-white text-slate-700' : 'border-white/10 bg-white/5 text-slate-200',
      ].join(' ')}>
        <div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error ? <div className={isLight ? 'rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700' : 'rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200'}>{error}</div> : null}

      <section className={[
        'overflow-hidden rounded-[2rem] border p-6 shadow-2xl backdrop-blur',
        isLight ? 'border-slate-200 bg-white text-slate-900 shadow-slate-200/70' : 'border-white/10 bg-slate-950/55 text-slate-100 shadow-cyan-950/20',
      ].join(' ')}>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <div className={[
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
              isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-cyan-400/20 bg-cyan-500/10 text-cyan-300',
            ].join(' ')}>
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_0_4px_rgba(34,211,238,0.18)]" />
              Employee workspace
            </div>

            <div>
              <p className={isLight ? 'text-sm text-slate-500' : 'text-sm text-slate-400'}>Your dashboard at a glance</p>
              <h1 className={`mt-2 text-4xl font-semibold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Welcome, {employee?.fullName || 'Employee'}
              </h1>
              <p className={`mt-3 max-w-2xl text-sm leading-7 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                Track your attendance, review leave activity, and keep your personal work details in one place. This view is focused on your routine, not the admin overview.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MiniMetric label="Attendance rate" value={`${attendanceRate}%`} tone={isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'} icon={TrendingUp} />
              <MiniMetric label="Present days" value={monthPresent} tone={isLight ? 'border-cyan-200 bg-cyan-50 text-cyan-700' : 'border-cyan-400/20 bg-cyan-500/10 text-cyan-300'} icon={CheckCircle2} />
              <MiniMetric label="Leave requests" value={sortedLeaves.length} tone={isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-400/20 bg-amber-500/10 text-amber-300'} icon={FileText} />
              <MiniMetric label="Salary" value={salaryLabel} tone={isLight ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-violet-400/20 bg-violet-500/10 text-violet-300'} icon={BadgeDollarSign} />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/?section=attendance')}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition',
                  isLight ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300',
                ].join(' ')}
              >
                View attendance <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/leaves')}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                  isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                ].join(' ')}
              >
                Manage leaves <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings')}
                className={[
                  'inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition',
                  isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                ].join(' ')}
              >
                Settings <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className={[
            'rounded-[1.75rem] border p-5 shadow-xl',
            isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-white/10 bg-white/5 text-slate-100',
          ].join(' ')}>
            <div className="flex items-center gap-4">
              <div className={[
                'grid h-18 w-18 shrink-0 place-items-center rounded-3xl text-2xl font-semibold',
                isLight ? 'bg-slate-900 text-white' : 'bg-cyan-400 text-slate-950',
              ].join(' ')}>
                {(employee?.fullName || 'E').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className={isLight ? 'text-sm text-slate-500' : 'text-sm text-slate-400'}>Profile snapshot</p>
                <h2 className="text-2xl font-semibold">{employee?.fullName || 'Employee'}</h2>
                <p className={isLight ? 'text-sm text-slate-600' : 'text-sm text-slate-300'}>{employee?.designation || 'Team member'}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickFacts.map((item) => (
                <div key={item.label} className={[
                  'rounded-2xl border px-4 py-3',
                  isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-slate-950/40',
                ].join(' ')}>
                  <p className={isLight ? 'text-xs uppercase tracking-[0.18em] text-slate-500' : 'text-xs uppercase tracking-[0.18em] text-slate-400'}>{item.label}</p>
                  <p className={`mt-2 text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <DataRow icon={Mail} label="Email" value={employee?.email || 'Not shared'} isLight={isLight} />
              <DataRow icon={Phone} label="Phone" value={employee?.phone || 'Not shared'} isLight={isLight} />
              <DataRow icon={CalendarDays} label="Joined on" value={formatDate(employee?.joiningDate)} isLight={isLight} />
              <DataRow icon={BriefcaseBusiness} label="Employment status" value={formatStatus(employee?.status)} isLight={isLight} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MiniMetric label="This month present" value={monthPresent} tone={isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300'} icon={CheckCircle2} />
        <MiniMetric label="This month absent" value={monthAbsent} tone={isLight ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-rose-400/20 bg-rose-500/10 text-rose-300'} icon={CircleAlert} />
        <MiniMetric label="Half-day entries" value={monthHalfDay} tone={isLight ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-amber-400/20 bg-amber-500/10 text-amber-300'} icon={Activity} />
        <MiniMetric label="Approved leaves" value={leaveBreakdown.APPROVED || 0} tone={isLight ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-violet-400/20 bg-violet-500/10 text-violet-300'} icon={FileText} />
      </section>

      <section id="attendance-section" className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Attendance trend</h3>
              <p className="text-sm text-slate-400">Last 7 days of personal attendance.</p>
            </div>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                {!isLight ? <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /> : null}
                <XAxis dataKey="name" stroke={isLight ? '#64748b' : '#94a3b8'} />
                <YAxis domain={[0, 100]} stroke={isLight ? '#64748b' : '#94a3b8'} />
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderColor: isLight ? '#cbd5e1' : '#1e293b', color: isLight ? '#0f172a' : '#e2e8f0' }} />
                <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">Leave status</h3>
          <p className="text-sm text-slate-400">A real breakdown of your requests.</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leaveChartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4}>
                  {leaveChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.name === 'Approved' ? '#34d399' : entry.name === 'Pending' ? '#f59e0b' : '#f43f5e'}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isLight ? '#ffffff' : '#0f172a', borderColor: isLight ? '#cbd5e1' : '#1e293b', color: isLight ? '#0f172a' : '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Pending', value: leaveBreakdown.PENDING || 0 },
              { label: 'Approved', value: leaveBreakdown.APPROVED || 0 },
              { label: 'Rejected', value: leaveBreakdown.REJECTED || 0 },
            ].map((item) => (
              <div key={item.label} className={[
                'rounded-2xl border px-4 py-3 text-center',
                isLight ? 'border-slate-200 bg-slate-50 text-slate-900' : 'border-white/10 bg-slate-950/40 text-slate-100',
              ].join(' ')}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent attendance</h3>
              <p className="text-sm text-slate-400">Latest attendance records pulled from the backend.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {recentAttendance.length === 0 ? (
              <div className={isLight ? 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600' : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300'}>
                No attendance records found yet.
              </div>
            ) : (
              recentAttendance.map((record) => (
                <div key={record.id} className={[
                  'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm',
                  isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-white/10 bg-slate-950/40 text-slate-200',
                ].join(' ')}>
                  <div>
                    <p className="font-medium text-white">{formatDate(record.date)}</p>
                    <p className={isLight ? 'text-sm text-slate-600' : 'text-sm text-slate-300'}>
                      {record.checkInTime || record.checkOutTime ? `Check in ${record.checkInTime || '—'} · Check out ${record.checkOutTime || '—'}` : 'No punch times recorded'}
                    </p>
                  </div>
                  <span className={statusClass(record.status, 'attendance')}>{formatStatus(record.status)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent leave requests</h3>
              <p className="text-sm text-slate-400">Your latest leave history and outcomes.</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {recentLeaves.length === 0 ? (
              <div className={isLight ? 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600' : 'rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300'}>
                No leave requests found yet.
              </div>
            ) : (
              recentLeaves.map((leave) => (
                <div key={leave.id} className={[
                  'rounded-2xl border px-4 py-3 text-sm',
                  isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-white/10 bg-slate-950/40 text-slate-200',
                ].join(' ')}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{formatDate(leave.fromDate)} - {formatDate(leave.toDate)}</p>
                      <p className={isLight ? 'mt-1 text-sm text-slate-600' : 'mt-1 text-sm text-slate-300'}>
                        {leave.reason || 'No reason provided'}
                      </p>
                    </div>
                    <span className={statusClass(leave.status)}>{formatStatus(leave.status)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}