import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from '@/lib/requestLimits';
import { constructWebhookEvent } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/stripe/webhook
 * Stripe webhook handler (signature verified + idempotent processing).
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`stripe:webhook:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    // Stripe requires the raw body for signature verification.
    const payload = await readTextWithLimit(req, 512_000);
    const signature = req.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(payload, signature, webhookSecret);
    if (!event) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const result = await handleStripeWebhookEvent({ event, supabase });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === 'number' ? (err as any).status : 400;
    if (status === 413) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
