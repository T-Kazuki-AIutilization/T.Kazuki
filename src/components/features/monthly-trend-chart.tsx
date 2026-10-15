'use client'

type Point = { month: string; revenue: number; paidAmount: number }

/** 直近 6 か月を YYYY-MM で返す（古い順） */
function lastMonths(n: number): string[] {
  const out: string[] = []
  const d = new Date()
  d.setDate(1)
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    out.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

function yen(n: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(n)
}

/** 依存ライブラリなしの SVG 棒グラフ（売上と入金済みを並べて表示） */
export function MonthlyTrendChart({ data, months = 6 }: { data: Point[]; months?: number }) {
  const keys = lastMonths(months)
  const byMonth = new Map(data.map((p) => [p.month, p]))
  const rows = keys.map((m) => ({ month: m, revenue: byMonth.get(m)?.revenue ?? 0, paid: byMonth.get(m)?.paidAmount ?? 0 }))
  const max = Math.max(1, ...rows.map((r) => r.revenue))
  const W = 600
  const H = 200
  const padL = 8
  const padB = 28
  const padT = 10
  const innerH = H - padB - padT
  const groupW = (W - padL * 2) / rows.length
  const barW = Math.min(28, groupW * 0.3)
  const allZero = rows.every((r) => r.revenue === 0)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-48 w-full" role="img" aria-label="月次売上推移">
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={padL} x2={W - padL} y1={padT + innerH * (1 - t)} y2={padT + innerH * (1 - t)} stroke="#e5e7eb" strokeDasharray="3 3" />
        ))}
        {rows.map((r, i) => {
          const cx = padL + groupW * i + groupW / 2
          const hRev = (r.revenue / max) * innerH
          const hPaid = (r.paid / max) * innerH
          return (
            <g key={r.month}>
              <rect x={cx - barW - 2} y={padT + innerH - hRev} width={barW} height={hRev} rx={3} fill="#1d4ed8" opacity={0.85}>
                <title>{`${r.month} 売上 ${yen(r.revenue)}`}</title>
              </rect>
              <rect x={cx + 2} y={padT + innerH - hPaid} width={barW} height={hPaid} rx={3} fill="#16a34a" opacity={0.85}>
                <title>{`${r.month} 入金済み ${yen(r.paid)}`}</title>
              </rect>
              <text x={cx} y={H - 8} textAnchor="middle" fontSize={11} fill="#6b7280">
                {r.month.slice(5)}月
              </text>
            </g>
          )
        })}
        {allZero && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={12} fill="#9ca3af">
            売上を登録するとグラフが表示されます
          </text>
        )}
      </svg>
      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-700" />売上（請求ベース）</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-600" />入金済み</span>
        <span className="ml-auto">最大 {yen(max)}</span>
      </div>
    </div>
  )
}
