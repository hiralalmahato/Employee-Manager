export default function Modal({ title, open, onClose, children }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-cyan-950/30">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-xl bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
