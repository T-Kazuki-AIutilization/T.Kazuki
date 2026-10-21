/**
 * 国民健康保険料の概算。区分（医療・後期高齢者支援金・介護）ごとに
 * 所得割（基準所得 × 料率）＋ 均等割（人数）＋ 平等割（世帯）を計算し、区分ごとの上限を適用する。
 * 料率は自治体ごとに異なるため、すべて編集可能。低所得世帯の軽減（7・5・2 割）は含まない。
 */

const BASIC = 430000 // 基準所得の計算で差し引く基礎控除相当

export type Part = { rate: number; perCapita: number; perHousehold: number; cap: number }
export type NhiInputs = {
  incomes: number[] // 世帯の加入者ごとの所得（売上 − 経費 − 青色控除。給与は給与所得）
  members40to64: number
  medical: Part; support: Part; care: Part
  childRate: number; childPerCapita: number
}
// 例示の料率（自治体により大きく異なる）。上限は 2025 年度の法定上限。
export const NHI_DEFAULTS: NhiInputs = {
  incomes: [3000000],
  members40to64: 0,
  medical: { rate: 0.077, perCapita: 47000, perHousehold: 0, cap: 660000 },
  support: { rate: 0.027, perCapita: 16000, perHousehold: 0, cap: 260000 },
  care: { rate: 0.022, perCapita: 16000, perHousehold: 0, cap: 170000 },
  childRate: 0, childPerCapita: 0,
}

export function calcNhi(v: NhiInputs) {
  const base = v.incomes.reduce((s, x) => s + Math.max(0, x - BASIC), 0)
  const n = v.incomes.length
  const part = (p: Part, people: number, b: number) => Math.min(p.cap, Math.floor(b * p.rate + p.perCapita * people + (people > 0 ? p.perHousehold : 0)))
  const medical = part(v.medical, n, base)
  const support = part(v.support, n, base)
  const careBase = v.members40to64 > 0 ? v.incomes.slice(0, v.members40to64).reduce((s, x) => s + Math.max(0, x - BASIC), 0) : 0
  const care = v.members40to64 > 0 ? part(v.care, v.members40to64, careBase) : 0
  const child = Math.floor(base * v.childRate + v.childPerCapita * n)
  const total = Math.floor((medical + support + care + child) / 100) * 100
  return { base, medical, support, care, child, total }
}


/** 所得別の国保料ページ（/tools/nhi/[万円]）の対象額。所得 100 万〜1,000 万円、100 万円刻み */
export const NHI_AMOUNTS = Array.from({ length: 10 }, (_, i) => 100 + i * 100)
