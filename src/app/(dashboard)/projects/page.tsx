'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layouts/app-shell'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { PROJECT_STATUSES } from '@/lib/constants/navigation'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n) }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('')

  useEffect(() => {
    const q = filter ? `?status=${filter}` : ''
    fetch(`/api/projects${q}`).then(r => r.json()).then(j => setProjects(j.data?.data ?? j.data ?? []))
  }, [filter])

  return (
    <AppShell title="案件">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-1">
          <Button size="sm" variant={filter === '' ? 'default' : 'outline'} onClick={() => setFilter('')}>すべて</Button>
          {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
            <Button key={k} size="sm" variant={filter === k ? 'default' : 'outline'} onClick={() => setFilter(k)}>{v.label}</Button>
          ))}
        </div>
        <div className="ml-auto"><Link href="/projects/new"><Button><Plus className="h-4 w-4 mr-1" />新規</Button></Link></div>
      </div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">案件名</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">クライアント</th>
            <th className="px-4 py-3 text-center font-medium">ステータス</th>
            <th className="px-4 py-3 text-right font-medium">金額</th>
            <th className="px-4 py-3 text-right font-medium hidden md:table-cell">締切</th>
          </tr></thead>
          <tbody>{projects.map(p => {
            const st = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            return (
              <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href=`/projects/${p.id}`}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.client?.name ?? '—'}</td>
                <td className="px-4 py-3 text-center">{st && <StatusBadge label={st.label} color={st.color} />}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(p.amount)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{p.deadline ?? '—'}</td>
              </tr>
            )
          })}</tbody>
        </table>
        {projects.length === 0 && <div className="p-8 text-center text-muted-foreground"><p>案件がまだ登録されていません</p><Link href="/projects/new"><Button variant="outline" className="mt-3">最初の案件を登録</Button></Link></div>}
      </div>
    </AppShell>
  )
}
