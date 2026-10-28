import { IT_TABLE, BASIC_TABLE } from '@/lib/takehome'

/**
 * 会社員の副業で増える税金の概算（2026 年分）。
 * 給与所得控除は 2026 年度改正後（最低保障額 74 万円 = 本則 69 万円＋2026・2027 年分の特例 5 万円。住民税も 2027 年度分から同じ）、社会保険料は年収の 15% で概算、基礎控除は合計所得に応じた 2026 年分の額。
 * 副業の所得（売上 − 経費）は給与と合算して課税される。会社の社会保険料は副業で変わらない。
 */

const floor = (n: number, unit = 1) => Math.floor(n / unit) * unit
export const SOCIAL_RATE = 0.15

export function kyuyoShotoku(s: number) {
  if (s <= 2200000) return Math.max(0, s - 740000)
  if (s <= 3600000) return Math.floor(s * 0.7 - 80000)
  if (s <= 6600000) return Math.floor(s * 0.8 - 440000)
  if (s <= 8500000) return Math.floor(s * 0.9 - 1100000)
  return s - 1950000
}

function taxes(salary: number, side: number) {
  const social = Math.round(salary * SOCIAL_RATE)
  const total = kyuyoShotoku(salary) + Math.max(0, side)
  const basic = BASIC_TABLE.find(([lo]) => total >= lo)?.[1] ?? 0
  const taxable = Math.max(0, floor(total - social - basic, 1000))
  const row = IT_TABLE.find(([lo]) => taxable >= lo) ?? IT_TABLE[IT_TABLE.length - 1]
  const it = Math.max(0, Math.floor(taxable * row[1] - row[2]))
  const incomeTax = floor(it + Math.floor(it * 0.021), 100)
  const taxableRes = Math.max(0, floor(total - social - 430000, 1000))
  const residentTax = taxableRes > 0 ? Math.max(0, floor(taxableRes * 0.1 - 2500, 100)) + 5000 : 0
  return { incomeTax, residentTax, rate: row[1] }
}

/** 副業の所得 side（円）で増える所得税・住民税。20 万円ルールの対象なら所得税の増加は 0 として扱う */
export function sideJobTax(salary: number, side: number) {
  const a = taxes(salary, 0)
  const b = taxes(salary, side)
  const rule20 = side <= 200000 && salary <= 20000000
  const incomeTax = rule20 ? 0 : b.incomeTax - a.incomeTax
  const residentTax = b.residentTax - a.residentTax
  const total = incomeTax + residentTax
  return { incomeTax, residentTax, total, keep: side - total, rate: b.rate, rule20 }
}

/**
 * 会社員（副業の所得 side を含む）のふるさと納税の上限額（目安・独身）。other はその他の所得控除（iDeCo・生命保険料など）。
 * 住民税所得割 × 20% ÷（90% − 所得税率 × 1.021）＋ 2,000 円。税率は住民税の課税所得 − 人的控除差 5 万円で判定。
 */
export function furusatoEmployee(salary: number, side: number, other = 0) {
  const social = Math.round(salary * SOCIAL_RATE)
  const income = kyuyoShotoku(salary) + Math.max(0, side)
  const taxableRes = Math.max(0, floor(income - social - 430000 - other, 1000))
  const shotokuwari = Math.max(0, taxableRes * 0.1 - 2500)
  const base = Math.max(0, taxableRes - 50000)
  const rate = base > 0 ? (IT_TABLE.find(([lo]) => base >= lo) ?? IT_TABLE[IT_TABLE.length - 1])[1] : 0
  const limit = shotokuwari > 0 ? floor((shotokuwari * 0.2) / (0.9 - rate * 1.021) + 2000, 1000) : 0
  return { income, social, taxableRes, shotokuwari: floor(shotokuwari, 100), rate, limit }
}

export function furusatoLimitEmployee(salary: number, side: number) {
  return furusatoEmployee(salary, side).limit
}

export const FUKUGYO_SALARIES = [300, 400, 500, 600, 700, 800, 1000]
export const FUKUGYO_SIDES = [20, 50, 100, 200]

/** 会社員（独身・扶養なし）の手取りの概算。社会保険料は年収の 15%、2026 年分の基礎控除 */
export function employeeTakeHome(salary: number) {
  const social = Math.round(salary * SOCIAL_RATE)
  const t = taxes(salary, 0)
  return { social, incomeTax: t.incomeTax, residentTax: t.residentTax, takeHome: salary - social - t.incomeTax - t.residentTax }
}

/** 会社員の年収 → フリーランスの売上換算ページ（/tools/kansan/[万円]）の対象額 */
export const KANSAN_SALARIES = [300, 400, 500, 600, 700, 800, 900, 1000]

/** 年収別の副業の税金ページ（/tools/fukugyo/[万円]）の対象額と、表に出す副業の所得（万円） */
export const FUKUGYO_PAGES = [300, 400, 500, 600, 700, 800, 900, 1000]
export const FUKUGYO_PAGE_SIDES = [10, 20, 30, 50, 80, 100, 150, 200, 300]

/** 合計所得がこの額を超えると基礎控除が下がる（2026 年分: 489 万円で 104→67 万円、655 万円で 67→62 万円） */
export const BASIC_STEPS = [
  { limit: 4890000, from: 1040000, to: 670000 },
  { limit: 6550000, from: 670000, to: 620000 },
]
