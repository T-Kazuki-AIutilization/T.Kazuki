import type { Metadata } from 'next'
import { SiteShell } from '@/components/marketing/site-shell'

export const metadata: Metadata = {
  title: '広告の掲載について | FreelanceOS',
  description: 'FreelanceOS のブログ・ツールにおける広告（アフィリエイトプログラム）の利用と表示の方針です。',
  alternates: { canonical: '/ad-policy' },
}

export default function AdPolicyPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-12 text-sm leading-relaxed sm:px-6">
        <h1 className="text-2xl font-bold">広告の掲載について</h1>
        <p className="mt-4">FreelanceOS のブログ・ツールの一部では、アフィリエイトプログラム（成果報酬型広告）を利用しています。広告リンクを経由してサービスの申し込みなどがあった場合、運営者が広告主から報酬を受け取ることがあります。読者の方に追加の費用がかかることはありません。</p>
        <h2 className="mt-8 text-lg font-semibold">表示の方針</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>広告リンクを含むページには、ページの冒頭に「PR（プロモーション）」であることを表示します。</li>
          <li>広告リンクを置く枠には「PR」の表記と、広告リンクを含む旨の注記を付けます。</li>
          <li>広告リンクには、検索エンジン向けに広告であることを示す属性（rel="sponsored"）を付けます。</li>
        </ul>
        <h2 className="mt-8 text-lg font-semibold">掲載の基準</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>記事のテーマ（請求・入金管理、税金、確定申告など）に関係し、読者の役に立つと判断したサービスだけを紹介します。</li>
          <li>報酬の有無や金額によって、記事の説明や計算結果を変えることはありません。</li>
          <li>料金・機能などの最新の情報は、各サービスの公式サイトでご確認ください。</li>
        </ul>
        <h2 className="mt-8 text-lg font-semibold">利用している主なプログラム</h2>
        <p className="mt-2">株式会社ファンコミュニケーションズが運営する「A8.net」</p>
      </main>
    </SiteShell>
  )
}
