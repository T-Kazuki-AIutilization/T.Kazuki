export const dynamic = 'force-dynamic'
import { createServerClient } from '@/lib/supabase/server'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)

  const today = new Date().toISOString().slice(0, 10)
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const { data } = await supabase.from('revenue_entries')
    .select('*, project:projects(id,title,client:clients(id,name))')
    .eq('user_id', user.id).in('payment_status', ['unbilled', 'billed'])
    .lte('due_date', nextWeek).order('due_date').limit(10)

  return jsonResponse(data ?? [])
}
