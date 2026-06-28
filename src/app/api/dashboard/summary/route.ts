export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const month = request.nextUrl.searchParams.get('month') || new Date().toISOString().slice(0, 7)
  const startDate = `${month}-01`
  const endDate = new Date(parseInt(month.slice(0,4)), parseInt(month.slice(5,7)), 0).toISOString().slice(0,10)
  const [revResult, projResult, clientResult] = await Promise.all([
    supabase.from('revenue_entries').select('amount, payment_status').eq('user_id', user.id).gte('billed_date', startDate).lte('billed_date', endDate),
    supabase.from('projects').select('status').eq('user_id', user.id),
    supabase.from('clients').select('id').eq('user_id', user.id).eq('is_archived', false),
  ])
  const entries = revResult.data ?? []
  const totalRevenue = entries.reduce((s, e) => s + Number(e.amount), 0)
  const paidAmount = entries.filter(e => e.payment_status === 'paid').reduce((s, e) => s + Number(e.amount), 0)
  const projects = projResult.data ?? []
  return jsonResponse({
    totalRevenue, paidAmount, unpaidAmount: totalRevenue - paidAmount,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalClients: clientResult.data?.length ?? 0,
  })
}
