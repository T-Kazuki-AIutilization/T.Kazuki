import { calc, floor, IT_TABLE, BASIC_TABLE } from '@/lib/takehome'
import { kyuyoShotoku, SOCIAL_RATE } from '@/lib/fukugyo'

/**
 * 医療費控除・セルフメディケーション税制で下がる所得税・住民税の概算（2026 年分）。
 * 医療費控除 = 医療費 − 保険金等の補填 − 10 万円（総所得金額等が 200 万円未満なら その 5%）、上限 200 万円。
 * セルフメディケーション税制 = 対象医薬品の購入費 − 1.2 万円、上限 8.8 万円。どちらか一方を選ぶ。
 * 国民健康保険料は所得控除の影響を受けないため変わらない。
 */

export type Earner = { kind: 'freelance'; sales: number; expenses: number; aoiro: number } | { kind: 'employee'; salary: number }

function taxes(income: number, social: number, deduction: number) {
  const basic = BASIC_TABLE.find(([lo]) => income >= lo)?.[1] ?? 0
  const taxableIt = Math.max(0, floor(income - social - basic - deduction, 1000))
  const row = IT_TABLE.find(([lo]) => taxableIt >= lo) ?? IT_TABLE[IT_TABLE.length - 1]
  const it = Math.max(0, Math.floor(taxableIt * row[1] - row[2]))
  const incomeTax = floor(it + Math.floor(it * 0.021), 100)
  const taxableRes = Math.max(0, floor(income - social - 430000 - deduction, 1000))
  const residentTax = taxableRes > 0 ? Math.max(0, floor(taxableRes * 0.1 - 2500, 100)) + 5000 : 0
  return { incomeTax, residentTax, rate: row[1] }
}

/** 総所得金額等と社会保険料（概算） */
export function incomeOf(e: Earner) {
  if (e.kind === 'employee') return { income: kyuyoShotoku(e.salary), social: Math.round(e.salary * SOCIAL_RATE) }
  const r = calc({ sales: e.sales, expenses: e.expenses, aoiro: e.aoiro, other: 0, withheld: 0, taxable: false, bizRate: 0, nhiRate: 0.1 })
  return { income: r.income, social: r.social }
}

export function medicalDeduction(income: number, paid: number, covered: number) {
  const threshold = income < 2000000 ? Math.floor(income * 0.05) : 100000
  return { threshold, deduction: Math.min(2000000, Math.max(0, paid - covered - threshold)) }
}

export function selfMedDeduction(otc: number) {
  return Math.min(88000, Math.max(0, otc - 12000))
}

/** 控除額 deduction で下がる所得税・住民税 */
export function savingFor(e: Earner, deduction: number) {
  const { income, social } = incomeOf(e)
  const a = taxes(income, social, 0)
  const b = taxes(income, social, deduction)
  const it = a.incomeTax - b.incomeTax
  const res = a.residentTax - b.residentTax
  return { income, it, res, total: it + res, rate: a.rate }
}

/** 早見表: 会社員の年収（万円）× 医療費（万円） */
export const IRYOHI_SALARIES = [300, 400, 500, 700, 1000]
export const IRYOHI_COSTS = [15, 20, 30, 50]
