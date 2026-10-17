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
import { Pencil, Trash2, ChevronLeft, FileText } from 'lucide-react'

function fmt(n: number) { return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n) }

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: '', clientId: '', categoryId: '', amount: '', deadline: '', memo: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch(`/api/projects/${id}`).then(r => r.json()).then(j => {
      if (j.data) {
        setProject(j.data)
        setForm({ title: j.data.title, clientId: j.data.client_id ?? '', categoryId: j.data.category_id ?? '', amount: String(j.data.amount), deadline: j.data.deadline ?? '', memo: j.data.memo ?? '' })
      }
    })
    fetch('/api/clients?limit=100').then(r => r.json()).then(j => setClients(j.data?.data ?? []))
    fetch('/api/categories').then(r => r.json()).then(j => setCategories(j.data ?? []))
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body = { title: form.title, clientId: form.clientId || null, categoryId: form.categoryId || null, amount: parseInt(form.amount) || 0, deadline: form.deadline || null, memo: form.memo || null }
      const res = await fetch(`/api/projects/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('保存に失敗しました')
      const j = await res.json()
      setProject((p: any) => ({ ...p, ...j.data })); setEditing(false); toast.success('保存しました')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  async function handleStatus(status: string) {
    const res = await fetch(`/api/projects/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) { setProject((p: any) => ({ ...p, status })); toast.success('ステータスを更新しました') }
    else { toast.error('更新に失敗しました') }
  }

  async function handleDelete() {
    if (!confirm('この案件を削除しますか？この操作は取り消せません。')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('削除しました'); router.push('/projects') }
    else { toast.error('削除に失敗しました') }
  }

  if (!project) return <AppShell title="案件詳細"><div className="p-8 text-center text-muted-foreground">読み込み中...</div></AppShell>

  const st = PROJECT_STATUSES[project.status as keyof typeof PROJECT_STATUSES]

  return (
    <AppShell title={project.title}>
      <div className="mb-4 flex items-center gap-2">
        <Link href="/projects"><Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />案件一覧</Button></Link>
        <div className="ml-auto flex gap-2">
          <Link href={`/projects/${id}/invoice`}><Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-1" />請求書を作成</Button></Link>
          <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}><Pencil className="h-4 w-4 mr-1" />{editing ? 'キャンセル' : '編集'}</Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-1" />削除</Button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">ステータス:</span>
        {Object.entries(PROJECT_STATUSES).map(([k, v]) => (
          <Button key={k} size="sm" variant={project.status === k ? 'default' : 'outline'} onClick={() => handleStatus(k)}>{v.label}</Button>
        ))}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div><Label>案件名 *</Label><Input required value={form.title} onChange={set('title')} /></div>
          <div><Label>クライアント</Label>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.clientId} onChange={set('clientId')}>
              <option value="">— 選択してください —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>カテゴリ</Label>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.categoryId} onChange={set('categoryId')}>
              <option value="">— 選択してください —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>金額（円）</Label><Input type="number" min="0" value={form.amount} onChange={set('amount')} /></div>
          <div><Label>締切日</Label><input type="date" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.deadline} onChange={set('deadline')} /></div>
          <div><Label>メモ</Label><textarea className="mt-1 w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.memo} onChange={set('memo')} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditing(false)}>キャンセル</Button><Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button></div>
        </form>
      ) : (
        <div className="max-w-lg rounded-lg border bg-white p-6 shadow-sm space-y-3 text-sm">
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">ステータス</span>{st && <StatusBadge label={st.label} color={st.color} />}</div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">クライアント</span><span>{project.client?.name ?? '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">カテゴリ</span><span>{project.category?.name ?? '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">金額</span><span className="font-semibold">{fmt(project.amount)}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">締切日</span><span>{project.deadline ?? '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">メモ</span><span className="whitespace-pre-wrap">{project.memo || '—'}</span></div>
          <div className="flex gap-4"><span className="w-24 text-muted-foreground shrink-0">作成日</span><span>{project.created_at?.slice(0, 10)}</span></div>
        </div>
      )}
    </AppShell>
  )
}
