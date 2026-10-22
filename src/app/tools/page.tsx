import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'
import { TOOLS } from '@/content/tools'

export const metadata: Metadata = {
  title: 'フリーランス向け無料ツール（登録不要）｜請求書作成・手取り計算 | FreelanceOS',
  description: 'ブラウザで使える無料ツール。請求書・見積書・納品書の作成（PDF 保存）、手取り・時間単価・国保料・源泉徴収・ふるさと納税上限の計算。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools' },
}


export default function ToolsIndexPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold">無料ツール <span className="ml-1 align-middle rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">登録不要</span></h1>
        <p className="mt-2 text-muted-foreground">ブラウザで完結し、入力内容は端末内にだけ保存されます。</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <li key={t.href} className="rounded-xl border p-5 transition-shadow hover:shadow-sm">
              <Link href={t.href} className="block">
                <h2 className="text-lg font-semibold hover:text-primary">{t.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-12 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="font-semibold">案件・売上・入金まで管理するなら FreelanceOS</p>
          <p className="mt-1 text-sm text-muted-foreground">案件から請求書を作成して「請求済み」で入金管理に登録。未入金をダッシュボードで確認できます。無料プランあり。</p>
          <Link href="/signup" className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90">無料ではじめる</Link>
        </div>
      </main>
    </SiteShell>
  )
}
