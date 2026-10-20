import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteShell } from '@/components/marketing/site-shell'

export const metadata: Metadata = {
  title: 'フリーランス向け無料ツール（登録不要）｜請求書作成・手取り計算 | FreelanceOS',
  description: 'ブラウザで使える無料ツール。請求書・見積書・納品書の作成（PDF 保存）、手取り・時間単価・国保料・源泉徴収・ふるさと納税上限の計算。登録不要、入力は端末内にのみ保存。',
  alternates: { canonical: '/tools' },
}

const TOOLS = [
  { href: '/tools/invoice', name: '請求書作成ツール', desc: '請求書・見積書・納品書を作成して PDF 保存。消費税 10%・源泉徴収 10.21% を自動計算、インボイス登録番号・振込先に対応。' },
  { href: '/tools/takehome', name: '手取り計算シミュレーター', desc: '売上と経費から所得税・住民税・国保・年金・事業税・消費税を差し引いた手取りを概算。2026 年分対応。' },
  { href: '/tools/rate', name: '時間単価計算ツール', desc: '目標の手取り年収・経費・稼働時間から、税金と保険料を含めて必要な売上と時間単価・日単価を逆算。' },
  { href: '/tools/nhi', name: '国民健康保険料の計算ツール', desc: '所得と世帯の加入者数から国保料を概算。医療・支援金・介護分の料率を自治体の値に変更できます。' },
  { href: '/tools/furusato', name: 'ふるさと納税の上限額シミュレーター', desc: '売上・経費・青色申告特別控除から、自己負担 2,000 円で済む寄附額の上限を概算。国保・年金の控除も自動反映。' },
  { href: '/tools/withholding', name: '源泉徴収税額の計算ツール', desc: '報酬額から 10.21%（100 万円超は 20.42%）の源泉徴収税額と請求額を計算。振込額からの逆算にも対応。' },
]

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
