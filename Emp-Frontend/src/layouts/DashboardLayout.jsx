import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useTheme } from '../hooks/useTheme'

export default function DashboardLayout() {
  const { isLight } = useTheme()

  return (
    <div
      className={[
        'flex min-h-screen',
        isLight
          ? 'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] text-slate-900'
          : 'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-slate-100',
      ].join(' ')}
    >
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
