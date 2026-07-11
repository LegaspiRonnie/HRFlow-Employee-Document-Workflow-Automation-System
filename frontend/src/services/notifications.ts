import api from '../lib/api'

export interface AppNotification {
  id: string
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export interface NotificationFeed {
  data: AppNotification[]
  unread_count: number
}

export async function listNotifications(): Promise<NotificationFeed> {
  const { data } = await api.get<NotificationFeed>('/notifications')
  return data
}

export async function markRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`)
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all')
}
