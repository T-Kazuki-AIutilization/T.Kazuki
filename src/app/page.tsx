import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FreelanceOS — 案件・売上・クライアントを1画面で管理',
  description:
    'Notion、Excel、メールに散らばった情報をひとつに。フリーランス専用の事業管理ダッシュボード。案件進捗・売上記録・入金追跡・収益分析が月額980円〜。',
  keywords: 'フリーランス 案件管理, フリーランス 売上管理, フリーランス ダッシュボード, 業務委託 管理ツール',
  openGraph: {
    title: 'FreelanceOS — 案件・売上・クライアントを1画面で管理',
    description: '案件・売上・クライアントをひとつの画面で「見える化」する、フリーランス専用の事業管理ダッシュボード。',
    type: 'website',
    locale: 'ja_JP',
  },
}

const PAIN_POINTS = [
  {
    icon: '📋',
    title: 'バラバラなツール',
    desc: '案件はNotion、売上はスプレッドシート、入金確認はメール。情報がどこにあるか分からない。',
  },
  {
    icon: '💸',
    title: '今月の入金が読めない',
    desc: 'クライアントごとに入金サイクルが違う。先月の売上は把握しているが、今月の着金予定が不明。',
  },
  {
    icon: '⏰',
    title: '管理に時間を取られる',
    desc: '月末の売上集計に毎回1〜2時間かかる。本業ではなく「管理のための管理」に追われている。',
  },
]

const FEATURES = [
  {
    icon: '📊',
    title: 'ダッシュボード',
    desc: '今月の売上・入金予定・進行中案件・クライアント数を一画面で把握。毎朝30秒で事業の全体像を確認。',
    badge: 'All プラン',
  },
  {
    icon: '👥',
    title: 'クライアント管理',
    desc: '連絡先・メモ・タグ・過去取引履歴を一元管理。「あのクライアントとの取引内容」をすぐに確認。',
    badge: 'All プラン',
  },
  {
    icon: '📁',
    title: '案件管理',
    desc: 'ステータス（進行中・完了・入金済み）・締切・金額をカンバン形式で管理。漏れをゼロに。',
    badge: 'All プラン',
  },
  {
    icon: '💰',
    title: '売上・入金追跡',
    desc: '売上記録から入金確認まで一貫して管理。未入金アラートで回収漏れを防止。',
    badge: 'Pro〜',
  },
  {
    icon: '📤',
    title: 'CSV エクスポート',
    desc: 'freee・マネーフォワード対応のCSVフォーマットでデータを出力。会計ソフトと連携して確定申告もスムーズ。',
    badge: 'Pro〜',
  },
  {
    icon: '🤖',
    title: 'AI インサイト',
    desc: '売上傾向の分析・時間単価ランキング・クライアント偏重度の自動検出。「どの案件が最も稼げるか」を可視化（順次提供）。',
    badge: 'Pro+（準備中）',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '¥0',
    period: '/月',
    desc: 'まずは試してみたい方へ',
    features: ['クライアント 3件まで', '案件 10件/月まで', 'ダッシュボード（簡易版）', 'メールサポート'],
    cta: '無料で始める',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '¥980',
    period: '/月',
    desc: '本格的に事業管理を始める方へ',
    features: ['クライアント・案件 無制限', 'フルダッシュボード', '売上・入金追跡', 'CSVエクスポート（freee/MF対応）', 'メール + チャットサポート'],
    cta: '14日間無料で試す',
    href: '/signup?plan=pro',
    highlight: true,
  },
  {
    name: 'Pro+',
    price: '¥1,480',
    period: '/月',
    desc: '事業の最適化を目指す方へ',
    features: ['Pro の全機能', 'クライアント別収益分析', '優先サポート', '分析機能（AIインサイト・時間単価分析）を順次先行提供'],
    cta: '14日間無料で試す',
    href: '/signup?plan=pro-plus',
    highlight: false,
  },
]

