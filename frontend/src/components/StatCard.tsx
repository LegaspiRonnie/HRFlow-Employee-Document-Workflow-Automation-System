/** Headline number tile used on every dashboard. */
export default function StatCard({
  label,
  value,
  accent = 'text-slate-800',
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}
