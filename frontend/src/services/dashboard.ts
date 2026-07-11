import api from '../lib/api'

/** Role-shaped payload of GET /dashboard. */
export interface DashboardData {
  role: 'employee' | 'manager' | 'hr_admin'
  cards: {
    total: number
    pending: number
    approved: number
    rejected: number
    // manager extras
    awaiting_me?: number
    team_size?: number
    // HR extras
    employees?: number
    awaiting_hr?: number
    avg_approval_hours?: number | null
  }
  charts?: {
    trend?: { month: string; count: number }[]
    by_department?: { name: string; count: number }[]
    most_requested?: { name: string; count: number }[]
  }
}

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<{ data: DashboardData }>('/dashboard')
  return data.data
}

/** HR-only: download the company-wide requests report as .xlsx. */
export async function downloadRequestsReport(): Promise<void> {
  const { data } = await api.get<Blob>('/hr/reports/requests.xlsx', { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `hrflow-requests-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}
