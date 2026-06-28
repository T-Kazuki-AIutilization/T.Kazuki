'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MAIN_NAV } from '@/lib/constants/navigation'

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white lg:hidden">
      <div className="flex items-center justify-around py-2">
        {MAIN_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]',
                isActive ? 'text-primary' : 'text-muted-foreground')}>
              <item.icon className="h-5 w-5" /><span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
