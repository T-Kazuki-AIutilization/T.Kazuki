'use client'
import { AdminSidebar } from './admin-sidebar'
import { Shield } from 'lucide-react'

type Props = { title: string; children: React.ReactNode }

export function AdminShell({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
          <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-medium text-violet-700">
            <Shield className="h-3 w-3" />管理者モード
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-medium text-violet-700">A</div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  )
}
