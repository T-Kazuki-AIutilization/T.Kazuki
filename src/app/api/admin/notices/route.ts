export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { noticeCreateSchema } from '@/lib/validations/notice'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
  return jsonResponse(data ?? [])
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json()
  const parsed = noticeCreateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)
  const { data, error } = await supabase.from('notices').insert({
    author_id: user.id, title: parsed.data.title, body: parsed.data.body,
    category: parsed.data.category, status: parsed.data.status,
    published_at: parsed.data.status === 'published' ? new Date().toISOString() : null,
  }).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)
  return jsonResponse(data, 201)
}
