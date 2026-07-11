import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as org from '../../services/org'
import type { Department, Position, PositionInput } from '../../types/org'

const EMPTY: PositionInput = { title: '', department_id: '', description: '' }

/** HR admin CRUD for positions, each belonging to a department. */
export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [editing, setEditing] = useState<Position | 'new' | null>(null)
  const [form, setForm] = useState<PositionInput>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    Promise.all([org.listPositions(), org.listDepartments()])
      .then(([pos, deps]) => {
        setPositions(pos)
        setDepartments(deps)
      })
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const openNew = () => {
    setForm(EMPTY)
    setFormError(null)
    setEditing('new')
  }

  const openEdit = (p: Position) => {
    setForm({ title: p.title, department_id: p.department_id, description: p.description ?? '' })
    setFormError(null)
    setEditing(p)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editing === 'new') await org.createPosition(form)
      else if (editing) await org.updatePosition(editing.id, form)
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (p: Position) => {
    if (!window.confirm(`Delete position "${p.title}"?`)) return
    try {
      await org.deletePosition(p.id)
      reload()
    } catch (err) {
      window.alert(getApiError(err))
    }
  }

  return (
    <div>
      <PageHeader
        title="Positions"
        subtitle="Job titles available within each department."
        action={
          <button
            onClick={openNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Position
          </button>
        }
      />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && positions.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No positions yet.</td></tr>
            )}
            {positions.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.title}</td>
                <td className="px-4 py-3 text-slate-600">{p.department?.name ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500">{p.description ?? '—'}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openEdit(p)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(p)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New Position' : 'Edit Position'}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Department</label>
            <select
              required
              value={form.department_id}
              onChange={(e) => setForm({ ...form, department_id: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="" disabled>Select a department…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description (optional)</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
