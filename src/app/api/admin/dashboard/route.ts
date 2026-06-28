export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { jsonResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createAdminClient()
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
  const { data: planData } = await supabase.from('profiles').select('plan')
  const plans = planData ?? []
  const proCount = plans.filter(p => p.plan === 'pro').length
  const proPlusCount = plans.filter(p => p.plan === 'pro_plus').length
  const mrr = proCount * 980 + proPlusCount * 1480

  return jsonResponse({
    totalUsers: totalUsers ?? 0,
    paidUsers: proCount + proPlusCount,
    mrr,
    planDistribution: { free: (totalUsers ?? 0) - proCount - proPlusCount, pro: proCount, pro_plus: proPlusCount },
  })
}
