import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowRight, CalendarClock, Eye, EyeOff, LoaderCircle, Sparkles, ShieldCheck, Users } from 'lucide-react'

const featuredItems = [
  {
    icon: Users,
    title: 'People operations',
    text: 'Records, departments, access.',
  },
  {
    icon: CalendarClock,
    title: 'Attendance and leave',
    text: 'Approvals and daily activity.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-aware access',
    text: 'Separated by role.',
  },
]

function FeatureCard({ icon, title, text }) {
  const Icon = icon

  return (
    <article className="group rounded-xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_40px_rgba(2,8,23,0.24)] transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/7 hover:shadow-[0_18px_50px_rgba(8,145,178,0.15)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-cyan-400/20 to-blue-500/20 text-cyan-200 ring-1 ring-white/10">
        <Icon size={19} />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
    </article>
  )
}

function LoginForm({ form, loading, error, showPassword, onChange, onSubmit, onTogglePassword }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Sign in</h2>
        <p className="mt-3 text-sm leading-6 text-gray-400 sm:text-base">Use your account credentials to continue.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-300">Email address</span>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-300">Password</span>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30">
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="rounded-md p-1.5 text-gray-400 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 text-sm text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-slate-950/70 text-blue-500 focus:ring-2 focus:ring-blue-500/30"
          />
          <span>Remember me</span>
        </label>

        <button type="button" className="text-left font-medium text-cyan-300 transition-colors duration-200 hover:text-cyan-200">
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-950/40 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Login
            <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </>
        )}
      </button>

    </form>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ email: 'admin@ems.com', password: 'Password@123' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (exception) {
      setError(exception?.response?.data?.message || 'Unable to sign in. Check your credentials.')
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_26%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] px-4 py-6 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-40 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.18),transparent_20%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl items-center">
        <main className="grid w-full overflow-hidden rounded-4xl border border-white/10 bg-slate-950/75 shadow-[0_30px_100px_rgba(2,8,23,0.55)] backdrop-blur-xl lg:grid-cols-[1.12fr_0.88fr]">
          <section className="relative flex flex-col justify-between gap-10 overflow-hidden border-b border-white/10 p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-14">
            <div className="absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                <Sparkles size={14} />
                Emp Manager
              </div>

              <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Manage your team with a clean, focused dashboard.
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-gray-400 sm:text-base">
                Attendance, leave, payroll, departments, and employee records in one secure place.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {featuredItems.map((item) => (
                  <FeatureCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
                ))}
              </div>
            </div>

          </section>

          <section className="flex items-center justify-center p-8 sm:p-10 lg:p-14">
            <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,8,23,0.45)] backdrop-blur-xl sm:p-8">
              <LoginForm
                form={form}
                loading={loading}
                error={error}
                showPassword={showPassword}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onTogglePassword={() => setShowPassword((value) => !value)}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
