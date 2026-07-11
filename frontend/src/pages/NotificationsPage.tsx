import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getApiError } from '../lib/errors'
import * as notificationsApi from '../services/notifications'
import type { AppNotification } from '../services/notifications'

/** In-app notification center: unread highlighting, mark-read actions. */
export default function NotificationsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const reload = useCallback(() => {
    notificationsApi
      .listNotifications()
      .then((feed) => setItems(feed.data))
      .catch((e) => setPageError(getApiError(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(reload, [reload])

  const open = async (n: AppNotification) => {
    if (!n.read) {
      await notificationsApi.markRead(n.id).catch(() => undefined)
    }
    if (n.link) navigate(n.link)
    else reload()
  }

  const handleMarkAll = async () => {
    await notificationsApi.markAllRead()
    reload()
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Notifications"
        subtitle="Workflow updates land here and in your email inbox."
        action={
          <button
            onClick={handleMarkAll}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Mark all as read
          </button>
        }
      />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}

      <div className="space-y-2">
        {loading && <p className="text-sm text-slate-400">Loading…</p>}
        {!loading && items.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            No notifications yet.
          </p>
        )}
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => open(n)}
            className={`block w-full rounded-xl border p-4 text-left transition-colors ${
              n.read
                ? 'border-slate-200 bg-white hover:bg-slate-50'
                : 'border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm ${n.read ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>
                  {!n.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-indigo-500" />}
                  {n.title}
                </p>
                <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
