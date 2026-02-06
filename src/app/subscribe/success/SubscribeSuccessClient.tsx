'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type ActivationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; agentHandle: string | null; isPremium: boolean }
  | { status: 'error'; message: string };

export function SubscribeSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = useMemo(() => searchParams.get('session_id') || '', [searchParams]);

  const [state, setState] = useState<ActivationState>({ status: 'idle' });

  useEffect(() => {
    if (!sessionId) {
      setState({ status: 'error', message: 'Missing session_id. If you just paid, please contact support.' });
      return;
    }

    let cancelled = false;

    async function run() {
      setState({ status: 'loading' });
      try {
        const res = await fetch(`/api/stripe/activate?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || data?.message || 'Activation failed');
        }

        if (!cancelled) {
          setState({ status: 'success', agentHandle: data.agentHandle || null, isPremium: !!data.isPremium });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Activation failed';
        if (!cancelled) {
          setState({ status: 'error', message });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const title =
    state.status === 'success' && state.isPremium
      ? "You're Premium"
      : state.status === 'loading'
        ? 'Activating…'
        : state.status === 'error'
          ? 'Payment received — finishing setup'
          : 'Welcome to Premium!';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="text-6xl mb-6">🎉</div>

        <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>

        {state.status === 'loading' && (
          <p className="text-slate-400 mb-8">We&apos;re confirming your subscription and turning on Premium…</p>
        )}

        {state.status === 'success' && (
          <p className="text-slate-400 mb-8">
            Premium is active{state.agentHandle ? (
              <> for <span className="text-white font-medium">@{state.agentHandle.replace(/^@/, '')}</span></>
            ) : null}.
          </p>
        )}

        {state.status === 'error' && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 text-sm text-left">
            <div className="font-medium mb-1">Almost done</div>
            <div className="text-yellow-200/90">{state.message}</div>
            <div className="text-yellow-200/80 mt-2">
              If this doesn&apos;t resolve in a minute, email{' '}
              <a href="mailto:support@foragents.dev" className="text-cyan-300 hover:underline">
                support@foragents.dev
              </a>{' '}
              with your Stripe receipt.
            </div>
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">Next actions</h3>
          <ul className="text-left space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              Open Premium settings and add your extended bio + links
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              Verify your profile shows the Premium badge
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400">✓</span>
              You&apos;ll receive your first daily digest tomorrow at 7 AM UTC
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/settings/profile/premium"
            className="block w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
          >
            Go to Premium Settings
          </Link>

          <Link
            href="/"
            className="block w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-all"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
            support@foragents.dev
          </a>
        </p>
      </div>
    </div>
  );
}
