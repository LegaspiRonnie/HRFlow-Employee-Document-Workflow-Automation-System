import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as documentsApi from '../../services/documents'
import type { DocumentType } from '../../types/documents'
import { TEMPLATE_PLACEHOLDERS } from '../../types/documents'

/**
 * HR template manager: one editable HTML template per document type.
 * Placeholders like {{employee_name}} are substituted at PDF time.
 */
export default function TemplatesPage() {
  const [types, setTypes] = useState<DocumentType[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [editing, setEditing] = useState<DocumentType | null>(null)
  const [body, setBody] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    documentsApi
      .listTemplates()
      .then(setTypes)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const openEdit = (t: DocumentType) => {
    if (!t.template) return
    setBody(t.template.body)
    setIsActive(t.template.is_active)
    setFormError(null)
    setEditing(t)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing?.template) return
    setSaving(true)
    setFormError(null)
    try {
      await documentsApi.updateTemplate(editing.template.id, { body, is_active: isActive })
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Document Templates"
        subtitle="The HTML body used when each document type is generated as a PDF."
      />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Document Type</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Edited</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {types.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{t.code}</td>
                <td className="px-4 py-3 text-slate-500">{t.description ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    t.template?.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {t.template?.is_active ? 'active' : 'disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {t.template ? new Date(t.template.updated_at).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="text-indigo-600 hover:underline">
                    Edit template
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        title={editing ? `Template — ${editing.name}` : ''}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">HTML body</label>
            <textarea
              required
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-600">Available placeholders</p>
            <p className="mt-1 font-mono text-[11px] leading-5 text-slate-500">
              {TEMPLATE_PLACEHOLDERS.join('  ')}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active (employees can request this document)
          </label>

          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
