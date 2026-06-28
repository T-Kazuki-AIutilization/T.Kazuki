import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/tokens.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'FreelanceOS — フリーランスの事業管理ダッシュボード',
  description: '案件・売上・クライアントを1画面で見える化。フリーランス専用の事業管理ツール。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
