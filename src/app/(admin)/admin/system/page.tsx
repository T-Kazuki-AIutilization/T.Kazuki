'use client'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layouts/admin-shell'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, RefreshCw, Server, Database, Globe } from 'lucide-react'

export default function AdminSystemPage() {
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try { const r = await fetch('/api/admin/system/health'); const j = await r.json(); setHealth(j.data) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const Icon = ({ ok }: { ok: boolean }) => ok
    ? <CheckCircle2 className="h-5 w-5 text-green-500" />
    : <XCircle className="h-5 w-5 text-red-500" />

  return (
    <AdminShell title="システム情報">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />更新
        </Button>
      </div>

      <div className="grid gap-4 max-w-2xl">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-1"><Server className="h-4 w-4" />ヘルスチェック</h2>
          {health ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><span>API</span></div>
                <div className="flex items-center gap-2"><Icon ok={health.api === 'ok'} /><span className="text-muted-foreground">{health.api}</span></div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2"><Database className="h-4 w-4 text-muted-foreground" /><span>データベース</span></div>
                <div className="flex items-center gap-2"><Icon ok={health.database === 'ok'} /><span className="text-muted-foreground">{health.database}</span></div>
              </div>
              <p className="text-xs text-muted-foreground pt-1">最終確認: {new Date(health.timestamp).toLocaleString('ja-JP')}</p>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">{loading ? '確認中...' : '—'}</div>
          )}
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-4">アプリケーション情報</h2>
          <div className="space-y-2 text-sm">
            {[
              ['サービス名', 'FreelanceOS'],
              ['フレームワーク', 'Next.js 14 (App Router)'],
              ['データベース', 'Supabase (PostgreSQL)'],
              ['認証', 'Supabase Auth'],
              ['ホスティング', 'Vercel'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
