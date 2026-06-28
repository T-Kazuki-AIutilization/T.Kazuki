export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { projectUpdateSchema } from '@/lib/validations/project'
import { jsonResponse, errorResponse } from '@/lib/utils'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data, error } = await supabase.from('projects')
    .select('*, client:clients(id,name), category:categories(id,name,color)').eq('id', params.id).eq('user_id', user.id).single()
  if (error || !data) return errorResponse('Not found', 'NOT_FOUND', 404)
  return jsonResponse(data)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = projectUpdateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const update: Record<string, unknown> = {}
  const d = parsed.data
  if (d.title !== undefined) update.title = d.title
  if (d.clientId !== undefined) update.client_id = d.clientId
  if (d.categoryId !== undefined) update.category_id = d.categoryId
  if (d.amount !== undefined) update.amount = d.amount
  if (d.deadline !== undefined) update.deadline = d.deadline
  if (d.memo !== undefined) update.memo = d.memo
  const { data, error } = await supabase.from('projects').update(update).eq('id', params.id).eq('user_id', user.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { error } = await supabase.from('projects').delete().eq('id', params.id).eq('user_id', user.id)
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse({ success: true })
}
