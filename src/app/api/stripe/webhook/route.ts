export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!
  let event
  try { event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!) }
  catch { return NextResponse.json({ error: 'Invalid signature' }, { status: 400 }) }
  const supabase = createAdminClient()
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as { customer: string }
    const { data: profiles } = await supabase.from('profiles').select('id').eq('stripe_customer_id', session.customer)
    if (profiles?.[0]) { await supabase.from('profiles').update({ plan: 'pro' }).eq('id', profiles[0].id) }
  }
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as { customer: string }
    const { data: profiles } = await supabase.from('profiles').select('id').eq('stripe_customer_id', sub.customer)
    if (profiles?.[0]) { await supabase.from('profiles').update({ plan: 'free' }).eq('id', profiles[0].id) }
  }
  return NextResponse.json({ received: true })
}
