import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as auditApi from '../../services/audit'
import type { AuditLogEntry } from '../../services/audit'

/** HR viewer over the append-only audit trail with prefix/date filters. */
export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [action, setAction] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const load = useCallback((page = 1, filters?: { action: string; dateFrom: string; dateTo: string }) => {
    setLoading(true)
    const f = filters ?? { action, dateFrom, dateTo }
    auditApi
      .listAuditLogs({
        page,
        action: f.action || undefined,
        date_from: f.dateFrom || undefined,
        date_to: f.dateTo || undefined,
      })
      .then((res) => {
        setLogs(res.data)
        setMeta(res.meta)
      })
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, dateFrom, dateTo])

  useEffect(() => {
    load(1, { action: '', dateFrom: '', dateTo: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilter = (e: FormEvent) => {
    e.preventDefault()
    load(1)
  }

  const inputCls =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Every sensitive action, permanently recorded." />

      <form onSubmit={handleFilter} className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-xs text-slate-500">Action prefix</label>
          <input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. request. or auth."
            className={`${inputCls} w-52`}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-slate-500">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
        </div>
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          Filter
        </button>
      </form>

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && logs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No log entries match the filters.</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 align-top">
                <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-700">{log.user?.name ?? 'system'}</td>
                <td className="px-4 py-2.5 text-slate-500">
                  {log.subject_type ? `${log.subject_type} #${log.subject_id}` : '—'}
                </td>
                <td className="px-4 py-2.5 max-w-64 truncate font-mono text-xs text-slate-400" title={log.details ? JSON.stringify(log.details) : ''}>
                  {log.details ? JSON.stringify(log.details) : '—'}
                </td>
                <td className="px-4 py-2.5 text-slate-400">{log.ip_address ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* pager */}
      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
        <span>{meta.total} entries</span>
        <div className="space-x-2">
          <button
            disabled={meta.current_page <= 1}
            onClick={() => load(meta.current_page - 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            Page {meta.current_page} / {meta.last_page}
          </span>
          <button
            disabled={meta.current_page >= meta.last_page}
            onClick={() => load(meta.current_page + 1)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}
