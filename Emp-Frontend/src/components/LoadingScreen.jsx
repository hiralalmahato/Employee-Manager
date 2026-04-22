export default function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-slate-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  )
}
