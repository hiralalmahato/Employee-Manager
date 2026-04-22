import { useTheme } from '../hooks/useTheme'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const options = [
    {
      id: 'dark',
      label: 'Dark mode',
      description: 'Best for low-light work and long sessions.',
    },
    {
      id: 'light',
      label: 'Light mode',
      description: 'A brighter interface with a cleaner look.',
    },
  ]

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div>
        <h3 className="text-xl font-semibold text-white">Settings</h3>
        <p className="text-sm text-slate-400">Theme, profile, and notification preferences.</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-white">Appearance</h4>
            <p className="text-sm text-slate-400">Switch between light and dark mode for the whole app.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
            Current: {theme}
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {options.map((option) => {
            const selected = theme === option.id

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={`rounded-3xl border p-5 text-left transition ${selected ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg shadow-cyan-950/20' : 'border-white/10 bg-slate-950/40 hover:border-cyan-400/30 hover:bg-white/5'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{option.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border ${selected ? 'border-cyan-300 bg-cyan-400' : 'border-slate-500 bg-transparent'}`} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {['Profile image upload', 'Email notifications', 'Role-based access'].map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-slate-200">
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}
