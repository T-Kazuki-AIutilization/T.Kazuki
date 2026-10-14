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

async function setPlanForCustomer(stripe: Stripe, customerId: string, plan: Plan) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ plan })
    .eq('stripe_customer_id', customerId)
    .select('id')
  if (error) {
    console.error('[stripe webhook] profile update failed', customerId, error.message)
    return
  }
  if (data && data.length > 0) return
  // 顧客 ID がプロファイルに未保存の場合は、顧客作成時に付けた metadata.userId で紐付け直す（自己修復）
  try {
    const customer = await stripe.customers.retrieve(customerId)
    const userId = (customer as Stripe.Customer).metadata?.userId
    if (!userId) {
      console.error('[stripe webhook] no profile for customer and no userId metadata', customerId)
      return
    }
    // 既に別の顧客 ID が紐付いているプロファイルは上書きしない（古い重複顧客のイベントで壊さないため）
    const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', userId).single()
    if (!profile || (profile.stripe_customer_id && profile.stripe_customer_id !== customerId)) {
      console.warn('[stripe webhook] ignoring event for unlinked customer', customerId, userId)
      return
    }
    if (plan === 'free') return // 未紐付けの顧客の解約・失効は無視
    const { error: linkError } = await supabase
      .from('profiles')
      .update({ plan, stripe_customer_id: customerId })
      .eq('id', userId)
    if (linkError) console.error('[stripe webhook] profile link failed', customerId, userId, linkError.message)
  } catch (e) {
    console.error('[stripe webhook] customer lookup failed', customerId, e instanceof Error ? e.message : e)
  }
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
      await setPlanForCustomer(stripe, customerId, planFromSubscription(sub))
      break
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object
      const customerId = customerIdOf(sub)
      if (customerId) await setPlanForCustomer(stripe, customerId, planFromSubscription(sub))
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const customerId = customerIdOf(sub)
      if (customerId) await setPlanForCustomer(stripe, customerId, 'free')
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
