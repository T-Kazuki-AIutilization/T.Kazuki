'use client'
import { useEffect, useState } from 'react'
import { AdminShell } from '@/components/layouts/admin-shell'
import { StatusBadge } from '@/components/ui/status-badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    fetch(`/api/admin/users${q}`).then(r => r.json()).then(j => setUsers(j.data?.data ?? j.data ?? []))
  }, [search])

  const planColor = (p: string) => ({ free: 'gray', pro: 'blue', pro_plus: 'green' }[p] ?? 'gray')

  return (
    <AdminShell title="ユーザー管理">
      <div className="mb-4"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="名前・メールで検索" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div></div>
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b"><tr>
            <th className="px-4 py-3 text-left font-medium">名前</th>
            <th className="px-4 py-3 text-left font-medium">メール</th>
            <th className="px-4 py-3 text-center font-medium">プラン</th>
            <th className="px-4 py-3 text-right font-medium">登録日</th>
          </tr></thead>
          <tbody>{users.map(u => (
            <tr key={u.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => window.location.href=`/admin/users/${u.id}`}>
              <td className="px-4 py-3 font-medium">{u.display_name || '(未設定)'}</td>
              <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
              <td className="px-4 py-3 text-center"><StatusBadge label={u.plan} color={planColor(u.plan)} /></td>
              <td className="px-4 py-3 text-right text-muted-foreground">{u.created_at?.slice(0, 10)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </AdminShell>
  )
}
