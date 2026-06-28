'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MAIN_NAV, SUB_NAV } from '@/lib/constants/navigation'

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:border-r lg:bg-white lg:fixed lg:inset-y-0">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">F</span>
        </div>
        <span className="text-lg font-bold text-foreground">FreelanceOS</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {MAIN_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          )
        })}
        <hr className="my-4 border-border" />
        {SUB_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>
              <item.icon className="h-4 w-4" />{item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">T</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">テスト太郎</p>
            <p className="text-xs text-muted-foreground">Pro プラン</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
