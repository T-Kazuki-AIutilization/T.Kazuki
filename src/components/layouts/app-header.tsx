'use client'
import { Menu, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = { title: string; onMenuClick?: () => void }

export function AppHeader({ title, onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative"><Bell className="h-4 w-4" /></Button>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">T</div>
      </div>
    </header>
  )
}
