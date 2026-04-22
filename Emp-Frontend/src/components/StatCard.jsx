export default function StatCard({ label, value, tone, caption }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/10 backdrop-blur">
      <div className={`h-1.5 w-20 rounded-full bg-linear-to-r ${tone}`} />
      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <h3 className="mt-2 text-3xl font-semibold text-white">{value}</h3>
      {caption ? <p className="mt-2 text-xs text-slate-500">{caption}</p> : null}
    </article>
  )
}
