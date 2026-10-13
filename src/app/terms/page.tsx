import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '利用規約 | FreelanceOS',
  description: 'FreelanceOS の利用規約です。サービスをご利用いただく前に必ずお読みください。',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
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
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">プライバシーポリシー</Link>
            <Link href="/tokusho" className="text-muted-foreground hover:text-foreground transition-colors">特定商取引法</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">利用規約</h1>
          <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年7月1日</p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="mb-3 text-lg font-semibold">第1条（適用）</h2>
            <p>本利用規約（以下「本規約」）は、FreelanceOS（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーの皆さまには、本規約に従って当サービスをご利用いただきます。</p>
            <p className="mt-2">本規約は、当サービスを利用するすべてのユーザーに適用されます。ユーザーが当サービスに登録した時点で、本規約に同意したものとみなします。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第2条（定義）</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>「当サービス」とは、FreelanceOS が提供するフリーランス事業管理ダッシュボードサービスを指します。</li>
              <li>「ユーザー」とは、当サービスに登録したすべての方を指します。</li>
              <li>「コンテンツ」とは、ユーザーが当サービスに登録・入力したデータ（クライアント情報、案件情報、売上データ等）を指します。</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第3条（利用登録）</h2>
            <p>当サービスへの登録は、メールアドレスとパスワードにより行います。登録時に入力いただいた情報は正確なものでなければなりません。虚偽の情報を登録した場合、利用を停止することがあります。</p>
            <p className="mt-2">登録は個人または個人事業主の方に限ります。18歳未満の方は保護者の同意が必要です。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第4条（サービス内容）</h2>
            <p>当サービスは、フリーランス・個人事業主の方を対象とした以下の機能を提供します。</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>クライアント・案件の管理</li>
              <li>売上・入金の記録と追跡</li>
              <li>事業ダッシュボードによる収益の可視化</li>
              <li>会計ソフト連携用 CSV エクスポート</li>
              <li>AI によるインサイト分析（Pro+ プランのみ）</li>
            </ul>
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <strong>重要:</strong> 当サービスは事業管理のサポートを目的としており、会計・税務・法務のアドバイスは提供しません。請求書の発行、インボイス準拠保証、確定申告支援は対象外です。専門家にご相談ください。
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第5条（料金・支払い）</h2>
            <p>当サービスには以下のプランがあります。</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Free プラン:</strong> 無料。クライアント3件・案件10件/月まで利用可能。</li>
              <li><strong>Pro プラン:</strong> 月額980円（税込）または年額9,408円（税込）。</li>
              <li><strong>Pro+ プラン:</strong> 月額1,480円（税込）または年額14,208円（税込）。</li>
            </ul>
            <p className="mt-2">有料プランの料金は、Stripe を通じてクレジットカードにより毎月（または毎年）自動で請求されます。料金は前払いとなります。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第6条（解約・返金）</h2>
            <p>有料プランはいつでも解約できます。解約後は当該請求期間の終了まで引き続きご利用いただけます。日割り返金は行いません。</p>
            <p className="mt-2">14日間の無料トライアル期間中に解約した場合、料金は発生しません。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第7条（禁止事項）</h2>
            <p>ユーザーは以下の行為を行ってはなりません。</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>法令または公序良俗に違反する行為</li>
              <li>当サービスへの不正アクセスまたはサーバーへの過度な負荷をかける行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>当サービスのリバースエンジニアリング・逆コンパイル</li>
              <li>当サービスを通じた第三者への迷惑行為</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第8条（コンテンツの取り扱い）</h2>
            <p>ユーザーが当サービスに登録したコンテンツの権利はユーザーに帰属します。当サービスは、サービス提供に必要な範囲でのみコンテンツを利用します。</p>
            <p className="mt-2">ユーザーはアカウント削除前に、CSV エクスポート機能等でデータを取得することができます。アカウント削除後はデータを復元できません。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第9条（知的財産権）</h2>
            <p>当サービスに関する知的財産権（ソフトウェア、デザイン、商標等）は、当サービス運営者または正当な権利者に帰属します。ユーザーは当サービスを私的利用の範囲でのみ使用できます。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第10条（免責事項）</h2>
            <p>当サービスはサービスの継続性・正確性を保証しません。当サービスの利用により生じた損害について、当サービス運営者の故意・重大な過失による場合を除き、責任を負いません。</p>
            <p className="mt-2">当サービスは予告なくサービス内容を変更・停止することがあります。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第11条（個人情報）</h2>
            <p>当サービスにおける個人情報の取り扱いについては、別途定める<Link href="/privacy" className="text-primary underline underline-offset-2">プライバシーポリシー</Link>に従います。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第12条（規約の変更）</h2>
            <p>当サービスは、必要に応じて本規約を変更することがあります。重要な変更がある場合は、サービス内またはメールにてご案内します。変更後も当サービスをご利用いただいた場合、変更後の規約に同意したものとみなします。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">第13条（準拠法・管轄裁判所）</h2>
            <p>本規約は日本法に準拠します。当サービスに関して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </section>

        </div>

        <div className="mt-12 rounded-xl border bg-slate-50 p-6 text-sm text-muted-foreground">
          <p>お問い合わせ: <a href="mailto:hello@freelanceos.app" className="text-primary underline underline-offset-2">hello@freelanceos.app</a></p>
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
