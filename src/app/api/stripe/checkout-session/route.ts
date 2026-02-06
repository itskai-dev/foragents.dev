import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * POST /api/stripe/checkout-session
 *
 * Creates a Stripe Checkout Session (subscription mode).
 *
 * Body:
 *  - agentHandle?: string
 *  - email?: string
 *  - plan?: 'monthly' | 'annual'
 */
export async function POST(req: NextRequest) {
  try {
    const { agentHandle, email, plan } = await req.json();

    const cleanHandle = typeof agentHandle === "string" ? agentHandle.replace(/^@/, "").trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim() : "";
    const cleanPlan = plan === "annual" ? "annual" : "monthly";

    if (!cleanHandle && !cleanEmail) {
      return NextResponse.json(
        { error: "agentHandle or email is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    let agentId = "unknown";
    let finalHandle = cleanHandle || (cleanEmail.split("@")[0] || "unknown");

    if (supabase) {
      if (cleanHandle) {
        const { data: agent } = await supabase
          .from("agents")
          .select("id, handle, is_premium")
          .eq("handle", cleanHandle)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json(
            { error: "This agent already has an active subscription" },
            { status: 400 }
          );
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.handle || cleanHandle;
        } else {
          // Create a minimal agent row.
          const { data: created, error } = await supabase
            .from("agents")
            .insert({
              handle: cleanHandle,
              name: cleanHandle,
              platform: "foragents",
              owner_url: cleanEmail || null,
            })
            .select("id, handle")
            .single();

          if (error || !created) {
            console.error("Agent create failed:", error);
            return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
          }

          agentId = created.id;
          finalHandle = created.handle || cleanHandle;
        }
      } else if (cleanEmail) {
        const { data: agent } = await supabase
          .from("agents")
          .select("id, handle, name, is_premium")
          .eq("owner_url", cleanEmail)
          .maybeSingle();

        if (agent?.is_premium) {
          return NextResponse.json(
            { error: "You already have an active subscription" },
            { status: 400 }
          );
        }

        if (agent?.id) {
          agentId = agent.id;
          finalHandle = agent.handle || agent.name || finalHandle;
        } else {
          const handleFromEmail = cleanEmail.split("@")[0] || "unknown";
          const { data: created, error } = await supabase
            .from("agents")
            .insert({
              handle: handleFromEmail,
              name: handleFromEmail,
              platform: "foragents",
              owner_url: cleanEmail,
            })
            .select("id, handle")
            .single();

          if (error || !created) {
            console.error("Agent create failed:", error);
            return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
          }

          agentId = created.id;
          finalHandle = created.handle || handleFromEmail;
        }
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://foragents.dev";

    const session = await createCheckoutSession({
      agentId,
      agentHandle: finalHandle,
      plan: cleanPlan,
      successUrl: `${baseUrl}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing?canceled=true`,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create checkout session. Stripe may not be configured." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
