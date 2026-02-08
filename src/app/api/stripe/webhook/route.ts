import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from '@/lib/requestLimits';
import { constructWebhookEvent } from '@/lib/stripe';
import { computeStripeEventLagSec, logRevenueEvent } from '@/lib/revenue-events';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * POST /api/stripe/webhook
 * Stripe webhook handler (signature verified + idempotent processing).
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const endpoint = '/api/stripe/webhook';
  const receivedAtMs = Date.now();

  let ip = 'unknown';
  let stripeEventId: string | null = null;
  let stripeEventType: string | null = null;
  let stripeEventCreated: number | null = null;

  try {
    ip = getClientIp(req);
    const rl = checkRateLimit(`stripe:webhook:${ip}`, { windowMs: 60_000, max: 60 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    // Stripe requires the raw body for signature verification.
    const payload = await readTextWithLimit(req, 512_000);
    const signature = req.headers.get('stripe-signature') || '';

    const event = constructWebhookEvent(payload, signature, webhookSecret);
    if (!event) {
      await logRevenueEvent('webhook_failed', {
        request_id: requestId,
        endpoint,
        ip,
        reason: 'invalid_signature',
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    stripeEventId = event.id;
    stripeEventType = event.type;
    stripeEventCreated = typeof event.created === 'number' ? event.created : null;

    const stripeEventLagSec = computeStripeEventLagSec(stripeEventCreated, receivedAtMs);

    await logRevenueEvent('webhook_received', {
      request_id: requestId,
      endpoint,
      ip,
      stripe_event_id: stripeEventId,
      stripe_event_type: stripeEventType,
      stripe_event_created_unix_sec: stripeEventCreated,
      stripe_event_lag_sec: stripeEventLagSec,
    });

    const supabase = getSupabaseAdmin();
    const processingStartMs = Date.now();
    const result = await handleStripeWebhookEvent({ event, supabase });
    const processingMs = Date.now() - processingStartMs;

    if (!result.ok) {
      await logRevenueEvent('webhook_failed', {
        request_id: requestId,
        endpoint,
        ip,
        stripe_event_id: stripeEventId,
        stripe_event_type: stripeEventType,
        stripe_event_created_unix_sec: stripeEventCreated,
        stripe_event_lag_sec: stripeEventLagSec,
        processing_ms: processingMs,
        error: result.error,
      });

      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    await logRevenueEvent('webhook_processed', {
      request_id: requestId,
      endpoint,
      ip,
      stripe_event_id: stripeEventId,
      stripe_event_type: stripeEventType,
      stripe_event_created_unix_sec: stripeEventCreated,
      stripe_event_lag_sec: stripeEventLagSec,
      processing_ms: processingMs,
      already_processed: (result as { alreadyProcessed?: unknown }).alreadyProcessed === true,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const status = typeof (err as any)?.status === 'number' ? (err as any).status : 400;

    await logRevenueEvent('webhook_failed', {
      request_id: requestId,
      endpoint,
      ip,
      stripe_event_id: stripeEventId,
      stripe_event_type: stripeEventType,
      stripe_event_created_unix_sec: stripeEventCreated,
      status,
      error: err instanceof Error ? err.message : String(err),
    });

    if (status === 413) {
      return NextResponse.json({ error: 'Request body too large' }, { status: 413 });
    }

    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
