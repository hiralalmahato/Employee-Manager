import { useEffect, useMemo, useRef, useState } from 'react'
import Modal from '../components/Modal'
import { payrollService } from '../services/payrollService'
import { employeeService } from '../services/employeeService'

const defaultForm = {
  employeeId: '',
  month: '',
  grossSalary: '',
  deductions: '',
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

function formatMonthValue(year, monthIndex) {
  return `${monthLabels[monthIndex]} ${year}`
}

function MonthIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  )
}

function MonthField({ value, onChangeMonth, placeholder, className = '' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const [selectedYear, selectedMonthLabel] = useMemo(() => {
    if (!value) {
      const today = new Date()
      return [today.getFullYear(), monthLabels[today.getMonth()]]
    }

    const [monthName, year] = value.split(' ')
    const monthIndex = monthLabels.findIndex((label) => label === monthName)
    return [Number(year), monthIndex >= 0 ? monthLabels[monthIndex] : monthLabels[new Date().getMonth()]]
  }, [value])

  const [viewYear, setViewYear] = useState(selectedYear)

  useEffect(() => {
    setViewYear(selectedYear)
  }, [selectedYear])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const selectMonth = (monthIndex) => {
    onChangeMonth(formatMonthValue(viewYear, monthIndex))
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 pl-12 text-sm text-white transition hover:border-cyan-400/40 hover:bg-slate-950/80"
      >
        <span className={value ? 'text-white' : 'text-slate-500'}>{value || placeholder}</span>
        <span className="text-slate-500">▾</span>
      </button>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open month picker"
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition hover:text-cyan-300"
      >
        <MonthIcon />
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.65rem)] z-30 w-80 max-w-[calc(100vw-2rem)] rounded-3xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/40 sm:w-88">
          <div className="mb-3 flex items-center justify-between gap-2 text-white">
            <button
              type="button"
              onClick={() => setViewYear((current) => current - 1)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5 hover:text-white"
            >
              Prev
            </button>
            <div className="text-sm font-semibold tracking-wide text-slate-100">{viewYear}</div>
            <button
              type="button"
              onClick={() => setViewYear((current) => current + 1)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-white/5 hover:text-white"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {monthLabels.map((label, index) => {
              const isSelected = value === `${label} ${viewYear}`

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => selectMonth(index)}
                  className={`rounded-xl border px-3 py-3 text-sm transition ${isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30' : 'border-white/10 text-slate-200 hover:border-cyan-400/40 hover:bg-white/10 hover:text-white'}`}
                >
                  {label.slice(0, 3)}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function PayrollPage() {
  const [records, setRecords] = useState([])
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(true)
  const [employeeLoading, setEmployeeLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadPayroll = async () => {
    setLoading(true)
    setError('')

    try {
      setRecords(await payrollService.getAll())
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to load payroll records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setEmployees(await employeeService.getAll())
      } catch (exception) {
        setError(exception?.response?.data?.message || 'Unable to load employees for payroll.')
      } finally {
        setEmployeeLoading(false)
      }
    }

    loadEmployees()
    loadPayroll()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const generatePayroll = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await payrollService.generate({
        ...form,
        grossSalary: Number(form.grossSalary),
        deductions: form.deductions ? Number(form.deductions) : 0,
      })
      setMessage('Payroll generated successfully.')
      setForm(defaultForm)
      await loadPayroll()
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to generate payroll.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white">Payroll</h3>
        <p className="text-sm text-slate-400">Generate salary records and open a payslip modal.</p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <form onSubmit={generatePayroll} className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 lg:grid-cols-4">
        {employeeLoading ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400 lg:col-span-4">Loading employees...</div>
        ) : (
          <select name="employeeId" value={form.employeeId} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white lg:col-span-2" required>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName} - {employee.employeeCode}
              </option>
            ))}
          </select>
        )}
        <MonthField value={form.month} onChangeMonth={(month) => setForm((current) => ({ ...current, month }))} placeholder="Select month" />
        <input name="grossSalary" value={form.grossSalary} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Gross salary" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
        <input name="deductions" value={form.deductions} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Deductions" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
        <button disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 lg:col-span-4">
          {saving ? 'Generating...' : 'Generate Payroll'}
        </button>
      </form>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-slate-300">Loading payroll records...</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/40">
          {records.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-white/10 px-5 py-4 last:border-b-0">
              <div>
                <p className="font-medium text-white">{item.employeeName}</p>
                <p className="text-sm text-slate-400">{item.month}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-cyan-300">₹{item.netSalary}</span>
                <button onClick={() => setSelected(item)} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10">
                  Payslip
                </button>
              </div>
            </div>
          ))}
          {!records.length ? <div className="px-5 py-6 text-sm text-slate-500">No payroll records found.</div> : null}
        </div>
      )}

      <Modal open={Boolean(selected)} title="Payslip" onClose={() => setSelected(null)}>
        <div className="space-y-3 text-sm text-slate-300">
          <p>Employee: {selected?.employeeName}</p>
          <p>Period: {selected?.month}</p>
          <p>Gross Pay: {selected?.grossSalary}</p>
          <p>Deductions: {selected?.deductions}</p>
          <p>Net Pay: {selected?.netSalary}</p>
        </div>
      </Modal>
    </div>
  )
}
