'use client'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layouts/admin-shell'
import { StatCard } from '@/components/features/stat-card'
import { Users, CreditCard, TrendingUp, BarChart3 } from 'lucide-react'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n) }

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null)
  useEffect(() => { fetch('/api/admin/dashboard').then(r => r.json()).then(j => setData(j.data)) }, [])

  return (
    <AdminShell title="管理者ダッシュボード">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="総ユーザー数" value={data ? `${data.totalUsers}人` : '—'} icon={Users} />
        <StatCard label="有料ユーザー" value={data ? `${data.paidUsers}人` : '—'} icon={CreditCard} />
        <StatCard label="MRR" value={data ? fmt(data.mrr) : '—'} icon={TrendingUp} />
        <StatCard label="ARR予測" value={data ? fmt(data.mrr * 12) : '—'} icon={BarChart3} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">MRR推移</h2>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm bg-slate-50 rounded">グラフ描画エリア</div>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3">プラン分布</h2>
          {data && <div className="space-y-3 mt-4">
            {[['Free', data.planDistribution.free], ['Pro', data.planDistribution.pro], ['Pro+', data.planDistribution.pro_plus]].map(([l, v]) => (
              <div key={l as string} className="flex items-center justify-between text-sm"><span>{l}</span><span className="font-semibold">{v}人</span></div>
            ))}
          </div>}
        </div>
      </div>
    </AdminShell>
  )
}
