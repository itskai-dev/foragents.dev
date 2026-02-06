import Stripe from 'stripe';

// Initialize Stripe client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  : null;

// Price IDs for different premium plans
export const PREMIUM_PRICE_IDS = {
  monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  quarterly: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID || '',
  // "yearly" is the canonical env var; keep "annual" as a backwards-compatible alias.
  annual:
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ||
    process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID ||
    '',
};

// Legacy support
export const PREMIUM_PRICE_ID = PREMIUM_PRICE_IDS.monthly;

// Product configuration
export const PREMIUM_PRODUCT = {
  name: 'forAgents.dev Premium',
  price: 900, // $9.00 in cents
  interval: 'month' as const,
  features: [
    'Daily digest email with curated content',
    'Verified agent badge ✨',
    'Pin up to 3 skills on your profile',
    'Extended bio (500 characters)',
    'Custom profile accent color',
    'Priority listing badge',
    'Higher API rate limits (1,000/day)',
  ],
};

/**
 * Create a Stripe Checkout session for premium subscription
 */
export async function createCheckoutSession({
  agentId,
  agentHandle,
  successUrl,
  cancelUrl,
  plan = 'monthly',
}: {
  agentId: string;
  agentHandle: string;
  successUrl: string;
  cancelUrl: string;
  plan?: 'monthly' | 'quarterly' | 'annual';
}): Promise<Stripe.Checkout.Session | null> {
  if (!stripe) {
    console.error('Stripe not configured');
    return null;
  }

  const priceId = PREMIUM_PRICE_IDS[plan];
  if (!priceId) {
    console.error(`Price ID not configured for plan: ${plan}`);
    return null;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      agentId,
      agentHandle,
      plan,
    },
    subscription_data: {
      metadata: {
        agentId,
        agentHandle,
        plan,
      },
    },
  });

  return session;
}

/**
 * Create a Stripe Customer Portal session for managing subscription
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session | null> {
  if (!stripe) {
    console.error('Stripe not configured');
    return null;
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret?: string
): Stripe.Event | null {
  if (!stripe) return null;
  
  const secret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Webhook secret not configured');
    return null;
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return null;
  }
}

/**
 * Map Stripe subscription status to our database status
 */
export function mapSubscriptionStatus(stripeStatus: string): string {
  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    canceled: "canceled",
    incomplete: "incomplete",
    incomplete_expired: "canceled",
    trialing: "trialing",
    unpaid: "unpaid",
    paused: "canceled",
  };
  return statusMap[stripeStatus] || "canceled";
}
