import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as employeesApi from '../../services/employees'
import * as orgApi from '../../services/org'
import type { Employee, EmployeeInput, ManagerOption } from '../../types/employees'
import type { Department, Position } from '../../types/org'
import { ROLE_LABELS } from '../../types/auth'

const EMPTY: EmployeeInput = {
  name: '', email: '', password: '', role: 'employee',
  department_id: '', position_id: '', manager_id: '',
  date_hired: '', phone: '', address: '', salary: '', status: 'active',
}

/** HR admin employee management: search, create (with account), edit, delete. */
export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [managers, setManagers] = useState<ManagerOption[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const [editing, setEditing] = useState<Employee | 'new' | null>(null)
  const [form, setForm] = useState<EmployeeInput>(EMPTY)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const reload = useCallback((q?: string) => {
    setLoading(true)
    employeesApi
      .listEmployees(q)
      .then(setEmployees)
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  // dropdown data loads once; the employee list re-loads on search
  useEffect(() => {
    Promise.all([orgApi.listDepartments(), orgApi.listPositions(), employeesApi.listManagerOptions()])
      .then(([deps, pos, mgrs]) => {
        setDepartments(deps)
        setPositions(pos)
        setManagers(mgrs)
      })
      .catch((e) => setPageError(getApiError(e)))
    reload()
  }, [reload])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    reload(search || undefined)
  }

  const openNew = () => {
    setForm(EMPTY)
    setFormError(null)
    setEditing('new')
  }

  const openEdit = (emp: Employee) => {
    setForm({
      name: emp.user.name,
      email: emp.user.email,
      password: '',
      role: emp.user.role,
      department_id: emp.department.id,
      position_id: emp.position.id,
      manager_id: emp.manager?.id ?? '',
      date_hired: emp.date_hired,
      phone: emp.phone ?? '',
      address: emp.address ?? '',
      salary: emp.salary ?? '',
      status: emp.status,
    })
    setFormError(null)
    setEditing(emp)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (editing === 'new') await employeesApi.createEmployee(form)
      else if (editing) await employeesApi.updateEmployee(editing.id, form)
      setEditing(null)
      reload(search || undefined)
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (emp: Employee) => {
    if (!window.confirm(`Delete ${emp.user.name} and their login account?`)) return
    try {
      await employeesApi.deleteEmployee(emp.id)
      reload(search || undefined)
    } catch (err) {
      window.alert(getApiError(err))
    }
  }

  // positions are filtered to the chosen department in the form
  const positionsForDept = positions.filter((p) => p.department_id === form.department_id)

  const inputCls =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none'

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Employee records and their login accounts."
        action={
          <button onClick={openNew} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            + New Employee
          </button>
        }
      />

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, or employee code…"
          className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button type="submit" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          Search
        </button>
      </form>

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Manager</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            )}
            {!loading && employees.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No employees found.</td></tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{emp.employee_code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800">{emp.user.name}</p>
                  <p className="text-xs text-slate-400">{emp.user.email}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{ROLE_LABELS[emp.user.role]}</td>
                <td className="px-4 py-3 text-slate-600">{emp.department.name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.position.title}</td>
                <td className="px-4 py-3 text-slate-600">{emp.manager?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-3">
                  <button onClick={() => openEdit(emp)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(emp)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        title={editing === 'new' ? 'New Employee' : 'Edit Employee'}
        onClose={() => setEditing(null)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full name</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {editing === 'new' ? 'Password (min 8)' : 'New password (blank = keep)'}
              </label>
              <input
                type="password"
                required={editing === 'new'}
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">System role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as EmployeeInput['role'] })} className={inputCls}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr_admin">HR Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <select
                required
                value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: Number(e.target.value), position_id: '' })}
                className={inputCls}
              >
                <option value="" disabled>Select…</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Position</label>
              <select
                required
                value={form.position_id}
                onChange={(e) => setForm({ ...form, position_id: Number(e.target.value) })}
                className={inputCls}
                disabled={form.department_id === ''}
              >
                <option value="" disabled>Select…</option>
                {positionsForDept.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Approving manager</label>
              <select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value === '' ? '' : Number(e.target.value) })} className={inputCls}>
                <option value="">None</option>
                {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({ROLE_LABELS[m.role]})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date hired</label>
              <input required type="date" value={form.date_hired} onChange={(e) => setForm({ ...form, date_hired: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Monthly salary</label>
              <input type="number" step="0.01" min="0" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeInput['status'] })} className={inputCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
            </div>
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
