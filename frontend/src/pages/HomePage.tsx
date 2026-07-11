import { useEffect, useState } from 'react'
import api from '../lib/api'

/** Shape of GET /api/v1/health — keep in sync with HealthController. */
interface HealthResponse {
  app: string
  status: string
  database: 'connected' | 'disconnected'
  time: string
}

/**
 * Temporary landing page proving the React → Axios → Laravel → MySQL
 * pipeline works end to end. Replaced by the real login/dashboard flow
 * in Features 1–2.
 */
export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<HealthResponse>('/health')
      .then((res) => setHealth(res.data))
      .catch(() => setError('API unreachable — is `php artisan serve` running?'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-white shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">HRFlow</h1>
        <p className="mt-1 text-sm text-slate-500">
          Employee Document &amp; Workflow Automation
        </p>

        <div className="mt-6 rounded-lg border border-slate-200 p-4 text-left text-sm">
          {error && <p className="text-red-600">{error}</p>}

          {!error && !health && <p className="text-slate-400">Checking API…</p>}

          {health && (
            <ul className="space-y-1 text-slate-700">
              <li>
                API:{' '}
                <span className="font-medium text-green-600">{health.status}</span>
              </li>
              <li>
                Database:{' '}
                <span
                  className={
                    health.database === 'connected'
                      ? 'font-medium text-green-600'
                      : 'font-medium text-red-600'
                  }
                >
                  {health.database}
                </span>
              </li>
              <li className="text-slate-400">Server time: {health.time}</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
