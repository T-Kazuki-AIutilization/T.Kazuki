export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { jsonResponse, errorResponse } from '@/lib/utils'

const tagSchema = z.object({ name: z.string().min(1).max(50), color: z.string().max(7).optional() })

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data } = await supabase.from('tags').select('*').eq('user_id', user.id).order('name')
  return jsonResponse(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = tagSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const { data, error } = await supabase.from('tags').insert({ user_id: user.id, ...parsed.data }).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data, 201)
}
