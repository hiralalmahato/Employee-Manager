import { useEffect, useState } from 'react'
import { departmentService } from '../services/departmentService'

const defaultForm = {
  name: '',
  description: '',
  managerName: '',
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(defaultForm)

  const loadDepartments = async () => {
    setLoading(true)
    setError('')

    try {
      setDepartments(await departmentService.getAll())
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to load departments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await departmentService.create(form)
      setMessage('Department created successfully.')
      setForm(defaultForm)
      await loadDepartments()
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to create department.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white">Departments</h3>
        <p className="text-sm text-slate-400">Create and maintain organizational departments.</p>
      </div>
      {message ? <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 lg:grid-cols-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Department name" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" required />
        <input name="managerName" value={form.managerName} onChange={handleChange} placeholder="Manager name" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white lg:col-span-1" />
        <button disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">
          {saving ? 'Saving...' : 'Create Department'}
        </button>
      </form>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-slate-300">Loading departments...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <div key={department.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-slate-200">
              <p className="font-medium text-white">{department.name}</p>
              <p className="mt-2 text-sm text-slate-400">{department.description || 'No description provided.'}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Manager: {department.managerName || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
