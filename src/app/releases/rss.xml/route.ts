import { NextResponse } from "next/server";
import { readReleases, sortReleasesDesc, type Release } from "@/lib/releases";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatHighlights(release: Release): string {
  if (release.highlights.length === 0) {
    return `<p>${escapeXml(release.description)}</p>`;
  }

  return `
    <p>${escapeXml(release.description)}</p>
    <ul>
      ${release.highlights.map((item) => `<li>${escapeXml(item)}</li>`).join("")}
    </ul>
  `;
}

export async function GET() {
  const baseUrl = "https://foragents.dev";
  const releases = sortReleasesDesc(await readReleases());

  const lastBuildDate = releases[0]?.updatedAt
    ? new Date(releases[0].updatedAt).toUTCString()
    : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>forAgents.dev Release Notes</title>
    <link>${baseUrl}/releases</link>
    <description>Version history and release notes for forAgents.dev</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/releases/rss.xml" rel="self" type="application/rss+xml"/>
    ${releases
      .map(
        (release) => `
    <item>
      <title>v${escapeXml(release.version)}: ${escapeXml(release.title)}</title>
      <link>${baseUrl}/releases#${escapeXml(release.id)}</link>
      <guid isPermaLink="true">${baseUrl}/releases#${escapeXml(release.id)}</guid>
      <pubDate>${new Date(release.date).toUTCString()}</pubDate>
      <description><![CDATA[
        <p><strong>Type:</strong> ${escapeXml(release.type)}</p>
        <p><strong>Date:</strong> ${escapeXml(release.date)}</p>
        <p><strong>Tags:</strong> ${escapeXml(release.tags.join(", ") || "none")}</p>
        ${formatHighlights(release)}
      ]]></description>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
