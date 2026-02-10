import { NextRequest, NextResponse } from "next/server";
import {
  buildExcerpt,
  estimateReadingTime,
  filterAndSortPosts,
  readBlogPosts,
  writeBlogPosts,
  type BlogPost,
} from "@/lib/blog";

type CreateBlogRequest = {
  title?: unknown;
  slug?: unknown;
  content?: unknown;
  author?: unknown;
  tags?: unknown;
};

function validateCreate(body: CreateBlogRequest): string[] {
  const errors: string[] = [];

  if (typeof body.title !== "string" || !body.title.trim()) {
    errors.push("title is required");
  }

  if (typeof body.slug !== "string" || !body.slug.trim()) {
    errors.push("slug is required");
  }

  if (typeof body.content !== "string" || !body.content.trim()) {
    errors.push("content is required");
  }

  if (typeof body.author !== "string" || !body.author.trim()) {
    errors.push("author is required");
  }

  if (!Array.isArray(body.tags) || body.tags.length === 0 || !body.tags.every((t) => typeof t === "string")) {
    errors.push("tags must be a non-empty string array");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const tag = searchParams.get("tag") || undefined;
  const sort = searchParams.get("sort") || undefined;

  const posts = await readBlogPosts();
  const filtered = filterAndSortPosts(posts, { search, tag, sort });

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
    const slug = (body.slug as string).trim();

    if (posts.some((p) => p.slug === slug)) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
    }

    const content = (body.content as string).trim();
    const now = new Date().toISOString();

    const newPost: BlogPost = {
      title: (body.title as string).trim(),
      slug,
      content,
      author: (body.author as string).trim(),
      tags: (body.tags as string[]).map((t) => t.trim()).filter(Boolean),
      publishedAt: now,
      updatedAt: now,
      excerpt: buildExcerpt(content),
      readingTime: estimateReadingTime(content),
    };

    posts.push(newPost);
    await writeBlogPosts(posts);

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body. Expected JSON." }, { status: 400 });
  }
}
