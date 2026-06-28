import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-06-24.dahlia',
    })
  }
  return _stripe
}

export const PLANS = {
  free:     { name: 'Free',  price: 0,    priceId: null },
  pro:      { name: 'Pro',   price: 980,  priceId: process.env.STRIPE_PRO_PRICE_ID! },
  pro_plus: { name: 'Pro+',  price: 1480, priceId: process.env.STRIPE_PRO_PLUS_PRICE_ID! },
} as const
