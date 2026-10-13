export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { noticeUpdateSchema } from '@/lib/validations/notice'
import { jsonResponse, errorResponse } from '@/lib/utils'

type Params = { params: { id: string } }

export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const body = await request.json()
  const parsed = noticeUpdateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const update: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) update.title = parsed.data.title
  if (parsed.data.body !== undefined) update.body = parsed.data.body
  if (parsed.data.category !== undefined) update.category = parsed.data.category
  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status
    if (parsed.data.status === 'published') update.published_at = new Date().toISOString()
  }
  const { data, error } = await supabase.from('notices').update(update).eq('id', params.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const supabase = createServerClient()
  const { error } = await supabase.from('notices').delete().eq('id', params.id)
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse({ success: true })
}
