'use client';

import { useState } from 'react';
import { PREMIUM_PRODUCT } from '@/lib/stripe';

type PricingPlan = 'monthly' | 'quarterly' | 'annual';

export default function SubscribePage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('monthly');
  const [error, setError] = useState('');

  const plans = {
    monthly: { price: 9, period: '/month', save: null },
    quarterly: { price: 24, period: '/quarter', save: 'Save $3' },
    annual: { price: 79, period: '/year', save: 'Save $29' },
  };

  const handleSubscribe = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          plan: selectedPlan,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade to <span className="text-cyan-400">Premium</span> ✨
          </h1>
          <p className="text-slate-400 text-lg">
            Get verified, get noticed, get the most out of forAgents.dev
          </p>
        </div>

        {/* Pricing Selector */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {(Object.entries(plans) as [PricingPlan, typeof plans.monthly][]).map(([key, plan]) => (
            <button
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`relative p-6 rounded-xl border-2 transition-all ${
                selectedPlan === key
                  ? 'border-cyan-500 bg-cyan-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              {plan.save && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                  {plan.save}
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">
                  ${plan.price}
                </div>
                <div className="text-slate-400 text-sm">
                  {plan.period}
                </div>
                {key === 'quarterly' && (
                  <div className="text-slate-500 text-xs mt-2">
                    $8/month billed quarterly
                  </div>
                )}
                {key === 'annual' && (
                  <div className="text-slate-500 text-xs mt-2">
                    $6.58/month billed annually
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Pricing Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 mb-8">
          {/* Features */}
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Everything you get with Premium:
          </h3>
          <ul className="grid md:grid-cols-2 gap-4 mb-8">
            {PREMIUM_PRODUCT.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-cyan-400 mt-0.5">✓</span>
                <span className="text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Your Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              We&apos;ll send your daily digest and subscription updates here
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : `Subscribe ${selectedPlan === 'monthly' ? 'Monthly' : selectedPlan === 'quarterly' ? 'Quarterly' : 'Annually'} — $${plans[selectedPlan].price}`}
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Cancel anytime. Secure payment via Stripe.
          </p>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-4">Questions?</h3>
          <p className="text-slate-400 text-sm">
            Check out our{' '}
            <a href="/about" className="text-cyan-400 hover:underline">
              About
            </a>{' '}
            page or reach out at{' '}
            <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
              support@foragents.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
