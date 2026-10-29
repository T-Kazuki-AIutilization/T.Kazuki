/**
 * 個人事業税の概算（都道府県税。前年の事業所得に対して 8 月・11 月に納付）。
 * 課税所得 = 事業所得（青色申告特別控除の前）− 事業主控除 290 万円（年の途中の開業・廃業は月割）。
 * 税額 = 課税所得（1,000 円未満切り捨て）× 税率（法定業種により 5%・4%・3%）、100 円未満切り捨て。
 */

export const JIGYOZEI_DEDUCT = 2900000

export const GYOSHU = [
  { id: 'design', label: 'デザイン業（Web・グラフィック・UI など）', rate: 0.05 },
  { id: 'ukeoi', label: '請負業（受託開発・制作など、成果物の完成を請け負う仕事）', rate: 0.05 },
  { id: 'consul', label: 'コンサルタント業', rate: 0.05 },
  { id: 'koukoku', label: '広告業', rate: 0.05 },
  { id: 'shashin', label: '写真業', rate: 0.05 },
  { id: 'buppan', label: '物品販売業（ネットショップ・せどりなど）', rate: 0.05 },
  { id: 'biyo', label: '理容業・美容業', rate: 0.05 },
  { id: 'shigyo', label: '士業（税理士・行政書士・社会保険労務士など）', rate: 0.05 },
  { id: 'anma', label: 'あん摩・マッサージ・指圧・はり・きゅう・柔道整復など', rate: 0.03 },
  { id: 'chikusan', label: '畜産業・水産業・薪炭製造業', rate: 0.04 },
  { id: 'none', label: '法定業種に当たらない（文筆業・芸術家など）', rate: 0 },
] as const

export type GyoshuId = (typeof GYOSHU)[number]['id']

/** 事業主控除（年の途中の開業・廃業は月割。1,000 円未満切り上げで概算） */
export function ownerDeduction(months: number) {
  const m = Math.min(12, Math.max(1, Math.round(months)))
  return m === 12 ? JIGYOZEI_DEDUCT : Math.ceil((JIGYOZEI_DEDUCT * m) / 12 / 1000) * 1000
}

export function jigyozei(i: { profit: number; months: number; rate: number }) {
  const income = Math.max(0, i.profit)
  const deduction = ownerDeduction(i.months)
  const taxable = Math.floor(Math.max(0, income - deduction) / 1000) * 1000
  const tax = Math.floor((taxable * i.rate) / 100) * 100
  // 1 万円以下は第 1 期（8 月）に全額。それ以外は 2 回に分け、1,000 円未満の端数は第 1 期に寄せる。
  const second = tax <= 10000 ? 0 : Math.floor(tax / 2 / 1000) * 1000
  return { income, deduction, taxable, tax, first: tax - second, second }
}

export const JIGYOZEI_INCOMES = [300, 400, 500, 600, 700, 800, 1000, 1200]
