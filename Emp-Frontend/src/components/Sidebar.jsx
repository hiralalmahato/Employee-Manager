import { NavLink } from 'react-router-dom'
import { navItems, ROLES } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function Sidebar() {
  const { user } = useAuth()
  const { isLight } = useTheme()

  return (
    <aside
      className={[
        'flex h-full w-72 flex-col px-5 py-6 backdrop-blur',
        isLight ? 'border-r border-slate-200 bg-white/90 text-slate-900' : 'border-r border-white/10 bg-slate-950/95 text-slate-100',
      ].join(' ')}
    >
      <div className="mb-8">
        <p className={`text-xs uppercase tracking-[0.35em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>Employee</p>
        <h1 className={`mt-2 text-2xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Management Suite</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems
          .filter((item) => !item.roles || item.roles.includes(user?.role || ROLES.EMPLOYEE))
          .map((item) => (
            <NavLink
              key={item.path}
              to={item.path === '/attendance' && (user?.role || ROLES.EMPLOYEE) === ROLES.EMPLOYEE ? '/?section=attendance' : item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? isLight
                      ? 'bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-400/30'
                      : 'bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <div className={isLight ? 'rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm' : 'rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300'}>
        <p className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Signed in as</p>
        <p>{user?.name || user?.email || 'Employee User'}</p>
        <p className={`mt-2 text-xs uppercase tracking-[0.25em] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>{user?.role || ROLES.EMPLOYEE}</p>
      </div>
    </aside>
  )
}
