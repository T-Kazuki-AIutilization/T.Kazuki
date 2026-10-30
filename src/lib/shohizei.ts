/**
 * 個人事業者の消費税（国税 7.8%・6.24% ＋ 地方消費税 22/78）の納付税額の概算。
 * - 2 割特例: 2026 年分まで。特別控除税額 = （売上の消費税額 − 返還等対価の消費税額）× 80%（付表 6 簡易版）
 * - 3 割特例: 2027・2028 年分。同じ計算で 70%（令和 8 年度改正）
 * - 簡易課税: 控除対象仕入税額 = （売上の消費税額 − 返還等対価の消費税額）× みなし仕入率（1 種類の事業のみ）
 * 課税標準額は税率ごとに 1,000 円未満、差引税額・地方消費税は 100 円未満を切り捨て。
 * 出典: 国税庁「2 割特例用 消費税及び地方消費税の確定申告の手引き」・消費税 Q&A 問 117-3。
 */

export const JIGYO = [
  { id: 1, label: '第 1 種（卸売業）', rate: 0.9 },
  { id: 2, label: '第 2 種（小売業など）', rate: 0.8 },
  { id: 3, label: '第 3 種（製造業・建設業など）', rate: 0.7 },
  { id: 4, label: '第 4 種（飲食店業など）', rate: 0.6 },
  { id: 5, label: '第 5 種（サービス業など）', rate: 0.5 },
  { id: 6, label: '第 6 種（不動産業）', rate: 0.4 },
] as const

export type MethodId = 'niwari' | 'sanwari' | 'kani'

/** 税込金額 → 税率ごとの対価の額・課税標準額・消費税額・返還等対価の消費税額 */
function byRate(gross: number, refund: number, rate: 10 | 8) {
  const taxBase = rate === 10 ? 110 : 108
  const kokuzei = rate === 10 ? 7.8 : 6.24
  const taika = Math.floor((Math.max(0, gross) * 100) / taxBase)
  const hyojun = Math.floor(taika / 1000) * 1000
  const tax = Math.floor((hyojun * kokuzei) / 100)
  const refundTax = Math.floor((Math.max(0, refund) * kokuzei) / taxBase)
  return { taika, hyojun, tax, refundTax }
}

export type Result = {
  std: ReturnType<typeof byRate>
  red: ReturnType<typeof byRate>
  hyojun: number
  tax: number
  refundTax: number
  base: number
  deduction: number
  kokuzei: number
  chiho: number
  total: number
}

/** 申告書の流れに沿って計算。deductionRate は 2 割特例 0.8・3 割特例 0.7・簡易課税はみなし仕入率。 */
export function calc(i: { std: number; stdRefund: number; red: number; redRefund: number; deductionRate: number }): Result {
  const std = byRate(i.std, i.stdRefund, 10)
  const red = byRate(i.red, i.redRefund, 8)
  const tax = std.tax + red.tax
  const refundTax = std.refundTax + red.refundTax
  // 付表 6 の ⑤（③ − ④）と ⑥（特別控除税額）は税率ごとに計算して合計する
  const base5 = Math.max(0, std.tax - std.refundTax) + Math.max(0, red.tax - red.refundTax)
  const deduction = Math.floor(Math.max(0, std.tax - std.refundTax) * i.deductionRate) + Math.floor(Math.max(0, red.tax - red.refundTax) * i.deductionRate)
  const kokuzei = Math.max(0, Math.floor((tax - deduction - refundTax) / 100) * 100)
  const chiho = Math.floor((kokuzei * 22) / 78 / 100) * 100
  return { std, red, hyojun: std.hyojun + red.hyojun, tax, refundTax, base: base5, deduction, kokuzei, chiho, total: kokuzei + chiho }
}

/** 申告する年分で使える特例（個人事業者・基準期間の課税売上高 1,000 万円以下などの要件を満たす場合） */
export function tokurei(year: number): { id: 'niwari' | 'sanwari'; label: string; rate: number } | null {
  if (year <= 2026) return { id: 'niwari', label: '2 割特例', rate: 0.8 }
  if (year <= 2028) return { id: 'sanwari', label: '3 割特例', rate: 0.7 }
  return null
}

/** 確定申告・納付の期限（個人事業者は翌年 3 月 31 日。土日なら翌開庁日） */
export function deadline(year: number) {
  const d = new Date(Date.UTC(year + 1, 2, 31))
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1)
  const w = '日月火水木金土'[d.getUTCDay()]
  return `${d.getUTCFullYear()} 年 ${d.getUTCMonth() + 1} 月 ${d.getUTCDate()} 日（${w}）`
}
