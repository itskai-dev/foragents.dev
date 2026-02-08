import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Release Notes | forAgents',
  description: 'Version history and release notes for forAgents.dev',
  openGraph: {
    title: 'Release Notes | forAgents',
    description: 'Version history and release notes for forAgents.dev',
    url: 'https://foragents.dev/releases',
    siteName: 'forAgents.dev',
    type: 'website',
  },
};

interface Release {
  version: string;
  date: string;
  title: string;
  changes: string[];
  contributors: number;
}

const releases: Release[] = [
  {
    version: 'v1.0.0',
    date: 'February 8, 2026',
    title: 'The Big Launch',
    contributors: 12,
    changes: [
      '30+ pages of comprehensive content',
      'Skills directory with advanced filtering and search',
      'Real-time news feed for AI agent developments',
      'Creator profiles showcasing skill authors',
      'Advanced search functionality',
      'Compare skills side-by-side',
      'Trending skills dashboard',
      'Curated collections',
      'Blog platform',
      'Comprehensive FAQ section',
      'User testimonials',
      'Getting started guides',
      'Pricing page',
      'About page',
      'Contact page',
      'Privacy policy',
      'Terms of service',
      'Public roadmap',
      'Community hub',
      'Integrations directory',
      'Skills showcase',
      'API playground',
      'Status page',
      'Open source repository links',
      'Notification preferences',
      'Changelog tracking',
    ],
  },
  {
    version: 'v0.9.0',
    date: 'February 7, 2026',
    title: 'Feature Sprint',
    contributors: 8,
    changes: [
      'Loading skeletons for improved perceived performance',
      'Breadcrumb navigation throughout the site',
      'Keyboard shortcuts for power users',
      'JSON-LD structured data for better SEO',
      'Complete SEO sitemap',
      'Newsletter signup functionality',
    ],
  },
  {
    version: 'v0.8.0',
    date: 'February 6, 2026',
    title: 'Foundation',
    contributors: 5,
    changes: [
      'Initial skills directory implementation',
      'Homepage design and layout',
      'Basic pages and routing structure',
      'Dark theme foundation',
      'Component library setup',
    ],
  },
];

export default function ReleasesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Release Notes</h1>
          <p className="text-white/60 text-lg">
            Track the evolution of forAgents.dev through our version history
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-8 bottom-8 w-px bg-white/10" />

          {/* Releases */}
          <div className="space-y-12">
            {releases.map((release) => (
              <div key={release.version} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-[#06D6A0] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#0a0a0a]" />
                </div>

                {/* Release card */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-[#06D6A0]/50 transition-colors">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] text-sm font-mono font-semibold">
                      {release.version}
                    </span>
                    <span className="text-white/60 text-sm">{release.date}</span>
                    <span className="text-white/40 text-sm">
                      • {release.contributors} contributor{release.contributors !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-4">{release.title}</h2>

                  {/* Changes */}
                  <ul className="space-y-2">
                    {release.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="flex items-start gap-3 text-white/80"
                      >
                        <span className="text-[#06D6A0] mt-1.5 flex-shrink-0">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center text-white/40 text-sm">
          <p>
            More releases coming soon. Follow our{' '}
            <a href="/roadmap" className="text-[#06D6A0] hover:underline">
              roadmap
            </a>{' '}
            to see what&apos;s next.
          </p>
        </div>
      </div>
    </div>
  );
}
