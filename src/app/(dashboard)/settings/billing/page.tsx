'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Check, CreditCard } from 'lucide-react'

const PLANS = [
  { key: 'free', name: 'Free', price: 0, features: ['クライアント管理（最大5件）', '案件管理（最大10件）', 'CSVエクスポート（月3回）'] },
  { key: 'pro', name: 'Pro', price: 2980, features: ['クライアント管理（無制限）', '案件管理（無制限）', 'CSVエクスポート（無制限）', '月次レポート'] },
  { key: 'pro_plus', name: 'Pro+', price: 5980, features: ['Proのすべて', '請求書発行機能', 'freee / MF連携', '優先サポート'] },
]

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => { fetch('/api/profile').then(r => r.json()).then(j => setProfile(j.data)) }, [])

  async function handleUpgrade(plan: string) {
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
                <Button className="w-full" onClick={() => handleUpgrade(plan.key)} disabled={!!loading}>
                  {loading === plan.key ? '処理中...' : plan.price === 0 ? 'ダウングレード' : 'アップグレード'}
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">※ 支払いはStripeで安全に処理されます。いつでもキャンセル可能です。</p>
      </div>
    </AppShell>
  )
}
