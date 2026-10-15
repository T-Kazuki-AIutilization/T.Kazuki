import {
  BOOTH_INVOICE_URL, BOOTH_TAX_URL, BOOTH_RATE_URL, BOOTH_TAKEHOME_URL, BOOTH_TRACKER_URL,
  BOOTH_LEDGER_FREE_URL, BOOTH_CASHFLOW_URL, BOOTH_TIMESHEET_URL,
} from '@/content/blog'

export type Template = {
  id: string
  name: string
  price: number
  summary: string
  features: string[]
  image: string
  href: string
  related?: { label: string; href: string }
}

/** BOOTH で販売している Excel テンプレート一覧（価格は税込） */
export const TEMPLATES: Template[] = [
  {
    id: 'ledger-free',
    name: '入金管理台帳（無料）',
    price: 0,
    summary: '請求番号・支払期限・入金日を記録するだけで、未入金と期限超過を自動で色分け。月別集計つき。',
    features: ['状態を自動判定（入金済／未入金／期限超過）', '請求合計・入金済・未入金・期限超過を自動集計', '月別の請求額・入金額・未入金額'],
    image: '/blog/previews/ledger_preview_1.png',
    href: BOOTH_LEDGER_FREE_URL,
    related: { label: '未入金を防ぐ入金管理の仕組み', href: '/blog/freelance-payment-tracking' },
  },
  {
    id: 'invoice',
    name: '見積書・納品書・請求書テンプレート',
    price: 980,
    summary: '設定シートに事業者情報を 1 回入れるだけで 3 帳票に自動反映。インボイス対応、入金管理台帳つき。',
    features: ['登録番号・税率別の消費税を自動計算', '源泉徴収の表示切替', '請求一覧（入金管理台帳）'],
    image: '/blog/previews/invoice_preview_1.png',
    href: BOOTH_INVOICE_URL,
    related: { label: '請求書の書き方（インボイス対応）', href: '/blog/freelance-invoice-how-to' },
  },
  {
    id: 'tax',
    name: '確定申告準備キット',
    price: 1280,
    summary: 'やることチェックリスト 37 項目、経費帳・売上帳、科目別集計、所得税の概算を 1 ファイルに。',
    features: ['科目を選ぶと家事按分率を自動入力', '月別・科目別の集計', '所得税の概算（青色申告控除対応）'],
    image: '/blog/previews/tax_preview_1.png',
    href: BOOTH_TAX_URL,
    related: { label: '確定申告の準備リスト', href: '/blog/freelance-tax-prep' },
  },
  {
    id: 'rate',
    name: '時間単価計算＋見積作成シート',
    price: 780,
    summary: '目標年収から必要な時間単価を逆算。工程別の見積作成と案件ごとの実績単価の記録まで。',
    features: ['目標年収 × 請求可能時間の早見表', '見積作成（バッファ率・値引き・税込）', '案件実績（目標単価未満は赤表示）'],
    image: '/blog/previews/rate_preview_1.png',
    href: BOOTH_RATE_URL,
    related: { label: '時間単価の計算方法と目安', href: '/blog/freelance-hourly-rate' },
  },
  {
    id: 'takehome',
    name: '手取り計算シミュレーター（2026年分対応）',
    price: 680,
    summary: '年間売上と経費から、所得税・住民税・国保・年金・事業税・消費税と手取りを一括で概算。',
    features: ['売上 300 万〜2,000 万円の早見表', '青色申告・インボイス登録の有無で比較', '料率などのパラメータは編集可'],
    image: '/blog/previews/takehome_preview_1.png',
    href: BOOTH_TAKEHOME_URL,
    related: { label: 'フリーランスの手取りはいくら？', href: '/blog/freelance-take-home-pay' },
  },
  {
    id: 'tracker',
    name: 'クライアント管理＋案件・入金管理シート',
    price: 880,
    summary: '案件一覧に入力するだけで、今月の受注額・入金額・入金予定・未入金・期限超過をダッシュボードに表示。',
    features: ['月別・クライアント別・状態別の集計', '納期超過・期限超過の未入金を自動色付け', 'クライアント一覧（100 件）'],
    image: '/blog/previews/tracker_preview_1.png',
    href: BOOTH_TRACKER_URL,
    related: { label: '案件管理ツールの比較', href: '/blog/freelance-project-management-tools' },
  },
  {
    id: 'cashflow',
    name: '資金繰り表＋納税資金積立シート',
    price: 980,
    summary: '月ごとの入金予定と経費から 12 か月先の月末残高を予測。納税の月に現金が足りない、を防ぐ。',
    features: ['資金不足は赤・安全ライン未満は橙で警告', '納税積立率から毎月の取り分け額を計算', '所得税・住民税・国保・年金の納税カレンダー'],
    image: '/blog/previews/cashflow_preview_1.png',
    href: BOOTH_CASHFLOW_URL,
    related: { label: 'フリーランスの手取りはいくら？', href: '/blog/freelance-take-home-pay' },
  },
  {
    id: 'timesheet',
    name: '稼働時間記録（タイムシート）＋案件別 実績時給',
    price: 780,
    summary: '開始・終了・休憩を入れるだけで作業時間を計算し、案件ごとの実績時給と月別の稼働を自動集計。',
    features: ['作業ログ 500 行・案件マスタ 30 件', '目標時給を下回る案件は赤表示', '時間契約は作業時間 × 単価で請求額を算出'],
    image: '/blog/previews/timesheet_preview_1.png',
    href: BOOTH_TIMESHEET_URL,
    related: { label: '時間単価の計算方法と目安', href: '/blog/freelance-hourly-rate' },
  },
]
