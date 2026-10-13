'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AdminShell } from '@/components/layouts/admin-shell'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { toast } from 'sonner'
import { ChevronLeft, Save } from 'lucide-react'

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState('')
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/users/${id}`).then(r => r.json()).then(j => {
      if (j.data) { setUser(j.data); setPlan(j.data.plan ?? 'free'); setRole(j.data.role ?? 'user') }
    })
  }, [id])

  async function handleSave() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan, role }) })
      if (!res.ok) throw new Error('保存に失敗しました')
      const j = await res.json()
      setUser(j.data)
      toast.success('更新しました')
    } catch (err: any) { toast.error(err.message) } finally { setLoading(false) }
  }

  const planColor = (p: string): 'gray' | 'blue' | 'green' => ({ free: 'gray' as const, pro: 'blue' as const, pro_plus: 'green' as const }[p] ?? 'gray')

  if (!user) return <AdminShell title="ユーザー詳細"><div className="p-8 text-center text-muted-foreground">読み込み中...</div></AdminShell>

  return (
    <AdminShell title={user.display_name || user.email || 'ユーザー詳細'}>
      <div className="mb-4">
        <Link href="/admin/users"><Button variant="ghost" size="sm"><ChevronLeft className="h-4 w-4 mr-1" />ユーザー一覧</Button></Link>
      </div>

      <div className="max-w-lg space-y-5">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-sm mb-4">ユーザー情報</h2>
          <div className="space-y-2 text-sm">
            {[
              ['表示名', user.display_name || '(未設定)'],
              ['メール', user.email],
              ['登録日', user.created_at?.slice(0, 10)],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 py-1.5 border-b last:border-0">
                <span className="w-24 text-muted-foreground shrink-0">{k}</span>
                <span>{v}</span>
              </div>
            ))}
            <div className="flex gap-4 py-1.5 border-b">
              <span className="w-24 text-muted-foreground shrink-0">プラン</span>
              <StatusBadge label={user.plan ?? 'free'} color={planColor(user.plan)} />
            </div>
            <div className="flex gap-4 py-1.5">
              <span className="w-24 text-muted-foreground shrink-0">ロール</span>
              <StatusBadge label={user.role ?? 'user'} color={user.role === 'admin' ? 'amber' : 'gray'} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-sm">管理操作</h2>
          <div>
            <Label>プラン変更</Label>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={plan} onChange={e => setPlan(e.target.value)}>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="pro_plus">Pro+</option>
            </select>
          </div>
          <div>
            <Label>ロール変更</Label>
            <select className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white" value={role} onChange={e => setRole(e.target.value)}>
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />{loading ? '保存中...' : '変更を保存'}
          </Button>
        </div>
      </div>
    </AdminShell>
  )
}
