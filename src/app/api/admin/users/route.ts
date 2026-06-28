export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jsonResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const supabase = createAdminClient()
  const url = request.nextUrl
  const search = url.searchParams.get('search') || ''
  const plan = url.searchParams.get('plan')
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50)

  let query = supabase.from('profiles').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range((page-1)*limit, page*limit-1)
  if (search) query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`)
  if (plan) query = query.eq('plan', plan)
  const { data, count } = await query

  return jsonResponse({ data: data ?? [], pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) } })
}
