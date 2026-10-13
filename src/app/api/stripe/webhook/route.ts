export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe, PLANS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

type Plan = 'free' | 'pro' | 'pro_plus'

/** Stripe の price id からアプリ内プランを決定する。未知の price は free 扱い。 */
function planFromPriceId(priceId: string | undefined | null): Plan {
  if (!priceId) return 'free'
  if (priceId === PLANS.pro_plus.priceId) return 'pro_plus'
  if (priceId === PLANS.pro.priceId) return 'pro'
  return 'free'
}

/** サブスクリプションの状態からプランを決定する。有効な状態以外は free に戻す。 */
function planFromSubscription(sub: Stripe.Subscription): Plan {
  const active = sub.status === 'active' || sub.status === 'trialing'
  if (!active) return 'free'
  const priceId = sub.items.data[0]?.price?.id
  return planFromPriceId(priceId)
}

async function setPlanForCustomer(customerId: string, plan: Plan) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('profiles').update({ plan }).eq('stripe_customer_id', customerId)
  if (error) console.error('[stripe webhook] profile update failed', customerId, error.message)
}

function customerIdOf(obj: { customer: string | Stripe.Customer | Stripe.DeletedCustomer | null }): string | null {
  if (!obj.customer) return null
  return typeof obj.customer === 'string' ? obj.customer : obj.customer.id
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const customerId = customerIdOf(session)
      if (!customerId || session.mode !== 'subscription' || !session.subscription) break
      const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id
      const sub = await stripe.subscriptions.retrieve(subId)
      await setPlanForCustomer(customerId, planFromSubscription(sub))
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const customerId = customerIdOf(sub)
      if (customerId) await setPlanForCustomer(customerId, planFromSubscription(sub))
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const customerId = customerIdOf(sub)
      if (customerId) await setPlanForCustomer(customerId, 'free')
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
