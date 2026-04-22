import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Modal from '../components/Modal'
import { employeeService } from '../services/employeeService'
import { departmentService } from '../services/departmentService'
import { leaveService } from '../services/leaveService'

const defaultForm = {
  fullName: '',
  email: '',
  phone: '',
  departmentId: '',
  designation: '',
  joiningDate: '',
  salary: '',
  status: 'ACTIVE',
  role: 'EMPLOYEE',
  profileImageUrl: '',
}

const statusLabel = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On Leave',
  INACTIVE: 'Inactive',
  PROBATION: 'Probation',
}

const statusClass = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300',
  ON_LEAVE: 'bg-amber-500/15 text-amber-300',
  INACTIVE: 'bg-rose-500/15 text-rose-300',
  PROBATION: 'bg-sky-500/15 text-sky-300',
}

const toDateKey = (value) => {
  if (!value) {
    return ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

export default function EmployeesPage() {
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [generatedCredentials, setGeneratedCredentials] = useState(null)

  const pageSize = 5
  const initialQuery = searchParams.get('query') || ''

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [employeeData, departmentData, leaveData] = await Promise.all([
        employeeService.getAll(),
        departmentService.getAll(),
        leaveService.getAll(),
      ])

      setEmployees(employeeData)
      setDepartments(departmentData)
      setLeaveRequests(leaveData)
      setCurrentPage(1)
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to load employee data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const refreshOnFocus = () => {
      loadData()
    }

    window.addEventListener('focus', refreshOnFocus)
    const intervalId = window.setInterval(loadData, 15000)

    return () => {
      window.removeEventListener('focus', refreshOnFocus)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    setSearch(initialQuery)
  }, [initialQuery])

  const departmentNameById = useMemo(() => {
    return Object.fromEntries(departments.map((department) => [department.id, department.name]))
  }, [departments])

  const displayEmployees = useMemo(() => {
    const todayKey = toDateKey(new Date())

    return employees.map((employee) => {
      const isOnApprovedLeaveToday = leaveRequests.some((leave) => {
        if (leave.employeeId !== employee.id || leave.status !== 'APPROVED') {
          return false
        }

        return todayKey && leave.fromDate && leave.toDate && todayKey >= leave.fromDate && todayKey <= leave.toDate
      })

      return isOnApprovedLeaveToday ? { ...employee, status: 'ON_LEAVE' } : employee
    })
  }, [employees, leaveRequests])

  const filtered = useMemo(
    () =>
      displayEmployees.filter((employee) => {
        const departmentName = departmentNameById[employee.departmentId] || ''
        const searchTerm = search.toLowerCase()
        const matchesSearch =
          employee.fullName.toLowerCase().includes(searchTerm) ||
          employee.email.toLowerCase().includes(searchTerm) ||
          employee.designation.toLowerCase().includes(searchTerm) ||
          departmentName.toLowerCase().includes(searchTerm)
        const matchesDepartment = departmentFilter ? employee.departmentId === departmentFilter : true
        return matchesSearch && matchesDepartment
      }),
    [displayEmployees, search, departmentFilter, departmentNameById],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedEmployees = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, departmentFilter])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
    setForm({ ...defaultForm, departmentId: departments[0]?.id || '' })
    setMessage('')
    setError('')
    setGeneratedCredentials(null)
  }

  const openEdit = (employee) => {
    const sourceEmployee = employees.find((item) => item.id === employee.id) || employee

    setEditing(sourceEmployee)
    setShowForm(true)
    setForm({
      fullName: sourceEmployee.fullName || '',
      email: sourceEmployee.email || '',
      phone: sourceEmployee.phone || '',
      departmentId: sourceEmployee.departmentId || departments[0]?.id || '',
      designation: sourceEmployee.designation || '',
      joiningDate: sourceEmployee.joiningDate || '',
      salary: sourceEmployee.salary ?? '',
      status: sourceEmployee.status || 'ACTIVE',
      role: sourceEmployee.role || 'EMPLOYEE',
      profileImageUrl: sourceEmployee.profileImageUrl || '',
    })
    setSelected(null)
    setMessage('')
    setError('')
    setGeneratedCredentials(null)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitEmployee = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    if (!form.departmentId) {
      setError('Please select a department before creating the employee.')
      setSaving(false)
      return
    }

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      departmentId: form.departmentId,
      designation: form.designation.trim(),
      joiningDate: form.joiningDate || null,
      salary: Number(form.salary),
      status: form.status,
      role: form.role,
      profileImageUrl: form.profileImageUrl.trim(),
    }

    if (editing) {
      payload.email = form.email.trim()
    }

    try {
      if (editing) {
        await employeeService.update(editing.id, payload)
        setMessage('Employee updated successfully.')
        setGeneratedCredentials(null)
      } else {
        const response = await employeeService.create(payload)
        setMessage('Employee created successfully.')
        setGeneratedCredentials({
          employeeName: response?.employee?.fullName || form.fullName,
          email: response?.generatedEmail,
          password: response?.generatedPassword,
        })
      }

      setForm(defaultForm)
      setEditing(null)
      setShowForm(false)
      await loadData()
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to save employee.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this employee?')
    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await employeeService.remove(id)
      setMessage('Employee deleted successfully.')
      setSelected(null)
      await loadData()
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to delete employee.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
      {generatedCredentials ? (
        <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/10 p-5 text-sm text-cyan-100">
          <p className="font-semibold text-white">Generated login credentials</p>
          <p className="mt-2">Employee: {generatedCredentials.employeeName}</p>
          <p>Email: {generatedCredentials.email}</p>
          <p>Password: {generatedCredentials.password}</p>
          <p className="mt-2 text-cyan-200">Share these credentials with the employee so they can sign in to the employee interface.</p>
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Employees</h3>
          <p className="text-sm text-slate-400">Search, filter, paginate, and manage employee records.</p>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search employee, designation, department"
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <select
            value={departmentFilter}
            onChange={(event) => setDepartmentFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <button onClick={openCreate} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">
            Add Employee
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-slate-300">Loading employees...</div>
      ) : (
        <>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Designation</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedEmployees.length ? (
                  paginatedEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-white/5">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{employee.fullName}</p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                      </td>
                      <td className="px-5 py-4">{departmentNameById[employee.departmentId] || employee.departmentId}</td>
                      <td className="px-5 py-4">{employee.designation}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[employee.status] || 'bg-slate-500/15 text-slate-300'}`}>
                          {statusLabel[employee.status] || employee.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setSelected(employee)} className="rounded-xl bg-white/5 px-3 py-2 text-xs text-white hover:bg-white/10">
                            View
                          </button>
                          <button onClick={() => openEdit(employee)} className="rounded-xl bg-cyan-500/15 px-3 py-2 text-xs text-cyan-300 hover:bg-cyan-500/25">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(employee.id)} className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/25" disabled={saving}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-400">
            <p>
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                className="rounded-xl border border-white/10 px-3 py-2 text-white disabled:opacity-40"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                className="rounded-xl border border-white/10 px-3 py-2 text-white disabled:opacity-40"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Modal open={Boolean(selected)} title={selected?.name || 'Employee'} onClose={() => setSelected(null)}>
        <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Department: {departmentNameById[selected?.departmentId] || selected?.departmentId}</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Designation: {selected?.designation}</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Status: {statusLabel[selected?.status] || selected?.status}</div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Employee Code: {selected?.employeeCode}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => openEdit(selected)} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Edit Employee
          </button>
          <button onClick={() => handleDelete(selected?.id)} className="rounded-xl border border-rose-500/30 px-4 py-2 text-sm text-rose-200">
            Delete Employee
          </button>
        </div>
      </Modal>

      <Modal open={showForm} title={editing ? 'Edit Employee' : 'Add Employee'} onClose={() => { setEditing(null); setShowForm(false); setForm(defaultForm); }}>
        <form onSubmit={submitEmployee} className="grid gap-4 sm:grid-cols-2">
          <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full name" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
          {editing ? (
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="Login email" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
          ) : (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 sm:col-span-2">
              Login email and password will be generated automatically after creation.
            </div>
          )}
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
          <select name="departmentId" value={form.departmentId} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required>
            <option value="">Select department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>{department.name}</option>
            ))}
          </select>
          <input name="designation" value={form.designation} onChange={handleChange} placeholder="Designation" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
          <input name="joiningDate" value={form.joiningDate} onChange={handleChange} type="date" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
          <input name="salary" value={form.salary} onChange={handleChange} type="number" min="0" step="0.01" placeholder="Salary" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
          <select name="status" value={form.status} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PROBATION">Probation</option>
          </select>
          <select name="role" value={form.role} onChange={handleChange} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white">
            <option value="EMPLOYEE">Employee</option>
            <option value="HR">HR</option>
            <option value="ADMIN">Admin</option>
          </select>
          <input name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} placeholder="Profile image URL" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white sm:col-span-2" />
          <button disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 sm:col-span-2">
            {saving ? 'Saving...' : editing ? 'Update Employee' : 'Create Employee'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
