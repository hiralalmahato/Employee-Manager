import { useEffect, useMemo, useState } from 'react'
import { leaveService } from '../services/leaveService'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { employeeService } from '../services/employeeService'
import { ROLES } from '../utils/constants'

const requestDefaults = {
  employeeId: '',
  employeeName: '',
  fromDate: '',
  toDate: '',
  reason: '',
}

export default function LeavesPage() {
  const { user } = useAuth()
  const { isLight } = useTheme()
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [form, setForm] = useState(requestDefaults)
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [employeeLoading, setEmployeeLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isEmployee = user?.role === ROLES.EMPLOYEE
  const isApprover = user?.role === ROLES.ADMIN || user?.role === ROLES.HR

  useEffect(() => {
    const loadCurrentEmployee = async () => {
      if (!isEmployee) {
        setEmployeeLoading(false)
        return
      }

      try {
        const employee = await employeeService.getMe()
        setCurrentEmployee(employee)
        setForm((current) => ({
          ...current,
          employeeId: employee.id,
          employeeName: employee.fullName,
        }))
      } catch (exception) {
        setError(exception?.response?.data?.message || 'Unable to load your employee profile.')
      } finally {
        setEmployeeLoading(false)
      }
    }

    loadCurrentEmployee()
  }, [])

  const loadLeaves = async () => {
    setLoading(true)
    setError('')

    try {
      setLeaves(isEmployee ? await leaveService.getMine() : await leaveService.getAll())
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to load leave requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaves()
  }, [])

  const visibleLeaves = useMemo(
    () =>
      [...leaves]
        .filter(Boolean)
        .sort((left, right) => new Date(right.updatedAt || right.createdAt || right.fromDate || 0) - new Date(left.updatedAt || left.createdAt || left.fromDate || 0)),
    [leaves],
  )

  const getStatusClasses = (status) => {
    switch (status) {
      case 'APPROVED':
        return isLight
          ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200'
          : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/20'
      case 'REJECTED':
        return isLight
          ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-200'
          : 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20'
      default:
        return isLight
          ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200'
          : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/20'
    }
  }

  const approveButtonClass = isLight
    ? 'rounded-xl border border-emerald-600 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:text-white/80'
    : 'rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60'

  const rejectButtonClass = isLight
    ? 'rounded-xl border border-rose-600 bg-rose-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:border-rose-300 disabled:bg-rose-300 disabled:text-white/80'
    : 'rounded-xl border border-rose-500/30 bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60'

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitLeave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await leaveService.apply(form)
      setMessage('Leave request submitted successfully.')
      setForm({
        ...requestDefaults,
        employeeId: currentEmployee?.id || form.employeeId,
        employeeName: currentEmployee?.fullName || form.employeeName,
      })
      await loadLeaves()
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to apply for leave.')
    } finally {
      setSaving(false)
    }
  }

  const actionLeave = async (id, action) => {
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = { approvedBy: user?.fullName || user?.name || user?.email || 'Admin', remarks: action === 'approve' ? 'Approved from dashboard' : 'Rejected from dashboard' }
      await leaveService[action === 'approve' ? 'approve' : 'reject'](id, payload)
      setMessage(`Leave request ${action}d successfully.`)
      await loadLeaves()
    } catch (exception) {
      setError(exception?.response?.data?.message || `Unable to ${action} leave.`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white">Leaves</h3>
        <p className="text-sm text-slate-400">
          {isEmployee ? 'Submit your leave request and track your own entries.' : 'Review and manage leave requests submitted by employees.'}
        </p>
      </div>

      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <div className={`grid gap-6 ${isEmployee ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {isEmployee ? (
          <form onSubmit={submitLeave} className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
            <h4 className="text-lg font-semibold text-white">Apply Leave</h4>
            {employeeLoading ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-400">Loading your employee profile...</div>
            ) : (
              <>
                <input value={currentEmployee?.fullName || form.employeeName} readOnly className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-300" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input name="fromDate" value={form.fromDate} onChange={handleChange} type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
                  <input name="toDate" value={form.toDate} onChange={handleChange} type="date" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
                </div>
                <textarea name="reason" value={form.reason} onChange={handleChange} placeholder="Reason" rows="4" className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
                <button disabled={saving || !form.employeeId} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Submitting...' : 'Submit Leave'}
                </button>
              </>
            )}
          </form>
        ) : null}

        <div className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5">
          <h4 className="text-lg font-semibold text-white">{isEmployee ? 'My Leave Requests' : 'Leave Requests'}</h4>
          {loading ? (
            <div className="text-sm text-slate-400">Loading leave requests...</div>
          ) : (
            <div className="space-y-3">
              {visibleLeaves.map((leave) => (
                <div key={leave.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{leave.employeeName}</p>
                      <p className="text-slate-400">{leave.fromDate} to {leave.toDate}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-400">{leave.reason}</p>
                  {isApprover ? (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => actionLeave(leave.id, 'approve')} disabled={saving} className={approveButtonClass}>
                        Approve
                      </button>
                      <button onClick={() => actionLeave(leave.id, 'reject')} disabled={saving} className={rejectButtonClass}>
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
              {!visibleLeaves.length ? <div className="text-sm text-slate-500">No leave requests found.</div> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
