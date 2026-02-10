import { NextRequest, NextResponse } from "next/server";
import {
  createReleaseId,
  filterReleases,
  isReleaseType,
  isSemver,
  readReleases,
  sortReleasesDesc,
  writeReleases,
  type Release,
} from "@/lib/releases";
import { readJsonWithLimit } from "@/lib/requestLimits";

const MAX_BODY_BYTES = 32_000;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawType = searchParams.get("type");
  const requestedType = isReleaseType(rawType) ? rawType : undefined;
  const search = searchParams.get("search")?.trim() ?? "";

  const releases = sortReleasesDesc(await readReleases());
  const filtered = filterReleases(releases, { type: requestedType, search });

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
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const rawType = body.type;

    const highlights = Array.isArray(body.highlights)
      ? body.highlights
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
      : [];

    const tags = Array.isArray(body.tags)
      ? body.tags
          .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
          .filter(Boolean)
      : [];

    const errors: string[] = [];

    if (!version) errors.push("version is required");
    if (version && !isSemver(version)) errors.push("version must be valid semver (e.g. 1.2.3)");
    if (!title) errors.push("title is required");
    if (!description) errors.push("description is required");
    if (!date) errors.push("date is required (YYYY-MM-DD)");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("date must be YYYY-MM-DD");
    if (!isReleaseType(rawType)) errors.push("type must be one of: major, minor, patch, security");
    if (highlights.length === 0) errors.push("highlights must include at least one item");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const type = rawType as Release["type"];
    const existing = await readReleases();

    if (existing.some((release) => release.version === version)) {
      return NextResponse.json(
        { error: "Validation failed", details: ["version already exists"] },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const nextRelease: Release = {
      id: createReleaseId(),
      version,
      title,
      description,
      type,
      date,
      highlights,
      tags,
      updatedAt: now,
    };

    const all = sortReleasesDesc([...existing, nextRelease]);
    await writeReleases(all);

    return NextResponse.json(nextRelease, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
