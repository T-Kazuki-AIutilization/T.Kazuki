import { BOOTH_TAX_URL, BOOTH_TAKEHOME_URL, BOOTH_RATE_URL, BOOTH_CASHFLOW_URL, BOOTH_BUNDLE_URL } from '@/content/blog'

// ツールページの「Excel 版」案内（BOOTH の有料テンプレート）。内容は各商品の説明に合わせる。
const ITEMS = {
  tax: { name: '確定申告準備キット（Excel）', price: '1,280円', href: BOOTH_TAX_URL, text: '準備〜提出までの 37 項目チェックリスト、経費帳・売上帳、勘定科目別の年間集計（青色申告決算書への転記用）、所得税の概算をひとつにまとめた Excel です。' },
  takehome: { name: '手取り計算シミュレーター（Excel）', price: '680円', href: BOOTH_TAKEHOME_URL, text: '国保の料率・均等割、控除額、消費税の特例（2 割・3 割）を自分の条件に合わせて編集でき、売上 300 万〜2,000 万円の早見表も自動で作れる Excel です。' },
  rate: { name: '時間単価計算＋見積作成シート（Excel）', price: '780円', href: BOOTH_RATE_URL, text: '目標年収・経費・稼働時間から必要な時間単価を逆算し、工程ごとの見積作成と案件ごとの実績単価の記録までできる Excel です。' },
  cashflow: { name: '資金繰り表＋納税積立シート（Excel）', price: '980円', href: BOOTH_CASHFLOW_URL, text: '月ごとの入金予定と経費から 12 か月先までの月末残高と、毎月いくら納税用に取り分けるべきかを計算する Excel です。納税カレンダーつき。' },
} as const

export function ExcelUpsell({ item }: { item: keyof typeof ITEMS }) {
  const x = ITEMS[item]
  return (
    <div className="mt-10 rounded-xl border bg-slate-50 p-5 text-sm">
      <p className="font-semibold">{x.name}</p>
      <p className="mt-1 text-muted-foreground">{x.text}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a href={x.href} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-md border border-primary bg-white px-4 text-sm font-medium text-primary hover:bg-primary hover:text-white">BOOTH で見る（{x.price}）↗</a>
        <a href={BOOTH_BUNDLE_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">7 点セット（3,980円）もあります ↗</a>
      </div>
    </div>
  )
}
