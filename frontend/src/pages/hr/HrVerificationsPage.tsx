import { useCallback, useEffect, useState } from 'react'
import DecisionModal from '../../components/DecisionModal'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as approvalsApi from '../../services/approvals'
import type { DocumentRequest } from '../../types/requests'

/**
 * Final HR verification. Verifying completes the request (and, from
 * Feature 9 on, triggers PDF generation automatically).
 */
export default function HrVerificationsPage() {
  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [deciding, setDeciding] = useState<{ request: DocumentRequest; action: 'approve' | 'reject' } | null>(null)

  const reload = useCallback(() => {
    setLoading(true)
    approvalsApi
      .hrQueue()
      .then(setRequests)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const handleDecision = async (requestId: number, comments: string) => {
    if (!deciding) return
    const updated = await approvalsApi.hrDecide(requestId, deciding.action, comments)
    setFlash(
      deciding.action === 'approve'
        ? `Request #${updated.id} verified — the document is being prepared.`
        : `Request #${updated.id} rejected and returned to the employee.`,
    )
    reload()
  }

  return (
    <div>
      <PageHeader
        title="HR Verification"
        subtitle="Manager-approved requests awaiting final HR verification."
      />

      {flash && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{flash}</p>}
      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Manager Approval</th>
              <th className="px-4 py-3 text-right">Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nothing awaiting verification.</td></tr>
            )}
            {requests.map((r) => {
              const managerApproval = r.approvals?.find((a) => a.stage === 'manager' && a.action === 'approved')
              return (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">#{r.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{r.employee?.user.name}</p>
                    <p className="text-xs text-slate-400">{r.employee?.employee_code}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.employee?.department.name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.document_type.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {managerApproval
                      ? `${managerApproval.approver.name}, ${new Date(managerApproval.created_at).toLocaleDateString()}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => setDeciding({ request: r, action: 'approve' })}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => setDeciding({ request: r, action: 'reject' })}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <DecisionModal
        request={deciding?.request ?? null}
        action={deciding?.action ?? 'approve'}
        stageLabel={deciding?.action === 'reject' ? 'Reject request' : 'Verify request'}
        onClose={() => setDeciding(null)}
        onSubmit={handleDecision}
      />
    </div>
  )
}
