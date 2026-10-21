/**
 * フリーランスの手取り計算（概算）。Excel 版「手取り計算シミュレーター」と同じ計算式。
 * 2026 年分（2025 年改正の基礎控除上乗せを反映）。
 */

const PENSION_MONTHLY = 17920 // 国民年金 2026 年度
const NHI_FLAT = 60000 // 国保 均等割（年・1人、自治体により 4〜8 万円）
const NHI_CAP = 1090000
const NHI_DEDUCT = 430000
const RES_RATE = 0.1
const RES_FLAT = 5000
const RES_BASIC = 430000
const RES_ADJ = 2500
const BIZ_DEDUCT = 2900000
const RECON = 0.021
export const IT_TABLE: [number, number, number][] = [
  [40000000, 0.45, 4796000], [18000000, 0.4, 2796000], [9000000, 0.33, 1536000], [6950000, 0.23, 636000],
  [3300000, 0.2, 427500], [1950000, 0.1, 97500], [0, 0.05, 0],
]
const BASIC_TABLE: [number, number][] = [
  [25000001, 0], [24500001, 160000], [24000001, 320000], [23500001, 480000], [6550001, 580000],
  [4890001, 630000], [3360001, 680000], [1320001, 880000], [0, 950000],
]

export const floor = (n: number, unit = 1) => Math.floor(n / unit) * unit

export type Inputs = { sales: number; expenses: number; aoiro: number; other: number; withheld: number; taxable: boolean; bizRate: number; nhiRate: number; ctRate?: number }

export function calc(i: Inputs) {
  const profit = Math.max(0, i.sales - i.expenses)
  const aoiroApplied = Math.min(i.aoiro, profit)
  const income = Math.max(0, profit - aoiroApplied) // 事業所得（青色控除後）
  const pension = PENSION_MONTHLY * 12
  const nhi = Math.min(NHI_CAP, floor(Math.max(0, income - NHI_DEDUCT) * i.nhiRate + NHI_FLAT, 100))
  const social = pension + nhi
  const basic = BASIC_TABLE.find(([lo]) => income >= lo)?.[1] ?? 0
  const taxableIt = Math.max(0, floor(income - social - basic - i.other, 1000))
  const row = IT_TABLE.find(([lo]) => taxableIt >= lo) ?? IT_TABLE[IT_TABLE.length - 1]
  const it = Math.max(0, Math.floor(taxableIt * row[1] - row[2]))
  const recon = Math.floor(it * RECON)
  const incomeTax = floor(it + recon, 100)
  const taxableRes = Math.max(0, floor(income - social - RES_BASIC - i.other, 1000))
  const residentTax = Math.max(0, floor(taxableRes * RES_RATE - RES_ADJ, 100)) + RES_FLAT
  const bizTax = Math.max(0, floor((income + aoiroApplied - BIZ_DEDUCT) * i.bizRate, 100))
  const consumptionTax = i.taxable ? floor(i.sales * 0.1 * (i.ctRate ?? 0.2), 100) : 0
  const taxes = incomeTax + residentTax + bizTax + consumptionTax
  const takeHome = i.sales - i.expenses - taxes - social
  return { profit, aoiroApplied, income, pension, nhi, social, basic, taxableIt, incomeTax, taxableRes, residentTax, bizTax, consumptionTax, taxes, takeHome, settle: incomeTax - i.withheld }
}


/** 売上別の手取りページ（/tools/takehome/[万円]）の対象額。300 万〜2,000 万円、100 万円刻み */
export const TAKEHOME_AMOUNTS = Array.from({ length: 18 }, (_, i) => 300 + i * 100)

/**
 * ふるさと納税の控除上限額（自己負担 2,000 円で済む寄附額）の概算。
 * 上限 = 住民税所得割額 × 20% ÷ (90% − 所得税の限界税率 × 1.021) ＋ 2,000 円
 * 限界税率は住民税の課税所得 − 人的控除差調整額（基礎控除分 5 万円）で判定（地方税法の特例控除割合）。
 */

const PERSONAL_DIFF = 50000
export type FurusatoInputs = { sales: number; expenses: number; aoiro: number; other: number; nhiRate: number }
export function furusatoLimit(i: FurusatoInputs) {
  const r = calc({ ...i, withheld: 0, taxable: false, bizRate: 0 })
  const shotokuwari = Math.max(0, r.taxableRes * 0.1 - 2500)
  const base = Math.max(0, r.taxableRes - PERSONAL_DIFF)
  const rate = base > 0 ? (IT_TABLE.find(([lo]) => base >= lo) ?? IT_TABLE[IT_TABLE.length - 1])[1] : 0
  const denom = 0.9 - rate * 1.021
  const limit = shotokuwari > 0 ? floor((shotokuwari * 0.2) / denom + 2000, 1000) : 0
  return { ...r, shotokuwari: floor(shotokuwari, 100), rate, limit }
}

