'use client'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layouts/admin-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { NOTICE_CATEGORIES } from '@/lib/constants/navigation'
import { toast } from 'sonner'
import { Plus, Trash2, Send, X } from 'lucide-react'

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', category: 'info', status: 'draft' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const load = () => fetch('/api/admin/notices').then(r => r.json()).then(j => setNotices(j.data ?? []))
  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/admin/notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('作成に失敗しました')
      toast.success('作成しました')
      setCreating(false)
      setForm({ title: '', body: '', category: 'info', status: 'draft' })
      load()
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  async function handlePublish(id: string) {
    const res = await fetch(`/api/admin/notices/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'published' }) })
    if (res.ok) { toast.success('公開しました'); load() }
    else { toast.error('公開に失敗しました') }
  }

  async function handleDelete(id: string) {
    if (!confirm('このお知らせを削除しますか？')) return
    const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('削除しました'); load() }
    else { toast.error('削除に失敗しました') }
  }

  return (
    <AdminShell title="お知らせ管理">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreating(c => !c)}>
          {creating ? <><X className="h-4 w-4 mr-1" />キャンセル</> : <><Plus className="h-4 w-4 mr-1" />新規作成</>}
        </Button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">新規お知らせ</h2>
          <div><Label>タイトル</Label><Input required value={form.title} onChange={set('title')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>カテゴリ</Label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.category} onChange={set('category')}>
                <option value="info">お知らせ</option>
                <option value="maintenance">メンテナンス</option>
                <option value="feature">機能追加</option>
              </select>
            </div>
            <div><Label>ステータス</Label>
              <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={form.status} onChange={set('status')}>
                <option value="draft">下書き</option>
                <option value="published">公開</option>
              </select>
            </div>
          </div>
          <div><Label>本文</Label><textarea className="mt-1 w-full rounded-md border px-3 py-2 text-sm" rows={5} required value={form.body} onChange={set('body')} /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreating(false)}>キャンセル</Button>
            <Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">タイトル</th>
            <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">カテゴリ</th>
            <th className="px-4 py-3 text-center font-medium">ステータス</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr></thead>
          <tbody>{notices.map(n => {
            const cat = NOTICE_CATEGORIES[n.category as keyof typeof NOTICE_CATEGORIES]
            return (
              <tr key={n.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{n.title}<div className="text-xs text-muted-foreground mt-0.5">{n.created_at?.slice(0, 10)}</div></td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">{cat && <StatusBadge label={cat.label} color={cat.color} />}</td>
                <td className="px-4 py-3 text-center"><StatusBadge label={n.status === 'published' ? '公開中' : '下書き'} color={n.status === 'published' ? 'green' : 'gray'} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {n.status !== 'published' && (
                      <Button size="sm" variant="outline" onClick={() => handlePublish(n.id)}><Send className="h-3 w-3 mr-1" />公開</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(n.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </td>
              </tr>
            )
          })}</tbody>
        </table>
        {notices.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">お知らせがまだありません</div>}
      </div>
    </AdminShell>
  )
}
