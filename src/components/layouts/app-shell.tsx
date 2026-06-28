'use client'
import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { MobileNav } from './mobile-nav'

type Props = { title: string; children: React.ReactNode }

export function AppShell({ title, children }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="lg:pl-60">
        <AppHeader title={title} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main className="p-4 pb-20 lg:p-6 lg:pb-6">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
