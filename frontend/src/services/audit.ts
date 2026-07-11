import api from '../lib/api'

export interface AuditLogEntry {
  id: number
  action: string
  user: { id: number; name: string } | null
  subject_type: string | null
  subject_id: number | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export interface AuditLogFilters {
  action?: string
  date_from?: string
  date_to?: string
  page?: number
}

export interface AuditLogPage {
  data: AuditLogEntry[]
  meta: { current_page: number; last_page: number; total: number }
}

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogPage> {
  const { data } = await api.get<AuditLogPage>('/hr/audit-logs', { params: filters })
  return data
}
