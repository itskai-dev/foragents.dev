import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type Creator = {
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  skills: string[];
  totalInstalls: number;
  totalReviews: number;
  rating: number;
  joinedAt: string;
  featured: boolean;
};

const CREATORS_PATH = path.join(process.cwd(), "data", "creators.json");

async function readCreators(): Promise<Creator[]> {
  const raw = await fs.readFile(CREATORS_PATH, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  return Array.isArray(parsed) ? (parsed as Creator[]) : [];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username).toLowerCase();

    const creators = await readCreators();
    const creator = creators.find(
      (entry) => entry.username.toLowerCase() === decodedUsername
    );

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const stats = {
      totalInstalls: creator.totalInstalls,
      avgRating: Number(creator.rating.toFixed(2)),
      skillCount: creator.skills.length,
      totalReviews: creator.totalReviews,
    };

    return NextResponse.json(
      {
        username: creator.username,
        stats,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load creator stats." },
      { status: 500 }
    );
  }
}
