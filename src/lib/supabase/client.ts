import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

export function createBrowserClient() {
  // Auth goes through Next.js rewrite proxy (/auth/v1/* → GoTrue:9999) to avoid CORS
  // REST/Storage go through Kong at port 8000 (works fine)
  return _createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/v1`,
      },
    }
  )
}
