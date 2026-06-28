export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { projectCreateSchema } from '@/lib/validations/project'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const url = request.nextUrl
  const status = url.searchParams.get('status')
  const clientId = url.searchParams.get('clientId')
  const categoryId = url.searchParams.get('categoryId')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  const sort = url.searchParams.get('sort') || 'created_at'
  const order = url.searchParams.get('order') !== 'asc'

  let query = supabase.from('projects')
    .select('*, client:clients(id,name), category:categories(id,name,color), revenue_entry:revenue_entries(id,payment_status,due_date)', { count: 'exact' })
    .eq('user_id', user.id).range((page-1)*limit, page*limit-1).order(sort, { ascending: !order })

  if (status) query = query.eq('status', status)
  if (clientId) query = query.eq('client_id', clientId)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, error, count } = await query
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse({ data, pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } })
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const body = await request.json()
  const parsed = projectCreateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)

  const { data, error } = await supabase.from('projects').insert({
    user_id: user.id, title: parsed.data.title, client_id: parsed.data.clientId ?? null,
    category_id: parsed.data.categoryId ?? null, amount: parsed.data.amount,
    deadline: parsed.data.deadline ?? null, memo: parsed.data.memo ?? null,
  }).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data, 201)
}
