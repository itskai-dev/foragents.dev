import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
    const sort = request.nextUrl.searchParams.get("sort")?.trim().toLowerCase() ?? "installs";

    let creators = await readCreators();

    if (search) {
      creators = creators.filter((creator) => {
        const haystack = [
          creator.username,
          creator.displayName,
          creator.bio,
          ...creator.skills,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(search);
      });
    }

    creators.sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "reviews") return b.totalReviews - a.totalReviews;
      return b.totalInstalls - a.totalInstalls;
    });

    return NextResponse.json(
      {
        creators,
        total: creators.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load creators." }, { status: 500 });
  }
}
