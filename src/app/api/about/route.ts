import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ABOUT_FILE_PATH = path.join(process.cwd(), "data", "about.json");

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  socialLinks: Record<string, string>;
};

type Milestone = {
  date: string;
  title: string;
  description: string;
};

type PlatformStats = {
  launchDate: string;
  totalSkills: number;
  totalAgents: number;
  contributorsCount: number;
};

type AboutData = {
  mission: string;
  team: TeamMember[];
  milestones: Milestone[];
  stats: PlatformStats;
};

async function readAboutData(): Promise<AboutData> {
  const raw = await fs.readFile(ABOUT_FILE_PATH, "utf8");
  return JSON.parse(raw) as AboutData;
}

export async function GET() {
  try {
    const data = await readAboutData();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error) {
    console.error("Failed to load about data", error);
    return NextResponse.json({ error: "Failed to load about data" }, { status: 500 });
  }
}
