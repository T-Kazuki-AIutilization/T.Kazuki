export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { jsonResponse } from '@/lib/utils'

function monthLabel(d: Date) {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function GET() {
  const supabase = createAdminClient()

  // ── プラン別ユーザー数 ──
  const { data: planData, count: totalUsers } = await supabase
    .from('profiles')
    .select('plan, created_at', { count: 'exact' })
  const plans = planData ?? []
  const proUsers    = plans.filter(p => p.plan === 'pro')
  const proPlusUsers = plans.filter(p => p.plan === 'pro_plus')
  const freeCount   = (totalUsers ?? 0) - proUsers.length - proPlusUsers.length
  const paidUsers   = proUsers.length + proPlusUsers.length
  const mrr         = proUsers.length * 980 + proPlusUsers.length * 1480
  const arpu        = paidUsers > 0 ? Math.round(mrr / paidUsers) : 0
  const conversionRate = (totalUsers ?? 0) > 0
    ? Math.round((paidUsers / (totalUsers ?? 1)) * 1000) / 10
    : 0

  // ── 過去6ヶ月の月次MRR（有料ユーザー登録日ベース）──
  const now = new Date()
  const months: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(monthLabel(d))
  }

  const monthlyMrr = months.map(month => {
    const newPro     = proUsers.filter(u => monthLabel(new Date(u.created_at)) === month).length
    const newProPlus = proPlusUsers.filter(u => monthLabel(new Date(u.created_at)) === month).length
    return { month, newPaid: newPro + newProPlus, revenue: newPro * 980 + newProPlus * 1480 }
  })

  // ── プラットフォーム上の売上（revenue_entries）月次集計 ──
  const { data: revenueRows } = await supabase
    .from('revenue_entries')
    .select('amount, paid_date, payment_status')
    .eq('payment_status', 'paid')
    .not('paid_date', 'is', null)

  const platformByMonth = months.map(month => {
    const total = (revenueRows ?? [])
      .filter(r => r.paid_date && monthLabel(new Date(r.paid_date)) === month)
      .reduce((sum, r) => sum + Number(r.amount), 0)
    return { month, amount: total }
  })
  const platformTotal = (revenueRows ?? []).reduce((sum, r) => sum + Number(r.amount), 0)

  // ── 最近の有料転換ユーザー（直近10件）──
  const { data: recentPaid } = await supabase
    .from('profiles')
    .select('id, display_name, email, plan, created_at')
    .in('plan', ['pro', 'pro_plus'])
    .order('created_at', { ascending: false })
    .limit(10)

  return jsonResponse({
    mrr,
    arr: mrr * 12,
    arpu,
    paidUsers,
    freeUsers: freeCount,
    totalUsers: totalUsers ?? 0,
    conversionRate,
    planDistribution: { free: freeCount, pro: proUsers.length, pro_plus: proPlusUsers.length },
    monthlyMrr,
    platformByMonth,
    platformTotal,
    recentPaid: recentPaid ?? [],
  })
}
