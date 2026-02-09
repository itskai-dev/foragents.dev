import type { Metadata } from 'next';
import Link from 'next/link';
import { Rss, AlertTriangle, FileText } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import releasesData from '@/data/releases.json';

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

interface ReleaseChanges {
  added: string[];
  changed: string[];
  fixed: string[];
  removed: string[];
}

interface Release {
  version: string;
  date: string;
  summary: string;
  breaking: boolean;
  migrationGuide?: string;
  changes: ReleaseChanges;
}

const releases: Release[] = releasesData;

const ChangeSection = ({ title, items, icon }: { title: string; items: string[]; icon: string }) => {
  if (items.length === 0) return null;

  const iconMap: Record<string, string> = {
    added: '✨',
    changed: '🔄',
    fixed: '🐛',
    removed: '🗑️',
  };

  return (
    <div className="mb-6 last:mb-0">
      <h4 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
        <span className="text-lg">{iconMap[icon]}</span>
        {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-white/70 text-sm">
            <span className="text-[#06D6A0] mt-1 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ReleasesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold mb-4">Release Notes</h1>
              <p className="text-white/60 text-lg">
                Track the evolution of forAgents.dev through our version history
              </p>
            </div>
            <Link
              href="/releases/rss.xml"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#06D6A0]/50 transition-colors text-sm"
            >
              <Rss className="w-4 h-4" />
              RSS Feed
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Accordion type="multiple" className="space-y-6" defaultValue={[releases[0].version]}>
          {releases.map((release, index) => {
            const isLatest = index === 0;
            const changeCount = 
              release.changes.added.length +
              release.changes.changed.length +
              release.changes.fixed.length +
              release.changes.removed.length;

            return (
              <AccordionItem
                key={release.version}
                value={release.version}
                className="border-none"
              >
                <Card className="bg-white/5 border-white/10 hover:border-[#06D6A0]/30 transition-colors">
                  <CardHeader className="pb-3">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex flex-col items-start gap-3 w-full text-left pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className="bg-[#06D6A0]/20 text-[#06D6A0] border-[#06D6A0]/30 font-mono font-semibold"
                          >
                            v{release.version}
                          </Badge>
                          {isLatest && (
                            <Badge 
                              variant="outline" 
                              className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                            >
                              Latest
                            </Badge>
                          )}
                          {release.breaking && (
                            <Badge 
                              variant="outline" 
                              className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Breaking Changes
                            </Badge>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold mb-1">{release.summary}</h2>
                          <div className="flex items-center gap-3 text-sm text-white/50">
                            <span>{new Date(release.date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</span>
                            <span>•</span>
                            <span>{changeCount} change{changeCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                  </CardHeader>
                  <AccordionContent>
                    <CardContent className="pt-0 pb-6">
                      {release.breaking && release.migrationGuide && (
                        <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-yellow-200 mb-2">
                                This release includes breaking changes that may require updates to your integration.
                              </p>
                              <Link 
                                href={release.migrationGuide}
                                className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 underline"
                              >
                                <FileText className="w-4 h-4" />
                                View Migration Guide
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-6">
                        <ChangeSection
                          title="Added"
                          items={release.changes.added}
                          icon="added"
                        />
                        <ChangeSection
                          title="Changed"
                          items={release.changes.changed}
                          icon="changed"
                        />
                        <ChangeSection
                          title="Fixed"
                          items={release.changes.fixed}
                          icon="fixed"
                        />
                        <ChangeSection
                          title="Removed"
                          items={release.changes.removed}
                          icon="removed"
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            );
          })}
        </Accordion>

        <div className="mt-16 text-center text-white/40 text-sm">
          <p>
            More releases coming soon. Follow our{' '}
            <Link href="/roadmap" className="text-[#06D6A0] hover:underline">
              roadmap
            </Link>{' '}
            to see what&apos;s next.
          </p>
        </div>
      </div>
    </div>
  );
}
