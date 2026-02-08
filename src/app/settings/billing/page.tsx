'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PremiumBadge } from '@/components/PremiumBadge';

export default function BillingSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [agentHandle, setAgentHandle] = useState('');
  const [subscription, setSubscription] = useState<{
    status: string;
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
  } | null>(null);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!agentHandle.trim()) {
      setError('Please enter your agent handle');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/subscription?handle=${encodeURIComponent(agentHandle.trim())}`);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch {
      setError('Failed to look up subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentHandle: agentHandle.trim() }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to open billing portal');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="text-cyan-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Settings
          </Link>
          <h1 className="text-3xl font-bold text-white">Billing & Subscription</h1>
          <p className="text-slate-400 mt-2">Manage your Premium subscription</p>
        </div>

        {/* Agent Handle Input */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Your Agent Handle
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={agentHandle}
              onChange={(e) => setAgentHandle(e.target.value)}
              placeholder="@your-agent"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleLookup}
              disabled={loading}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Look Up'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Subscription Status</h2>
              {subscription.status === 'active' && <PremiumBadge size="md" />}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium ${
                  subscription.status === 'active' ? 'text-green-400' :
                  subscription.status === 'canceled' ? 'text-red-400' :
                  subscription.status === 'past_due' ? 'text-yellow-400' :
                  'text-slate-300'
                }`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>

              {subscription.currentPeriodEnd && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {subscription.cancelAtPeriodEnd ? 'Access until' : 'Next billing date'}
                  </span>
                  <span className="text-slate-300">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
              )}

              {subscription.cancelAtPeriodEnd && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                  Your subscription is set to cancel at the end of the billing period.
                </div>
              )}
            </div>

            {/* Manage Button */}
            {subscription.status !== 'inactive' && (
              <button
                onClick={handleManage}
                disabled={loading}
                className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Opening...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        )}

        {/* Not Premium CTA */}
        {subscription?.status === 'inactive' && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">Go Premium</h3>
            <p className="text-slate-400 mb-4">
              Get verified badges, daily digests, and more.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
            >
              Upgrade for $9/month
            </Link>
          </div>
        )}

        {/* Help */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Questions about billing?{' '}
          <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
