export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const url = request.nextUrl
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const format = url.searchParams.get('format') || 'default'
  let query = supabase.from('revenue_entries').select('*, project:projects(title, client:clients(name))').eq('user_id', user.id).order('billed_date')
  if (from) query = query.gte('billed_date', from)
  if (to) query = query.lte('billed_date', to)
  const { data } = await query
  const entries = data ?? []
  let csv = ''
  if (format === 'freee') {
    csv = '収入日,勘定科目,税区分,金額,取引先,品目,メモ\n'
    for (const e of entries) { csv += `${e.paid_date||e.billed_date||''},売上高,課対仕入10%,${e.amount},${(e as any).project?.client?.name||''},${(e as any).project?.title||''},${e.memo||''}\n` }
  } else if (format === 'moneyforward') {
    csv = '日付,内容,金額(税込),勘定科目,取引先\n'
    for (const e of entries) { csv += `${e.paid_date||e.billed_date||''},${(e as any).project?.title||''},${e.amount},売上高,${(e as any).project?.client?.name||''}\n` }
  } else {
    csv = '日付,案件名,クライアント,金額,ステータス,入金日,メモ\n'
    for (const e of entries) { csv += `${e.billed_date||''},${(e as any).project?.title||''},${(e as any).project?.client?.name||''},${e.amount},${e.payment_status},${e.paid_date||''},${e.memo||''}\n` }
  }
  return new Response(csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="freelanceos_export_${format}.csv"` } })
}
