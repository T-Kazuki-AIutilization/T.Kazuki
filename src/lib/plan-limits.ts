import type { SupabaseClient } from '@supabase/supabase-js'

/** 料金ページ・ランディングの表記と一致させること */
export const FREE_LIMITS = {
  clients: 3,
  projectsPerMonth: 10,
} as const

export type Plan = 'free' | 'pro' | 'pro_plus'

export async function getUserPlan(supabase: SupabaseClient, userId: string): Promise<Plan> {
  const { data } = await supabase.from('profiles').select('plan').eq('id', userId).single()
  const plan = data?.plan as Plan | undefined
  return plan === 'pro' || plan === 'pro_plus' ? plan : 'free'
}

export function isPaid(plan: Plan) {
  return plan === 'pro' || plan === 'pro_plus'
}

export const UPGRADE_HINT = '「プラン・支払い」から Pro にアップグレードすると無制限になります（14日間無料）。'

/** 無料プランのクライアント上限を超えていれば理由文字列を返す */
export async function clientLimitReason(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const plan = await getUserPlan(supabase, userId)
  if (isPaid(plan)) return null
  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_archived', false)
  if ((count ?? 0) >= FREE_LIMITS.clients) {
    return `無料プランで登録できるクライアントは ${FREE_LIMITS.clients} 件までです。${UPGRADE_HINT}`
  }
  return null
}

/** 無料プランの今月の案件作成上限を超えていれば理由文字列を返す */
export async function projectLimitReason(supabase: SupabaseClient, userId: string): Promise<string | null> {
  const plan = await getUserPlan(supabase, userId)
  if (isPaid(plan)) return null
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', monthStart)
  if ((count ?? 0) >= FREE_LIMITS.projectsPerMonth) {
    return `無料プランで今月作成できる案件は ${FREE_LIMITS.projectsPerMonth} 件までです。${UPGRADE_HINT}`
  }
  return null
}
