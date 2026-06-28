'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ADMIN_NAV, ADMIN_SUB_NAV } from '@/lib/constants/navigation'

export function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:bg-slate-900 lg:fixed lg:inset-y-0">
      <div className="flex h-16 items-center gap-2 border-b border-slate-700 px-6">
        <div className="h-8 w-8 rounded-lg bg-violet-500 flex items-center justify-center">
          <span className="text-sm font-bold text-white">F</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">FreelanceOS</span>
          <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">Admin</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-slate-800 text-blue-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white')}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          )
        })}
        <hr className="my-4 border-slate-700" />
        {ADMIN_SUB_NAV.map((item) => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <item.icon className="h-4 w-4" />{item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-medium text-violet-300">A</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">管理者</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
