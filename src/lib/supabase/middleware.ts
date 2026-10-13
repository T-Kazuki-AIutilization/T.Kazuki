import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function decodeJWTPayload(jwt: string): Record<string, unknown> | null {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function decodeSessionCookie(raw: string): Record<string, unknown> | null {
  try {
    if (!raw.startsWith('base64-')) return null
    const json = Buffer.from(raw.substring(7), 'base64url').toString('utf8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function getSessionFromCookies(request: NextRequest) {
  const STORAGE_KEY = 'supabase.auth.token'
  let raw = request.cookies.get(STORAGE_KEY)?.value ?? null

  if (!raw) {
    const chunks: string[] = []
    for (let i = 0; i < 10; i++) {
      const chunk = request.cookies.get(`${STORAGE_KEY}.${i}`)?.value
      if (!chunk) break
      chunks.push(chunk)
    }
    if (chunks.length > 0) raw = chunks.join('')
  }

  if (!raw) return { user: null, accessToken: null }

  const session = decodeSessionCookie(raw)
  if (!session) return { user: null, accessToken: null }

  const accessToken = session.access_token as string | undefined
  if (!accessToken) return { user: null, accessToken: null }

  const payload = decodeJWTPayload(accessToken)
  if (!payload) return { user: null, accessToken: null }

  const exp = payload.exp as number | undefined
  if (!exp || exp * 1000 < Date.now()) return { user: null, accessToken: null }

  const user = (session.user as Record<string, unknown>) ?? {
    id: payload.sub,
    email: payload.email,
  }

  return { user, accessToken }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const { user, accessToken } = getSessionFromCookies(request)

  // DBクエリ用クライアント（admin role確認等に使用）
  // auth.*は呼ばない。PostgRESTへのRESTクエリのみ使用
  const supabase = accessToken ? createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        // GoTrueを一切呼ばないよう設定
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]))
        },
      },
    }
  ) : null

  return { supabaseResponse, user, supabase }
}