const FAQS = [
  {
    q: 'freeeやマネーフォワードと何が違いますか？',
    a: 'freee・マネーフォワードは「会計・確定申告」のツールです。FreelanceOSは「事業の見える化」に特化したツール。両者は競合ではなく、FreelanceOSでまとめたデータをCSVで会計ソフトに渡す設計です。「freeeの前に、まずFreelanceOS」という使い方を想定しています。',
  },
  {
    q: '請求書の発行はできますか？',
    a: '現時点ではご対応しておりません。FreelanceOSは案件・売上・入金の管理に特化しており、請求書発行は専門ツール（Misoca、freee請求書等）をご利用ください。CSVエクスポートで請求書ツールとの連携が可能です。',
  },
  {
    q: '無料プランからの変更はいつでもできますか？',
    a: 'はい、いつでもアップグレード・ダウングレードが可能です。アップグレード時は日割り計算で即日適用されます。',
  },
  {
    q: 'データはどこに保存されますか？セキュリティは？',
    a: 'データはSupabase（PostgreSQL）に保存され、RLS（行レベルセキュリティ）により他のユーザーのデータには一切アクセスできません。全通信はSSL/TLSで暗号化されています。',
  },
  {
    q: '法人でも利用できますか？',
    a: 'フリーランス・個人事業主の方を主な対象としていますが、法人の方もご利用いただけます。複数ユーザー対応（チーム機能）は将来のロードマップに含まれています。',
  },
]

