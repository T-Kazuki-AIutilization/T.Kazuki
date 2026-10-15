export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'
import { getUserPlan } from '@/lib/plan-limits'

type Row = { clientId: string | null; clientName: string; total: number; paid: number; unpaid: number; count: number; share: number }

/** クライアント別の収益集計（Pro+ の機能）。期間は billed_date で絞る。 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const plan = await getUserPlan(supabase, user.id)
  if (plan !== 'pro_plus') {
    return errorResponse('クライアント別収益分析は Pro+ プランの機能です。「プラン・支払い」からアップグレードできます。', 'PLAN_LIMIT', 403)
  }
  const url = request.nextUrl
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  let query = supabase
    .from('revenue_entries')
    .select('amount, payment_status, project:projects(client_id, client:clients(name))')
    .eq('user_id', user.id)
  if (from) query = query.gte('billed_date', from)
  if (to) query = query.lte('billed_date', to)
  const { data, error } = await query
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)

  const map = new Map<string, Row>()
  let grand = 0
  for (const e of (data ?? []) as Array<Record<string, any>>) {
    const clientId: string | null = e.project?.client_id ?? null
    const name: string = e.project?.client?.name ?? 'クライアント未設定'
    const key = clientId ?? '__none__'
    const row = map.get(key) ?? { clientId, clientName: name, total: 0, paid: 0, unpaid: 0, count: 0, share: 0 }
    const amount = Number(e.amount) || 0
    row.total += amount
    if (e.payment_status === 'paid') row.paid += amount
    else row.unpaid += amount
    row.count += 1
    grand += amount
    map.set(key, row)
  }
  const rows = [...map.values()]
    .map((r) => ({ ...r, share: grand > 0 ? r.total / grand : 0 }))
    .sort((a, b) => b.total - a.total)
  return jsonResponse({ rows, grandTotal: grand })
}
