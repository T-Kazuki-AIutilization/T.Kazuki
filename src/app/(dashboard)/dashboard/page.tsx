'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { StatCard } from '@/components/features/stat-card'
import { MonthlyTrendChart } from '@/components/features/monthly-trend-chart'
import { Banknote, CreditCard, AlertCircle, FolderKanban } from 'lucide-react'

type Summary = { totalRevenue: number; paidAmount: number; unpaidAmount: number; activeProjects: number; completedProjects: number; totalClients: number }
type Trend = { month: string; revenue: number; paidAmount: number }[]
type Upcoming = { id: string; amount: number; due_date: string; project: { title: string; client: { name: string } | null } | null }[]

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n) }

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [upcoming, setUpcoming] = useState<Upcoming>([])
  const [trend, setTrend] = useState<Trend>([])

  useEffect(() => {
    fetch('/api/dashboard/summary').then(r => r.json()).then(j => setSummary(j.data))
    fetch('/api/dashboard/upcoming-payments').then(r => r.json()).then(j => setUpcoming(j.data ?? []))
    fetch('/api/dashboard/monthly-trend').then(r => r.json()).then(j => setTrend(j.data ?? []))
  }, [])

  return (
    <AppShell title="ダッシュボード">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="今月の売上" value={summary ? fmt(summary.totalRevenue) : '—'} icon={Banknote} />
        <StatCard label="入金済み" value={summary ? fmt(summary.paidAmount) : '—'} icon={CreditCard} />
        <StatCard label="未入金" value={summary ? fmt(summary.unpaidAmount) : '—'} icon={AlertCircle} />
        <StatCard label="進行中の案件" value={summary ? `${summary.activeProjects}件` : '—'} icon={FolderKanban} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">月次売上推移（直近 6 か月）</h2>
          <MonthlyTrendChart data={trend} />
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">直近の入金予定</h2>
          {upcoming.length === 0 ? (
            <p className="text-xs text-muted-foreground">入金予定はありません</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map(u => (
                <li key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{u.project?.title ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">{u.due_date} · {u.project?.client?.name ?? ''}</p>
                  </div>
                  <span className="font-semibold">{fmt(u.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
