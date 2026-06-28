'use client'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layouts/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [form, setForm] = useState({ displayName: '', businessName: '', email: '' })
  const [loading, setLoading] = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => { fetch('/api/profile').then(r => r.json()).then(j => { if (j.data) setForm({ displayName: j.data.display_name || '', businessName: j.data.business_name || '', email: j.data.email || '' }) }) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true)
    try {
      const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error('保存に失敗しました')
      toast.success('設定を保存しました')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  return (
    <AppShell title="設定">
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        <div><Label>表示名</Label><Input value={form.displayName} onChange={set('displayName')} /></div>
        <div><Label>屋号</Label><Input value={form.businessName} onChange={set('businessName')} /></div>
        <div><Label>メールアドレス</Label><Input type="email" value={form.email} onChange={set('email')} /></div>
        <div className="flex justify-end"><Button type="submit" disabled={loading}>{loading ? '保存中...' : '変更を保存'}</Button></div>
      </form>
    </AppShell>
  )
}
