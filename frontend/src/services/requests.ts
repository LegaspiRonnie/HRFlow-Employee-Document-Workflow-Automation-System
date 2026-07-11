import api from '../lib/api'
import type { DocumentRequest } from '../types/requests'

/** Own requests, newest first. */
export async function listMyRequests(): Promise<DocumentRequest[]> {
  const { data } = await api.get<{ data: DocumentRequest[] }>('/requests')
  return data.data
}

export async function submitRequest(input: {
  document_type_id: number
  purpose: string
}): Promise<DocumentRequest> {
  const { data } = await api.post<{ data: DocumentRequest }>('/requests', input)
  return data.data
}

export async function getRequest(id: number): Promise<DocumentRequest> {
  const { data } = await api.get<{ data: DocumentRequest }>(`/requests/${id}`)
  return data.data
}
