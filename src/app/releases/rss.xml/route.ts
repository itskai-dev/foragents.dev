import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type ReleaseType = "major" | "minor" | "patch";

type Release = {
  id: string;
  version: string;
  title: string;
  type: ReleaseType;
  description: string;
  changes: string[];
  publishedAt: string;
  author: string;
};

const RELEASES_PATH = path.join(process.cwd(), "data", "releases.json");

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeRelease(raw: unknown): Release | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Partial<Release>;
  if (
    typeof item.id !== "string" ||
    typeof item.version !== "string" ||
    typeof item.title !== "string" ||
    (item.type !== "major" && item.type !== "minor" && item.type !== "patch") ||
    typeof item.description !== "string" ||
    !Array.isArray(item.changes) ||
    typeof item.publishedAt !== "string" ||
    typeof item.author !== "string"
  ) {
    return null;
  }

  return {
    ...item,
    type: item.type,
    changes: item.changes.filter((change): change is string => typeof change === "string"),
  } as Release;
}

async function readReleases(): Promise<Release[]> {
  try {
    const raw = await fs.readFile(RELEASES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeRelease(item))
      .filter((item): item is Release => Boolean(item))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  } catch {
    return [];
  }
}

function formatChanges(release: Release): string {
  if (release.changes.length === 0) {
    return `<p>${escapeXml(release.description)}</p>`;
  }

  return `
    <p>${escapeXml(release.description)}</p>
    <ul>
      ${release.changes.map((item) => `<li>${escapeXml(item)}</li>`).join("")}
    </ul>
  `;
}

export async function GET() {
  const baseUrl = "https://foragents.dev";
  const releases = await readReleases();

  const lastBuildDate = releases[0]?.publishedAt
    ? new Date(releases[0].publishedAt).toUTCString()
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
      <pubDate>${new Date(release.publishedAt).toUTCString()}</pubDate>
      <description><![CDATA[
        <p><strong>Type:</strong> ${escapeXml(release.type)}</p>
        <p><strong>Author:</strong> ${escapeXml(release.author)}</p>
        ${formatChanges(release)}
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
