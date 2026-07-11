import { useState } from 'react'
import type { FormEvent } from 'react'
import Modal from './Modal'
import { getApiError } from '../lib/errors'
import type { DocumentRequest } from '../types/requests'

/**
 * Approve/reject dialog shared by the manager queue and HR verification
 * pages. Comments are optional on approve, required on reject (the
 * backend enforces the same rule).
 */
export default function DecisionModal({
  request,
  action,
  stageLabel,
  onClose,
  onSubmit,
}: {
  request: DocumentRequest | null
  action: 'approve' | 'reject'
  stageLabel: string // e.g. "Approve request" / "Verify request"
  onClose: () => void
  onSubmit: (requestId: number, comments: string) => Promise<void>
}) {
  const [comments, setComments] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!request) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit(request.id, comments)
      setComments('')
      onClose()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const isReject = action === 'reject'

  return (
    <Modal
      open={request !== null}
      title={request ? `${stageLabel} — #${request.id} ${request.document_type.name}` : ''}
      onClose={() => {
        setComments('')
        setError(null)
        onClose()
      }}
    >
      {request && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-700">{request.employee?.user.name}</p>
            <p className="text-slate-500">Purpose: {request.purpose}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Comments {isReject ? '(required)' : '(optional)'}
            </label>
            <textarea
              required={isReject}
              rows={3}
              maxLength={500}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={isReject ? 'Explain why this request is rejected…' : 'Any note for the record…'}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                isReject ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Submitting…' : isReject ? 'Reject request' : 'Confirm'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
