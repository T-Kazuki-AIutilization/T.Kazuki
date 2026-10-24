// 提携（アフィリエイト）リンク。url が空のものは表示しない。ASP の審査・提携後に url を設定する。
// 表示時は必ず「PR」表記と rel="sponsored" を付ける（景品表示法のステルスマーケティング規制）。

export type Offer = { id: string; name: string; note: string; url: string; pixel?: string } // pixel: A8 のインプレッション計測用 1x1 画像の URL

export const OFFERS: Record<string, Offer> = {
  'freee-kaikei': { id: 'freee-kaikei', name: 'freee会計（個人事業主向け）', note: '銀行口座・カードの明細を取り込んで帳簿をつけ、青色申告決算書と確定申告書まで作成', url: 'https://px.a8.net/svt/ejp?a8mat=4BEO5N+6Z8Y2A+3SPO+9FDI8Y', pixel: 'https://www15.a8.net/0.gif?a8mat=4BEO5N+6Z8Y2A+3SPO+9FDI8Y' },
  'mf-kakutei': { id: 'mf-kakutei', name: 'マネーフォワード クラウド確定申告', note: '明細の自動取り込みと仕訳の提案、確定申告書の作成・e-Tax 提出に対応', url: 'https://px.a8.net/svt/ejp?a8mat=4BEO5N+73EZAQ+4JGQ+BX3J6', pixel: 'https://www15.a8.net/0.gif?a8mat=4BEO5N+73EZAQ+4JGQ+BX3J6' },
  'yayoi-aoiro': { id: 'yayoi-aoiro', name: 'やよいの青色申告 オンライン', note: '青色申告に必要な帳簿と決算書の作成から e-Tax での申告まで対応。無料で試せるプランあり（条件は公式サイトで確認）', url: 'https://px.a8.net/svt/ejp?a8mat=4BEO5N+6JROC2+35XE+5YJRM', pixel: 'https://www11.a8.net/0.gif?a8mat=4BEO5N+6JROC2+35XE+5YJRM' },
  'freee-kaigyo': { id: 'freee-kaigyo', name: 'freee開業', note: '質問に答えると開業届・青色申告承認申請書などの書類を作成（無料）', url: '' },
}

export function activeOffers(ids: string[]): Offer[] {
  return ids.map((id) => OFFERS[id]).filter((o): o is Offer => Boolean(o && o.url))
}
