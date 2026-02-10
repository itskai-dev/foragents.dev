import { NextRequest, NextResponse } from "next/server";
import { BuilderDraft, readBuilderDrafts, slugify, writeBuilderDrafts } from "@/lib/builderStore";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type PatchPayload = {
  name?: unknown;
  description?: unknown;
  version?: unknown;
  author?: unknown;
  tags?: unknown;
  files?: unknown;
  status?: unknown;
};

function normalizeTags(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeFiles(value: unknown): BuilderDraft["files"] | undefined {
  if (!Array.isArray(value)) return undefined;

  return value
    .map((file) => {
      if (!file || typeof file !== "object") return null;

      const name = typeof (file as { name?: unknown }).name === "string"
        ? (file as { name: string }).name.trim()
        : "";

      if (!name) return null;

      return {
        name,
        content: typeof (file as { content?: unknown }).content === "string"
          ? (file as { content: string }).content
          : "",
      };
    })
    .filter((file): file is { name: string; content: string } => file !== null);
}

export async function GET(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const drafts = await readBuilderDrafts();
  const draft = drafts.find((item) => item.id === id);

  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  return NextResponse.json({ draft }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as PatchPayload;

    const drafts = await readBuilderDrafts();
    const index = drafts.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Draft not found." }, { status: 404 });
    }

    const current = drafts[index];
    const nextName = typeof body.name === "string" ? body.name.trim() : current.name;

    const updated: BuilderDraft = {
      ...current,
      name: nextName,
      slug: nextName !== current.name ? slugify(nextName) || current.slug : current.slug,
      description: typeof body.description === "string" ? body.description.trim() : current.description,
      version: typeof body.version === "string" && body.version.trim() ? body.version.trim() : current.version,
      author: typeof body.author === "string" && body.author.trim() ? body.author.trim() : current.author,
      tags: normalizeTags(body.tags) ?? current.tags,
      files: normalizeFiles(body.files) ?? current.files,
      status: body.status === "published" || body.status === "draft" ? body.status : current.status,
      updatedAt: new Date().toISOString(),
    };

    drafts[index] = updated;
    await writeBuilderDrafts(drafts);

    return NextResponse.json({ success: true, draft: updated });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const drafts = await readBuilderDrafts();
  const index = drafts.findIndex((item) => item.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  const [deleted] = drafts.splice(index, 1);
  await writeBuilderDrafts(drafts);

  return NextResponse.json({ success: true, deleted });
}
