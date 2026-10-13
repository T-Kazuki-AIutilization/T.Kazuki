import { createServerClient as _createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const STORAGE_KEY = 'supabase.auth.token'
const CHUNK_SIZE = 3180

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

function getSessionFromCookieStore(cookieStore: ReturnType<typeof cookies>) {
  const allCookies = cookieStore.getAll()
  const single = allCookies.find((c) => c.name === STORAGE_KEY)
  let raw = single?.value ?? null

  if (!raw) {
    const chunks: string[] = []
    for (let i = 0; i < 10; i++) {
      const chunk = allCookies.find((c) => c.name === `${STORAGE_KEY}.${i}`)
      if (!chunk) break
      chunks.push(chunk.value)
    }
    if (chunks.length > 0) raw = chunks.join('')
  }

  if (!raw || !raw.startsWith('base64-')) return { user: null, accessToken: null }
  try {
    const json = Buffer.from(raw.substring(7), 'base64url').toString('utf8')
    const session = JSON.parse(json)
    const accessToken = session.access_token as string | undefined
    if (!accessToken) return { user: null, accessToken: null }
    const payload = decodeJWTPayload(accessToken)
    if (!payload) return { user: null, accessToken: null }
    const exp = payload.exp as number | undefined
    if (!exp || exp * 1000 < Date.now()) return { user: null, accessToken: null }
    const user = (session.user as Record<string, unknown>) ?? { id: payload.sub, email: payload.email }
    return { user, accessToken }
  } catch {
    return { user: null, accessToken: null }
  }
}

export function createServerClient() {
  const cookieStore = cookies()
  const { user, accessToken } = getSessionFromCookieStore(cookieStore)

  const supabase = _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          })
        },
      },
    }
  )

  // Override auth.getUser to decode JWT locally — avoids undici calls to GoTrue
  if (user) {
    const cachedUser = user as import('@supabase/supabase-js').User
    supabase.auth.getUser = async () => ({ data: { user: cachedUser }, error: null })
    supabase.auth.getSession = async () => ({
      data: {
        session: {
          access_token: accessToken!,
          refresh_token: '',
          expires_in: 3600,
          token_type: 'bearer',
          user: cachedUser,
        }
      },
      error: null,
    })
  }

  return supabase
}

export function createAdminClient() {
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
      cookies: { getAll: () => [], setAll: () => {} },
    }
  )
}
