import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { logRevenueEvent } from '@/lib/revenue-events';
import { getSupabase } from '@/lib/supabase';
import { checkRateLimit, getClientIp, rateLimitResponse, readJsonWithLimit } from '@/lib/requestLimits';

export const runtime = 'nodejs';

const MAX_JSON_BYTES = 2_000;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`subscribe:${ip}`, { windowMs: 60_000, max: 20 });
    if (!rl.ok) return rateLimitResponse(rl.retryAfterSec);

    const body = await readJsonWithLimit<Record<string, unknown>>(req, MAX_JSON_BYTES);
    const email = body?.email;
    const plan = body?.plan;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Try to find or create agent
    const supabase = getSupabase();
    let agentId: string = 'unknown';
    let agentHandle: string = email.split('@')[0];

    const cleanPlan: 'monthly' | 'quarterly' | 'annual' =
      plan === 'monthly' || plan === 'quarterly' || plan === 'annual' ? plan : 'monthly';

    if (supabase) {
      // Check if agent exists by email (stored in owner_url)
      const { data: existingAgent } = await supabase
        .from('agents')
        .select('id, handle, name, is_premium')
        .eq('owner_url', email)
        .single();

      if (existingAgent) {
        if (existingAgent.is_premium) {
          return NextResponse.json(
            { error: 'You already have an active subscription' },
            { status: 400 }
          );
        }
        agentId = existingAgent.id;
        agentHandle = existingAgent.handle || existingAgent.name || agentHandle;
      } else {
        // Create new agent record
        const { data: newAgent, error } = await supabase
          .from('agents')
          .insert({
            name: agentHandle,
            platform: 'foragents',
            owner_url: email,
          })
          .select('id')
          .single();

        if (error || !newAgent) {
          console.error('Failed to create agent:', error);
          return NextResponse.json(
            { error: 'Failed to register agent' },
            { status: 500 }
          );
        }
        agentId = newAgent.id;
      }
    }

    // Create Stripe checkout session
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://foragents.dev';

    const session = await createCheckoutSession({
      agentId,
      agentHandle,
      plan: cleanPlan,
      successUrl: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/subscribe?canceled=true`,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Stripe may not be configured.' },
        { status: 500 }
      );
    }

    await logRevenueEvent('checkout_started', {
      endpoint: '/api/subscribe',
      ip,
      agent_id: agentId,
      agent_handle: agentHandle,
      plan: cleanPlan,
      stripe_checkout_session_id: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Subscribe error:', err);

    const status =
      typeof err === 'object' && err && 'status' in err
        ? Number((err as { status?: unknown }).status)
        : 500;
    if (status === 413) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
