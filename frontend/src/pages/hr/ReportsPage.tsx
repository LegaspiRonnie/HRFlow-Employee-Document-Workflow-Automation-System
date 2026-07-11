import { useState } from 'react'
import PageHeader from '../../components/PageHeader'
import { getApiError } from '../../lib/errors'
import * as dashboardApi from '../../services/dashboard'

/** HR exports — Excel downloads built from live data. */
export default function ReportsPage() {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setDownloading(true)
    setError(null)
    try {
      await dashboardApi.downloadRequestsReport()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="Reports" subtitle="Export live data as Excel workbooks." />

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Document requests report</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every request company-wide with employee, department, workflow status, and
          generated document number. One row per request.
        </p>
        <button
          onClick={handleExport}
          disabled={downloading}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {downloading ? 'Preparing…' : 'Download .xlsx'}
        </button>
      </div>
    </div>
  )
}
