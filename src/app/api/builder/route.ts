import { NextRequest, NextResponse } from "next/server";
import { BuilderDraft, readBuilderDrafts, slugify, writeBuilderDrafts } from "@/lib/builderStore";

function makeId(name: string): string {
  const base = slugify(name) || "skill";
  return `${base}_${Date.now().toString(36)}`;
}

function parsePayload(body: unknown): Omit<BuilderDraft, "id" | "slug" | "createdAt" | "updatedAt"> | null {
  if (!body || typeof body !== "object") return null;

  const payload = body as {
    name?: unknown;
    description?: unknown;
    version?: unknown;
    author?: unknown;
    tags?: unknown;
    files?: unknown;
    status?: unknown;
  };

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) return null;

  const tags = Array.isArray(payload.tags)
    ? payload.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const files = Array.isArray(payload.files)
    ? payload.files
        .map((file) => {
          if (!file || typeof file !== "object") return null;

          const fileName = typeof (file as { name?: unknown }).name === "string"
            ? (file as { name: string }).name.trim()
            : "";

          if (!fileName) return null;

          return {
            name: fileName,
            content: typeof (file as { content?: unknown }).content === "string"
              ? (file as { content: string }).content
              : "",
          };
        })
        .filter((file): file is { name: string; content: string } => file !== null)
    : [];

  return {
    name,
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    version: typeof payload.version === "string" && payload.version.trim() ? payload.version.trim() : "0.1.0",
    author: typeof payload.author === "string" && payload.author.trim() ? payload.author.trim() : "Unknown",
    tags,
    files,
    status: payload.status === "published" ? "published" : "draft",
  };
}

export async function GET() {
  const drafts = await readBuilderDrafts();
  const sorted = [...drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return NextResponse.json(
    {
      drafts: sorted,
      count: sorted.length,
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
    const body = (await request.json()) as unknown;
    const payload = parsePayload(body);

    if (!payload) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const draft: BuilderDraft = {
      ...payload,
      id: makeId(payload.name),
      slug: slugify(payload.name) || makeId(payload.name),
      createdAt: now,
      updatedAt: now,
    };

    const drafts = await readBuilderDrafts();
    drafts.unshift(draft);
    await writeBuilderDrafts(drafts);

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
