import { Suspense } from 'react';
import { SubscribeSuccessClient } from './success-client';

export const runtime = 'nodejs';

export default function SubscribeSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">Activating…</h1>
            <p className="text-slate-400">Loading checkout session…</p>
          </div>
        </div>
      }
    >
      <SubscribeSuccessClient />
    </Suspense>
  );
}
