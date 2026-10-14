export const dynamic = 'force-dynamic'
import type Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/utils'

/** ログイン中ユーザーの Stripe サブスクリプション状況（料金ページの表示用） */
export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return jsonResponse({ subscription: null })
  try {
    const stripe = getStripe()
    const list = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: 'all', limit: 10 })
    const live = list.data.filter((s) => s.status === 'active' || s.status === 'trialing' || s.status === 'past_due')
    const sub: Stripe.Subscription | undefined = live.sort((a, b) => b.created - a.created)[0]
    if (!sub) return jsonResponse({ subscription: null })
    const item = sub.items.data[0]
    const priceId = item?.price?.id
    const plan = priceId === PLANS.pro_plus.priceId ? 'pro_plus' : priceId === PLANS.pro.priceId ? 'pro' : 'unknown'
    const periodEnd = item?.current_period_end ?? null
    return jsonResponse({
      subscription: {
        id: sub.id,
        status: sub.status,
        plan,
        trialEnd: sub.trial_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        cancelAt: sub.cancel_at,
        currentPeriodEnd: periodEnd,
      },
    })
  } catch (e) {
    console.error('[stripe subscription] failed', (e as Error).message)
    return jsonResponse({ subscription: null })
  }
}
