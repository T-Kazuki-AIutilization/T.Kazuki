export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data } = await supabase.from('notices').select('id, title, body, category, published_at')
    .eq('status', 'published').order('published_at', { ascending: false }).limit(5)
  return jsonResponse(data ?? [])
}
