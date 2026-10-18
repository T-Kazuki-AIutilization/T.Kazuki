import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicInvoiceTool } from './tool'
import { SITE_URL } from '@/lib/site'

export const metadata: Metadata = {
  title: '請求書作成ツール（無料・登録不要）｜見積書・納品書も。消費税・源泉徴収を自動計算して PDF 保存 | FreelanceOS',
  description:
    'ブラウザで請求書・見積書・納品書を作成して PDF 保存できる無料ツール。登録不要、入力内容は端末内にのみ保存。消費税 10% と源泉徴収 10.21% の自動計算、インボイス登録番号・振込先の記載に対応。フリーランス・個人事業主向け。',
  alternates: { canonical: '/tools/invoice' },
  openGraph: {
    title: '請求書作成ツール（無料・登録不要）| FreelanceOS',
    description: '請求書・見積書・納品書をブラウザで作成し PDF 保存。消費税・源泉徴収を自動計算。',
    type: 'website',
    locale: 'ja_JP',
    images: [{ url: '/blog/og/tools-invoice.png', width: 1200, height: 630 }],
  },
}

export default function InvoiceToolPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'FreelanceOS 請求書作成ツール',
    url: `${SITE_URL}/tools/invoice`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    description: '請求書・見積書・納品書をブラウザで作成して PDF 保存できる無料ツール。登録不要。',
    inLanguage: 'ja',
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b bg-white print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-lg font-bold">請求書作成ツール <span className="ml-1 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">無料・登録不要</span></h1>
            <p className="text-xs text-muted-foreground">請求書・見積書・納品書を作成して PDF 保存。消費税 10%・源泉徴収 10.21% を自動計算。入力内容は端末内にのみ保存されます。</p>
          </div>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/blog/freelance-invoice-how-to" className="text-muted-foreground hover:text-foreground">請求書の書き方</Link>
            <Link href="/templates" className="text-muted-foreground hover:text-foreground">Excel テンプレート</Link>
            <Link href="/signup" className="inline-flex h-8 items-center rounded-md bg-primary px-3 font-medium text-white hover:bg-primary/90">無料登録して案件と連携</Link>
          </nav>
        </div>
      </header>
      <PublicInvoiceTool />
      <section className="mx-auto max-w-3xl px-4 py-10 text-sm leading-relaxed text-muted-foreground print:hidden">
        <h2 className="text-base font-semibold text-foreground">このツールについて</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>請求書・見積書・納品書を切り替えて作成できます。明細は何行でも追加でき、小計・消費税（10%）・合計を自動計算します。</li>
          <li>原稿料・デザイン料など源泉徴収の対象になる報酬は、チェック 1 つで税抜額 × 10.21% を差し引いた請求額にできます。</li>
          <li>インボイス制度の登録番号（T から始まる 13 桁）と振込先を記載できます。</li>
          <li>「印刷 / PDF に保存」で A4 の PDF になります。発行者情報と内容はブラウザ内（この端末）にだけ保存され、サーバーには送信されません。</li>
          <li>書類の末尾に小さく「FreelanceOS で作成」と入ります。<Link href="/signup" className="text-primary hover:underline">FreelanceOS に無料登録</Link>すると案件から請求書を作成して入金管理に連携でき、Pro では表記なしで発行できます。</li>
        </ul>
        <h2 className="mt-8 text-base font-semibold text-foreground">あわせて読みたい</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li><Link href="/blog/freelance-invoice-how-to" className="text-primary hover:underline">フリーランスの請求書の書き方｜インボイス対応の記載項目と源泉徴収の計算</Link></li>
          <li><Link href="/blog/freelance-invoice-email-template" className="text-primary hover:underline">請求書を送るメールの文例｜件名・本文・入金催促</Link></li>
          <li><Link href="/blog/freelance-withholding-tax" className="text-primary hover:underline">フリーランスの源泉徴収とは？10.21% の計算方法</Link></li>
          <li><Link href="/blog/freelance-estimate-how-to" className="text-primary hover:underline">フリーランスの見積書の書き方</Link></li>
        </ul>
      </section>
    </>
  )
}
