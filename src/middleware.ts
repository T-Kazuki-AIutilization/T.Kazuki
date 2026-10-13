import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/terms', '/privacy', '/tokusho', '/api/health', '/api/test-auth', '/api/auth', '/api/stripe/webhook']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/auth/v1/') || pathname === '/auth/v1') {
    return NextResponse.next()
  }

  const { supabaseResponse, user, supabase } = await updateSession(request)

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return supabaseResponse
  }

  if (!user) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!supabase) {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', (user as { id: string }).id).single()
    if (profile?.role !== 'admin') {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: { message: 'Forbidden', code: 'FORBIDDEN' } }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
