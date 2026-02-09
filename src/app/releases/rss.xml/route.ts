import { NextResponse } from 'next/server';
import releasesData from '@/data/releases.json';

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

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatChanges(release: Release): string {
  let html = '';

  if (release.breaking) {
    html += '<p><strong>⚠️ Breaking Changes</strong></p>';
  }

  if (release.changes.added.length > 0) {
    html += '<h3>✨ Added</h3><ul>';
    release.changes.added.forEach(item => {
      html += `<li>${escapeXml(item)}</li>`;
    });
    html += '</ul>';
  }

  if (release.changes.changed.length > 0) {
    html += '<h3>🔄 Changed</h3><ul>';
    release.changes.changed.forEach(item => {
      html += `<li>${escapeXml(item)}</li>`;
    });
    html += '</ul>';
  }

  if (release.changes.fixed.length > 0) {
    html += '<h3>🐛 Fixed</h3><ul>';
    release.changes.fixed.forEach(item => {
      html += `<li>${escapeXml(item)}</li>`;
    });
    html += '</ul>';
  }

  if (release.changes.removed.length > 0) {
    html += '<h3>🗑️ Removed</h3><ul>';
    release.changes.removed.forEach(item => {
      html += `<li>${escapeXml(item)}</li>`;
    });
    html += '</ul>';
  }

  if (release.migrationGuide) {
    html += `<p><a href="https://foragents.dev${escapeXml(release.migrationGuide)}">View Migration Guide</a></p>`;
  }

  return html;
}

export async function GET() {
  const baseUrl = 'https://foragents.dev';
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>forAgents.dev Release Notes</title>
    <link>${baseUrl}/releases</link>
    <description>Version history and release notes for forAgents.dev</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(releases[0].date).toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/releases/rss.xml" rel="self" type="application/rss+xml"/>
    ${releases.map(release => `
    <item>
      <title>v${escapeXml(release.version)}: ${escapeXml(release.summary)}</title>
      <link>${baseUrl}/releases#v${release.version}</link>
      <guid isPermaLink="true">${baseUrl}/releases#v${release.version}</guid>
      <pubDate>${new Date(release.date).toUTCString()}</pubDate>
      <description><![CDATA[
        ${formatChanges(release)}
      ]]></description>
    </item>`).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
    },
  });
}
