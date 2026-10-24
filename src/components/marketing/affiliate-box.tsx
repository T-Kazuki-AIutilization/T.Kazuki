import Link from 'next/link'
import { activeOffers } from '@/content/affiliates'

/** 提携（広告）リンクの枠。URL 未設定のサービスは表示せず、1 件もなければ何も描画しない */
export function AffiliateBox({ title, ids, className = 'mt-8' }: { title: string; ids: string[]; className?: string }) {
  const offers = activeOffers(ids)
  if (!offers.length) return null
  return (
    <aside className={`${className} rounded-xl border bg-white p-5`}>
      <p className="flex items-center gap-2 font-semibold"><span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">PR</span>{title}</p>
      <ul className="mt-3 space-y-3">
        {offers.map((o) => (
          <li key={o.id} className="text-sm">
            <a href={o.url} target="_blank" rel="sponsored nofollow noopener" className="font-medium text-primary hover:underline">{o.name} ↗</a>
            {o.pixel && <img src={o.pixel} width={1} height={1} alt="" className="inline" />}
            <p className="mt-0.5 text-muted-foreground">{o.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">このボックスには広告（提携）リンクを含みます。料金・機能は各公式サイトでご確認ください。</p>
    </aside>
  )
}

/** ページ冒頭（ファーストビュー）の広告表示。ids のどれかが有効なときだけ表示する */
export function AdNotice({ ids, className = 'mt-3' }: { ids: string[]; className?: string }) {
  if (!activeOffers(ids).length) return null
  return (
    <p className={`${className} rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900`}>
      【PR】このページにはプロモーション（広告）が含まれています。<Link href="/ad-policy" className="underline">広告の掲載について</Link>
    </p>
  )
}
