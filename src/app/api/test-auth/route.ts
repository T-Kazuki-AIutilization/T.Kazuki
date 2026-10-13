import { NextResponse } from 'next/server'

export async function GET() {
  const authUrl = process.env.SUPABASE_AUTH_URL || 'NOT_SET'
  console.log('[test-auth] authUrl:', authUrl)
  
  const start = Date.now()
  try {
    const res = await fetch(`${authUrl}/health`, { signal: AbortSignal.timeout(5000) })
    const data = await res.json()
    return NextResponse.json({ ok: true, ms: Date.now() - start, authUrl, data })
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, ms: Date.now() - start, authUrl, error: String(e) })
  }
}
