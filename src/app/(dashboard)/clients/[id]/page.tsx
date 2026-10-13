'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { PROJECT_STATUSES } from '@/lib/constants/navigation'
import { toast } from 'sonner'
import { Pencil, Trash2, FolderKanban, ChevronLeft } from 'lucide-react'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n) }

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', memo: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch(`/api/clients/${id}`).then(r => r.json()).then(j => {
      if (j.data) {
        setClient(j.data)
        setForm({ name: j.data.name, companyName: j.data.company_name ?? '', email: j.data.email ?? '', phone: j.data.phone ?? '', memo: j.data.memo ?? '' })
      }
    })
    fetch(`/api/projects?clientId=${id}&limit=50`).then(r => r.json()).then(j => setProjects(j.data?.data ?? []))
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('保存に失敗しました')
      const j = await res.json()
      setClient(j.data); setEditing(false); toast.success('保存しました')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  async function handleDelete() {
    if (!confirm('このクライアントをアーカイブしますか？')) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    toast.success('アーカイブしました'); router.push('/clients')
  }

  if (!client) return <AppShell title="クライアント詳細"><div className="p-8 text-center text-muted-foreground">読み込み中...</div></AppShell>

  return (
    <AppShell title={client.name}>
      <div className="mb-4 flex items-center gap-2">
        <Link href="/clients"><Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />一覧へ戻る</Button></Link>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}><Pencil className="h-4 w-4 mr-1" />{editing ? 'キャンセル' : '編集'}</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" />削除</Button>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm mb-6">
          <div><Label>クライアント名 *</Label><Input required value={form.name} onChange={set('name')} /></div>
          <div><Label>会社名</Label><Input value={form.companyName} onChange={set('companyName')} /></div>
          <div><Label>メール</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
          <div><Label>電話番号</Label><Input value={form.phone} onChange={set('phone')} /></div>
          <div><Label>メモ</Label><textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.memo} onChange={set('memo')} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(false)}>キャンセル</Button><Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button></div>
        </form>
      ) : (
        <div className="max-w-lg rounded-lg border bg-white p-6 shadow-sm mb-6 space-y-3 text-sm">
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">会社名</span><span>{client.company_name || '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">メール</span><span>{client.email || '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">電話番号</span><span>{client.phone || '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">メモ</span><span className="whitespace-pre-wrap">{client.memo || '—'}</span></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-1 text-sm"><FolderKanban className="h-4 w-4" />関連案件</h2>
        <Link href={`/projects/new?clientId=${id}`}><Button size="sm">+ 新規案件</Button></Link>
      </div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">案件名</th>
            <th className="px-4 py-3 text-center font-medium">ステータス</th>
            <th className="px-4 py-3 text-right font-medium">金額</th>
            <th className="px-4 py-3 text-right font-medium hidden md:table-cell">締切</th>
          </tr></thead>
          <tbody>{projects.map(p => {
            const st = PROJECT_STATUSES[p.status as keyof typeof PROJECT_STATUSES]
            return (
              <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => router.push(`/projects/${p.id}`)}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-center">{st && <StatusBadge label={st.label} color={st.color} />}</td>
                <td className="px-4 py-3 text-right font-semibold">{fmt(p.amount)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{p.deadline ?? '—'}</td>
              </tr>
            )
          })}</tbody>
        </table>
        {projects.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">案件がありません</div>}
      </div>
    </AppShell>
  )
}
