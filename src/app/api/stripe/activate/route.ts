import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { activatePremiumFromCheckoutSession } from '@/lib/stripeActivation';

export const runtime = 'nodejs';

/**
 * GET /api/stripe/activate?session_id=cs_...
 *
 * Lightweight “repair + confirm” endpoint used by /subscribe/success.
 * It re-fetches the Checkout Session (and expanded subscription) and updates
 * the agent/subscription rows based on Stripe metadata.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id') || '';

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id is required' }, { status: 400 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Stripe returns “complete” sessions; double-check to avoid activating from a canceled session.
    if (session.status !== 'complete') {
      return NextResponse.json(
        { ok: false, error: `Checkout session not complete (${session.status})` },
        { status: 409 }
      );
    }

    const supabase = getSupabaseAdmin();

    const result = await activatePremiumFromCheckoutSession({ session, supabase });
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('Activation from checkout session failed:', err);
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
  }
}
