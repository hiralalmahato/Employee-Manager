import { useEffect, useMemo, useRef, useState } from 'react'
import { attendanceService } from '../services/attendanceService'
import { employeeService } from '../services/employeeService'

const defaultForm = {
  employeeId: '',
  date: '',
  status: 'PRESENT',
  checkInTime: '',
  checkOutTime: '',
  remarks: '',
}

const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const timeSlots = Array.from({ length: (22 - 9 + 1) * 2 }, (_, index) => {
  const totalMinutes = 9 * 60 + index * 30
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const minutes = String(totalMinutes % 60).padStart(2, '0')
  return `${hours}:${minutes}`
})

function formatDisplayDate(value) {
  if (!value) return ''

  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value

  return `${day}-${month}-${year}`
}

function formatTimeDisplay(value) {
  if (!value) return ''

  const [hours, minutes] = value.split(':')
  const hourNumber = Number(hours)
  const suffix = hourNumber >= 12 ? 'PM' : 'AM'
  const displayHour = ((hourNumber + 11) % 12) + 1
  return `${String(displayHour).padStart(2, '0')}:${minutes} ${suffix}`
}

function toDateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getCalendarCells(viewDate) {
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const firstWeekday = firstDayOfMonth.getDay()
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const cells = []

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null)
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
  }

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return cells
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  )
}

