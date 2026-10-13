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
          <footer className="mx-auto max-w-[1200px] mt-8 border-t pt-4 pb-2 hidden lg:flex flex-wrap gap-4 text-xs text-muted-foreground">
            <a href="/terms" className="hover:text-foreground transition-colors">利用規約</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</a>
            <a href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</a>
            <span className="ml-auto">© 2026 FreelanceOS</span>
          </footer>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
