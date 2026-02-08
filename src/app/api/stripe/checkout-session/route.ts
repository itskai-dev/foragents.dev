import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { logRevenueEvent } from '@/lib/revenue-events';
import { getSupabaseAdmin } from '@/lib/server/supabase-admin';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';

export const runtime = 'nodejs';

const MAX_JSON_BYTES = 2_000;

/**
 * POST /api/stripe/checkout-session
 *
 * Creates a Stripe Checkout Session in subscription mode.
 *
 * Body:
 *  - agentHandle?: string (preferred)
 *  - email?: string (fallback for creating an agent record)
 *  - plan?: 'monthly' | 'quarterly' | 'annual'
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`stripe:checkout-session:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
    const agentHandle = body.agentHandle;
    const email = body.email;
    const plan = body.plan;

    if (!agentHandle && !email) {
      return NextResponse.json({ error: 'agentHandle or email is required' }, { status: 400 });
    }

    const cleanEmail = typeof email === 'string' ? email.trim() : undefined;

    const rawHandle =
      typeof agentHandle === 'string'
        ? agentHandle
        : typeof cleanEmail === 'string'
          ? cleanEmail.split('@')[0]
          : undefined;

    const cleanHandle = typeof rawHandle === 'string' ? rawHandle.replace(/^@/, '').trim() : '';

    if (!cleanHandle) {
      return NextResponse.json({ error: 'Invalid agentHandle/email' }, { status: 400 });
    }

    const cleanPlan: 'monthly' | 'quarterly' | 'annual' =
      plan === 'annual' || plan === 'quarterly' || plan === 'monthly' ? plan : 'monthly';

    const supabase = getSupabaseAdmin();

    let agentId = 'unknown';
    let finalHandle = cleanHandle;

    if (supabase) {
      // NOTE: Production DB may not have a `handle` column yet (early schema used only `name`).
      // Keep this endpoint compatible by using `name` as the canonical handle.

      if (cleanEmail) {
        // Find or create by email
        const { data: agent } = await supabase
          .from('agents')
          .select('id, name, is_premium')
          .eq('owner_url', cleanEmail)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 });
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.name || cleanHandle;
        } else {
          const { data: created, error } = await supabase
            .from('agents')
            .insert({
              name: cleanHandle,
              platform: 'foragents',
              owner_url: cleanEmail,
            })
            .select('id, name')
            .single();

          if (error || !created) {
            console.error('Agent create failed:', error);
            return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
          }

          agentId = created.id;
          finalHandle = created.name || cleanHandle;
        }
      } else if (typeof agentHandle === 'string' && agentHandle.trim()) {
        // If no email, best-effort lookup by name
        const { data: agent } = await supabase
          .from('agents')
          .select('id, name, is_premium')
          .eq('name', cleanHandle)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json({ error: 'This agent already has an active subscription' }, { status: 400 });
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.name || cleanHandle;
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://foragents.dev';

    const session = await createCheckoutSession({
      agentId,
      agentHandle: finalHandle,
      plan: cleanPlan,
      successUrl: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Stripe may not be configured.' },
        { status: 500 }
      );
    }

    await logRevenueEvent('checkout_started', {
      endpoint: '/api/stripe/checkout-session',
      ip,
      agent_id: agentId,
      agent_handle: finalHandle,
      plan: cleanPlan,
      stripe_checkout_session_id: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);

    const status =
      typeof error === 'object' && error && 'status' in error
        ? Number((error as { status?: unknown }).status)
        : 500;
    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
