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

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  author: string;
  install_cmd: string;
  repo_url: string;
  tags: string[];
};

const CREATORS_PATH = path.join(process.cwd(), "data", "creators.json");
const SKILLS_PATH = path.join(process.cwd(), "data", "skills.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username).toLowerCase();

    const creators = await readJsonFile<Creator[]>(CREATORS_PATH);
    const skills = await readJsonFile<Skill[]>(SKILLS_PATH);

    const creator = creators.find(
      (entry) => entry.username.toLowerCase() === decodedUsername
    );

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const creatorSkills = skills.filter((skill) => creator.skills.includes(skill.slug));

    return NextResponse.json(
      {
        creator: {
          ...creator,
          skills: creatorSkills,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load creator." }, { status: 500 });
  }
}
