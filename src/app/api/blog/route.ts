import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  buildExcerpt,
  estimateReadingTime,
  filterAndSortPosts,
  readBlogPosts,
  slugifyTitle,
  writeBlogPosts,
  type BlogPost,
} from "@/lib/blog";

type CreateBlogRequest = {
  title?: unknown;
  content?: unknown;
  author?: unknown;
  tags?: unknown;
  excerpt?: unknown;
};

function validateCreate(body: CreateBlogRequest): string[] {
  const errors: string[] = [];

  if (typeof body.title !== "string" || !body.title.trim()) {
    errors.push("title is required");
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    errors.push("content is required");
  }

  if (typeof body.author !== "string" || !body.author.trim()) {
    errors.push("author is required");
  }

  if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === "string")) {
    errors.push("tags must be a string array");
  }

  if (body.excerpt !== undefined && typeof body.excerpt !== "string") {
    errors.push("excerpt must be a string when provided");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;

  const posts = await readBlogPosts();
  const filtered = filterAndSortPosts(posts, { search, tag, sort: "recent" });

  return NextResponse.json({ posts: filtered, total: filtered.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateBlogRequest;
    const errors = validateCreate(body);

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const posts = await readBlogPosts();
    const title = (body.title as string).trim();
    const baseSlug = slugifyTitle(title) || "post";

    let slug = baseSlug;
    let suffix = 2;
    while (posts.some((post) => post.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    const content = (body.content as string).trim();
    const now = new Date().toISOString();

    const newPost: BlogPost = {
      id: randomUUID(),
      title,
      slug,
      content,
      author: (body.author as string).trim(),
      tags: (body.tags as string[]).map((t) => t.trim()).filter(Boolean),
      excerpt: (body.excerpt as string | undefined)?.trim() || buildExcerpt(content),
      viewCount: 0,
      publishedAt: now,
      updatedAt: now,
      readingTime: estimateReadingTime(content),
    };

    posts.push(newPost);
    await writeBlogPosts(posts);

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
