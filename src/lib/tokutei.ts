import { employeeTax } from '@/lib/haigusha'
import { kyuyoShotoku } from '@/lib/fukugyo'

/**
 * 19〜22 歳の子の特定扶養控除・特定親族特別控除の概算（2026 年分の所得税、2027 年度分の住民税）。
 * 子の合計所得金額 = 給与所得（アルバイト）＋ 事業所得・雑所得（業務委託の売上 − 経費 − 青色申告特別控除）。
 * 控除を受ける親は会社員（社会保険料は年収の 15%）。特定扶養控除・特定親族特別控除に親の所得制限はない。
 */

export type Child = { salary: number; sales: number; expenses: number; aoiro: number }

export function childIncome(c: Child) {
  const kyuyo = kyuyoShotoku(c.salary)
  const profit = Math.max(0, c.sales - c.expenses)
  const biz = Math.max(0, profit - Math.min(c.aoiro, profit))
  return { kyuyo, profit, biz, total: kyuyo + biz }
}

export const FUYO_LIMIT = 620000 // 特定扶養控除の所得要件（2026 年分から。2025 年分までは 58 万円）
export const TOKUTEI_FULL = 850000 // 特定親族特別控除が満額 63 万円のままの上限
export const TOKUTEI_LIMIT = 1230000 // 特定親族特別控除の上限

/** 特定親族特別控除: [子の所得の上限, 所得税, 住民税] */
export const TOKUTEI: [number, number, number][] = [
  [850000, 630000, 450000],
  [900000, 610000, 450000],
  [950000, 510000, 450000],
  [1000000, 410000, 410000],
  [1050000, 310000, 310000],
  [1100000, 210000, 210000],
  [1150000, 110000, 110000],
  [1200000, 60000, 60000],
  [1230000, 30000, 30000],
]

export function tokuteiDeduction(child: number) {
  if (child <= FUYO_LIMIT) return { kind: 'fuyo' as const, it: 630000, res: 450000 }
  const row = TOKUTEI.find(([lim]) => child <= lim)
  if (!row) return { kind: 'none' as const, it: 0, res: 0 }
  return { kind: 'tokutei' as const, it: row[1], res: row[2] }
}

/** 会社員の親（年収 salary）が、子の所得 child で受けられる控除と、下がる所得税・住民税（年間） */
export function tokuteiSaving(salary: number, child: number) {
  const d = tokuteiDeduction(child)
  const base = employeeTax(salary, 0, 0)
  const w = employeeTax(salary, d.it, d.res)
  const incomeTax = base.incomeTax - w.incomeTax
  const residentTax = base.residentTax - w.residentTax
  return { ...d, incomeTax, residentTax, total: incomeTax + residentTax }
}

export const TOKUTEI_SALARIES = [400, 500, 600, 700, 800, 1000]
/** 早見表の子の所得（万円） */
export const TOKUTEI_INCOMES = [60, 85, 95, 100, 110, 123]
