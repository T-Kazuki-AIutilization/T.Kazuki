export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { clientUpdateSchema } from '@/lib/validations/client'
import { jsonResponse, errorResponse } from '@/lib/utils'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const { data, error } = await supabase.from('clients')
    .select('*, tags:client_tags(tag:tags(id,name,color))').eq('id', params.id).eq('user_id', user.id).single()
  if (error || !data) return errorResponse('Not found', 'NOT_FOUND', 404)
  return jsonResponse(data)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const body = await request.json()
  const parsed = clientUpdateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)

  const { tagIds, ...fields } = parsed.data
  const update: Record<string, unknown> = {}
  if (fields.name !== undefined) update.name = fields.name
  if (fields.companyName !== undefined) update.company_name = fields.companyName
  if (fields.email !== undefined) update.email = fields.email
  if (fields.phone !== undefined) update.phone = fields.phone
  if (fields.memo !== undefined) update.memo = fields.memo

  const { data, error } = await supabase.from('clients').update(update)
    .eq('id', params.id).eq('user_id', user.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)

  if (tagIds) {
    await supabase.from('client_tags').delete().eq('client_id', params.id)
    if (tagIds.length) {
      await supabase.from('client_tags').insert(tagIds.map((tid) => ({ client_id: params.id, tag_id: tid })))
    }
  }
  return jsonResponse(data)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const { error } = await supabase.from('clients').update({ is_archived: true })
    .eq('id', params.id).eq('user_id', user.id)
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse({ success: true })
}
