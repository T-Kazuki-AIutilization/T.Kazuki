export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  const startDate = `${sixMonthsAgo.toISOString().slice(0,7)}-01`

  const { data } = await supabase.from('revenue_entries')
    .select('amount, payment_status, billed_date').eq('user_id', user.id).gte('billed_date', startDate).order('billed_date')

  const monthly: Record<string, { revenue: number; paidAmount: number }> = {}
  for (const entry of data ?? []) {
    if (!entry.billed_date) continue
    const m = entry.billed_date.slice(0, 7)
    if (!monthly[m]) monthly[m] = { revenue: 0, paidAmount: 0 }
    monthly[m].revenue += Number(entry.amount)
    if (entry.payment_status === 'paid') monthly[m].paidAmount += Number(entry.amount)
  }

  const result = Object.entries(monthly).sort().map(([month, vals]) => ({ month, ...vals }))
  return jsonResponse(result)
}
