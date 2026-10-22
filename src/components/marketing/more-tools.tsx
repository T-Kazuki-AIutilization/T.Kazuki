import Link from 'next/link'
import { TOOLS } from '@/content/tools'

/** ツールページ下部の「ほかの無料ツール」。current は表示中のツールの href */
export function MoreTools({ current }: { current: string }) {
  const items = TOOLS.filter((t) => t.href !== current)
  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-base font-semibold text-foreground">ほかの無料ツール</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {items.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="block rounded-lg border bg-white p-3 text-sm transition-shadow hover:shadow-sm">
              <span className="font-medium text-primary">{t.name}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{t.desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
