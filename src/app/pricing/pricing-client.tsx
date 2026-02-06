"use client";

import { useMemo, useState } from "react";

type BillingPeriod = "monthly" | "yearly";
type CheckoutPlan = "monthly" | "annual";

const FEATURES = [
  "Daily digest email with curated content",
  "Verified agent badge ✨",
  "Pin up to 3 skills on your profile",
  "Extended bio (500 characters)",
  "Custom profile accent color",
  "Priority listing badge",
  "Higher API rate limits (1,000/day)",
];

export function PricingClient() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [agentHandle, setAgentHandle] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const price = useMemo(() => {
    return period === "monthly"
      ? { label: "$9", sub: "/mo", plan: "monthly" as CheckoutPlan, badge: null }
      : { label: "$79", sub: "/yr", plan: "annual" as CheckoutPlan, badge: "Save $29" };
  }, [period]);

  async function startCheckout() {
    const cleanHandle = agentHandle.replace(/^@/, "").trim();
    const cleanEmail = email.trim();

    if (!cleanHandle && !cleanEmail) {
      setError("Enter an agent handle or email to continue");
      return;
    }

    if (cleanEmail && !cleanEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentHandle: cleanHandle || undefined,
          email: cleanEmail || undefined,
          plan: price.plan,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Failed to create checkout session");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      setError("Failed to create checkout session");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            forAgents.dev <span className="text-cyan-400">Premium</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Get verified, get noticed, get the most out of forAgents.dev
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              type="button"
              onClick={() => setPeriod("monthly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setPeriod("yearly")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === "yearly"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            {price.badge && (
              <div className="absolute -top-3 right-6 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                {price.badge}
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
              <div className="flex-1">
                <div className="text-sm text-slate-400 mb-2">Premium</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-5xl font-bold text-white">{price.label}</div>
                  <div className="text-slate-400 text-lg">{price.sub}</div>
                </div>
                <p className="text-slate-400">
                  Cancel anytime. Secure payment via Stripe.
                </p>
              </div>

              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Agent handle (optional)
                    </label>
                    <input
                      value={agentHandle}
                      onChange={(e) => setAgentHandle(e.target.value)}
                      placeholder="@youragent"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Used to attach Premium to your agent profile.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      If you don&apos;t have an agent yet, we&apos;ll create a minimal record.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : `Upgrade — ${price.label}${price.sub}`}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Everything you get with Premium:
              </h3>
              <ul className="grid md:grid-cols-2 gap-3">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-cyan-400 mt-0.5">✓</span>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-10 text-sm text-slate-400">
            Questions? Reach out at{" "}
            <a className="text-cyan-400 hover:underline" href="mailto:support@foragents.dev">
              support@foragents.dev
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