export default function LandingPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FreelanceOS',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'フリーランス専用の事業管理ダッシュボード。案件・売上・クライアント・入金を1画面で管理。',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'JPY', name: 'Free' },
      { '@type': 'Offer', price: '980', priceCurrency: 'JPY', name: 'Pro（月額）' },
      { '@type': 'Offer', price: '1480', priceCurrency: 'JPY', name: 'Pro+（月額）' },
    ],
  }
  return (
    <div className="min-h-screen bg-white text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">F</span>
            </div>
            <span className="text-lg font-bold">FreelanceOS</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">機能</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">料金</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">ブログ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 pb-24 pt-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            月額980円〜 · 14日間無料トライアル
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Notion、Excel、メール…
            <br />
            <span className="text-primary">バラバラの管理</span>、もう終わりにしませんか？
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            案件・売上・クライアントを1画面で管理。
            <br className="hidden sm:block" />
            フリーランスの事業が「見える」ダッシュボード。
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 text-base font-semibold text-white hover:bg-primary/90 transition-colors sm:w-auto"
            >
              無料で始める（クレジットカード不要）
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border px-8 text-base font-medium hover:bg-slate-50 transition-colors sm:w-auto"
            >
              ログイン
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Freeプランはずっと無料 · クレジットカード登録不要 · いつでもキャンセル可
          </p>
        </div>

        {/* Dashboard mockup */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="overflow-hidden rounded-xl border bg-slate-900 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-slate-500">freelanceos.app/dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
              {[
                { label: '今月の売上', value: '¥487,000', sub: '先月比 +12%', color: 'text-green-400' },
                { label: '入金待ち', value: '¥220,000', sub: '3件', color: 'text-amber-400' },
                { label: '進行中案件', value: '8', sub: '件', color: 'text-blue-400' },
                { label: 'クライアント', value: '12', sub: '社', color: 'text-purple-400' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg bg-slate-800 p-4">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-700 px-6 pb-6 pt-4">
              <p className="mb-3 text-xs font-medium text-slate-400">直近の案件</p>
              <div className="space-y-2">
                {[
                  { name: 'Webサイトリニューアル', client: '株式会社アルファ', amount: '¥150,000', status: '進行中', color: 'bg-blue-500' },
                  { name: 'ロゴデザイン', client: '田中デザイン事務所', amount: '¥45,000', status: '入金済み', color: 'bg-green-500' },
                  { name: 'iOS アプリ開発', client: 'ベータ株式会社', amount: '¥280,000', status: '請求済み', color: 'bg-amber-500' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded bg-slate-800/50 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${p.color}`} />
                      <div>
                        <p className="text-xs font-medium text-slate-200">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.client}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-200">{p.amount}</p>
                      <p className="text-xs text-slate-500">{p.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">こんな悩み、ありませんか？</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {PAIN_POINTS.map((item) => (
              <div key={item.title} className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 rounded-xl border bg-primary/5 p-6 text-center">
            <p className="text-lg font-semibold">
              FreelanceOS なら、これらをすべて解決できます。
            </p>
            <p className="mt-2 text-muted-foreground">
              1つのダッシュボードに集約して、「管理」を30秒で終わらせましょう。
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">主要機能</h2>
            <p className="mt-4 text-muted-foreground">事業管理に必要な機能を、シンプルに。</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{f.badge}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            ベータユーザーの声
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                quote: '毎月の売上集計が1時間から5分に短縮されました。入金漏れも一度もないです。',
                name: 'K.T. さん',
                role: 'フリーランスエンジニア（32歳）',
              },
              {
                quote: '案件数が多いので管理が大変でしたが、FreelanceOSで全部一元化できました。freeeとの連携も楽。',
                name: 'H.S. さん',
                role: 'フリーランスイラストレーター（27歳）',
              },
              {
                quote: '複数の収入源を統合して見られるのが最高。時間単価で案件を比較できて、仕事の選び方が変わりました。',
                name: 'R.M. さん',
                role: 'エンジニア兼YouTuber（29歳）',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-xl border bg-white p-6 text-left shadow-sm">
                <p className="mb-4 text-sm leading-relaxed text-foreground">「{t.quote}」</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">シンプルな料金プラン</h2>
            <p className="mt-4 text-muted-foreground">
              有料プランは14日間無料トライアル付き。いつでもキャンセル可能。
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-6 ${plan.highlight ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white shadow-sm'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-900">
                      人気 No.1
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : ''}`}>{plan.name}</h3>
                  <p className={`mt-1 text-sm ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {plan.desc}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 text-base ${plan.highlight ? 'text-amber-300' : 'text-green-500'}`}>✓</span>
                      <span className={plan.highlight ? 'text-primary-foreground/90' : ''}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-primary hover:bg-slate-100'
                      : 'border border-primary bg-white text-primary hover:bg-primary hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            ※ 価格はすべて税込。トライアル期間中に解約した場合、料金は発生しません。
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">3ステップで始められる</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: '01', title: 'アカウント作成', desc: 'メールアドレスだけで登録完了。クレジットカード不要。' },
              { step: '02', title: 'クライアント・案件を登録', desc: '現在の案件とクライアントを登録するだけ。インポート機能でスプレッドシートからも移行可能。' },
              { step: '03', title: 'ダッシュボードを確認', desc: '事業の全体像が一目で分かるようになります。毎朝30秒のチェックルーティンが完成。' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">{s.step}</span>
                </div>
                <h3 className="mb-2 font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">よくある質問</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-3 font-semibold text-sm sm:text-base">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            あなたの事業を、今日から「見える化」しましょう。
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Freeプランはずっと無料。Pro / Pro+ は14日間無料トライアル付き。
          </p>
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 text-base font-semibold text-primary hover:bg-slate-100 transition-colors"
          >
            無料アカウントを作成する
          </Link>
          <p className="mt-4 text-sm text-primary-foreground/60">
            クレジットカード不要 · いつでもキャンセル可 · 解約後もFreeプランで継続利用可
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-white">F</span>
              </div>
              <span className="font-bold">FreelanceOS</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">ログイン</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">新規登録</Link>
              <a href="#pricing" className="hover:text-foreground transition-colors">料金プラン</a>
              <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
              <Link href="/blog" className="hover:text-foreground transition-colors">ブログ</Link>
              <a href="https://freelancekt.booth.pm" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Excelテンプレート（BOOTH）</a>
            </nav>
          </div>
          <div className="mt-6 border-t pt-6 text-center text-xs text-muted-foreground">
            <div className="flex flex-wrap justify-center gap-4 mb-3">
              <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
              <Link href="/tokusho" className="hover:text-foreground transition-colors">特定商取引法に基づく表記</Link>
            </div>
            <p>© 2026 FreelanceOS. All rights reserved.</p>
            <p className="mt-1">
              本サービスは事業管理のサポートを目的としており、会計・税務・法務のアドバイスは提供しません。
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
