'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', companyName: '', email: '', phone: '', memo: '' })
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const j = await res.json(); throw new Error(j.error?.message) }
      toast.success('クライアントを作成しました')
      router.push('/clients')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  return (
    <AppShell title="クライアント作成">
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <div><Label>クライアント名 *</Label><Input required value={form.name} onChange={set('name')} /></div>
        <div><Label>会社名</Label><Input value={form.companyName} onChange={set('companyName')} /></div>
        <div><Label>メール</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
        <div><Label>電話番号</Label><Input value={form.phone} onChange={set('phone')} /></div>
        <div><Label>メモ</Label><textarea className="w-full rounded-md border px-3 py-2 text-sm" rows={3} value={form.memo} onChange={set('memo')} /></div>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button><Button type="submit" disabled={loading}>{loading ? '保存中...' : '保存する'}</Button></div>
      </form>
    </AppShell>
  )
}
