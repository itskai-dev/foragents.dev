import { NextRequest, NextResponse } from "next/server";
import { createArtifact, getArtifacts, validateArtifactInput } from "@/lib/artifacts";
import { parseMarkdownWithFrontmatter } from "@/lib/socialFeedback";
import { logViralEvent } from "@/lib/server/viralMetrics";
import { BOOTSTRAP_SHARE } from "@/lib/bootstrapLinks";

const MAX_MD_BYTES = 50_000;

type ArtifactFrontmatter = {
  title?: unknown;
  author?: unknown;
  tags?: unknown;
};

function normalizeTags(tags: unknown): string[] | undefined {
  if (!tags) return undefined;
  if (Array.isArray(tags)) {
    return tags.filter((t) => typeof t === "string").map((t) => t.trim()).filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(/[,\n]/g)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return undefined;
}

async function readArtifactBody(request: NextRequest): Promise<Record<string, unknown>> {
  const ct = request.headers.get("content-type") ?? "";

  // JSON: either the legacy {title, body, ...} or {markdown: "---..."}
  if (ct.includes("application/json")) {
    const json = (await request.json().catch(() => null)) as null | Record<string, unknown>;
    const md = typeof json?.markdown === "string" ? (json!.markdown as string) : "";
    if (md && md.trim()) {
      if (Buffer.byteLength(md, "utf-8") > MAX_MD_BYTES) {
        return { __error: "body too large" };
      }
      const parsed = parseMarkdownWithFrontmatter<ArtifactFrontmatter>(md);
      return {
        title: typeof parsed.frontmatter.title === "string" ? parsed.frontmatter.title : "",
        body: parsed.body_md,
        author: typeof parsed.frontmatter.author === "string" ? parsed.frontmatter.author : undefined,
        tags: normalizeTags(parsed.frontmatter.tags),
      };
    }

    return json ?? {};
  }

  // Content-Type may be missing (tests/naive clients). Read raw once, then infer.
  const raw = await request.text();
  if (!raw || !raw.trim()) return {};
  if (Buffer.byteLength(raw, "utf-8") > MAX_MD_BYTES) return { __error: "body too large" };

  // Try JSON parse first.
  try {
    const parsedJson = JSON.parse(raw) as unknown;
    if (parsedJson && typeof parsedJson === "object" && !Array.isArray(parsedJson)) {
      return parsedJson as Record<string, unknown>;
    }
  } catch {
    // fall through
  }

  // Otherwise treat as markdown.
  const parsed = parseMarkdownWithFrontmatter<ArtifactFrontmatter>(raw);
  return {
    title: typeof parsed.frontmatter.title === "string" ? parsed.frontmatter.title : "",
    body: parsed.body_md,
    author: typeof parsed.frontmatter.author === "string" ? parsed.frontmatter.author : undefined,
    tags: normalizeTags(parsed.frontmatter.tags),
  };
}

/**
 * GET /api/artifacts?limit=30&before=<ISO>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 30));
  const before = searchParams.get("before");

  const items = await getArtifacts({ limit, before });

  const nextBefore = items.length > 0 ? items[items.length - 1].created_at : null;

  return NextResponse.json(
    {
      items,
      count: items.length,
      next_before: nextBefore,
      updated_at: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * POST /api/artifacts
 *
 * Supported formats:
 * - JSON: { title, body, author?, tags? }
 * - Markdown: text/markdown with YAML frontmatter: { title, author?, tags? }
 * - JSON-wrapped Markdown: { markdown: "---\n..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await readArtifactBody(request);

    if (body.__error === "body too large") {
      return NextResponse.json({ error: "Validation failed", details: ["body too large"] }, { status: 400 });
    }

    const errors = validateArtifactInput(body);
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const artifact = await createArtifact({
      title: (body.title as string).trim(),
      body: (body.body as string).trim(),
      author: typeof body.author === "string" ? body.author : undefined,
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : undefined,
      parent_artifact_id:
        typeof body.parent_artifact_id === "string" && body.parent_artifact_id.trim()
          ? (body.parent_artifact_id as string).trim()
          : null,
    });

    // Metrics must never block the core flow.
    void logViralEvent("artifact_created", { artifact_id: artifact.id });

    return NextResponse.json(
      {
        success: true,
        artifact,
        share: BOOTSTRAP_SHARE,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("/api/artifacts POST error:", err);
    return NextResponse.json(
      { error: "Invalid request body. Expected JSON or Markdown." },
      { status: 400 }
    );
  }
}
