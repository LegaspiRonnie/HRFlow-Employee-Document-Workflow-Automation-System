import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import { getApiError } from '../../lib/errors'
import * as approvalsApi from '../../services/approvals'
import type { DocumentRequest } from '../../types/requests'

/** Every request from the manager's team, any status, newest first. */
export default function TeamHistoryPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    approvalsApi
      .managerHistory()
      .then(setRequests)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Team History" subtitle="All document requests from your direct reports." />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Decision</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Your team has not submitted any requests yet.</td></tr>
            )}
            {requests.map((r) => {
              const lastApproval = r.approvals?.[r.approvals.length - 1]
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{r.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.employee?.user.name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.document_type.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} label={r.status_label} /></td>
                  <td className="px-4 py-3 text-slate-500">
                    {lastApproval
                      ? `${lastApproval.action} by ${lastApproval.approver.name}${lastApproval.comments ? ` — “${lastApproval.comments}”` : ''}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
