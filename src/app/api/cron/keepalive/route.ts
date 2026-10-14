export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Supabase の無料プロジェクトは一定期間アクセスが無いと一時停止されるため、
 * Vercel Cron から 1 日 1 回、軽い読み取りを行って稼働状態を維持する。
 * 返すのは件数だけで、個人情報は含めない。
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, profiles: count ?? 0, at: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'unknown' }, { status: 500 })
  }
}
