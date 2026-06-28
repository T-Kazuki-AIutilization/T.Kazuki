'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layouts/app-shell'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search } from 'lucide-react'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(n) }

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = search ? `&search=${encodeURIComponent(search)}` : ''
    fetch(`/api/clients?limit=50${q}`).then(r => r.json()).then(j => setClients(j.data?.data ?? j.data ?? []))
  }, [search])

  return (
    <AppShell title="クライアント">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="検索..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Link href="/clients/new"><Button><Plus className="h-4 w-4 mr-1" />新規</Button></Link>
      </div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">名前</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">会社名</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">タグ</th>
            <th className="px-4 py-3 text-right font-medium">案件数</th>
          </tr></thead>
          <tbody>{clients.map(c => (
            <tr key={c.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href=`/clients/${c.id}`}>
              <td className="px-4 py-3 font-medium">{c.name}</td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.company_name || '—'}</td>
              <td className="px-4 py-3 hidden md:table-cell"><div className="flex gap-1">{(c.tags ?? []).map((t: any) => <StatusBadge key={t.tag?.id ?? t.id} label={t.tag?.name ?? t.name} color="blue" />)}</div></td>
              <td className="px-4 py-3 text-right">{c._count?.projects ?? '—'}</td>
            </tr>
          ))}</tbody>
        </table>
        {clients.length === 0 && <div className="p-8 text-center text-muted-foreground"><p>クライアントがまだ登録されていません</p><Link href="/clients/new"><Button variant="outline" className="mt-3">最初のクライアントを登録</Button></Link></div>}
      </div>
    </AppShell>
  )
}
