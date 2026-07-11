import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as documentsApi from '../../services/documents'
import * as requestsApi from '../../services/requests'
import type { DocumentType } from '../../types/documents'

/** Submit a new document request; lands in the manager's queue. */
export default function RequestFormPage() {
  const navigate = useNavigate()
  const [types, setTypes] = useState<DocumentType[]>([])
  const [typeId, setTypeId] = useState<number | ''>('')
  const [purpose, setPurpose] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    documentsApi
      .listDocumentTypes()
      .then(setTypes)
      .catch((e) => setError(getApiError(e)))
  }, [])

  const selected = types.find((t) => t.id === typeId)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (typeId === '') return
    setSubmitting(true)
    setError(null)
    try {
      await requestsApi.submitRequest({ document_type_id: typeId, purpose })
      // land on the tracking page so the new "Pending Manager Review" row is visible
      navigate('/requests', { state: { submitted: true } })
    } catch (err) {
      setError(getApiError(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Request a Document"
        subtitle="Your request goes to your manager first, then to HR for verification."
      />

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Document type</label>
          <select
            required
            value={typeId}
            onChange={(e) => setTypeId(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="" disabled>Select a document…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {selected?.description && (
            <p className="mt-1 text-xs text-slate-500">{selected.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Purpose</label>
          <textarea
            required
            minLength={5}
            maxLength={500}
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Visa application at the Japanese embassy"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">{purpose.length}/500 — will appear on the generated document.</p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting || typeId === ''}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit request'}
        </button>
      </form>
    </div>
  )
}
