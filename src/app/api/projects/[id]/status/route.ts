export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { projectStatusSchema } from '@/lib/validations/project'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = projectStatusSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const update: Record<string, unknown> = { status: parsed.data.status }
  if (parsed.data.status === 'completed') update.completed_at = new Date().toISOString()
  if (parsed.data.status === 'in_progress') update.completed_at = null
  const { data, error } = await supabase.from('projects').update(update).eq('id', params.id).eq('user_id', user.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data)
}
