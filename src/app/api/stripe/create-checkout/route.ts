export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { jsonResponse, errorResponse } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
  const body = await request.json().catch(() => ({}))
  // plan キー（pro / pro_plus）を受け取り、price id はサーバー側で決める
  const plan = body.plan as string | undefined
  const priceId =
    plan === 'pro' ? PLANS.pro.priceId
    : plan === 'pro_plus' ? PLANS.pro_plus.priceId
    : (body.priceId as string | undefined)
  const allowed = [PLANS.pro.priceId, PLANS.pro_plus.priceId].filter(Boolean)
  if (!priceId || !allowed.includes(priceId)) return errorResponse('Unknown plan', 'VALIDATION_ERROR', 422)
  const { data: profile } = await supabase.from('profiles').select('stripe_customer_id, email').eq('id', user.id).single()
  let customerId = profile?.stripe_customer_id as string | null | undefined
  // 保存済みの顧客 ID が現在のモード（本番/テスト）に存在しない場合は作り直す
  if (customerId) {
    try {
      const existing = await stripe.customers.retrieve(customerId)
      if ((existing as { deleted?: boolean }).deleted) customerId = null
    } catch {
      customerId = null
    }
  }
  if (!customerId) {
    const customer = await stripe.customers.create({ email: profile?.email, metadata: { userId: user.id } })
    customerId = customer.id
    // stripe_customer_id は一般ユーザーに更新権限を与えていない列なので、サーバー側の管理者クライアントで書き込む
    const admin = createAdminClient()
    const { error: saveError } = await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    if (saveError) {
      console.error('[create-checkout] failed to save stripe_customer_id', user.id, saveError.message)
      return errorResponse('Failed to prepare billing', 'INTERNAL_ERROR', 500)
    }
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId, mode: 'subscription', line_items: [{ price: priceId, quantity: 1 }],
    locale: 'ja', allow_promotion_codes: true,
    subscription_data: { trial_period_days: 14 },
    success_url: `${request.nextUrl.origin}/settings/billing?success=true`,
    cancel_url: `${request.nextUrl.origin}/settings/billing?canceled=true`,
  })
  return jsonResponse({ url: session.url })
}
