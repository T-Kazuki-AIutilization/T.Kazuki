export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', params.id).single()
  if (error || !data) return errorResponse('Not found', 'NOT_FOUND', 404)
  return jsonResponse(data)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createAdminClient()
  const body = await request.json()
  const allowed: Record<string, unknown> = {}
  if (body.plan !== undefined) allowed.plan = body.plan
  if (body.role !== undefined) allowed.role = body.role
  if (body.display_name !== undefined) allowed.display_name = body.display_name
  const { data, error } = await supabase.from('profiles').update(allowed).eq('id', params.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data)
}
