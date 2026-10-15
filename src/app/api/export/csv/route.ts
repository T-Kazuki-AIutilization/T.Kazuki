export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/utils'
import { getUserPlan, isPaid, UPGRADE_HINT } from '@/lib/plan-limits'

/** CSV のセルをエスケープする（カンマ・改行・引用符を含む値に対応） */
function cell(v: unknown): string {
  const s = v == null ? '' : String(v)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function row(values: unknown[]): string {
  return values.map(cell).join(',') + '\r\n'
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const plan = await getUserPlan(supabase, user.id)
  if (!isPaid(plan)) return errorResponse(`CSV エクスポートは Pro プランの機能です。${UPGRADE_HINT}`, 'PLAN_LIMIT', 403)

  const url = request.nextUrl
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const format = url.searchParams.get('format') || 'default'
  let query = supabase.from('revenue_entries').select('*, project:projects(title, client:clients(name))').eq('user_id', user.id).order('billed_date')
  if (from) query = query.gte('billed_date', from)
  if (to) query = query.lte('billed_date', to)
  const { data } = await query
  const entries = (data ?? []) as Array<Record<string, any>>

  let csv = ''
  if (format === 'freee') {
    csv += row(['収入日', '勘定科目', '税区分', '金額', '取引先', '品目', 'メモ'])
    for (const e of entries) csv += row([e.paid_date || e.billed_date || '', '売上高', '課税売上10%', e.amount, e.project?.client?.name || '', e.project?.title || '', e.memo || ''])
  } else if (format === 'moneyforward') {
    csv += row(['日付', '内容', '金額(税込)', '勘定科目', '取引先'])
    for (const e of entries) csv += row([e.paid_date || e.billed_date || '', e.project?.title || '', e.amount, '売上高', e.project?.client?.name || ''])
  } else {
    csv += row(['日付', '案件名', 'クライアント', '金額', 'ステータス', '入金日', 'メモ'])
    for (const e of entries) csv += row([e.billed_date || '', e.project?.title || '', e.project?.client?.name || '', e.amount, e.payment_status, e.paid_date || '', e.memo || ''])
  }
  // Excel（Windows）で文字化けしないよう UTF-8 BOM を付ける
  const body = '\uFEFF' + csv
  const date = new Date().toISOString().slice(0, 10)
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="freelanceos_${format}_${date}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