function DateField({ value, onChangeDate, placeholder, className = '', placement = 'start', density = 'default' }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    if (!value) {
      const today = new Date()
      return new Date(today.getFullYear(), today.getMonth(), 1)
    }

    const [year, month] = value.split('-')
    return new Date(Number(year), Number(month) - 1, 1)
  })
  const rootRef = useRef(null)

  const controlPadding = density === 'compact' ? 'px-3 py-2 pl-10 text-sm' : 'px-4 py-3 pl-12 text-sm'
  const iconOffset = density === 'compact' ? 'left-3' : 'left-4'
  const popoverWidth = density === 'compact' ? 'w-72 sm:w-80' : 'w-80 sm:w-88'

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (!value) return

    const [year, month] = value.split('-')
    if (year && month) {
      setViewDate(new Date(Number(year), Number(month) - 1, 1))
    }
  }, [value])

  const selectDate = (date) => {
    onChangeDate(toDateValue(date))
    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
    setOpen(false)
  }

  const calendarCells = getCalendarCells(viewDate)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 ${controlPadding} text-white transition hover:border-cyan-400/40 hover:bg-slate-950/80`}
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>{value ? formatDisplayDate(value) : placeholder}</span>
        <span className="text-slate-500">▾</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open date picker"
        className={`absolute ${iconOffset} top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300`}
      >
        <CalendarIcon />
      </button>

      {open ? (
        <div className={`absolute top-[calc(100%+0.65rem)] z-30 ${popoverWidth} max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/40 ${placement === 'end' ? 'right-0' : 'left-0'}`}>
          <div className="mb-3 flex items-center justify-between gap-2 text-white">
            <button
              type="button"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5 hover:text-white"
            >
              Prev
            </button>
            <div className="text-sm font-semibold tracking-wide text-slate-100">
              {monthLabels[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={() => setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5 hover:text-white"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400">
            {dayLabels.map((label) => (
              <div key={label} className="py-1.5">
                {label}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10 rounded-xl" />
              }

              const dateValue = toDateValue(date)
              const isSelected = dateValue === value

              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={`h-9 rounded-xl text-sm transition ${isSelected ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TimeField({ value, onChangeTime, placeholder, className = '', placement = 'start' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const selectTime = (timeValue) => {
    onChangeTime(timeValue)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 pl-12 text-sm text-white transition hover:border-cyan-400/40 hover:bg-slate-950/80"
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>{value ? formatTimeDisplay(value) : placeholder}</span>
        <span className="text-slate-500">▾</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open time picker"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
      >
        <ClockIcon />
      </button>

      {open ? (
        <div className={`absolute top-[calc(100%+0.65rem)] z-30 ${placement === 'end' ? 'right-0' : 'left-0'} w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/40 sm:w-88`}>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Select time</p>
              <p className="text-xs text-slate-500">Choose a clock-in or clock-out time</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:text-white">
              Close
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => {
                const selected = slot === value

                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => selectTime(slot)}
                    className={`rounded-xl px-3 py-2 text-sm transition ${selected ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border border-white/10 text-slate-200 hover:border-cyan-400/40 hover:bg-white/10 hover:text-white'}`}
                  >
                    {formatTimeDisplay(slot)}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function AttendancePage() {
  const [form, setForm] = useState(defaultForm)
  const [employeeId, setEmployeeId] = useState('')
  const [date, setDate] = useState('')
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployees(await employeeService.getAll())
      } catch (exception) {
        setError(exception?.response?.data?.message || 'Unable to load employees for attendance.')
      } finally {
        setInitialLoading(false)
      }
    }

    loadEmployees()
  }, [])

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === form.employeeId),
    [employees, form.employeeId],
  )

  const employeeMap = useMemo(() => new Map(employees.map((employee) => [employee.id, employee])), [employees])

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'employeeId') {
      setForm((current) => ({
        ...current,
        employeeId: value,
      }))
      return
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleMarkAttendance = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await attendanceService.mark(form)
      setMessage('Attendance marked successfully.')
      setForm(defaultForm)
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to mark attendance.')
    } finally {
      setSaving(false)
    }
  }

  const loadRecords = async () => {
    if (!employeeId && !date) {
      setError('Enter an employee ID or a date before loading attendance records.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = employeeId ? await attendanceService.getByEmployee(employeeId) : await attendanceService.getByDate(date)
      setRecords(data)
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to load attendance records.')
    } finally {
      setLoading(false)
    }
  }

  const statusClass = {
    PRESENT: 'bg-emerald-500/15 text-emerald-300',
    ABSENT: 'bg-rose-500/15 text-rose-300',
    HALF_DAY: 'bg-amber-500/15 text-amber-300',
    ON_LEAVE: 'bg-sky-500/15 text-sky-300',
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white">Attendance</h3>
        <p className="text-sm text-slate-400">Mark attendance and filter records by date or employee.</p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleMarkAttendance} className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h4 className="text-lg font-semibold text-white">Mark Attendance</h4>
          {initialLoading ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">Loading employees...</div>
          ) : (
            <select name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} - {employee.employeeCode}
                </option>
              ))}
            </select>
          )}
          {selectedEmployee ? <p className="text-xs text-slate-400">Selected ID: {selectedEmployee.id}</p> : null}
          <DateField value={form.date} onChangeDate={(nextDate) => setForm((current) => ({ ...current, date: nextDate }))} placeholder="Select attendance date" />
          <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
          <div className="grid gap-4 sm:grid-cols-2">
            <TimeField value={form.checkInTime} onChangeTime={(nextTime) => setForm((current) => ({ ...current, checkInTime: nextTime }))} placeholder="Check in time" />
            <TimeField value={form.checkOutTime} onChangeTime={(nextTime) => setForm((current) => ({ ...current, checkOutTime: nextTime }))} placeholder="Check out time" />
          </div>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} placeholder="Remarks" rows="3" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
          <button disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">
            {saving ? 'Saving...' : 'Mark Attendance'}
          </button>
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h4 className="text-lg font-semibold text-white">View Attendance</h4>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_220px]">
            <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white">
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
            <DateField value={date} onChangeDate={setDate} placeholder="Filter by date" placement="end" density="compact" />
          </div>
          <button onClick={loadRecords} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-white">
            Load Records
          </button>

          {loading ? (
            <div className="text-sm text-slate-400">Loading records...</div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{employeeMap.get(record.employeeId)?.fullName || 'Employee'}</p>
                      <p className="text-xs text-slate-400">{employeeMap.get(record.employeeId)?.employeeCode || record.employeeId}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[record.status] || 'bg-slate-500/15 text-slate-300'}`}>
                      {record.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-400">{record.date}</p>
                </div>
              ))}
              {!records.length ? <div className="text-sm text-slate-500">No records loaded yet.</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
