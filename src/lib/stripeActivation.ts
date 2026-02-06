import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { mapSubscriptionStatus } from '@/lib/stripe';

export type ActivatePremiumResult =
  | {
      ok: true;
      agentId: string | null;
      agentHandle: string | null;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      status: string | null;
      isPremium: boolean;
    }
  | { ok: false; error: string };

function isActiveStatus(status: string | null | undefined) {
  return status === 'active' || status === 'trialing';
}

export async function activatePremiumFromCheckoutSession({
  session,
  supabase,
}: {
  session: Stripe.Checkout.Session;
  supabase: SupabaseClient | null;
}): Promise<ActivatePremiumResult> {
  const agentId = (session.metadata?.agentId as string | undefined) || null;
  const agentHandle = (session.metadata?.agentHandle as string | undefined) || null;

  const stripeCustomerId = (session.customer as string) || null;

  const subscription = session.subscription as Stripe.Subscription | string | null;
  const subscriptionObj = typeof subscription === 'string' || !subscription ? null : subscription;

  const mappedStatus = subscriptionObj ? mapSubscriptionStatus(subscriptionObj.status) : null;
  const isPremium = subscriptionObj ? isActiveStatus(mappedStatus) : true;

  const currentPeriodEndIso = subscriptionObj?.current_period_end
    ? new Date(subscriptionObj.current_period_end * 1000).toISOString()
    : null;

  const stripeSubscriptionId = subscriptionObj?.id || (typeof subscription === 'string' ? subscription : null);

  if (!supabase) {
    return {
      ok: true,
      agentId,
      agentHandle,
      stripeCustomerId,
      stripeSubscriptionId,
      status: mappedStatus,
      isPremium,
    };
  }

  // Write subscription audit row if we can.
  if (subscriptionObj && stripeCustomerId) {
    await supabase.from('subscriptions').upsert(
      {
        stripe_subscription_id: subscriptionObj.id,
        stripe_customer_id: stripeCustomerId,
        agent_id: agentId,
        status: mappedStatus || 'active',
        price_id: subscriptionObj.items.data[0]?.price.id,
        current_period_start: subscriptionObj.current_period_start
          ? new Date(subscriptionObj.current_period_start * 1000).toISOString()
          : null,
        current_period_end: currentPeriodEndIso,
        cancel_at_period_end: subscriptionObj.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'stripe_subscription_id' }
    );
  }

  // Update agent premium flags.
  if (agentId) {
    await supabase
      .from('agents')
      .update({
        is_premium: isPremium,
        premium_expires_at: isPremium ? currentPeriodEndIso : null,
        stripe_customer_id: stripeCustomerId,
      })
      .eq('id', agentId);
  } else if (agentHandle) {
    await supabase
      .from('agents')
      .update({
        is_premium: isPremium,
        premium_expires_at: isPremium ? currentPeriodEndIso : null,
        stripe_customer_id: stripeCustomerId,
      })
      .eq('handle', agentHandle.replace(/^@/, '').trim());
  } else if (stripeCustomerId) {
    await supabase
      .from('agents')
      .update({
        is_premium: isPremium,
        premium_expires_at: isPremium ? currentPeriodEndIso : null,
      })
      .eq('stripe_customer_id', stripeCustomerId);
  } else {
    return { ok: false, error: 'Missing agent metadata' };
  }

  return {
    ok: true,
    agentId,
    agentHandle,
    stripeCustomerId,
    stripeSubscriptionId,
    status: mappedStatus,
    isPremium,
  };
}
