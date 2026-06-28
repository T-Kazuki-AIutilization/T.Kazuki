export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { jsonResponse, errorResponse } from '@/lib/utils'

const profileUpdateSchema = z.object({ displayName: z.string().max(100).optional(), businessName: z.string().max(100).optional(), email: z.string().email().optional() })

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return jsonResponse(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = profileUpdateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const update: Record<string, unknown> = {}
  if (parsed.data.displayName !== undefined) update.display_name = parsed.data.displayName
  if (parsed.data.businessName !== undefined) update.business_name = parsed.data.businessName
  if (parsed.data.email !== undefined) update.email = parsed.data.email
  const { data, error } = await supabase.from('profiles').update(update).eq('id', user.id).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data)
}
