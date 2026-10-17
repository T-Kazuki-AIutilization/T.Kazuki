export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'
import { FREE_LIMITS, getUserPlan, isPaid } from '@/lib/plan-limits'

/** 現在のプランと、無料プランの上限に対する使用量（ダッシュボードの表示用） */
export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const plan = await getUserPlan(supabase, user.id)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const [{ count: clients }, { count: projects }] = await Promise.all([
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_archived', false),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthStart),
  ])
  return jsonResponse({
    plan,
    paid: isPaid(plan),
    clients: { used: clients ?? 0, limit: FREE_LIMITS.clients },
    projectsThisMonth: { used: projects ?? 0, limit: FREE_LIMITS.projectsPerMonth },
  })
}
