'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import http from 'http'

function httpPost(url: string, body: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = http.request({
      hostname: u.hostname,
      port: Number(u.port) || 80,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Connection': 'close',
      },
    }, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode ?? 0, data }))
    })
    req.on('error', reject)
    req.setTimeout(10000, () => { req.destroy(new Error('GoTrue timeout')) })
    req.write(body)
    req.end()
  })
}

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const authUrl = process.env.SUPABASE_AUTH_URL || 'http://192.168.10.108:9999'

  const t = Date.now()
  let result: { status: number; data: string }
  try {
    result = await httpPost(
      `${authUrl}/token?grant_type=password`,
      JSON.stringify({ email, password })
    )
  } catch (e) {
    return { error: 'サーバー接続エラー: ' + String(e) }
  }

  if (result.status !== 200) {
    try {
      const err = JSON.parse(result.data)
      return { error: err.error_description || err.msg || `認証失敗 (${result.status})` }
    } catch {
      return { error: `認証失敗 (${result.status})` }
    }
  }

  const session = JSON.parse(result.data)
  console.log('[signInAction] ok in', Date.now() - t, 'ms, user:', session.user?.email)

  // base64-<base64url(JSON)> 形式でクッキーに保存（@supabase/ssr 互換）
  const sessionData = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: 'bearer',
    user: session.user,
  })
  const encoded = 'base64-' + Buffer.from(sessionData).toString('base64url')

  const STORAGE_KEY = 'supabase.auth.token'
  const cookieOpts = { path: '/', sameSite: 'lax' as const, httpOnly: false, maxAge: 60 * 60 * 24 * 365 }
  const CHUNK_SIZE = 3180

  const cookieStore = cookies()
  if (encoded.length <= CHUNK_SIZE) {
    cookieStore.set(STORAGE_KEY, encoded, cookieOpts)
  } else {
    for (let i = 0; i * CHUNK_SIZE < encoded.length; i++) {
      cookieStore.set(`${STORAGE_KEY}.${i}`, encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE), cookieOpts)
    }
  }

  redirect('/dashboard')
}
