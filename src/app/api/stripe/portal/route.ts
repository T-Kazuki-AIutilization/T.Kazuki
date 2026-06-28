export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const stripe = getStripe()
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return errorResponse('No subscription', 'NOT_FOUND', 404)
  const session = await stripe.billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${request.nextUrl.origin}/settings/billing` })
  return jsonResponse({ url: session.url })
}
