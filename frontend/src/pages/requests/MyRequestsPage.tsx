import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import StatusBadge from '../../components/StatusBadge'
import WorkflowSteps from '../../components/WorkflowSteps'
import { getApiError } from '../../lib/errors'
import * as documentsApi from '../../services/documents'
import * as requestsApi from '../../services/requests'
import type { DocumentRequest } from '../../types/requests'

/** Track own requests: status badges + workflow stepper + decision trail. */
export default function MyRequestsPage() {
  const location = useLocation()
  const justSubmitted = Boolean((location.state as { submitted?: boolean } | null)?.submitted)

  const [requests, setRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)
  const [selected, setSelected] = useState<DocumentRequest | null>(null)

  useEffect(() => {
    requestsApi
      .listMyRequests()
      .then(setRequests)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  const handleDownload = async (r: DocumentRequest) => {
    if (!r.generated_document) return
    try {
      await documentsApi.downloadDocument(
        r.generated_document.id,
        `${r.generated_document.document_number}.pdf`,
      )
    } catch (err) {
      window.alert(getApiError(err))
    }
  }

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Track each request through manager review and HR verification."
        action={
          <Link to="/requests/new" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            + New Request
          </Link>
        }
      />

      {justSubmitted && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Request submitted — it is now pending your manager's review.
        </p>
      )}
      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Purpose</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No requests yet — <Link to="/requests/new" className="text-indigo-600 hover:underline">submit your first one</Link>.
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">#{r.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{r.document_type.name}</td>
                <td className="px-4 py-3 max-w-56 truncate text-slate-500" title={r.purpose}>{r.purpose}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} label={r.status_label} /></td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                  {r.generated_document && (
                    <button
                      onClick={() => handleDownload(r)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Download PDF
                    </button>
                  )}
                  <button onClick={() => setSelected(r)} className="text-indigo-600 hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={selected !== null}
        title={selected ? `Request #${selected.id} — ${selected.document_type.name}` : ''}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <div className="space-y-5">
            <div className="flex justify-center py-2">
              <WorkflowSteps status={selected.status} />
            </div>

            <div className="text-sm">
              <p className="text-xs uppercase tracking-wide text-slate-400">Purpose</p>
              <p className="mt-1 text-slate-700">{selected.purpose}</p>
            </div>

            {selected.approvals && selected.approvals.length > 0 && (
              <div className="text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">Decision trail</p>
                <ul className="mt-2 space-y-2">
                  {selected.approvals.map((a) => (
                    <li key={a.id} className="rounded-lg border border-slate-200 p-3">
                      <p className="font-medium text-slate-700">
                        {a.stage === 'manager' ? 'Manager' : 'HR'} {a.action} — {a.approver.name}
                      </p>
                      {a.comments && <p className="mt-1 text-slate-500">“{a.comments}”</p>}
                      <p className="mt-1 text-xs text-slate-400">{new Date(a.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selected.generated_document && (
              <div className="rounded-lg bg-green-50 p-3 text-sm">
                <p className="font-medium text-green-800">
                  Document {selected.generated_document.document_number} (v{selected.generated_document.version}) is ready
                </p>
                <p className="text-xs text-green-600">
                  Valid until {selected.generated_document.expires_at ?? '—'}
                </p>
                <button
                  onClick={() => handleDownload(selected)}
                  className="mt-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Download PDF
                </button>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Submitted {new Date(selected.created_at).toLocaleString()} · Last update{' '}
              {new Date(selected.updated_at).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
