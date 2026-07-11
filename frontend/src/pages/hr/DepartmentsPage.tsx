import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as org from '../../services/org'
import type { Department, DepartmentInput } from '../../types/org'

const EMPTY: DepartmentInput = { name: '', code: '', description: '' }

/** HR admin CRUD for departments — list, modal create/edit, delete. */
export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  // modal state: null = closed, 'new' = creating, Department = editing
  const [editing, setEditing] = useState<Department | 'new' | null>(null)
  const [form, setForm] = useState<DepartmentInput>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    setLoading(true)
    org
      .listDepartments()
      .then(setDepartments)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const openNew = () => {
    setForm(EMPTY)
    setFormError(null)
    setEditing('new')
  }

  const openEdit = (d: Department) => {
    setForm({ name: d.name, code: d.code, description: d.description ?? '' })
    setFormError(null)
    setEditing(d)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editing === 'new') await org.createDepartment(form)
      else if (editing) await org.updateDepartment(editing.id, form)
      setEditing(null)
      reload()
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (d: Department) => {
    if (!window.confirm(`Delete department "${d.name}"?`)) return
    try {
      await org.deleteDepartment(d.id)
      reload()
    } catch (err) {
      window.alert(getApiError(err)) // e.g. 409: still has positions/employees
    }
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Organizational units employees belong to."
        action={
          <button
            onClick={openNew}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + New Department
          </button>
        }
      />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center">Positions</th>
              <th className="px-4 py-3 text-center">Employees</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && departments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No departments yet.</td></tr>
            )}
            {departments.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{d.code}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                <td className="px-4 py-3 text-slate-500">{d.description ?? '—'}</td>
                <td className="px-4 py-3 text-center">{d.positions_count ?? 0}</td>
                <td className="px-4 py-3 text-center">{d.employees_count ?? 0}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openEdit(d)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(d)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New Department' : 'Edit Department'}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Code (max 10 chars)</label>
            <input
              required
              maxLength={10}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none"
            />
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
