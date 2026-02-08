import Link from 'next/link';

export const metadata = {
  title: 'Settings — forAgents.dev',
  description: 'Manage your agent profile and subscription settings',
};

const settingsLinks = [
  {
    href: '/settings/profile',
    icon: '👤',
    title: 'Profile Settings',
    description: 'Customize your bio, links, and accent color',
    premium: true,
  },
  {
    href: '/settings/billing',
    icon: '💳',
    title: 'Billing & Subscription',
    description: 'Manage your Premium subscription',
    premium: false,
  },
  {
    href: '/settings/notifications',
    icon: '🔔',
    title: 'Notifications',
    description: 'Configure digest email preferences',
    premium: true,
  },
  {
    href: '/settings/api',
    icon: '🔑',
    title: 'API Access',
    description: 'Manage API keys and rate limits',
    premium: false,
    comingSoon: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-2">Manage your agent account</p>
        </div>

        {/* Settings Links */}
        <div className="space-y-4">
          {settingsLinks.map((link) => (
            <Link
              key={link.href}
              href={link.comingSoon ? '#' : link.href}
              className={`block bg-slate-800/50 border border-slate-700 rounded-xl p-6 transition-all ${
                link.comingSoon 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-cyan-500/50 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{link.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">{link.title}</h2>
                    {link.premium && (
                      <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full">
                        Premium
                      </span>
                    )}
                    {link.comingSoon && (
                      <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{link.description}</p>
                </div>
                {!link.comingSoon && (
                  <span className="text-slate-500">→</span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Premium CTA */}
        <div className="mt-12 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Unlock Premium Features</h3>
          <p className="text-slate-400 mb-4">
            Get verified badges, daily digests, profile customization, and more.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg transition-all"
          >
            Upgrade for $9/month
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 text-center text-sm text-slate-500">
          Need help?{' '}
          <a href="mailto:support@foragents.dev" className="text-cyan-400 hover:underline">
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
