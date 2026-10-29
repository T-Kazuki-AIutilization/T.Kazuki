/**
 * 個人事業主の減価償却の概算（平成 19 年 4 月 1 日以後に取得した資産。平成 24 年 4 月 1 日以後の定率法は 200% 定率法）。
 * - 取得価額 10 万円未満: 業務に使い始めた年に全額経費
 * - 10 万円以上 20 万円未満: 一括償却資産として 3 年で 1/3 ずつ（月割なし）を選べる
 * - 青色申告者の少額減価償却資産の特例: 10 万円以上 40 万円未満（2026 年 3 月 31 日までの取得は 30 万円未満）を全額経費（年 300 万円まで、2029 年 3 月 31 日までの取得）
 * - 通常の減価償却: 定額法（個人の法定償却方法）または定率法（届出が必要）、初年は使い始めた月からの月割
 * 出典: 国税庁タックスアンサー No.2100・No.2106、減価償却資産の償却率等表。
 */

export const ASSETS = [
  { id: 'pc', label: 'パソコン（サーバー用を除く）', life: 4 },
  { id: 'server', label: 'サーバー', life: 5 },
  { id: 'camera', label: 'カメラ・映画撮影機', life: 5 },
  { id: 'audio', label: 'テレビ・音響機器', life: 5 },
  { id: 'office', label: '複写機・その他の事務機器', life: 5 },
  { id: 'software', label: 'ソフトウエア（購入したもの）', life: 5, intangible: true },
  { id: 'desk_metal', label: '事務机・いす・キャビネット（主として金属製）', life: 15 },
  { id: 'desk', label: '事務机・いす・キャビネット（その他）', life: 8 },
  { id: 'aircon', label: 'エアコン（冷房用・暖房用機器）', life: 6 },
  { id: 'kei', label: '軽自動車（総排気量 0.66 リットル以下）', life: 4 },
  { id: 'car', label: '普通自動車', life: 6 },
  { id: 'bike', label: 'バイク（2 輪自動車）', life: 3 },
  { id: 'custom', label: 'その他（耐用年数を選ぶ）', life: 0 },
] as const

export type AssetId = (typeof ASSETS)[number]['id']

/** 耐用年数 → [定額法の償却率, 定率法の償却率, 改定償却率, 保証率]（平成 24 年 4 月 1 日以後取得） */
export const RATES: Record<number, [number, number, number, number]> = {
  2: [0.5, 1.0, 0, 0],
  3: [0.334, 0.667, 1.0, 0.11089],
  4: [0.25, 0.5, 1.0, 0.12499],
  5: [0.2, 0.4, 0.5, 0.108],
  6: [0.167, 0.333, 0.334, 0.09911],
  7: [0.143, 0.286, 0.334, 0.0868],
  8: [0.125, 0.25, 0.334, 0.07909],
  9: [0.112, 0.222, 0.25, 0.07126],
  10: [0.1, 0.2, 0.25, 0.06552],
  11: [0.091, 0.182, 0.2, 0.05992],
  12: [0.084, 0.167, 0.2, 0.05566],
  13: [0.077, 0.154, 0.167, 0.0518],
  14: [0.072, 0.143, 0.167, 0.04854],
  15: [0.067, 0.133, 0.143, 0.04565],
  16: [0.063, 0.125, 0.143, 0.04294],
  17: [0.059, 0.118, 0.125, 0.04038],
  18: [0.056, 0.111, 0.112, 0.03884],
  19: [0.053, 0.105, 0.112, 0.03693],
  20: [0.05, 0.1, 0.112, 0.03486],
}
export const LIVES = Object.keys(RATES).map(Number)

export type Method = 'teigaku' | 'teiritsu'
export type Row = { year: number; months: number; dep: number; expense: number; end: number }

/**
 * 通常の減価償却の年ごとの償却費。year/month は業務に使い始めた年月。
 * 有形の資産は帳簿価額 1 円まで、無形（ソフトウエア）は 0 円まで。償却費は 1 円未満切り捨て。
 */
