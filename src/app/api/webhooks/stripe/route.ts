import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { constructWebhookEvent } from '@/lib/stripe';
import { computeStripeEventLagSec, logRevenueEvent } from '@/lib/revenue-events';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { handleStripeWebhookEvent } from '@/lib/stripeWebhookHandler';
import { checkRateLimit, getClientIp, rateLimitResponse, readTextWithLimit } from '@/lib/requestLimits';

export const runtime = 'nodejs';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const MAX_BODY_BYTES = 256_000;

/**
 * Legacy route (kept for backward compatibility).
 * Prefer POST /api/stripe/webhook.
 */
export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const endpoint = '/api/webhooks/stripe';
  const receivedAtMs = Date.now();

  let ip = 'unknown';
  let stripeEventId: string | null = null;
  let stripeEventType: string | null = null;
  let stripeEventCreated: number | null = null;

  try {
    ip = getClientIp(req);
    const rl = checkRateLimit(`stripe:webhook-legacy:${ip}`, { windowMs: 60_000, max: 120 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const payload = await readTextWithLimit(req, MAX_BODY_BYTES);
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
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : 500;

    await logRevenueEvent('webhook_failed', {
      request_id: requestId,
      endpoint,
      ip,
      stripe_event_id: stripeEventId,
      stripe_event_type: stripeEventType,
      stripe_event_created_unix_sec: stripeEventCreated,
      status,
      error: error instanceof Error ? error.message : String(error),
    });

    console.error('Stripe webhook error:', error);

    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
