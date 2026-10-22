import { IT_TABLE, BASIC_TABLE } from '@/lib/takehome'

/**
 * 会社員の副業で増える税金の概算（2026 年分）。
 * 給与所得控除は 2025 年改正後（最低 65 万円）、社会保険料は年収の 15% で概算、基礎控除は合計所得に応じた 2026 年分の額。
 * 副業の所得（売上 − 経費）は給与と合算して課税される。会社の社会保険料は副業で変わらない。
 */

const floor = (n: number, unit = 1) => Math.floor(n / unit) * unit
export const SOCIAL_RATE = 0.15

export function kyuyoShotoku(s: number) {
  if (s <= 1900000) return Math.max(0, s - 650000)
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

export const FUKUGYO_SALARIES = [300, 400, 500, 600, 700, 800, 1000]
export const FUKUGYO_SIDES = [20, 50, 100, 200]