export function schedule(i: { cost: number; life: number; method: Method; year: number; month: number; ratio: number; intangible?: boolean }): Row[] {
  const r = RATES[i.life]
  if (!r || i.cost <= 0) return []
  const [fixed, rate, revised, guarantee] = r
  const floorValue = i.intangible ? 0 : 1
  const method = i.intangible ? 'teigaku' : i.method
  const guaranteeAmount = i.cost * guarantee
  const rows: Row[] = []
  let book = i.cost
  let revisedBase = 0
  for (let n = 0; book > floorValue && n < 60; n++) {
    const months = n === 0 ? 13 - i.month : 12
    let full: number
    if (method === 'teigaku') full = i.cost * fixed
    else {
      const pre = book * rate
      if (revisedBase === 0 && pre < guaranteeAmount) revisedBase = book
      full = revisedBase > 0 ? revisedBase * revised : pre
    }
    const dep = Math.min(Math.floor((full * months) / 12), book - floorValue)
    book -= dep
    rows.push({ year: i.year + n, months, dep, expense: Math.floor(dep * i.ratio), end: book })
  }
  return rows
}

/** 少額減価償却資産の特例の上限（取得日で判定） */
export function shogakuLimit(year: number, month: number) {
  if (year > 2029 || (year === 2029 && month > 3)) return 0
  return year > 2026 || (year === 2026 && month >= 4) ? 400000 : 300000
}

export type Option = { id: 'zengaku' | 'ikkatsu' | 'shogaku' | 'normal'; label: string; first: number; years: { year: number; expense: number }[]; note: string }

/** 選べる経費化の方法と、年ごとの経費（事業割合を掛けた後）。cost は判定に使う取得価額。 */
export function options(i: { cost: number; life: number; method: Method; year: number; month: number; ratio: number; aoiro: boolean; intangible?: boolean }): Option[] {
  const out: Option[] = []
  const ex = (n: number) => Math.floor(n * i.ratio)
  if (i.cost <= 0) return out
  if (i.cost < 100000) {
    out.push({ id: 'zengaku', label: '全額をその年の経費（10 万円未満）', first: ex(i.cost), years: [{ year: i.year, expense: ex(i.cost) }], note: '消耗品費などとして、使い始めた年に全額を経費にします。' })
    return out
  }
  const limit = shogakuLimit(i.year, i.month)
  if (i.aoiro && limit > 0 && i.cost < limit) {
    out.push({ id: 'shogaku', label: '少額減価償却資産の特例（青色申告）', first: ex(i.cost), years: [{ year: i.year, expense: ex(i.cost) }], note: `取得価額 ${limit / 10000} 万円未満の資産を、使い始めた年に全額経費にできます（その年の合計 300 万円まで）。12 月に使い始めても全額です。` })
  }
  if (i.cost < 200000) {
    const third = Math.floor(i.cost / 3)
    const amounts = [third, third, i.cost - third * 2]
    out.push({ id: 'ikkatsu', label: '一括償却資産（3 年で 1/3 ずつ）', first: ex(amounts[0]), years: amounts.map((a, n) => ({ year: i.year + n, expense: ex(a) })), note: '月割はなく、12 月に使い始めても 1/3 を経費にできます。白色申告でも使えます。' })
  }
  const rows = schedule(i)
  out.push({ id: 'normal', label: `通常の減価償却（${i.intangible || i.method === 'teigaku' ? '定額法' : '定率法'}・${i.life} 年）`, first: rows[0]?.expense ?? 0, years: rows.map((r) => ({ year: r.year, expense: r.expense })), note: '使い始めた月からの月割で、耐用年数にわたって経費にします。' })
  return out
}

/** 判定に使う取得価額。税抜経理なら消費税 10% を除く（免税事業者は税込経理）。 */
export function judgeCost(price: number, zeinuki: boolean) {
  return zeinuki ? Math.round(price / 1.1) : price
}
