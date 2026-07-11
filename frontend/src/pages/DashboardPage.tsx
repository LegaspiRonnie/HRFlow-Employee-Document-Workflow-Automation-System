import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'
import { getApiError } from '../lib/errors'
import * as dashboardApi from '../services/dashboard'
import type { DashboardData } from '../services/dashboard'
import { ROLE_LABELS } from '../types/auth'

/** Single data hue (validated against the light surface); grid/axes stay recessive. */
const SERIES = '#4f46e5'
const GRID = '#e2e8f0'
const INK_MUTED = '#94a3b8'

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      <div className="h-56">{children}</div>
    </div>
  )
}

/** Role-aware dashboard: stat cards for everyone, charts for manager/HR. */
export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    dashboardApi
      .getDashboard()
      .then(setData)
      .catch((e) => setPageError(getApiError(e)))
  }, [])

  if (!user) return null

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle={`You are signed in as ${ROLE_LABELS[user.role]}.`}
      />

      {pageError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pageError}</p>}
      {!data && !pageError && <p className="text-sm text-slate-400">Loading dashboard…</p>}

      {data && (
        <div className="space-y-6">
          {/* headline cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={data.role === 'employee' ? 'My requests' : 'Total requests'} value={data.cards.total} />
            <StatCard label="Pending" value={data.cards.pending} accent="text-amber-600" />
            <StatCard label="Approved" value={data.cards.approved} accent="text-green-600" />
            <StatCard label="Rejected" value={data.cards.rejected} accent="text-red-600" />

            {data.role === 'manager' && (
              <>
                <StatCard label="Awaiting my review" value={data.cards.awaiting_me ?? 0} accent="text-indigo-600" />
                <StatCard label="Team members" value={data.cards.team_size ?? 0} />
              </>
            )}
            {data.role === 'hr_admin' && (
              <>
                <StatCard label="Active employees" value={data.cards.employees ?? 0} />
                <StatCard label="Awaiting HR" value={data.cards.awaiting_hr ?? 0} accent="text-indigo-600" />
                <StatCard
                  label="Avg. approval time"
                  value={data.cards.avg_approval_hours != null ? `${data.cards.avg_approval_hours}h` : '—'}
                />
              </>
            )}
          </div>

          {/* charts (manager: 2, HR: 3) */}
          {data.charts && (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.charts.trend && (
                <ChartCard title="Requests — last 6 months">
                  <ResponsiveContainer>
                    <LineChart data={data.charts.trend} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ stroke: GRID }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Line type="monotone" dataKey="count" name="Requests" stroke={SERIES} strokeWidth={2} dot={{ r: 3, fill: SERIES }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {data.charts.most_requested && (
                <ChartCard title="Most requested documents">
                  <ResponsiveContainer>
                    <BarChart data={data.charts.most_requested} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: INK_MUTED }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
                      />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" name="Requests" fill={SERIES} barSize={28} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}

              {data.charts.by_department && (
                <ChartCard title="Requests by department">
                  <ResponsiveContainer>
                    <BarChart data={data.charts.by_department} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke={GRID} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: INK_MUTED }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" name="Requests" fill={SERIES} barSize={28} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
