import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJsonWithLimit } from "@/lib/requestLimits";

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
const MAX_BODY_BYTES = 32_000;

function isReleaseType(value: unknown): value is ReleaseType {
  return value === "major" || value === "minor" || value === "patch";
}

function isSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function normalizeRelease(raw: unknown): Release | null {
  if (!raw || typeof raw !== "object") return null;

  const obj = raw as Partial<Release>;

  if (
    typeof obj.id !== "string" ||
    typeof obj.version !== "string" ||
    typeof obj.title !== "string" ||
    !isReleaseType(obj.type) ||
    typeof obj.description !== "string" ||
    !Array.isArray(obj.changes) ||
    typeof obj.publishedAt !== "string" ||
    typeof obj.author !== "string"
  ) {
    return null;
  }

  const changes = obj.changes
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return {
    id: obj.id,
    version: obj.version,
    title: obj.title,
    type: obj.type,
    description: obj.description,
    changes,
    publishedAt: obj.publishedAt,
    author: obj.author,
  };
}

async function readReleases(): Promise<Release[]> {
  try {
    const raw = await fs.readFile(RELEASES_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeRelease(item))
      .filter((item): item is Release => Boolean(item));
  } catch {
    return [];
  }
}

async function writeReleases(releases: Release[]): Promise<void> {
  const dir = path.dirname(RELEASES_PATH);
  await fs.mkdir(dir, { recursive: true });

  const tmp = `${RELEASES_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(releases, null, 2), "utf-8");
  await fs.rename(tmp, RELEASES_PATH);
}

function sortByPublishedAtDesc(releases: Release[]): Release[] {
  return [...releases].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawType = searchParams.get("type");
  const requestedType = isReleaseType(rawType) ? rawType : null;
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

  const releases = sortByPublishedAtDesc(await readReleases());

  const filtered = releases.filter((release) => {
    const typeMatch = requestedType ? release.type === requestedType : true;

    if (!typeMatch) return false;
    if (!search) return true;

    return (
      release.title.toLowerCase().includes(search) ||
      release.description.toLowerCase().includes(search)
    );
  });

  return NextResponse.json(
    {
      releases: filtered,
      total: filtered.length,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonWithLimit<Record<string, unknown>>(request, MAX_BODY_BYTES);

    const version = typeof body.version === "string" ? body.version.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const rawType = body.type;
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const author = typeof body.author === "string" && body.author.trim() ? body.author.trim() : "forAgents Team";

    const changes = Array.isArray(body.changes)
      ? body.changes
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
      : [];

    const errors: string[] = [];

    if (!version) errors.push("version is required");
    if (version && !isSemver(version)) errors.push("version must be valid semver (e.g. 1.2.3)");
    if (!title) errors.push("title is required");
    if (!isReleaseType(rawType)) errors.push("type must be one of: major, minor, patch");
    if (!description) errors.push("description is required");
    if (changes.length === 0) errors.push("changes must include at least one item");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const type = rawType as ReleaseType;
    const existing = await readReleases();

    if (existing.some((release) => release.version === version)) {
      return NextResponse.json(
        { error: "Validation failed", details: ["version already exists"] },
        { status: 409 }
      );
    }

    const newRelease: Release = {
      id: `rel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      version,
      title,
      type,
      description,
      changes,
      publishedAt: new Date().toISOString(),
      author,
    };

    const next = sortByPublishedAtDesc([...existing, newRelease]);
    await writeReleases(next);

    return NextResponse.json(newRelease, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
