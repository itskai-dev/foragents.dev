import { NextResponse } from "next/server";

import changelog from "../../../../data/changelog.json";

type ChangelogEntry = {
  date: string;
  title: string;
  description: string;
  category: "feature" | "fix" | "improvement";
  link: string;
  pr?: string;
};

export async function GET() {
  const entries = (Array.isArray(changelog) ? (changelog as ChangelogEntry[]) : [])
    .slice()
    .sort((a, b) => {
      const d = new Date(b.date).getTime() - new Date(a.date).getTime();
      return d;
    });

  return NextResponse.json(
    {
      updated_at: new Date().toISOString(),
      entries,
      count: entries.length,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}
