import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記 | FreelanceOS',
  description: 'FreelanceOS の特定商取引法に基づく表記です。',
  robots: { index: true, follow: true },
}

const items: { label: string; value: string | React.ReactNode }[] = [
  { label: '販売業者', value: '田中 一綺（個人事業主）' },
  { label: '運営責任者', value: '田中 一綺（たなか かずき）' },
  {
    label: '所在地',
    value: (
      <>
        〒550-0006<br />
        大阪府大阪市西区江之子島1-5-8-603
      </>
    ),
  },
  {
    label: '電話番号',
    value: (
      <>
        080-2507-6163<br />
        <span className="text-xs text-muted-foreground">受付時間: 平日 10:00〜18:00（土日祝除く）</span>
      </>
    ),
  },
  {
    label: 'メールアドレス',
    value: (
      <a href="mailto:t.kazuki.freelance@gmail.com" className="text-primary underline underline-offset-2">
        t.kazuki.freelance@gmail.com
      </a>
    ),
  },
  {
    label: 'サービス名',
    value: 'FreelanceOS（フリーランス事業管理ダッシュボード）',
  },
  {
    label: '販売価格',
    value: (
      <ul className="space-y-1">
        <li>Free プラン: 無料</li>
        <li>Pro プラン: 月額 980円（税込）/ 年額 9,408円（税込）</li>
        <li>Pro+ プラン: 月額 1,480円（税込）/ 年額 14,208円（税込）</li>
      </ul>
    ),
  },
  {
    label: '支払い方法',
    value: 'クレジットカード（Visa / Mastercard / American Express / JCB）',
  },
  {
    label: '支払い時期',
    value: (
      <>
        <p>月払い: 登録日から毎月同日に自動請求</p>
        <p className="mt-1">年払い: 登録日から毎年同日に自動請求</p>
        <p className="mt-1">無料トライアル（14日間）終了後に自動的に有料プランへ移行します。トライアル期間中に解約した場合、料金は発生しません。</p>
      </>
    ),
  },
  {
    label: 'サービス提供時期',
    value: '有料プラン登録完了後（または無料トライアル開始後）、即時ご利用いただけます。',
  },
  {
    label: '返品・解約について',
    value: (
      <>
        <p>有料プランはいつでも解約できます。解約は設定画面の「プラン管理」から行えます。</p>
        <p className="mt-1">解約後は当該請求期間の終了日までご利用いただけます。期間途中の解約による日割り返金は行いません。</p>
        <p className="mt-1">14日間の無料トライアル期間中に解約した場合、費用は一切発生しません。</p>
        <p className="mt-1">デジタルコンテンツ・ソフトウェアサービスの性質上、サービス提供開始後の返金はお断りしております（消費者契約法に基づく場合を除く）。</p>
      </>
    ),
  },
  {
    label: '動作環境',
    value: (
      <>
        <p>最新版の Google Chrome / Firefox / Safari / Microsoft Edge</p>
        <p className="mt-1">インターネット接続環境が必要です。</p>
      </>
    ),
  },
]

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-white">F</span>
            </div>
            <span className="font-bold">FreelanceOS</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">利用規約</Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">プライバシーポリシー</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">特定商取引法に基づく表記</h1>
          <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年7月1日</p>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {items.map(({ label, value }, i) => (
                <tr key={label} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <th className="w-40 px-5 py-4 text-left font-semibold text-foreground align-top sm:w-48">
                    {label}
                  </th>
                  <td className="px-5 py-4 text-muted-foreground leading-relaxed">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-xl border bg-slate-50 p-5 text-sm text-muted-foreground">
          <p>お問い合わせ: <a href="mailto:t.kazuki.freelance@gmail.com" className="text-primary underline underline-offset-2">t.kazuki.freelance@gmail.com</a></p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">トップ</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">© 2026 FreelanceOS. All rights reserved.</p>
      </footer>
    </div>
  )
}
