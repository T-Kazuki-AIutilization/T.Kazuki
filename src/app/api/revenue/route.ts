export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { revenueCreateSchema } from '@/lib/validations/revenue'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const url = request.nextUrl
  const status = url.searchParams.get('paymentStatus')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  let query = supabase.from('revenue_entries')
    .select('*, project:projects(id,title,client:clients(id,name))', { count: 'exact' })
    .eq('user_id', user.id).order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1)
  if (status) query = query.eq('payment_status', status)
  if (from) query = query.gte('billed_date', from)
  if (to) query = query.lte('billed_date', to)
  const { data, error, count } = await query
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse({ data, pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } })
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = revenueCreateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const { data, error } = await supabase.from('revenue_entries').insert({
    user_id: user.id, project_id: parsed.data.projectId ?? null, amount: parsed.data.amount,
    payment_status: parsed.data.paymentStatus, billed_date: parsed.data.billedDate ?? null,
    due_date: parsed.data.dueDate ?? null, paid_date: parsed.data.paidDate ?? null, memo: parsed.data.memo ?? null,
  }).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data, 201)
}
