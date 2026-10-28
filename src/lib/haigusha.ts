import { IT_TABLE, BASIC_TABLE } from '@/lib/takehome'
import { kyuyoShotoku, SOCIAL_RATE } from '@/lib/fukugyo'

/**
 * 配偶者控除・配偶者特別控除の概算（2026 年分の所得税、2027 年度分の住民税）。
 * 配偶者の合計所得金額 = 給与所得 ＋ 事業所得（売上 − 経費 − 青色申告特別控除）。
 * 控除を受ける本人は会社員（独身扱いの手取り計算と同じく、社会保険料は年収の 15%）。
 */

const floor = (n: number, unit = 1) => Math.floor(n / unit) * unit

export type Spouse = { salary: number; sales: number; expenses: number; aoiro: number }

export function spouseIncome(s: Spouse) {
  const profit = Math.max(0, s.sales - s.expenses)
  const biz = Math.max(0, profit - Math.min(s.aoiro, profit))
  return { kyuyo: kyuyoShotoku(s.salary), biz, profit, total: kyuyoShotoku(s.salary) + biz }
}

export const HAIGUSHA_LIMIT = 620000 // 配偶者控除の所得要件（2026 年分から。2025 年分までは 58 万円）
export const TOKUBETSU_FULL = 950000 // 配偶者特別控除が満額のままの上限
export const TOKUBETSU_LIMIT = 1330000 // 配偶者特別控除の上限

/** 配偶者特別控除: [配偶者の所得の上限, 所得税（本人の合計所得 900 万/950 万/1,000 万円以下）, 住民税（同）] */
const TOKUBETSU: [number, number[], number[]][] = [
  [950000, [380000, 260000, 130000], [330000, 220000, 110000]],
  [1000000, [360000, 240000, 120000], [330000, 220000, 110000]],
  [1050000, [310000, 210000, 110000], [310000, 210000, 110000]],
  [1100000, [260000, 180000, 90000], [260000, 180000, 90000]],
  [1150000, [210000, 140000, 70000], [210000, 140000, 70000]],
  [1200000, [160000, 110000, 60000], [160000, 110000, 60000]],
  [1250000, [110000, 80000, 40000], [110000, 80000, 40000]],
  [1300000, [60000, 40000, 20000], [60000, 40000, 20000]],
  [1330000, [30000, 20000, 10000], [30000, 20000, 10000]],
]

/** 本人の合計所得 → 0: 900 万円以下, 1: 950 万円以下, 2: 1,000 万円以下, -1: 対象外 */
function band(selfIncome: number) {
  if (selfIncome <= 9000000) return 0
  if (selfIncome <= 9500000) return 1
  if (selfIncome <= 10000000) return 2
  return -1
}

export function haigushaDeduction(spouse: number, selfIncome: number, elderly = false) {
  const b = band(selfIncome)
  if (b < 0) return { kind: 'none' as const, it: 0, res: 0, reason: 'self' as const }
  if (spouse <= HAIGUSHA_LIMIT) {
    const it = elderly ? [480000, 320000, 160000][b] : [380000, 260000, 130000][b]
    const res = elderly ? [380000, 260000, 130000][b] : [330000, 220000, 110000][b]
    return { kind: 'haigusha' as const, it, res, reason: null }
  }
  const row = TOKUBETSU.find(([lim]) => spouse <= lim)
  if (!row) return { kind: 'none' as const, it: 0, res: 0, reason: 'spouse' as const }
  return { kind: 'tokubetsu' as const, it: row[1][b], res: row[2][b], reason: null }
}

export function employeeTax(salary: number, itDed: number, resDed: number) {
  const social = Math.round(salary * SOCIAL_RATE)
  const income = kyuyoShotoku(salary)
  const basic = BASIC_TABLE.find(([lo]) => income >= lo)?.[1] ?? 0
  const taxable = Math.max(0, floor(income - social - basic - itDed, 1000))
  const row = IT_TABLE.find(([lo]) => taxable >= lo) ?? IT_TABLE[IT_TABLE.length - 1]
  const it = Math.max(0, Math.floor(taxable * row[1] - row[2]))
  const incomeTax = floor(it + Math.floor(it * 0.021), 100)
  const taxableRes = Math.max(0, floor(income - social - 430000 - resDed, 1000))
  const residentTax = taxableRes > 0 ? Math.max(0, floor(taxableRes * 0.1 - 2500, 100)) : 0
  return { income, incomeTax, residentTax }
}

/** 会社員（年収 salary）が配偶者の所得 spouse で受けられる控除と、下がる所得税・住民税（年間） */
export function haigushaSaving(salary: number, spouse: number, elderly = false) {
  const base = employeeTax(salary, 0, 0)
  const d = haigushaDeduction(spouse, base.income, elderly)
  const w = employeeTax(salary, d.it, d.res)
  const incomeTax = base.incomeTax - w.incomeTax
  const residentTax = base.residentTax - w.residentTax
  return { ...d, selfIncome: base.income, incomeTax, residentTax, total: incomeTax + residentTax }
}

/** 青色・白色別に、配偶者の「売上 − 経費」がいくらまでなら各区切りに収まるか（円） */
export const AOIRO_OPTIONS = [
  { aoiro: 650000, label: '青色 65 万円控除' },
  { aoiro: 550000, label: '青色 55 万円控除' },
  { aoiro: 100000, label: '青色 10 万円控除' },
  { aoiro: 0, label: '白色申告' },
]

export const HAIGUSHA_SALARIES = [400, 500, 600, 700, 800, 1000]
export const HAIGUSHA_PROFITS = [60, 100, 130, 160, 180, 200]
