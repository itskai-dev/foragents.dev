import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { activatePremiumFromCheckoutSession } from '@/lib/stripeActivation';

export const runtime = 'nodejs';

/**
 * GET /api/admin/stripe/reconcile?secret=...&days=7&limit=50
 *
 * One-off reconciliation for recent completed Checkout Sessions.
 * Safe to run via cron / manually.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret') || '';
  const expected = process.env.STRIPE_RECONCILE_SECRET || '';

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const daysRaw = Number(req.nextUrl.searchParams.get('days') || '7');
  const limitRaw = Number(req.nextUrl.searchParams.get('limit') || '50');

  const days = Number.isFinite(daysRaw) ? Math.max(1, Math.min(30, daysRaw)) : 7;
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(100, limitRaw)) : 50;

  const createdGte = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;

  const supabase = getSupabaseAdmin();

  const sessions = await stripe.checkout.sessions.list({
    limit,
    created: { gte: createdGte },
  });

  let scanned = 0;
  let repaired = 0;
  const errors: Array<{ sessionId: string; error: string }> = [];

  for (const s of sessions.data) {
    scanned += 1;

    // Only completed subscription checkouts.
    if (s.status !== 'complete' || s.mode !== 'subscription') continue;

    try {
      const full = await stripe.checkout.sessions.retrieve(s.id, {
        expand: ['subscription'],
      });

      const res = await activatePremiumFromCheckoutSession({ session: full, supabase });
      if (res.ok) repaired += 1;
      else errors.push({ sessionId: s.id, error: res.error });
    } catch (err: any) {
      errors.push({ sessionId: s.id, error: err?.message || 'unknown_error' });
    }
  }

  return NextResponse.json({ ok: true, scanned, repaired, errors });
}
