import Link from 'next/link'
import { BOOTH_SHOP_URL, NOTE_URL, X_URL } from '@/lib/site'

/** ランディング以外の公開ページ（ブログ・規約など）で共用するヘッダー／フッター */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            <span className="font-bold">FreelanceOS</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">ブログ</Link>
            <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">テンプレート</Link>
            <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">ツール</Link>
            <Link href="/#pricing" className="hidden text-muted-foreground hover:text-foreground transition-colors sm:inline">料金</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">ログイン</Link>
            <Link
              href="/signup"
              className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">トップ</Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">ブログ</Link>
          <Link href="/templates" className="hover:text-foreground transition-colors">テンプレート</Link>
          <Link href="/tools" className="hover:text-foreground transition-colors">無料ツール</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</Link>
          <a href={BOOTH_SHOP_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">BOOTH</a>
          <a href={X_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">X</a>
          <a href={NOTE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">note</a>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">© 2026 FreelanceOS. All rights reserved.</p>
      </footer>
    </div>
  )
}
