/**
 * フリーランス（事業所得）の確定申告で戻る所得税（還付）・納める所得税の概算。2026 年分。
 * 申告書第一表の流れ: 所得 → 所得控除 → 課税される所得（1,000 円未満切り捨て）→ 所得税 → 復興特別所得税（2.1%、1 円未満切り捨て）
 * → 源泉徴収税額を引く（黒字は 100 円未満切り捨て、赤字はそのまま還付）→ 予定納税額を引く。
 */
import { BASIC_TABLE, IT_TABLE, floor } from './takehome'

export type KanpuInputs = { sales: number; expenses: number; aoiro: number; social: number; other: number; withheld: number; yotei: number }

export function calcKanpu(i: KanpuInputs) {
  const profit = Math.max(0, i.sales - i.expenses)
  const aoiro = Math.min(i.aoiro, profit)
  const income = profit - aoiro
  const basic = BASIC_TABLE.find(([lo]) => income >= lo)?.[1] ?? 0
  const deductions = i.social + basic + i.other
  const taxable = Math.max(0, floor(income - deductions, 1000))
  const row = IT_TABLE.find(([lo]) => taxable >= lo) ?? IT_TABLE[IT_TABLE.length - 1]
  const it = Math.max(0, Math.floor(taxable * row[1] - row[2]))
  const recon = Math.floor(it * 0.021)
  const tax = it + recon
  const diff = tax - i.withheld
  const shinkoku = diff > 0 ? floor(diff, 100) : diff
  const settle = shinkoku - i.yotei // プラスは納める税金、マイナスは還付される税金
  return { profit, aoiro, income, basic, deductions, taxable, rate: row[1], it, recon, tax, shinkoku, settle }
}

/** 源泉徴収税額の目安（1 回の支払いが 100 万円以下なら税抜報酬 × 10.21%） */
export const withheldOf = (fee: number) => Math.floor(fee * 0.1021)
