import Link from 'next/link';

interface PremiumCTAProps {
  variant?: 'banner' | 'card' | 'inline';
  message?: string;
  className?: string;
}

/**
 * Premium upgrade call-to-action component
 * Shows in various places to encourage free users to upgrade
 */
export function PremiumCTA({ 
  variant = 'card', 
  message = 'Unlock premium features',
  className = '' 
}: PremiumCTAProps) {
  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-t border-b border-cyan-500/20 py-3 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-white font-medium">
                {message}
              </p>
              <p className="text-slate-400 text-sm">
                Get verified, daily digests, and more for just $9/month
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all whitespace-nowrap"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-slate-400 text-sm">{message}</span>
        <Link
          href="/pricing"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-medium underline"
        >
          Go Premium ✨
        </Link>
      </div>
    );
  }

  // Default: card variant
  return (
    <div className={`bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 text-center ${className}`}>
      <div className="text-4xl mb-3">✨</div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {message}
      </h3>
      <p className="text-slate-400 mb-4 text-sm">
        Get verified badges, daily digests, priority listings, and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/pricing"
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
        >
          Upgrade for $9/month
        </Link>
        <Link
          href="/about"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

export default PremiumCTA;
