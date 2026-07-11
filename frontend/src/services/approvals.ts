import api from '../lib/api'
import type { DocumentRequest } from '../types/requests'

/** Manager review stage — team-scoped on the backend. */

export async function managerQueue(): Promise<DocumentRequest[]> {
  const { data } = await api.get<{ data: DocumentRequest[] }>('/manager/queue')
  return data.data
}

export async function managerHistory(): Promise<DocumentRequest[]> {
  const { data } = await api.get<{ data: DocumentRequest[] }>('/manager/history')
  return data.data
}

export async function managerDecide(
  requestId: number,
  action: 'approve' | 'reject',
  comments: string,
): Promise<DocumentRequest> {
  const { data } = await api.post<{ data: DocumentRequest }>(
    `/manager/requests/${requestId}/decision`,
    { action, comments: comments || null },
  )
  return data.data
}
