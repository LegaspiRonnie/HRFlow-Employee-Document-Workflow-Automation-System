import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import PageHeader from '../components/PageHeader'
import { getApiError } from '../lib/errors'
import * as employeesApi from '../services/employees'
import type { Employee } from '../types/employees'
import { ROLE_LABELS } from '../types/auth'

/**
 * The signed-in user's own employee record. Employment details are
 * read-only (HR manages those); contact details are editable.
 */
export default function ProfilePage() {
  const [profile, setProfile] = useState<Employee | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    employeesApi
      .getProfile()
      .then((p) => {
        setProfile(p)
        setPhone(p.phone ?? '')
        setAddress(p.address ?? '')
      })
      .catch((e) => setPageError(getApiError(e)))
  }, [])

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setSaved(false)
    try {
      const updated = await employeesApi.updateProfile({ phone, address })
      setProfile(updated)
      setSaved(true)
    } catch (err) {
      setFormError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  if (pageError) {
    return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>
  }
  if (!profile) {
    return <p className="text-sm text-slate-400">Loading profile…</p>
  }

  const facts: [string, string][] = [
    ['Employee code', profile.employee_code],
    ['Email', profile.user.email],
    ['Role', ROLE_LABELS[profile.user.role]],
    ['Department', profile.department.name],
    ['Position', profile.position.title],
    ['Manager', profile.manager?.name ?? '—'],
    ['Date hired', profile.date_hired],
    ['Status', profile.status],
  ]

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" subtitle="Employment details are maintained by HR." />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">{profile.user.name}</h2>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
              <dd className="mt-0.5 text-slate-700">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <form onSubmit={handleSave} className="mt-6 rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-800">Contact details</h2>
        <div>
          <label className="block text-sm font-medium text-slate-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {formError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
        {saved && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">Contact details updated.</p>}

        <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
