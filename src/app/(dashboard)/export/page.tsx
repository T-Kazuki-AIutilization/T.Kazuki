'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Download } from 'lucide-react'

export default function ExportPage() {
  const [from, setFrom] = useState(new Date().toISOString().slice(0, 7) + '-01')
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [format, setFormat] = useState('default')

  function handleExport() {
    window.open(`/api/export/csv?from=${from}&to=${to}&format=${format}`, '_blank')
  }

  return (
    <AppShell title="CSVエクスポート">
      <div className="max-w-md space-y-5 rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>開始日</Label><input type="date" className="w-full rounded-md border px-3 py-2 text-sm" value={from} onChange={e => setFrom(e.target.value)} /></div>
          <div><Label>終了日</Label><input type="date" className="w-full rounded-md border px-3 py-2 text-sm" value={to} onChange={e => setTo(e.target.value)} /></div>
        </div>
        <div><Label>フォーマット</Label>
          <div className="mt-2 space-y-2">
            {[['default', '標準CSV'], ['freee', 'freee取込用'], ['moneyforward', 'マネーフォワード取込用']].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm"><input type="radio" name="format" value={v} checked={format === v} onChange={() => setFormat(v)} />{l}</label>
            ))}
          </div>
        </div>
        <Button className="w-full" onClick={handleExport}><Download className="h-4 w-4 mr-2" />ダウンロード</Button>
        <p className="text-xs text-muted-foreground">※ 出力データは売上記録の一覧です。会計・税務処理はfreee/MF側で行ってください。</p>
      </div>
    </AppShell>
  )
}
