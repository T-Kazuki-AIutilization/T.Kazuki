'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ChevronLeft } from 'lucide-react'

function NewProjectForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clients, setClients] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', clientId: searchParams.get('clientId') ?? '',
    categoryId: '', amount: '', deadline: '', memo: ''
  })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/clients?limit=100').then(r => r.json()).then(j => setClients(j.data?.data ?? []))
    fetch('/api/categories').then(r => r.json()).then(j => setCategories(j.data ?? []))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const body = {
        title: form.title, clientId: form.clientId || null,
        categoryId: form.categoryId || null,
        amount: parseInt(form.amount) || 0,
        deadline: form.deadline || null, memo: form.memo || null,
      }
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message) }
      toast.success('案件を作成しました'); router.push('/projects')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div><Label>案件名 *</Label><Input required value={form.title} onChange={set('title')} placeholder="Webサイトリニューアル" /></div>
      <div><Label>クライアント</Label>
        <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.clientId} onChange={set('clientId')}>
          <option value="">— 選択してください —</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company_name ? ` (${c.company_name})` : ''}</option>)}
        </select>
      </div>
      <div><Label>カテゴリ</Label>
        <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.categoryId} onChange={set('categoryId')}>
          <option value="">— 選択してください —</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div><Label>金額（円）</Label><Input type="number" min="0" value={form.amount} onChange={set('amount')} placeholder="0" /></div>
      <div><Label>締切日</Label><input type="date" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" value={form.deadline} onChange={set('deadline')} /></div>
      <div><Label>メモ</Label><textarea className="mt-1 w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.memo} onChange={set('memo')} /></div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button>
        <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button>
      </div>
    </form>
  )
}

export default function NewProjectPage() {
  return (
    <AppShell title="新規案件">
      <div className="mb-4">
        <Link href="/projects"><Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />案件一覧</Button></Link>
      </div>
      <Suspense fallback={<div className="text-muted-foreground text-sm">読み込み中...</div>}>
        <NewProjectForm />
      </Suspense>
    </AppShell>
  )
}
