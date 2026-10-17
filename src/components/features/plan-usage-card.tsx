'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Usage = {
  plan: 'free' | 'pro' | 'pro_plus'
  paid: boolean
  clients: { used: number; limit: number }
  projectsThisMonth: { used: number; limit: number }
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const ratio = Math.min(used / limit, 1)
  const color = ratio >= 1 ? 'bg-red-500' : ratio >= 0.67 ? 'bg-amber-500' : 'bg-primary'
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span>{label}</span>
        <span className={ratio >= 1 ? 'font-semibold text-red-600' : 'text-muted-foreground'}>
          {used} / {limit}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  )
}

/** 無料プランの利用状況。上限が近づいたらアップグレードを案内する。有料プランでは表示しない。 */
export function PlanUsageCard() {
  const [usage, setUsage] = useState<Usage | null>(null)
  useEffect(() => {
    fetch('/api/account/usage').then((r) => r.json()).then((j) => setUsage(j.data ?? null)).catch(() => setUsage(null))
  }, [])
  if (!usage || usage.paid) return null
  const nearLimit = usage.clients.used >= usage.clients.limit - 1 || usage.projectsThisMonth.used >= usage.projectsThisMonth.limit - 2
  return (
    <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">無料プランの利用状況</h2>
        <Link href="/settings/billing" className="text-xs font-medium text-primary hover:underline">
          {nearLimit ? 'Pro にアップグレード（14日間無料）' : 'プランを見る'}
        </Link>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Meter label="クライアント" used={usage.clients.used} limit={usage.clients.limit} />
        <Meter label="今月作成した案件" used={usage.projectsThisMonth.used} limit={usage.projectsThisMonth.limit} />
      </div>
      {nearLimit && (
        <p className="mt-3 text-xs text-muted-foreground">
          Pro ならクライアント・案件が無制限になり、CSV エクスポート（freee / マネーフォワード取込用）も使えます。
        </p>
      )}
    </div>
  )
}
