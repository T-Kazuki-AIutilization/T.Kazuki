export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { priceId } = await request.json()
  if (!priceId) return errorResponse('priceId is required', 'VALIDATION_ERROR', 422)
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()
  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile?.email, metadata: { userId: user.id } })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId, mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${request.nextUrl.origin}/settings/billing?success=true`,
    cancel_url: `${request.nextUrl.origin}/settings/billing?canceled=true`,
  })
  return jsonResponse({ url: session.url })
}
