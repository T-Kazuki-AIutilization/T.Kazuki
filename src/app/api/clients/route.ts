export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { clientCreateSchema } from '@/lib/validations/client'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const url = request.nextUrl
  const search = url.searchParams.get('search') || ''
  const tag = url.searchParams.get('tag')
  const archived = url.searchParams.get('archived') === 'true'
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)
  const offset = (page - 1) * limit

  let query = supabase.from('clients').select('*, tags:client_tags(tag:tags(id,name,color))', { count: 'exact' })
    .eq('user_id', user.id).eq('is_archived', archived).order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) query = query.or(`name.ilike.%${search}%,company_name.ilike.%${search}%`)
  if (tag) query = query.contains('client_tags', [{ tag_id: tag }])

  const { data, error, count } = await query
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)

  return jsonResponse({ data, pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } })
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const body = await request.json()
  const parsed = clientCreateSchema.safeParse(body)
  if (!parsed.success) return errorResponse(parsed.error.issues[0].message, 'VALIDATION_ERROR', 422)

  const { tagIds, ...clientData } = parsed.data
  const insert = {
    user_id: user.id, name: clientData.name,
    company_name: clientData.companyName ?? null, email: clientData.email ?? null,
    phone: clientData.phone ?? null, memo: clientData.memo ?? null,
  }

  const { data, error } = await supabase.from('clients').insert(insert).select().single()
  if (error) return errorResponse(error.message, 'DB_ERROR', 500)

  if (tagIds?.length && data) {
    await supabase.from('client_tags').insert(tagIds.map((tagId) => ({ client_id: data.id, tag_id: tagId })))
  }

  return jsonResponse(data, 201)
}
