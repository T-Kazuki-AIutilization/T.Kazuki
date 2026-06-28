export const dynamic = 'force-dynamic'
import { createAdminClient } from '@/lib/supabase/server'
import { jsonResponse } from '@/lib/utils'

export async function GET() {
  const supabase = createAdminClient()
  let dbStatus = 'ok'
  try { await supabase.from('profiles').select('id').limit(1) } catch { dbStatus = 'error' }
  return jsonResponse({ api: 'ok', database: dbStatus, timestamp: new Date().toISOString() })
}
