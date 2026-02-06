import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

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
    const { agentHandle, email, plan } = await req.json();

    if (!agentHandle && !email) {
      return NextResponse.json({ error: 'agentHandle or email is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    let agentId = 'unknown';
    let finalHandle = (agentHandle || (email as string).split('@')[0] || 'unknown') as string;

    // Normalize inputs
    const cleanHandle = typeof finalHandle === 'string' ? finalHandle.replace(/^@/, '').trim() : 'unknown';
    const cleanEmail = typeof email === 'string' ? email.trim() : undefined;

    if (supabase) {
      if (agentHandle) {
        const { data: agent } = await supabase
          .from('agents')
          .select('id, handle, is_premium')
          .eq('handle', cleanHandle)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json({ error: 'This agent already has an active subscription' }, { status: 400 });
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.handle || cleanHandle;
        } else if (cleanEmail) {
          // Create a minimal agent row if handle doesn't exist.
          const { data: created, error } = await supabase
            .from('agents')
            .insert({
              handle: cleanHandle,
              name: cleanHandle,
              platform: 'foragents',
              owner_url: cleanEmail,
            })
            .select('id, handle')
            .single();

          if (error || !created) {
            console.error('Agent create failed:', error);
            return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
          }

          agentId = created.id;
          finalHandle = created.handle;
        }
      } else if (cleanEmail) {
        // Try to find or create agent by owner_url (email)
        const { data: agent } = await supabase
          .from('agents')
          .select('id, handle, name, is_premium')
          .eq('owner_url', cleanEmail)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 });
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.handle || agent.name || cleanHandle;
        } else {
          const { data: created, error } = await supabase
            .from('agents')
            .insert({
              handle: cleanHandle,
              name: cleanHandle,
              platform: 'foragents',
              owner_url: cleanEmail,
            })
            .select('id, handle')
            .single();

          if (error || !created) {
            console.error('Agent create failed:', error);
            return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
          }

          agentId = created.id;
          finalHandle = created.handle;
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://foragents.dev';

    const session = await createCheckoutSession({
      agentId,
      agentHandle: finalHandle,
      plan,
      successUrl: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Failed to create checkout session. Stripe may not be configured.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
