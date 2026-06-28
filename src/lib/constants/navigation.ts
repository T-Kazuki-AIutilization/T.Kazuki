import {
  LayoutDashboard, Users, FolderKanban, Receipt, Download,
  Settings, CreditCard,
  BarChart3, UserCog, DollarSign, Megaphone, Activity, ArrowLeftRight,
} from 'lucide-react'

// ── ユーザー画面ナビ ──
export const MAIN_NAV = [
  { label: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { label: 'クライアント', href: '/clients', icon: Users },
  { label: '案件', href: '/projects', icon: FolderKanban },
  { label: '売上・入金', href: '/revenue', icon: Receipt },
  { label: 'CSVエクスポート', href: '/export', icon: Download },
] as const

export const SUB_NAV = [
  { label: '設定', href: '/settings', icon: Settings },
  { label: 'プラン・支払い', href: '/settings/billing', icon: CreditCard },
] as const

// ── 管理者画面ナビ ──
export const ADMIN_NAV = [
  { label: 'ダッシュボード', href: '/admin', icon: BarChart3 },
  { label: 'ユーザー管理', href: '/admin/users', icon: UserCog },
  { label: '収益モニタリング', href: '/admin/revenue', icon: DollarSign },
  { label: 'お知らせ管理', href: '/admin/notices', icon: Megaphone },
  { label: 'システム情報', href: '/admin/system', icon: Activity },
] as const

export const ADMIN_SUB_NAV = [
  { label: 'ユーザー画面へ', href: '/dashboard', icon: ArrowLeftRight },
  { label: '設定', href: '/settings', icon: Settings },
] as const

// ── ステータス定数 ──
export const PROJECT_STATUSES = {
  in_progress: { label: '進行中', color: 'blue' as const },
  completed: { label: '完了', color: 'amber' as const },
  paid: { label: '入金済み', color: 'green' as const },
  cancelled: { label: 'キャンセル', color: 'gray' as const },
}

export const PAYMENT_STATUSES = {
  unbilled: { label: '未請求', color: 'gray' as const },
  billed: { label: '請求済み', color: 'amber' as const },
  paid: { label: '入金済み', color: 'green' as const },
}

export const NOTICE_CATEGORIES = {
  info: { label: 'お知らせ', color: 'blue' as const },
  maintenance: { label: 'メンテナンス', color: 'amber' as const },
  feature: { label: '機能追加', color: 'green' as const },
}
