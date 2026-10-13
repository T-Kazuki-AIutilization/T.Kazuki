'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, CreditCard } from 'lucide-react'

const PLANS = [
  { key: 'free', name: 'Free', price: 0, features: ['クライアント 3件まで', '案件 10件/月まで', 'ダッシュボード（簡易版）'] },
  { key: 'pro', name: 'Pro', price: 980, features: ['クライアント・案件 無制限', 'フルダッシュボード', '売上・入金追跡', 'CSVエクスポート'] },
  { key: 'pro_plus', name: 'Pro+', price: 1480, features: ['Pro の全機能', 'クライアント別収益分析', '優先サポート', '今後追加される分析機能を先行利用'] },
]

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => { fetch('/api/profile').then(r => r.json()).then(j => setProfile(j.data)) }, [])

  async function handleUpgrade(plan: string) {
    // Free へのダウングレードは Stripe のカスタマーポータルで解約する
    if (plan === 'free') { await handlePortal(); return }
    setLoading(plan)
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
      const j = await res.json()
      if (j.data?.url) { window.location.href = j.data.url }
      else { toast.error('チェックアウトの作成に失敗しました') }
    } catch { toast.error('エラーが発生しました') } finally { setLoading(null) }
  }

  async function handlePortal() {
    setLoading('portal')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const j = await res.json()
      if (j.data?.url) { window.location.href = j.data.url }
      else { toast.error('ポータルの作成に失敗しました') }
    } catch { toast.error('エラーが発生しました') } finally { setLoading(null) }
  }

  const currentPlan = profile?.plan ?? 'free'
  const hasSubscription = currentPlan !== 'free'

  return (
    <AppShell title="プラン・支払い">
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between rounded-lg border bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">現在のプラン</p>
            <p className="text-xl font-bold mt-0.5">{currentPlan === 'pro_plus' ? 'Pro+' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</p>
          </div>
          {currentPlan !== 'free' && (
            <Button variant="outline" onClick={handlePortal} disabled={loading === 'portal'}>
              <CreditCard className="h-4 w-4 mr-2" />{loading === 'portal' ? '処理中...' : '支払い・請求管理'}
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map(plan => (
            <div key={plan.key} className={`rounded-lg border bg-white p-5 shadow-sm flex flex-col ${currentPlan === plan.key ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
              <div className="mb-4">
                {plan.key === 'pro' && <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded mb-2">おすすめ</span>}
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="mt-1"><span className="text-2xl font-bold">{plan.price === 0 ? '無料' : `¥${plan.price.toLocaleString()}`}</span>{plan.price > 0 && <span className="text-sm text-muted-foreground">/月</span>}</p>
              </div>
              <ul className="space-y-2 mb-5 flex-1 text-sm">
                {plan.features.map(f => <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{f}</li>)}
              </ul>
              {currentPlan === plan.key ? (
                <Button disabled variant="outline" className="w-full">現在のプラン</Button>
              ) : (
                <Button className="w-full" onClick={() => hasSubscription ? handlePortal() : handleUpgrade(plan.key)} disabled={!!loading}>
                  {loading === plan.key || (hasSubscription && loading === 'portal') ? '処理中...' : plan.price === 0 ? '解約してFreeに戻す' : hasSubscription ? 'プランを変更' : 'アップグレード'}
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">※ 有料プランは14日間の無料トライアル付き。支払いはStripeで安全に処理され、いつでもキャンセルできます。</p>
      </div>
    </AppShell>
  )
}
