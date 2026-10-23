import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | FreelanceOS',
  description: 'FreelanceOS のプライバシーポリシーです。個人情報の取り扱いについて説明しています。',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
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
            <Link href="/tokusho" className="text-muted-foreground hover:text-foreground transition-colors">特定商取引法</Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">プライバシーポリシー</h1>
          <p className="mt-2 text-sm text-muted-foreground">最終更新日: 2026年7月1日</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">

          <p className="text-muted-foreground">
            FreelanceOS（以下「当サービス」）は、ユーザーの個人情報の保護を重要な責務と考えています。本プライバシーポリシーでは、当サービスが収集する情報、利用目的、および管理方法について説明します。
          </p>

          <section>
            <h2 className="mb-3 text-lg font-semibold">1. 収集する情報</h2>
            <p className="mb-2 font-medium text-foreground">ユーザーから直接収集する情報：</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>メールアドレス（アカウント登録時）</li>
              <li>氏名・ユーザー名（任意設定時）</li>
              <li>支払い情報（Stripe が処理。当サービスはカード番号を保持しません）</li>
              <li>ユーザーが入力したコンテンツ（クライアント情報、案件情報、売上データ等）</li>
            </ul>
            <p className="mb-2 mt-4 font-medium text-foreground">自動的に収集する情報：</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>IPアドレス、ブラウザの種類・バージョン</li>
              <li>アクセス日時、参照URL</li>
              <li>デバイス情報（OS、画面解像度等）</li>
              <li>Cookie および類似技術による情報</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">2. 利用目的</h2>
            <p className="mb-2">収集した情報は以下の目的で利用します。</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>当サービスの提供・運営・改善</li>
              <li>ユーザー認証およびアカウント管理</li>
              <li>料金の請求・決済処理</li>
              <li>サービスに関する重要なお知らせの送信</li>
              <li>ユーザーサポートへの対応</li>
              <li>不正利用の検知・防止</li>
              <li>利用状況の分析によるサービス改善</li>
              <li>ユーザーの同意を得た場合のマーケティング情報の送信</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">3. 第三者への提供</h2>
            <p className="mb-2">当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
            </ul>
            <p className="mb-2 mt-4 font-medium text-foreground">利用する主なサービス（データ処理委託先）：</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong>Supabase</strong>（データベース・認証）— PostgreSQL によるデータ保存、ユーザー認証処理</li>
              <li><strong>Stripe</strong>（決済処理）— クレジットカード情報の処理・管理</li>
              <li><strong>Vercel</strong>（ホスティング）— アプリケーションの配信</li>
            </ul>
            <p className="mt-3 text-muted-foreground">各社のプライバシーポリシーについては、各社のウェブサイトをご確認ください。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">4. Cookie の利用</h2>
            <p className="mb-2 text-muted-foreground">当サービスは以下の目的で Cookie を使用します。</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong>必須 Cookie：</strong>ログインセッションの維持等、サービスの基本機能に必要</li>
              <li><strong>分析 Cookie：</strong>サービス利用状況の把握・改善（Google Analytics 等）</li>
            </ul>
            <p className="mt-2 text-muted-foreground">ブラウザの設定により Cookie を無効にできますが、一部機能が正しく動作しない場合があります。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">5. データの保管・セキュリティ</h2>
            <p className="text-muted-foreground">ユーザーデータは PostgreSQL データベースに保存され、行レベルセキュリティ（RLS）により各ユーザーは自分のデータのみアクセスできます。通信はすべて SSL/TLS で暗号化されます。</p>
            <p className="mt-2 text-muted-foreground">アカウントを削除すると、登録データは速やかに削除されます。バックアップデータは最大30日後に削除されます。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">6. ユーザーの権利</h2>
            <p className="mb-2 text-muted-foreground">ユーザーは以下の権利を有します。</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>保有する個人情報の開示請求</li>
              <li>誤りのある個人情報の訂正・削除請求</li>
              <li>マーケティングメールの配信停止（各メール内の配信停止リンクから）</li>
              <li>CSV エクスポートによるデータのポータビリティ</li>
              <li>アカウントの削除（設定画面から実施可能）</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">7. 未成年者のプライバシー</h2>
            <p className="text-muted-foreground">当サービスは18歳未満の方を対象としていません。18歳未満の方の個人情報を意図的に収集することはありません。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">8. プライバシーポリシーの変更</h2>
            <p className="text-muted-foreground">本ポリシーを変更する場合は、当ページにて告知します。重要な変更がある場合は、メールでもお知らせします。変更後も当サービスをご利用いただいた場合、変更後のポリシーに同意したものとみなします。</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">9. お問い合わせ</h2>
            <p className="text-muted-foreground">個人情報の取り扱いに関するご質問・ご要望は以下までご連絡ください。</p>
            <div className="mt-3 rounded-xl border bg-slate-50 p-4 text-muted-foreground">
              <p>FreelanceOS プライバシー担当</p>
              <p>メール: <a href="mailto:hello@freelanceos.app" className="text-primary underline underline-offset-2">hello@freelanceos.app</a></p>
            </div>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">トップ</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
          <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</Link>
          <Link href="/ad-policy" className="hover:text-foreground transition-colors">広告の掲載について</Link>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">© 2026 FreelanceOS. All rights reserved.</p>
      </footer>
    </div>
  )
}
