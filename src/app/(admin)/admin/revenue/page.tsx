'use client'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layouts/admin-shell'
import { TrendingUp, Users, DollarSign, BarChart3, ArrowUpRight, CreditCard } from 'lucide-react'

const fmt = (n: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n)

function KpiCard({ label, value, sub, icon: Icon, color = 'violet' }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color?: string
}) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 text-violet-600',
    green:  'bg-green-50  text-green-600',
    blue:   'bg-blue-50   text-blue-600',
    amber:  'bg-amber-50  text-amber-600',
    rose:   'bg-rose-50   text-rose-600',
  }
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className={`p-2 rounded-lg ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function BarChart({ data, valueKey, labelKey, color = '#818cf8', formatValue }: {
  data: any[]; valueKey: string; labelKey: string
  color?: string; formatValue?: (v: number) => string
}) {
  const max = Math.max(...data.map(d => d[valueKey]), 1)
  return (
    <div className="flex items-end gap-2 h-36 pt-2">
      {data.map((d, i) => {
        const pct = Math.round((d[valueKey] / max) * 100)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {formatValue ? formatValue(d[valueKey]) : d[valueKey]}
            </span>
            <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(pct, 2)}%`, backgroundColor: pct > 0 ? color : '#e2e8f0' }} />
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d[labelKey].slice(-5)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AdminRevenuePage() {
  const [d, setD] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then(r => r.json())
      .then(j => { setD(j.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const planLabel: Record<string, string> = { pro: 'Pro', pro_plus: 'Pro+' }
  const planColor: Record<string, string> = { pro: 'bg-blue-500', pro_plus: 'bg-violet-500' }

  return (
    <AdminShell title="収益モニタリング">

      {/* KPI カード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="MRR" value={loading ? '—' : fmt(d?.mrr ?? 0)} sub="月次定期収益" icon={TrendingUp} color="violet" />
        <KpiCard label="ARR 予測" value={loading ? '—' : fmt(d?.arr ?? 0)} sub="MRR × 12" icon={BarChart3} color="blue" />
        <KpiCard label="ARPU" value={loading ? '—' : fmt(d?.arpu ?? 0)} sub="有料ユーザー平均" icon={DollarSign} color="green" />
        <KpiCard label="有料ユーザー" value={loading ? '—' : `${d?.paidUsers ?? 0}人`} sub={`転換率 ${d?.conversionRate ?? 0}%`} icon={CreditCard} color="amber" />
        <KpiCard label="総ユーザー" value={loading ? '—' : `${d?.totalUsers ?? 0}人`} sub={`Free ${d?.freeUsers ?? 0}人`} icon={Users} color="rose" />
        <KpiCard label="取引売上合計" value={loading ? '—' : fmt(d?.platformTotal ?? 0)} sub="ユーザー入金済み累計" icon={ArrowUpRight} color="green" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">

        {/* MRR 月次トレンド */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">新規有料転換 — 月次推移（過去6ヶ月）</h2>
            <span className="text-xs text-muted-foreground">登録日ベース</span>
          </div>
          {d?.monthlyMrr
            ? <BarChart data={d.monthlyMrr} valueKey="newPaid" labelKey="month" color="#818cf8"
                formatValue={v => `${v}人`} />
            : <div className="h-36 flex items-center justify-center text-sm text-muted-foreground bg-slate-50 rounded-lg">読み込み中...</div>
          }
        </div>

        {/* プラットフォーム取引売上 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">ユーザー取引売上 — 月次（過去6ヶ月）</h2>
            <span className="text-xs text-muted-foreground">入金済みのみ</span>
          </div>
          {d?.platformByMonth
            ? <BarChart data={d.platformByMonth} valueKey="amount" labelKey="month" color="#4ade80"
                formatValue={v => v >= 10000 ? `${Math.round(v / 10000)}万` : v > 0 ? fmt(v) : '¥0'} />
            : <div className="h-36 flex items-center justify-center text-sm text-muted-foreground bg-slate-50 rounded-lg">読み込み中...</div>
          }
        </div>

        {/* プラン分布 */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">プラン分布</h2>
          {d ? (
            <div className="space-y-3">
              {[
                { key: 'free',     label: 'Free',  count: d.planDistribution.free,     revenue: 0,         color: 'bg-slate-300' },
                { key: 'pro',      label: 'Pro',   count: d.planDistribution.pro,      revenue: d.planDistribution.pro * 980,    color: 'bg-blue-500' },
                { key: 'pro_plus', label: 'Pro+',  count: d.planDistribution.pro_plus, revenue: d.planDistribution.pro_plus * 1480, color: 'bg-violet-500' },
              ].map(({ label, count, revenue, color }) => {
                const pct = d.totalUsers > 0 ? Math.round((count / d.totalUsers) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{count}人 ({pct}%)</span>
                        {revenue > 0 && <span className="font-semibold text-foreground">{fmt(revenue)}/月</span>}
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="mt-4 pt-3 border-t flex justify-between text-sm">
                <span className="text-muted-foreground">MRR 合計</span>
                <span className="font-bold text-violet-600">{fmt(d.mrr)}</span>
              </div>
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-sm text-muted-foreground bg-slate-50 rounded-lg">読み込み中...</div>
          )}
        </div>

        {/* 最近の有料転換ユーザー */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">最近の有料転換ユーザー</h2>
          {d?.recentPaid?.length > 0 ? (
            <div className="space-y-0 divide-y">
              {d.recentPaid.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{u.display_name || '(未設定)'}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.plan === 'pro_plus' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {planLabel[u.plan] ?? u.plan}
                    </span>
                    <span className="text-xs text-muted-foreground">{u.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground bg-slate-50 rounded-lg">
              {loading ? '読み込み中...' : '有料ユーザーはまだいません'}
            </div>
          )}
        </div>
      </div>

      {/* サマリーテーブル */}
      {d && (
        <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">月次収益サマリー（過去6ヶ月）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 text-left font-medium">月</th>
                  <th className="pb-2 text-right font-medium">新規有料</th>
                  <th className="pb-2 text-right font-medium">新規MRR寄与</th>
                  <th className="pb-2 text-right font-medium">取引売上</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {d.monthlyMrr.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 font-medium">{row.month}</td>
                    <td className="py-2 text-right">{row.newPaid}人</td>
                    <td className="py-2 text-right text-violet-600 font-medium">{fmt(row.revenue)}</td>
                    <td className="py-2 text-right text-green-600 font-medium">{fmt(d.platformByMonth[i]?.amount ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr className="font-semibold">
                  <td className="pt-2">合計</td>
                  <td className="pt-2 text-right">{d.recentPaid.length}人+</td>
                  <td className="pt-2 text-right text-violet-600">{fmt(d.mrr)} /月</td>
                  <td className="pt-2 text-right text-green-600">{fmt(d.platformTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

    </AdminShell>
  )
}
